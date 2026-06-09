import type { BracketMatch, GroupLetter, PredictionState, Standing } from './tournament.types';

/** Respuesta estándar de la API. */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/** DTO para crear predicción. */
export interface CreatePredictionRequest {
  title?: string;
}

/** DTO para actualizar predicción. */
export interface UpdatePredictionRequest {
  title?: string;
  isPublic?: boolean;
  champion?: string | null;
}

/** Respuesta de listado de predicciones. */
export interface PredictionListItem {
  id: string;
  title: string;
  isPublic: boolean;
  champion: string | null;
  totalScore: number;
  updatedAt: string;
}

/** Respuesta detallada de predicción. */
export interface PredictionDetailResponse extends PredictionListItem {
  state: PredictionState;
}

/** Request para guardar resultados de grupo. */
export interface SaveGroupResultsRequest {
  groupLetter: GroupLetter;
  results: Array<{
    homeTeam: string;
    awayTeam: string;
    homeGoals: number;
    awayGoals: number;
  }>;
}

/** Request para avanzar equipo en llave. */
export interface AdvanceTeamRequest {
  round: BracketMatch['round'];
  matchIndex: number;
  winner: string;
  penWin?: boolean;
}

/** Entrada del leaderboard. */
export interface LeaderboardEntry {
  rank: number;
  username: string;
  predictionId: string;
  title: string;
  totalScore: number;
  champion: string | null;
}

/** Respuesta de grupos con fixtures. */
export interface GroupsResponse {
  groups: Record<
    GroupLetter,
    {
      letter: GroupLetter;
      teams: string[];
      fixtures: Array<{
        homeTeam: string;
        awayTeam: string;
        homeGoals: number | null;
        awayGoals: number | null;
      }>;
    }
  >;
}

/** Standings calculados por grupo. */
export interface StandingsResponse {
  groupLetter: GroupLetter;
  standings: Standing[];
}
