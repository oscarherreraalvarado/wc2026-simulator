import type { Fixture, GroupLetter, GroupState, Standing } from '@wc2026/shared-types';

/** Equipos oficiales por grupo (sin depender de CJS en runtime). */
export const GROUPS_TEAMS: Record<GroupLetter, string[]> = {
  A: ['México', 'Corea del Sur', 'Sudáfrica', 'Chequia'],
  B: ['Canadá', 'Bosnia y Herzegovina', 'Catar', 'Suiza'],
  C: ['Brasil', 'Marruecos', 'Haití', 'Escocia'],
  D: ['Estados Unidos', 'Paraguay', 'Australia', 'Türkiye'],
  E: ['Alemania', 'Curazao', 'Costa de Marfil', 'Ecuador'],
  F: ['Países Bajos', 'Japón', 'Suecia', 'Túnez'],
  G: ['Bélgica', 'Egipto', 'IR Irán', 'Nueva Zelanda'],
  H: ['España', 'Uruguay', 'Arabia Saudita', 'Cabo Verde'],
  I: ['Francia', 'Senegal', 'Noruega', 'Irak'],
  J: ['Argentina', 'Argelia', 'Austria', 'Jordania'],
  K: ['Portugal', 'Colombia', 'Uzbekistán', 'Congo DR'],
  L: ['Inglaterra', 'Croacia', 'Ghana', 'Panamá'],
};

export const GROUP_LETTERS = Object.keys(GROUPS_TEAMS) as GroupLetter[];

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

export function buildReferenceGroup(letter: GroupLetter): ReferenceGroupView {
  const teams = [...GROUPS_TEAMS[letter]];
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

/** Calcula tabla de posiciones (copia local para evitar interop CJS en Angular). */
export function calcStandings(teams: string[], fixtures: Fixture[]): Standing[] {
  const stats = new Map<string, Omit<Standing, 'rank' | 'goalDifference'>>();

  for (const team of teams) {
    stats.set(team, {
      team,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
    });
  }

  for (const fixture of fixtures) {
    if (fixture.homeGoals === null || fixture.awayGoals === null) {
      continue;
    }

    const home = stats.get(fixture.homeTeam);
    const away = stats.get(fixture.awayTeam);
    if (!home || !away) {
      continue;
    }

    home.played += 1;
    away.played += 1;
    home.goalsFor += fixture.homeGoals;
    home.goalsAgainst += fixture.awayGoals;
    away.goalsFor += fixture.awayGoals;
    away.goalsAgainst += fixture.homeGoals;

    if (fixture.homeGoals > fixture.awayGoals) {
      home.won += 1;
      home.points += 3;
      away.lost += 1;
    } else if (fixture.homeGoals < fixture.awayGoals) {
      away.won += 1;
      away.points += 3;
      home.lost += 1;
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.points += 1;
      away.points += 1;
    }
  }

  return [...stats.values()]
    .map((row) => ({
      ...row,
      goalDifference: row.goalsFor - row.goalsAgainst,
      rank: 0,
    }))
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    })
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

/** Mejores 8 terceros entre los 12 grupos. */
export function getBestThirds(groups: Record<string, GroupState>): Standing[] {
  const thirds: Standing[] = [];

  for (const state of Object.values(groups)) {
    const third = state.standings.find((row) => row.rank === 3);
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

export function toFixtures(
  letter: GroupLetter,
  group: ReferenceGroupView,
): Fixture[] {
  return group.fixtures.map((fixture, index) => ({
    id: `${letter}-${index}`,
    groupLetter: letter,
    homeTeam: fixture.homeTeam,
    awayTeam: fixture.awayTeam,
    homeGoals: fixture.homeGoals,
    awayGoals: fixture.awayGoals,
    played: fixture.homeGoals != null && fixture.awayGoals != null,
  }));
}

/** Extrae el mapa de grupos desde la respuesta de la API. */
export function extractApiGroups(payload: unknown): Partial<Record<GroupLetter, ReferenceGroupView>> {
  if (!payload || typeof payload !== 'object') {
    return {};
  }

  const record = payload as Record<string, unknown>;

  if (record['groups'] && typeof record['groups'] === 'object') {
    return record['groups'] as Partial<Record<GroupLetter, ReferenceGroupView>>;
  }

  if (record['A'] && typeof record['A'] === 'object') {
    return record as Partial<Record<GroupLetter, ReferenceGroupView>>;
  }

  return {};
}

/** Garantiza 4 equipos y 6 partidos por grupo. */
export function hydrateGroup(
  letter: GroupLetter,
  apiGroup?: ReferenceGroupView | null,
  savedFixtures: GroupFixtureView[] = [],
): ReferenceGroupView {
  const reference = buildReferenceGroup(letter);
  const base = isValidGroupView(apiGroup) ? apiGroup! : reference;
  return mergeGroupScores(
    {
      letter,
      teams: [...base.teams],
      fixtures: base.fixtures.map((fixture) => ({ ...fixture })),
    },
    savedFixtures,
  );
}
