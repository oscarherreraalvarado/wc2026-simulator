import type { GroupState, Standing } from '@wc2026/shared-types';

/**
 * Retorna los 8 mejores terceros entre los 12 grupos, ordenados por criterio FIFA.
 */
export function getBestThirds(groups: Record<string, GroupState>): Standing[] {
  const thirds: Standing[] = [];

  for (const state of Object.values(groups)) {
    const third = state.standings.find((s) => s.rank === 3);
    if (third) {
      thirds.push(third);
    }
  }

  return thirds
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    })
    .slice(0, 8);
}
