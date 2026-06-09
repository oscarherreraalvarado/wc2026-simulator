import { Inject, Injectable } from '@nestjs/common';
import type { PredictionScoreResult } from '@wc2026/shared-types';
import { SCORING_POINTS, computePredictionScore } from '@wc2026/tournament-logic';
import {
  PREDICTIONS_REPOSITORY,
  type IPredictionsRepository,
} from '../predictions/interfaces/predictions-repository.interface';
import type { UpsertOfficialResultDto } from './dto/upsert-official-result.dto';
import { OfficialResultsRepository } from './official-results.repository';

@Injectable()
export class ScoringService {
  constructor(
    private readonly officialResultsRepository: OfficialResultsRepository,
    @Inject(PREDICTIONS_REPOSITORY)
    private readonly predictionsRepository: IPredictionsRepository,
  ) {}

  /** Reglas de puntuación (público). */
  getScoringRules() {
    return SCORING_POINTS;
  }

  /** Lista resultados oficiales (público). */
  listOfficialResults() {
    return this.officialResultsRepository.findAll();
  }

  /** Carga o actualiza un resultado oficial y recalcula puntajes. */
  async upsertOfficialResult(dto: UpsertOfficialResultDto) {
    const result = await this.officialResultsRepository.upsert({
      stage: dto.stage,
      homeTeam: dto.homeTeam,
      awayTeam: dto.awayTeam,
      homeGoals: dto.homeGoals,
      awayGoals: dto.awayGoals,
      winner: dto.winner,
    });

    const recalculated = await this.recalculateAllScores();
    return { result, recalculated };
  }

  /** Elimina un resultado oficial y recalcula puntajes. */
  async removeOfficialResult(stage: string, homeTeam: string, awayTeam: string) {
    await this.officialResultsRepository.remove(stage, homeTeam, awayTeam);
    const recalculated = await this.recalculateAllScores();
    return { removed: true, recalculated };
  }

  /** Recalcula puntajes de todas las predicciones. */
  async recalculateAllScores(): Promise<{ updated: number }> {
    const [predictionIds, officialResults] = await Promise.all([
      this.predictionsRepository.findAllIds(),
      this.officialResultsRepository.findAll(),
    ]);

    let updated = 0;

    for (const predictionId of predictionIds) {
      const score = await this.scorePrediction(predictionId, officialResults);
      await this.predictionsRepository.update(predictionId, {
        total_score: score.totalScore,
      });
      updated += 1;
    }

    return { updated };
  }

  /** Puntaje detallado de una predicción. */
  async getPredictionScore(predictionId: string): Promise<PredictionScoreResult> {
    const officialResults = await this.officialResultsRepository.findAll();
    return this.scorePrediction(predictionId, officialResults);
  }

  private async scorePrediction(
    predictionId: string,
    officialResults: Awaited<ReturnType<OfficialResultsRepository['findAll']>>,
  ): Promise<PredictionScoreResult> {
    const [prediction, groupResults, bracketPicks] = await Promise.all([
      this.predictionsRepository.findById(predictionId),
      this.predictionsRepository.findGroupResults(predictionId),
      this.predictionsRepository.findBracketPicks(predictionId),
    ]);

    if (!prediction) {
      return {
        totalScore: 0,
        breakdown: [],
        officialChampion: null,
        scoredGroupMatches: 0,
        scoredKnockoutMatches: 0,
      };
    }

    const predictedGroups = groupResults
      .filter((row) => row.home_goals != null && row.away_goals != null)
      .map((row) => ({
        homeTeam: row.home_team,
        awayTeam: row.away_team,
        homeGoals: row.home_goals as number,
        awayGoals: row.away_goals as number,
      }));

    const predictedBracket = bracketPicks.map((pick) => ({
      round: pick.round,
      matchIndex: pick.match_index,
      winner: pick.winner,
    }));

    return computePredictionScore(
      predictedGroups,
      predictedBracket,
      prediction.champion,
      officialResults,
    );
  }
}
