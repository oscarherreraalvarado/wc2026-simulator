import type { GroupState } from '@wc2026/shared-types';
import { getBestThirds } from '../thirds';

describe('getBestThirds', () => {
  it('retorna máximo 8 terceros', () => {
    const groups: Record<string, GroupState> = {};
    for (let i = 0; i < 12; i += 1) {
      const letter = String.fromCharCode(65 + i);
      groups[letter] = {
        group: { letter: letter as GroupState['group']['letter'], teams: [], fixtures: [] },
        standings: [
          { team: `${letter}1`, played: 3, won: 3, drawn: 0, lost: 0, goalsFor: 6, goalsAgainst: 0, goalDifference: 6, points: 9, rank: 1 },
          { team: `${letter}2`, played: 3, won: 2, drawn: 0, lost: 1, goalsFor: 4, goalsAgainst: 2, goalDifference: 2, points: 6, rank: 2 },
          { team: `${letter}3`, played: 3, won: 1, drawn: 0, lost: 2, goalsFor: 2, goalsAgainst: 4, goalDifference: -2, points: 3, rank: 3 },
          { team: `${letter}4`, played: 3, won: 0, drawn: 0, lost: 3, goalsFor: 0, goalsAgainst: 6, goalDifference: -6, points: 0, rank: 4 },
        ],
      };
    }

    const best = getBestThirds(groups);
    expect(best).toHaveLength(8);
  });
});
