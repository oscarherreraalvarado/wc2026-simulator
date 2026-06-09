import type { Fixture, Standing } from '@wc2026/shared-types';

/**
 * Calcula la tabla de posiciones de un grupo.
 * Desempate: puntos → diferencia de goles → goles a favor.
 */
export function calcStandings(teams: string[], fixtures: Fixture[]): Standing[] {
  const stats = new Map<
    string,
    Omit<Standing, 'rank' | 'goalDifference'>
  >();

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

  const standings: Standing[] = [...stats.values()]
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

  return standings;
}
