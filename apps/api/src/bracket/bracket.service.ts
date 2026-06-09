import { Inject, Injectable } from '@nestjs/common';
import type { BracketState } from '@wc2026/shared-types';
import { advanceTeam } from '@wc2026/tournament-logic';
import {
  PREDICTIONS_REPOSITORY,
  type IPredictionsRepository,
} from '../predictions/interfaces/predictions-repository.interface';
import { buildPredictionState } from '../predictions/prediction-state.builder';
import { PredictionsService } from '../predictions/predictions.service';
import type { AdvanceTeamDto } from './dto/advance-team.dto';

@Injectable()
export class BracketService {
  constructor(
    private readonly predictionsService: PredictionsService,
    @Inject(PREDICTIONS_REPOSITORY)
    private readonly predictionsRepository: IPredictionsRepository,
  ) {}

  /** Obtiene el estado de la llave de una predicción. */
  async getBracket(predictionId: string, userId: string): Promise<BracketState> {
    const row = await this.predictionsService.assertOwnership(predictionId, userId);
    const [groupResults, bracketPicks] = await Promise.all([
      this.predictionsRepository.findGroupResults(predictionId),
      this.predictionsRepository.findBracketPicks(predictionId),
    ]);

    const state = buildPredictionState(groupResults, bracketPicks);

    return {
      predictionId,
      matches: state.bracket,
      champion: row.champion,
    };
  }

  /** Registra el ganador de un partido eliminatorio. */
  async advancePick(
    predictionId: string,
    userId: string,
    dto: AdvanceTeamDto,
  ): Promise<BracketState> {
    await this.predictionsService.assertOwnership(predictionId, userId);

    await this.predictionsRepository.upsertBracketPick(
      predictionId,
      dto.round,
      dto.matchIndex,
      dto.winner,
      dto.penWin ?? false,
    );

    const [groupResults, bracketPicks, row] = await Promise.all([
      this.predictionsRepository.findGroupResults(predictionId),
      this.predictionsRepository.findBracketPicks(predictionId),
      this.predictionsRepository.findById(predictionId),
    ]);

    const state = buildPredictionState(groupResults, bracketPicks);
    const updatedMatches = advanceTeam(
      state.bracket,
      dto.round,
      dto.matchIndex,
      dto.winner,
      dto.penWin ?? false,
    );

    let champion = row?.champion ?? null;
    if (dto.round === 'FINAL') {
      champion = dto.winner;
      await this.predictionsRepository.update(predictionId, { champion: dto.winner });
    }

    return {
      predictionId,
      matches: updatedMatches,
      champion,
    };
  }
}
