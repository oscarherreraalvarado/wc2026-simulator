import { Injectable, InternalServerErrorException } from '@nestjs/common';
import type { BracketRound, GroupLetter } from '@wc2026/shared-types';
import { SupabaseService } from '../supabase/supabase.service';
import type { BracketPickRow, GroupResultRow } from './prediction-state.builder';
import type {
  IPredictionsRepository,
  PredictionRow,
} from './interfaces/predictions-repository.interface';

@Injectable()
export class SupabasePredictionsRepository implements IPredictionsRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAllByUserId(userId: string): Promise<PredictionRow[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('predictions')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return (data ?? []) as PredictionRow[];
  }

  async findById(id: string): Promise<PredictionRow | null> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('predictions')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return (data as PredictionRow | null) ?? null;
  }

  async create(userId: string, title: string): Promise<PredictionRow> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('predictions')
      .insert({ user_id: userId, title })
      .select('*')
      .single();

    if (error || !data) {
      throw new InternalServerErrorException(error?.message ?? 'No se pudo crear la predicción');
    }

    return data as PredictionRow;
  }

  async update(
    id: string,
    patch: Partial<Pick<PredictionRow, 'title' | 'is_public' | 'champion' | 'total_score'>>,
  ): Promise<PredictionRow> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('predictions')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) {
      throw new InternalServerErrorException(error?.message ?? 'No se pudo actualizar');
    }

    return data as PredictionRow;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabaseService
      .getClient()
      .from('predictions')
      .delete()
      .eq('id', id);

    if (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findGroupResults(predictionId: string): Promise<GroupResultRow[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('group_results')
      .select('group_letter, home_team, away_team, home_goals, away_goals')
      .eq('prediction_id', predictionId);

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return (data ?? []) as GroupResultRow[];
  }

  async findBracketPicks(predictionId: string): Promise<BracketPickRow[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('bracket_picks')
      .select('round, match_index, winner, pen_win')
      .eq('prediction_id', predictionId);

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return (data ?? []) as BracketPickRow[];
  }

  async upsertGroupResults(
    predictionId: string,
    groupLetter: GroupLetter,
    results: Array<{
      homeTeam: string;
      awayTeam: string;
      homeGoals: number;
      awayGoals: number;
    }>,
  ): Promise<void> {
    const rows = results.map((result) => ({
      prediction_id: predictionId,
      group_letter: groupLetter,
      home_team: result.homeTeam,
      away_team: result.awayTeam,
      home_goals: result.homeGoals,
      away_goals: result.awayGoals,
    }));

    const { error: deleteError } = await this.supabaseService
      .getClient()
      .from('group_results')
      .delete()
      .eq('prediction_id', predictionId)
      .eq('group_letter', groupLetter);

    if (deleteError) {
      throw new InternalServerErrorException(deleteError.message);
    }

    if (rows.length === 0) {
      return;
    }

    const { error } = await this.supabaseService.getClient().from('group_results').insert(rows);

    if (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async upsertBracketPick(
    predictionId: string,
    round: BracketRound,
    matchIndex: number,
    winner: string,
    penWin: boolean,
  ): Promise<void> {
    const { error } = await this.supabaseService
      .getClient()
      .from('bracket_picks')
      .upsert(
        {
          prediction_id: predictionId,
          round,
          match_index: matchIndex,
          winner,
          pen_win: penWin,
        },
        { onConflict: 'prediction_id,round,match_index' },
      );

    if (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findAllIds(): Promise<string[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('predictions')
      .select('id');

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return (data ?? []).map((row) => row.id as string);
  }
}
