import type { Fixture, Group, GroupLetter, Standing } from '@wc2026/shared-types';
import { GROUPS_DATA } from './constants.js';
import { calcStandings } from './standings.js';
import { getBestThirds } from './thirds.js';

/** Genera fixtures round-robin para 4 equipos (6 partidos). */
function buildRoundRobinFixtures(group: Group): Fixture[] {
  const [t1, t2, t3, t4] = group.teams;
  const pairs: Array<[string, string]> = [
    [t1, t2],
    [t1, t3],
    [t1, t4],
    [t2, t3],
    [t2, t4],
    [t3, t4],
  ];

  return pairs.map(([homeTeam, awayTeam], index) => ({
    id: `${group.letter}-${index}`,
    groupLetter: group.letter,
    homeTeam,
    awayTeam,
    homeGoals: null,
    awayGoals: null,
    played: false,
  }));
}

/** Simula un grupo con marcadores aleatorios. */
export function simulateGroup(letter: GroupLetter): {
  group: Group;
  standings: Standing[];
} {
  const data = GROUPS_DATA[letter];
  const group: Group = {
    letter: data.letter,
    teams: [...data.teams],
    fixtures: buildRoundRobinFixtures({
      letter: data.letter,
      teams: data.teams,
      fixtures: [],
    }),
  };

  group.fixtures = group.fixtures.map((fixture) => ({
    ...fixture,
    homeGoals: Math.floor(Math.random() * 4),
    awayGoals: Math.floor(Math.random() * 4),
    played: true,
  }));

  const standings = calcStandings(group.teams, group.fixtures);
  return { group, standings };
}

/** Simula todos los grupos y calcula mejores terceros. */
export function simulateAll(): {
  groups: Record<GroupLetter, { group: Group; standings: Standing[] }>;
  bestThirds: Standing[];
} {
  const letters = Object.keys(GROUPS_DATA) as GroupLetter[];
  const groups = {} as Record<GroupLetter, { group: Group; standings: Standing[] }>;
  const groupStates: Record<string, import('@wc2026/shared-types').GroupState> = {};

  for (const letter of letters) {
    const result = simulateGroup(letter);
    groups[letter] = result;
    groupStates[letter] = {
      group: result.group,
      standings: result.standings,
    };
  }

  return {
    groups,
    bestThirds: getBestThirds(groupStates),
  };
}
