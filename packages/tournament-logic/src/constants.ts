import type { GroupLetter } from '@wc2026/shared-types';

/** Datos oficiales de grupos — FIFA World Cup 2026 (48 equipos). */
export const GROUPS_DATA: Record<GroupLetter, { letter: GroupLetter; teams: string[] }> = {
  A: { letter: 'A', teams: ['México', 'Corea del Sur', 'Sudáfrica', 'Chequia'] },
  B: { letter: 'B', teams: ['Canadá', 'Bosnia y Herzegovina', 'Catar', 'Suiza'] },
  C: { letter: 'C', teams: ['Brasil', 'Marruecos', 'Haití', 'Escocia'] },
  D: { letter: 'D', teams: ['Estados Unidos', 'Paraguay', 'Australia', 'Türkiye'] },
  E: { letter: 'E', teams: ['Alemania', 'Curazao', 'Costa de Marfil', 'Ecuador'] },
  F: { letter: 'F', teams: ['Países Bajos', 'Japón', 'Suecia', 'Túnez'] },
  G: { letter: 'G', teams: ['Bélgica', 'Egipto', 'IR Irán', 'Nueva Zelanda'] },
  H: { letter: 'H', teams: ['España', 'Uruguay', 'Arabia Saudita', 'Cabo Verde'] },
  I: { letter: 'I', teams: ['Francia', 'Senegal', 'Noruega', 'Irak'] },
  J: { letter: 'J', teams: ['Argentina', 'Argelia', 'Austria', 'Jordania'] },
  K: { letter: 'K', teams: ['Portugal', 'Colombia', 'Uzbekistán', 'Congo DR'] },
  L: { letter: 'L', teams: ['Inglaterra', 'Croacia', 'Ghana', 'Panamá'] },
};

/** Emojis de bandera por nombre de equipo. */
export const FLAGS: Record<string, string> = {
  México: '🇲🇽',
  'Corea del Sur': '🇰🇷',
  Sudáfrica: '🇿🇦',
  Chequia: '🇨🇿',
  Canadá: '🇨🇦',
  'Bosnia y Herzegovina': '🇧🇦',
  Catar: '🇶🇦',
  Suiza: '🇨🇭',
  Brasil: '🇧🇷',
  Marruecos: '🇲🇦',
  Haití: '🇭🇹',
  Escocia: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'Estados Unidos': '🇺🇸',
  Paraguay: '🇵🇾',
  Australia: '🇦🇺',
  Türkiye: '🇹🇷',
  Alemania: '🇩🇪',
  Curazao: '🇨🇼',
  'Costa de Marfil': '🇨🇮',
  Ecuador: '🇪🇨',
  'Países Bajos': '🇳🇱',
  Japón: '🇯🇵',
  Suecia: '🇸🇪',
  Túnez: '🇹🇳',
  Bélgica: '🇧🇪',
  Egipto: '🇪🇬',
  'IR Irán': '🇮🇷',
  'Nueva Zelanda': '🇳🇿',
  España: '🇪🇸',
  Uruguay: '🇺🇾',
  'Arabia Saudita': '🇸🇦',
  'Cabo Verde': '🇨🇻',
  Francia: '🇫🇷',
  Senegal: '🇸🇳',
  Noruega: '🇳🇴',
  Irak: '🇮🇶',
  Argentina: '🇦🇷',
  Argelia: '🇩🇿',
  Austria: '🇦🇹',
  Jordania: '🇯🇴',
  Portugal: '🇵🇹',
  Colombia: '🇨🇴',
  Uzbekistán: '🇺🇿',
  'Congo DR': '🇨🇩',
  Inglaterra: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  Croacia: '🇭🇷',
  Ghana: '🇬🇭',
  Panamá: '🇵🇦',
};

/** Posición en fase de grupos para emparejamientos R32. */
export type BracketSlotPosition = 'W' | 'R';

/** Slot de un tercero clasificado (índice 0-7 en mejores terceros). */
export interface ThirdBracketSlot {
  group: 'T';
  pos: number;
}

/** Slot de campeón o subcampeón de un grupo. */
export interface GroupBracketSlot {
  group: GroupLetter;
  pos: BracketSlotPosition;
}

export type BracketSlot = ThirdBracketSlot | GroupBracketSlot;

/** Regla de un partido del Round of 32. */
export interface R32BracketRule {
  id: string;
  matchIndex: number;
  home: BracketSlot;
  away: BracketSlot;
}

/**
 * Reglas de emparejamiento R32 — FIFA World Cup 2026.
 * W = 1º del grupo, R = 2º, T[n] = n-ésimo mejor tercero (0-7).
 */
export const R32_BRACKET_RULES: R32BracketRule[] = [
  { id: 'R32_1', matchIndex: 0, home: { group: 'A', pos: 'W' }, away: { group: 'B', pos: 'R' } },
  { id: 'R32_2', matchIndex: 1, home: { group: 'C', pos: 'W' }, away: { group: 'D', pos: 'R' } },
  { id: 'R32_3', matchIndex: 2, home: { group: 'E', pos: 'W' }, away: { group: 'F', pos: 'R' } },
  { id: 'R32_4', matchIndex: 3, home: { group: 'G', pos: 'W' }, away: { group: 'H', pos: 'R' } },
  { id: 'R32_5', matchIndex: 4, home: { group: 'I', pos: 'W' }, away: { group: 'J', pos: 'R' } },
  { id: 'R32_6', matchIndex: 5, home: { group: 'K', pos: 'W' }, away: { group: 'L', pos: 'R' } },
  { id: 'R32_7', matchIndex: 6, home: { group: 'A', pos: 'R' }, away: { group: 'B', pos: 'W' } },
  { id: 'R32_8', matchIndex: 7, home: { group: 'C', pos: 'R' }, away: { group: 'D', pos: 'W' } },
  { id: 'R32_9', matchIndex: 8, home: { group: 'E', pos: 'R' }, away: { group: 'F', pos: 'W' } },
  { id: 'R32_10', matchIndex: 9, home: { group: 'G', pos: 'R' }, away: { group: 'H', pos: 'W' } },
  { id: 'R32_11', matchIndex: 10, home: { group: 'I', pos: 'R' }, away: { group: 'J', pos: 'W' } },
  { id: 'R32_12', matchIndex: 11, home: { group: 'K', pos: 'R' }, away: { group: 'L', pos: 'W' } },
  { id: 'R32_13', matchIndex: 12, home: { group: 'T', pos: 0 }, away: { group: 'T', pos: 1 } },
  { id: 'R32_14', matchIndex: 13, home: { group: 'T', pos: 2 }, away: { group: 'T', pos: 3 } },
  { id: 'R32_15', matchIndex: 14, home: { group: 'T', pos: 4 }, away: { group: 'T', pos: 5 } },
  { id: 'R32_16', matchIndex: 15, home: { group: 'T', pos: 6 }, away: { group: 'T', pos: 7 } },
];

/** Lista plana de los 48 equipos del torneo. */
export const ALL_TEAMS: string[] = (Object.keys(GROUPS_DATA) as GroupLetter[]).flatMap(
  (letter) => GROUPS_DATA[letter].teams,
);

/** Devuelve el emoji de bandera de un equipo (fallback 🏳️). */
export function getTeamFlag(team: string): string {
  return FLAGS[team] ?? '🏳️';
}
