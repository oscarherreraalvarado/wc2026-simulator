import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { LeaderboardEntry } from '@wc2026/shared-types';
import { LeaderboardService } from './leaderboard.service';

@ApiTags('leaderboard')
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  @ApiOperation({ summary: 'Top 100 predicciones públicas' })
  getLeaderboard(): Promise<LeaderboardEntry[]> {
    return this.leaderboardService.getTop100();
  }
}
