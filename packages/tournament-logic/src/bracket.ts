import type { BracketMatch, BracketRound, GroupLetter, Standing } from '@wc2026/shared-types';
import type { BracketSlot } from './constants.js';
import { R32_BRACKET_RULES } from './constants.js';

/** Resuelve un slot de la llave a nombre de equipo según standings y mejores terceros. */
export function resolveBracketSlot(
  slot: BracketSlot,
  standingsByGroup: Partial<Record<GroupLetter, Standing[]>>,
  bestThirds: Standing[],
): string | null {
  if (slot.group === 'T') {
    return bestThirds[slot.pos]?.team ?? null;
  }

  const standings = standingsByGroup[slot.group];
  if (!standings?.length) {
    return null;
  }

  const rank = slot.pos === 'W' ? 1 : 2;
  return standings.find((row) => row.rank === rank)?.team ?? null;
}

/** Construye los 16 partidos de R32 a partir de la fase de grupos. */
export function buildBracket(
  standingsByGroup: Partial<Record<GroupLetter, Standing[]>>,
  bestThirds: Standing[],
): BracketMatch[] {
  return R32_BRACKET_RULES.map((rule) => ({
    round: 'R32' as BracketRound,
    matchIndex: rule.matchIndex,
    homeTeam: resolveBracketSlot(rule.home, standingsByGroup, bestThirds),
    awayTeam: resolveBracketSlot(rule.away, standingsByGroup, bestThirds),
    winner: null,
    penWin: false,
  }));
}

/** Avanza un equipo ganador en un partido de la llave. */
export function advanceTeam(
  matches: BracketMatch[],
  round: BracketRound,
  matchIndex: number,
  winner: string,
  penWin = false,
): BracketMatch[] {
  return matches.map((match) => {
    if (match.round === round && match.matchIndex === matchIndex) {
      return { ...match, winner, penWin };
    }
    return match;
  });
}

/** Obtiene los 2 primeros de cada grupo como clasificados directos. */
export function getDirectQualifiers(
  groupStandings: Record<string, Standing[]>,
): { first: string[]; second: string[] } {
  const first: string[] = [];
  const second: string[] = [];

  for (const standings of Object.values(groupStandings)) {
    const top = standings.find((s) => s.rank === 1);
    const runner = standings.find((s) => s.rank === 2);
    if (top) first.push(top.team);
    if (runner) second.push(runner.team);
  }

  return { first, second };
}
