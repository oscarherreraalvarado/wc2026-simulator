import type {
  BracketRound,
  GroupLetter,
  PredictionDetailResponse,
  PredictionListItem,
} from '@wc2026/shared-types';
import type { BracketPickRow, GroupResultRow } from '../prediction-state.builder';

export interface PredictionRow {
  id: string;
  user_id: string;
  title: string;
  is_public: boolean;
  champion: string | null;
  total_score: number;
  created_at: string;
  updated_at: string;
}

export interface IPredictionsRepository {
  findAllByUserId(userId: string): Promise<PredictionRow[]>;
  findById(id: string): Promise<PredictionRow | null>;
  create(userId: string, title: string): Promise<PredictionRow>;
  update(
    id: string,
    patch: Partial<Pick<PredictionRow, 'title' | 'is_public' | 'champion' | 'total_score'>>,
  ): Promise<PredictionRow>;
  delete(id: string): Promise<void>;
  findGroupResults(predictionId: string): Promise<GroupResultRow[]>;
  findBracketPicks(predictionId: string): Promise<BracketPickRow[]>;
  upsertGroupResults(
    predictionId: string,
    groupLetter: GroupLetter,
    results: Array<{
      homeTeam: string;
      awayTeam: string;
      homeGoals: number;
      awayGoals: number;
    }>,
  ): Promise<void>;
  upsertBracketPick(
    predictionId: string,
    round: BracketRound,
    matchIndex: number,
    winner: string,
    penWin: boolean,
  ): Promise<void>;
  findAllIds(): Promise<string[]>;
}

export const PREDICTIONS_REPOSITORY = Symbol('PREDICTIONS_REPOSITORY');

export function toListItem(row: PredictionRow): PredictionListItem {
  return {
    id: row.id,
    title: row.title,
    isPublic: row.is_public,
    champion: row.champion,
    totalScore: row.total_score,
    updatedAt: row.updated_at,
  };
}

export function toDetail(
  row: PredictionRow,
  detail: Omit<PredictionDetailResponse, keyof PredictionListItem>,
): PredictionDetailResponse {
  return {
    ...toListItem(row),
    ...detail,
  };
}
