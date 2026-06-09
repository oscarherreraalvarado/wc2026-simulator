import type {
  BracketMatch,
  BracketRound,
  GroupLetter,
  GroupState,
  OfficialResult,
  PredictedBracketPick,
  PredictedGroupMatch,
  PredictionScoreResult,
  ScoreBreakdownItem,
  ScoringPointsConfig,
} from '@wc2026/shared-types';
import { buildBracket } from './bracket.js';
import { GROUPS_DATA } from './constants.js';
import { calcStandings } from './standings.js';
import { getBestThirds } from './thirds.js';

/** Reglas de puntuación del simulador WC2026. */
export const SCORING_POINTS: ScoringPointsConfig = {
  groupExactScore: 5,
  groupCorrectOutcome: 2,
  knockout: {
    R32: 4,
    R16: 6,
    QF: 8,
    SF: 10,
    FINAL: 15,
    TP: 4,
  },
  championBonus: 10,
};

const KNOCKOUT_ROUNDS: BracketRound[] = ['R32', 'R16', 'QF', 'SF', 'FINAL', 'TP'];

type KnockoutBracket = Record<BracketRound, BracketMatch[]>;

function createEmptyRound(round: BracketRound, count: number): BracketMatch[] {
  return Array.from({ length: count }, (_, matchIndex) => ({
    round,
    matchIndex,
    homeTeam: null,
    awayTeam: null,
    winner: null,
    penWin: false,
  }));
}

function propagateToNextRound(
  nextRound: BracketMatch[],
  sourceMatchIndex: number,
  team: string,
): BracketMatch[] {
  const targetIndex = Math.floor(sourceMatchIndex / 2);
  const isHome = sourceMatchIndex % 2 === 0;

  return nextRound.map((match, index) => {
    if (index !== targetIndex) {
      return match;
    }
    return isHome ? { ...match, homeTeam: team } : { ...match, awayTeam: team };
  });
}

function matchKey(home: string, away: string): string {
  return [home, away].sort().join('|');
}

function deriveWinner(result: OfficialResult): string | null {
  if (result.winner) {
    return result.winner;
  }
  if (result.homeGoals == null || result.awayGoals == null) {
    return null;
  }
  if (result.homeGoals > result.awayGoals) {
    return result.homeTeam;
  }
  if (result.awayGoals > result.homeGoals) {
    return result.awayTeam;
  }
  return null;
}

function matchOutcome(homeGoals: number, awayGoals: number): 'home' | 'away' | 'draw' {
  if (homeGoals > awayGoals) {
    return 'home';
  }
  if (homeGoals < awayGoals) {
    return 'away';
  }
  return 'draw';
}

function scoreGroupMatch(
  predicted: PredictedGroupMatch,
  official: OfficialResult,
): { points: number; label: string } {
  if (official.homeGoals == null || official.awayGoals == null) {
    return { points: 0, label: '' };
  }

  const label = `${predicted.homeTeam} ${predicted.homeGoals}-${predicted.awayGoals} ${predicted.awayTeam}`;

  if (
    predicted.homeGoals === official.homeGoals &&
    predicted.awayGoals === official.awayGoals
  ) {
    return { points: SCORING_POINTS.groupExactScore, label };
  }

  const predOutcome = matchOutcome(predicted.homeGoals, predicted.awayGoals);
  const offOutcome = matchOutcome(official.homeGoals, official.awayGoals);

  if (predOutcome === offOutcome) {
    return { points: SCORING_POINTS.groupCorrectOutcome, label };
  }

  return { points: 0, label };
}

function buildGroupStatesFromOfficial(groupResults: OfficialResult[]): Record<GroupLetter, GroupState> {
  const groupStates = {} as Record<GroupLetter, GroupState>;
  const letters = Object.keys(GROUPS_DATA) as GroupLetter[];

  for (const letter of letters) {
    const data = GROUPS_DATA[letter];
    const pairs: Array<[string, string]> = [];

    for (let i = 0; i < data.teams.length; i += 1) {
      for (let j = i + 1; j < data.teams.length; j += 1) {
        pairs.push([data.teams[i], data.teams[j]]);
      }
    }

    const fixtures = pairs.map(([homeTeam, awayTeam], index) => {
      const saved = groupResults.find(
        (r) => r.homeTeam === homeTeam && r.awayTeam === awayTeam,
      );
      const played = saved?.homeGoals != null && saved?.awayGoals != null;

      return {
        id: `${letter}-${index}`,
        groupLetter: letter,
        homeTeam,
        awayTeam,
        homeGoals: saved?.homeGoals ?? null,
        awayGoals: saved?.awayGoals ?? null,
        played,
      };
    });

    const standings = calcStandings(data.teams, fixtures);
    groupStates[letter] = {
      group: { letter, teams: [...data.teams], fixtures },
      standings,
    };
  }

  return groupStates;
}

function applyResultsToRound(
  matches: BracketMatch[],
  results: OfficialResult[],
): BracketMatch[] {
  let updated = [...matches];

  for (const result of results) {
    const winner = deriveWinner(result);
    if (!winner) {
      continue;
    }

    let applied = false;
    updated = updated.map((match) => {
      if (applied) {
        return match;
      }

      const teamsSet =
        match.homeTeam != null &&
        match.awayTeam != null &&
        matchKey(match.homeTeam, match.awayTeam) ===
          matchKey(result.homeTeam, result.awayTeam);

      if (teamsSet) {
        applied = true;
        return { ...match, winner };
      }

      return match;
    });

    if (!applied) {
      updated = updated.map((match) => {
        if (applied) {
          return match;
        }

        const vacant = match.homeTeam == null && match.awayTeam == null;
        const singleMatchRound = updated.length === 1;

        if (vacant || singleMatchRound) {
          applied = true;
          return {
            ...match,
            homeTeam: result.homeTeam,
            awayTeam: result.awayTeam,
            winner,
          };
        }

        return match;
      });
    }
  }

  return updated;
}

function propagateSfToFinalAndTp(
  sf: BracketMatch[],
  finalRound: BracketMatch[],
  tpRound: BracketMatch[],
): { final: BracketMatch[]; tp: BracketMatch[] } {
  let finalMatches = [...finalRound];
  let tpMatches = [...tpRound];

  for (const match of sf) {
    if (!match.winner) {
      continue;
    }

    const loser =
      match.homeTeam === match.winner ? match.awayTeam : match.homeTeam;

    finalMatches =
      match.matchIndex === 0
        ? finalMatches.map((m, i) =>
            i === 0 ? { ...m, homeTeam: match.winner } : m,
          )
        : finalMatches.map((m, i) =>
            i === 0 ? { ...m, awayTeam: match.winner } : m,
          );

    if (loser) {
      tpMatches =
        match.matchIndex === 0
          ? tpMatches.map((m, i) => (i === 0 ? { ...m, homeTeam: loser } : m))
          : tpMatches.map((m, i) => (i === 0 ? { ...m, awayTeam: loser } : m));
    }
  }

  return { final: finalMatches, tp: tpMatches };
}

function propagateQfLosersToTp(
  qf: BracketMatch[],
  tpRound: BracketMatch[],
): BracketMatch[] {
  let tpMatches = [...tpRound];

  for (const match of qf) {
    if (!match.winner) {
      continue;
    }

    const loser =
      match.homeTeam === match.winner ? match.awayTeam : match.homeTeam;
    if (!loser) {
      continue;
    }

    const slot = match.matchIndex < 2 ? 'homeTeam' : 'awayTeam';
    tpMatches = tpMatches.map((m, i) =>
      i === 0 ? { ...m, [slot]: loser } : m,
    );
  }

  return tpMatches;
}

/** Construye la llave oficial completa a partir de resultados reales. */
export function buildOfficialKnockoutBracket(
  officialResults: OfficialResult[],
): KnockoutBracket {
  const groupResults = officialResults.filter((r) => r.stage === 'GROUP');
  const groupStates = buildGroupStatesFromOfficial(groupResults);
  const standingsByGroup = Object.fromEntries(
    (Object.keys(groupStates) as GroupLetter[]).map((letter) => [
      letter,
      groupStates[letter].standings,
    ]),
  ) as Partial<Record<GroupLetter, GroupState['standings']>>;

  const bestThirds = getBestThirds(groupStates);

  let r32 = buildBracket(standingsByGroup, bestThirds);
  let r16 = createEmptyRound('R16', 8);
  let qf = createEmptyRound('QF', 4);
  let sf = createEmptyRound('SF', 2);
  let finalRound = createEmptyRound('FINAL', 1);
  let tp = createEmptyRound('TP', 1);

  const byRound = (round: BracketRound) =>
    officialResults.filter((r) => r.stage === round);

  r32 = applyResultsToRound(r32, byRound('R32'));
  for (const match of r32) {
    if (match.winner) {
      r16 = propagateToNextRound(r16, match.matchIndex, match.winner);
    }
  }

  r16 = applyResultsToRound(r16, byRound('R16'));
  for (const match of r16) {
    if (match.winner) {
      qf = propagateToNextRound(qf, match.matchIndex, match.winner);
    }
  }

  qf = applyResultsToRound(qf, byRound('QF'));
  for (const match of qf) {
    if (match.winner) {
      sf = propagateToNextRound(sf, match.matchIndex, match.winner);
    }
  }
  tp = propagateQfLosersToTp(qf, tp);

  sf = applyResultsToRound(sf, byRound('SF'));
  const propagated = propagateSfToFinalAndTp(sf, finalRound, tp);
  finalRound = propagated.final;
  tp = propagated.tp;

  finalRound = applyResultsToRound(finalRound, byRound('FINAL'));
  tp = applyResultsToRound(tp, byRound('TP'));

  return {
    R32: r32,
    R16: r16,
    QF: qf,
    SF: sf,
    FINAL: finalRound,
    TP: tp,
  };
}

function findOfficialGroupResult(
  officialResults: OfficialResult[],
  predicted: PredictedGroupMatch,
): OfficialResult | undefined {
  return officialResults.find(
    (r) =>
      r.stage === 'GROUP' &&
      r.homeTeam === predicted.homeTeam &&
      r.awayTeam === predicted.awayTeam,
  );
}

/** Calcula puntos de una predicción vs resultados oficiales. */
export function computePredictionScore(
  groupResults: PredictedGroupMatch[],
  bracketPicks: PredictedBracketPick[],
  predictedChampion: string | null,
  officialResults: OfficialResult[],
): PredictionScoreResult {
  const breakdown: ScoreBreakdownItem[] = [];
  let totalScore = 0;
  let scoredGroupMatches = 0;
  let scoredKnockoutMatches = 0;

  const groupOfficials = officialResults.filter(
    (r) => r.stage === 'GROUP' && r.homeGoals != null && r.awayGoals != null,
  );

  for (const predicted of groupResults) {
    const official = findOfficialGroupResult(groupOfficials, predicted);
    if (!official) {
      continue;
    }

    scoredGroupMatches += 1;
    const { points, label } = scoreGroupMatch(predicted, official);
    if (points > 0) {
      breakdown.push({
        category: 'group',
        label,
        points,
        earned: true,
      });
      totalScore += points;
    }
  }

  const officialBracket = buildOfficialKnockoutBracket(officialResults);

  for (const pick of bracketPicks) {
    if (!pick.winner) {
      continue;
    }

    const officialMatch = officialBracket[pick.round]?.[pick.matchIndex];
    if (!officialMatch?.winner) {
      continue;
    }

    scoredKnockoutMatches += 1;
    const roundPoints = SCORING_POINTS.knockout[pick.round];
    const earned = pick.winner === officialMatch.winner;

    if (earned) {
      breakdown.push({
        category: 'knockout',
        label: `${pick.round} #${pick.matchIndex + 1}: ${pick.winner}`,
        points: roundPoints,
        earned: true,
      });
      totalScore += roundPoints;
    }
  }

  const officialChampion =
    officialBracket.FINAL[0]?.winner ?? null;

  if (
    predictedChampion &&
    officialChampion &&
    predictedChampion === officialChampion
  ) {
    breakdown.push({
      category: 'champion',
      label: `Campeón: ${predictedChampion}`,
      points: SCORING_POINTS.championBonus,
      earned: true,
    });
    totalScore += SCORING_POINTS.championBonus;
  }

  return {
    totalScore,
    breakdown,
    officialChampion,
    scoredGroupMatches,
    scoredKnockoutMatches,
  };
}

/** Etiquetas legibles de rondas para breakdown. */
export const KNOCKOUT_ROUND_LABELS: Record<BracketRound, string> = {
  R32: 'Dieciseisavos',
  R16: 'Octavos',
  QF: 'Cuartos',
  SF: 'Semifinal',
  FINAL: 'Final',
  TP: '3er puesto',
};

export { KNOCKOUT_ROUNDS };
