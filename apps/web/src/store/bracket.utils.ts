import type { BracketMatch, BracketRound } from '@wc2026/shared-types';

/** Crea partidos vacíos para una ronda. */
export function createEmptyRound(round: BracketRound, count: number): BracketMatch[] {
  return Array.from({ length: count }, (_, matchIndex) => ({
    round,
    matchIndex,
    homeTeam: null,
    awayTeam: null,
    winner: null,
    penWin: false,
  }));
}

/** Coloca un ganador en el slot correspondiente de la ronda siguiente. */
export function propagateToNextRound(
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

/** Etiquetas en español para cada ronda. */
export const ROUND_LABELS: Record<BracketRound, string> = {
  R32: 'Round of 32',
  R16: 'Octavos',
  QF: 'Cuartos',
  SF: 'Semifinal',
  FINAL: 'Final',
  TP: '3er Lugar',
};
