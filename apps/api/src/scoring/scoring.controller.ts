import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { PredictionsService } from '../predictions/predictions.service';
import { AdminGuard } from './admin.guard';
import { UpsertOfficialResultDto } from './dto/upsert-official-result.dto';
import { ScoringService } from './scoring.service';

@ApiTags('scoring')
@Controller()
export class ScoringController {
  constructor(
    private readonly scoringService: ScoringService,
    private readonly predictionsService: PredictionsService,
  ) {}

  @Get('scoring/rules')
  @ApiOperation({ summary: 'Reglas de puntuación del torneo' })
  getScoringRules() {
    return this.scoringService.getScoringRules();
  }

  @Get('official-results')
  @ApiOperation({ summary: 'Listar resultados oficiales del torneo' })
  listOfficialResults() {
    return this.scoringService.listOfficialResults();
  }

  @Post('official-results')
  @UseGuards(AdminGuard)
  @ApiHeader({ name: 'x-admin-key', required: true })
  @ApiOperation({ summary: 'Cargar o actualizar un resultado oficial (admin)' })
  upsertOfficialResult(@Body() dto: UpsertOfficialResultDto) {
    return this.scoringService.upsertOfficialResult(dto);
  }

  @Delete('official-results')
  @UseGuards(AdminGuard)
  @ApiHeader({ name: 'x-admin-key', required: true })
  @ApiOperation({ summary: 'Eliminar un resultado oficial (admin)' })
  async removeOfficialResult(
    @Query('stage') stage: string,
    @Query('homeTeam') homeTeam: string,
    @Query('awayTeam') awayTeam: string,
  ) {
    return this.scoringService.removeOfficialResult(stage, homeTeam, awayTeam);
  }

  @Post('scoring/recalculate')
  @UseGuards(AdminGuard)
  @ApiHeader({ name: 'x-admin-key', required: true })
  @ApiOperation({ summary: 'Recalcular puntajes de todas las predicciones (admin)' })
  recalculateAll() {
    return this.scoringService.recalculateAllScores();
  }

  @Get('predictions/:id/score')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Desglose de puntos de una predicción' })
  async getPredictionScore(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.predictionsService.assertOwnership(id, user.userId);
    return this.scoringService.getPredictionScore(id);
  }
}
