import { computePredictionScore, SCORING_POINTS } from '../scoring';
import type { OfficialResult } from '@wc2026/shared-types';

describe('computePredictionScore', () => {
  const officialGroup: OfficialResult[] = [
    {
      stage: 'GROUP',
      homeTeam: 'México',
      awayTeam: 'Corea del Sur',
      homeGoals: 2,
      awayGoals: 1,
      winner: null,
    },
  ];

  it('otorga puntos por marcador exacto en grupos', () => {
    const result = computePredictionScore(
      [{ homeTeam: 'México', awayTeam: 'Corea del Sur', homeGoals: 2, awayGoals: 1 }],
      [],
      null,
      officialGroup,
    );

    expect(result.totalScore).toBe(SCORING_POINTS.groupExactScore);
    expect(result.breakdown[0].category).toBe('group');
  });

  it('otorga puntos por resultado correcto sin marcador exacto', () => {
    const result = computePredictionScore(
      [{ homeTeam: 'México', awayTeam: 'Corea del Sur', homeGoals: 1, awayGoals: 0 }],
      [],
      null,
      officialGroup,
    );

    expect(result.totalScore).toBe(SCORING_POINTS.groupCorrectOutcome);
  });

  it('no suma puntos si el resultado es incorrecto', () => {
    const result = computePredictionScore(
      [{ homeTeam: 'México', awayTeam: 'Corea del Sur', homeGoals: 0, awayGoals: 2 }],
      [],
      null,
      officialGroup,
    );

    expect(result.totalScore).toBe(0);
  });

  it('otorga bonus por campeón correcto', () => {
    const result = computePredictionScore(
      [],
      [{ round: 'FINAL', matchIndex: 0, winner: 'Argentina' }],
      'Argentina',
      [
        {
          stage: 'FINAL',
          homeTeam: 'Argentina',
          awayTeam: 'Francia',
          homeGoals: 3,
          awayGoals: 2,
          winner: 'Argentina',
        },
      ],
    );

    expect(result.officialChampion).toBe('Argentina');
    expect(result.totalScore).toBeGreaterThanOrEqual(
      SCORING_POINTS.knockout.FINAL + SCORING_POINTS.championBonus,
    );
  });
});
