import { Injectable, InternalServerErrorException } from '@nestjs/common';
import type { LeaderboardEntry } from '@wc2026/shared-types';
import { SupabaseService } from '../supabase/supabase.service';

interface LeaderboardRow {
  id: string;
  title: string;
  total_score: number;
  champion: string | null;
  profiles: { username: string } | { username: string }[] | null;
}

@Injectable()
export class LeaderboardService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /** Top 100 predicciones públicas ordenadas por puntaje. */
  async getTop100(): Promise<LeaderboardEntry[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('predictions')
      .select('id, title, total_score, champion, profiles(username)')
      .eq('is_public', true)
      .order('total_score', { ascending: false })
      .limit(100);

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    const rows = (data ?? []) as LeaderboardRow[];

    return rows.map((row, index) => {
      const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;

      return {
        rank: index + 1,
        username: profile?.username ?? 'Anónimo',
        predictionId: row.id,
        title: row.title,
        totalScore: row.total_score,
        champion: row.champion,
      };
    });
  }
}
