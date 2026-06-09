import { Body, Controller, Get, Param, ParseUUIDPipe, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { BracketState } from '@wc2026/shared-types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { BracketService } from './bracket.service';
import { AdvanceTeamDto } from './dto/advance-team.dto';

@ApiTags('bracket')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bracket')
export class BracketController {
  constructor(private readonly bracketService: BracketService) {}

  @Get(':predictionId')
  @ApiOperation({ summary: 'Estado de la llave' })
  getBracket(
    @Param('predictionId', ParseUUIDPipe) predictionId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<BracketState> {
    return this.bracketService.getBracket(predictionId, user.userId);
  }

  @Put(':predictionId')
  @ApiOperation({ summary: 'Actualizar pick en la llave' })
  advance(
    @Param('predictionId', ParseUUIDPipe) predictionId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AdvanceTeamDto,
  ): Promise<BracketState> {
    return this.bracketService.advancePick(predictionId, user.userId, dto);
  }
}
