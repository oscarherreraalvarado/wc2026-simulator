/** Letra del grupo en fase de grupos (A–L). */
export type GroupLetter = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L';

/** Partido de fase de grupos. */
export interface Fixture {
  id: string;
  groupLetter: GroupLetter;
  homeTeam: string;
  awayTeam: string;
  homeGoals: number | null;
  awayGoals: number | null;
  played: boolean;
}

/** Equipos y fixtures de un grupo. */
export interface Group {
  letter: GroupLetter;
  teams: string[];
  fixtures: Fixture[];
}

/** Fila de tabla de posiciones. */
export interface Standing {
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  rank: number;
}

/** Ronda eliminatoria. */
export type BracketRound = 'R32' | 'R16' | 'QF' | 'SF' | 'FINAL' | 'TP';

/** Partido de llave eliminatoria. */
export interface BracketMatch {
  round: BracketRound;
  matchIndex: number;
  homeTeam: string | null;
  awayTeam: string | null;
  winner: string | null;
  penWin: boolean;
}

/** Estado de un grupo con resultados y standings calculados. */
export interface GroupState {
  group: Group;
  standings: Standing[];
}

/** Estado completo de predicción de fase de grupos + llave. */
export interface PredictionState {
  groupStates: Record<GroupLetter, GroupState>;
  bestThirds: Standing[];
  bracket: BracketMatch[];
}

export * from './prediction.types';
export * from './user.types';
export * from './api.types';
