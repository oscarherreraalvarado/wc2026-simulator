import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import type { GroupLetter } from '@wc2026/shared-types';

const GROUP_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'] as const;

class GroupResultItemDto {
  @ApiProperty()
  @IsString()
  homeTeam!: string;

  @ApiProperty()
  @IsString()
  awayTeam!: string;

  @ApiProperty({ minimum: 0 })
  @IsInt()
  @Min(0)
  homeGoals!: number;

  @ApiProperty({ minimum: 0 })
  @IsInt()
  @Min(0)
  awayGoals!: number;
}

export class SaveGroupResultsDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  predictionId!: string;

  @ApiProperty({ enum: GROUP_LETTERS })
  @IsIn(GROUP_LETTERS)
  groupLetter!: GroupLetter;

  @ApiProperty({ type: [GroupResultItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GroupResultItemDto)
  results!: GroupResultItemDto[];
}

export class SimulateGroupDto {
  @ApiProperty({ required: false, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  predictionId?: string;
}
