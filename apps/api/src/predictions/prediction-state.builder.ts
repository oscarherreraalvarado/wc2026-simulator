import type {
  BracketMatch,
  BracketRound,
  GroupLetter,
  GroupState,
  PredictionState,
} from '@wc2026/shared-types';
import { GROUPS_DATA } from '@wc2026/tournament-logic';
import { calcStandings } from '@wc2026/tournament-logic';
import { getBestThirds } from '@wc2026/tournament-logic';

export interface GroupResultRow {
  group_letter: GroupLetter;
  home_team: string;
  away_team: string;
  home_goals: number | null;
  away_goals: number | null;
}

export interface BracketPickRow {
  round: BracketRound;
  match_index: number;
  winner: string | null;
  pen_win: boolean;
}

/** Construye PredictionState desde filas de Supabase. */
export function buildPredictionState(
  groupResults: GroupResultRow[],
  bracketPicks: BracketPickRow[],
): PredictionState {
  const groupStates = {} as Record<GroupLetter, GroupState>;
  const letters = Object.keys(GROUPS_DATA) as GroupLetter[];

  for (const letter of letters) {
    const data = GROUPS_DATA[letter];
    const resultsForGroup = groupResults.filter((r) => r.group_letter === letter);

    const fixtures = buildFixtures(data.teams, letter, resultsForGroup);
    const standings = calcStandings(data.teams, fixtures);

    groupStates[letter] = {
      group: { letter, teams: [...data.teams], fixtures },
      standings,
    };
  }

  const bestThirds = getBestThirds(groupStates);
  const bracket = mapBracketPicks(bracketPicks);

  return { groupStates, bestThirds, bracket };
}

function buildFixtures(
  teams: string[],
  letter: GroupLetter,
  results: GroupResultRow[],
): GroupState['group']['fixtures'] {
  const pairs: Array<[string, string]> = [];
  for (let i = 0; i < teams.length; i += 1) {
    for (let j = i + 1; j < teams.length; j += 1) {
      pairs.push([teams[i], teams[j]]);
    }
  }

  return pairs.map(([homeTeam, awayTeam], index) => {
    const saved = results.find(
      (r) => r.home_team === homeTeam && r.away_team === awayTeam,
    );
    const played = saved?.home_goals != null && saved?.away_goals != null;

    return {
      id: `${letter}-${index}`,
      groupLetter: letter,
      homeTeam,
      awayTeam,
      homeGoals: saved?.home_goals ?? null,
      awayGoals: saved?.away_goals ?? null,
      played,
    };
  });
}

function mapBracketPicks(picks: BracketPickRow[]): BracketMatch[] {
  return picks.map((pick) => ({
    round: pick.round,
    matchIndex: pick.match_index,
    homeTeam: null,
    awayTeam: null,
    winner: pick.winner,
    penWin: pick.pen_win,
  }));
}
