import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import type { BracketRound } from '@wc2026/shared-types';

const ROUNDS = ['R32', 'R16', 'QF', 'SF', 'FINAL', 'TP'] as const;

export class AdvanceTeamDto {
  @ApiProperty({ enum: ROUNDS })
  @IsIn(ROUNDS)
  round!: BracketRound;

  @ApiProperty({ minimum: 0 })
  @IsInt()
  @Min(0)
  matchIndex!: number;

  @ApiProperty()
  @IsString()
  winner!: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  penWin?: boolean;
}
