import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import type { BracketRound } from '@wc2026/shared-types';

const STAGES = ['GROUP', 'R32', 'R16', 'QF', 'SF', 'FINAL', 'TP'] as const;

export class UpsertOfficialResultDto {
  @ApiProperty({ enum: STAGES })
  @IsIn(STAGES)
  stage!: (typeof STAGES)[number];

  @ApiProperty()
  @IsString()
  homeTeam!: string;

  @ApiProperty()
  @IsString()
  awayTeam!: string;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  homeGoals?: number;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  awayGoals?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  winner?: string;
}
