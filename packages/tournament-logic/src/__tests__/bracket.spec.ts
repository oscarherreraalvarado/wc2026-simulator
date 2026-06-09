import type { GroupLetter } from '@wc2026/shared-types';
import { advanceTeam, buildBracket, resolveBracketSlot } from '../bracket';
import { GROUPS_DATA } from '../constants';
import { calcStandings } from '../standings';
import { getBestThirds } from '../thirds';
import { simulateAll } from '../simulate';

describe('bracket', () => {
  it('buildBracket crea 16 partidos R32', () => {
    const { groups, bestThirds } = simulateAll();
    const standingsByGroup = {} as Record<GroupLetter, import('@wc2026/shared-types').Standing[]>;
    for (const letter of Object.keys(groups) as GroupLetter[]) {
      standingsByGroup[letter] = groups[letter].standings;
    }

    const matches = buildBracket(standingsByGroup, bestThirds);
    expect(matches).toHaveLength(16);
    expect(matches.every((m) => m.round === 'R32')).toBe(true);
  });

  it('advanceTeam asigna ganador', () => {
    const matches = buildBracket({} as Record<GroupLetter, never[]>, []);
    const updated = advanceTeam(matches, 'R32', 0, 'México');
    expect(updated[0].winner).toBe('México');
  });

  it('resolveBracketSlot asigna campeón y subcampeón de grupo', () => {
    const teams = GROUPS_DATA.A.teams;
    const fixtures = [
      {
        id: 'A-0',
        groupLetter: 'A' as GroupLetter,
        homeTeam: teams[0],
        awayTeam: teams[1],
        homeGoals: 2,
        awayGoals: 0,
        played: true,
      },
    ];
    const standings = calcStandings(teams, fixtures);

    expect(resolveBracketSlot({ group: 'A', pos: 'W' }, { A: standings }, [])).toBe(teams[0]);
    expect(resolveBracketSlot({ group: 'A', pos: 'R' }, { A: standings }, [])).toBe(
      standings.find((row) => row.rank === 2)?.team,
    );
  });

  it('R32_1 empareja campeón A vs subcampeón B tras simular', () => {
    const { groups, bestThirds } = simulateAll();
    const standingsByGroup = {} as Record<GroupLetter, import('@wc2026/shared-types').Standing[]>;
    for (const letter of Object.keys(groups) as GroupLetter[]) {
      standingsByGroup[letter] = groups[letter].standings;
    }

    const matches = buildBracket(standingsByGroup, bestThirds);
    const r32_1 = matches[0];

    expect(r32_1.homeTeam).toBe(standingsByGroup.A[0].team);
    expect(r32_1.awayTeam).toBe(standingsByGroup.B[1].team);
  });
});
