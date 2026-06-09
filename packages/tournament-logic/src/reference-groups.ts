import type { GroupLetter } from '@wc2026/shared-types';
import { GROUPS_DATA } from './constants.js';

type GroupFixtureView = {
  homeTeam: string;
  awayTeam: string;
  homeGoals: number | null;
  awayGoals: number | null;
};

export type ReferenceGroupView = {
  letter: GroupLetter;
  teams: string[];
  fixtures: GroupFixtureView[];
};

/** Genera los 6 partidos round-robin de un grupo de referencia. */
export function buildReferenceGroup(letter: GroupLetter): ReferenceGroupView {
  const teams = [...GROUPS_DATA[letter].teams];
  const pairs: Array<[string, string]> = [];

  for (let i = 0; i < teams.length; i += 1) {
    for (let j = i + 1; j < teams.length; j += 1) {
      pairs.push([teams[i], teams[j]]);
    }
  }

  return {
    letter,
    teams,
    fixtures: pairs.map(([homeTeam, awayTeam]) => ({
      homeTeam,
      awayTeam,
      homeGoals: null,
      awayGoals: null,
    })),
  };
}

/** Valida que un grupo tenga la estructura esperada (4 equipos, 6 partidos). */
export function isValidGroupView(group: ReferenceGroupView | null | undefined): boolean {
  if (!group) {
    return false;
  }

  return (
    group.teams.length === 4 &&
    group.fixtures.length === 6 &&
    group.fixtures.every(
      (fixture) =>
        Boolean(fixture.homeTeam?.trim()) && Boolean(fixture.awayTeam?.trim()),
    )
  );
}

/** Fusiona marcadores guardados sobre la estructura de referencia del grupo. */
export function mergeGroupScores(
  reference: ReferenceGroupView,
  savedFixtures: GroupFixtureView[] = [],
): ReferenceGroupView {
  return {
    ...reference,
    fixtures: reference.fixtures.map((fixture) => {
      const saved = savedFixtures.find(
        (row) =>
          row.homeTeam === fixture.homeTeam && row.awayTeam === fixture.awayTeam,
      );

      return saved
        ? {
            ...fixture,
            homeGoals: saved.homeGoals,
            awayGoals: saved.awayGoals,
          }
        : fixture;
    }),
  };
}
