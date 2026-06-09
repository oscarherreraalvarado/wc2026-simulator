import type { BracketMatch, GroupLetter, PredictionState, Standing } from './tournament.types';

/** Estado de la llave eliminatoria de una predicción. */
export interface BracketState {
  predictionId: string;
  matches: BracketMatch[];
  champion: string | null;
}

/** Snapshot persistible de una predicción. */
export interface SavedPrediction {
  id: string;
  userId: string;
  title: string;
  isPublic: boolean;
  champion: string | null;
  totalScore: number;
  state: PredictionState;
  createdAt: string;
  updatedAt: string;
}

/** Input parcial para actualizar marcadores de grupo. */
export interface GroupScoreUpdate {
  groupLetter: GroupLetter;
  homeTeam: string;
  awayTeam: string;
  homeGoals: number;
  awayGoals: number;
}

/** Mejores terceros seleccionados para R32. */
export interface BestThirdsSelection {
  standings: Standing[];
  qualifiedTeams: string[];
}
