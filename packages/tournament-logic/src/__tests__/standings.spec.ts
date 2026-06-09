import type { Fixture } from '@wc2026/shared-types';
import { calcStandings } from '../standings';

describe('calcStandings', () => {
  const teams = ['A', 'B', 'C', 'D'];

  it('ordena por puntos y desempates', () => {
    const fixtures: Fixture[] = [
      {
        id: '1',
        groupLetter: 'A',
        homeTeam: 'A',
        awayTeam: 'B',
        homeGoals: 2,
        awayGoals: 0,
        played: true,
      },
      {
        id: '2',
        groupLetter: 'A',
        homeTeam: 'C',
        awayTeam: 'D',
        homeGoals: 1,
        awayGoals: 1,
        played: true,
      },
    ];

    const standings = calcStandings(teams, fixtures);
    expect(standings[0].team).toBe('A');
    expect(standings[0].points).toBe(3);
  });
});
