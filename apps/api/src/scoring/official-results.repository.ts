import { Injectable, InternalServerErrorException } from '@nestjs/common';
import type { BracketRound, OfficialResult } from '@wc2026/shared-types';
import { SupabaseService } from '../supabase/supabase.service';

interface OfficialResultRow {
  id: string;
  stage: string;
  home_team: string;
  away_team: string;
  home_goals: number | null;
  away_goals: number | null;
  winner: string | null;
  played_at: string;
}

function toOfficialResult(row: OfficialResultRow): OfficialResult {
  return {
    id: row.id,
    stage: row.stage as OfficialResult['stage'],
    homeTeam: row.home_team,
    awayTeam: row.away_team,
    homeGoals: row.home_goals,
    awayGoals: row.away_goals,
    winner: row.winner,
    playedAt: row.played_at,
  };
}

@Injectable()
export class OfficialResultsRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(): Promise<OfficialResult[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('official_results')
      .select('*')
      .order('played_at', { ascending: true });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return ((data ?? []) as OfficialResultRow[]).map(toOfficialResult);
  }

  async upsert(input: {
    stage: OfficialResult['stage'];
    homeTeam: string;
    awayTeam: string;
    homeGoals?: number;
    awayGoals?: number;
    winner?: string;
  }): Promise<OfficialResult> {
    const row = {
      stage: input.stage,
      home_team: input.homeTeam,
      away_team: input.awayTeam,
      home_goals: input.homeGoals ?? null,
      away_goals: input.awayGoals ?? null,
      winner: input.winner ?? null,
    };

    const { data, error } = await this.supabaseService
      .getClient()
      .from('official_results')
      .upsert(row, { onConflict: 'stage,home_team,away_team' })
      .select('*')
      .single();

    if (error || !data) {
      throw new InternalServerErrorException(error?.message ?? 'No se pudo guardar resultado');
    }

    return toOfficialResult(data as OfficialResultRow);
  }

  async remove(stage: string, homeTeam: string, awayTeam: string): Promise<void> {
    const { error } = await this.supabaseService
      .getClient()
      .from('official_results')
      .delete()
      .eq('stage', stage)
      .eq('home_team', homeTeam)
      .eq('away_team', awayTeam);

    if (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}

export type { BracketRound };
