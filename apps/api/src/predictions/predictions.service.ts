import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  PredictionDetailResponse,
  PredictionListItem,
} from '@wc2026/shared-types';
import type { CreatePredictionDto } from './dto/create-prediction.dto';
import type { UpdatePredictionDto } from './dto/update-prediction.dto';
import {
  PREDICTIONS_REPOSITORY,
  toDetail,
  toListItem,
  type IPredictionsRepository,
} from './interfaces/predictions-repository.interface';
import { buildPredictionState } from './prediction-state.builder';

@Injectable()
export class PredictionsService {
  constructor(
    @Inject(PREDICTIONS_REPOSITORY)
    private readonly repository: IPredictionsRepository,
  ) {}

  /** Lista predicciones del usuario autenticado. */
  async findAll(userId: string): Promise<PredictionListItem[]> {
    const rows = await this.repository.findAllByUserId(userId);
    return rows.map(toListItem);
  }

  /** Obtiene una predicción con estado completo. */
  async findOne(id: string, userId: string): Promise<PredictionDetailResponse> {
    const row = await this.assertOwnership(id, userId);
    const [groupResults, bracketPicks] = await Promise.all([
      this.repository.findGroupResults(id),
      this.repository.findBracketPicks(id),
    ]);

    return toDetail(row, {
      state: buildPredictionState(groupResults, bracketPicks),
    });
  }

  /** Crea una predicción vacía. */
  async create(userId: string, dto: CreatePredictionDto): Promise<PredictionDetailResponse> {
    const row = await this.repository.create(userId, dto.title ?? 'Mi Predicción');
    return toDetail(row, {
      state: buildPredictionState([], []),
    });
  }

  /** Actualiza metadatos de la predicción. */
  async update(
    id: string,
    userId: string,
    dto: UpdatePredictionDto,
  ): Promise<PredictionDetailResponse> {
    await this.assertOwnership(id, userId);

    const patch: Parameters<IPredictionsRepository['update']>[1] = {};
    if (dto.title !== undefined) patch.title = dto.title;
    if (dto.isPublic !== undefined) patch.is_public = dto.isPublic;
    if (dto.champion !== undefined) patch.champion = dto.champion;

    const row = await this.repository.update(id, patch);
    const [groupResults, bracketPicks] = await Promise.all([
      this.repository.findGroupResults(id),
      this.repository.findBracketPicks(id),
    ]);

    return toDetail(row, {
      state: buildPredictionState(groupResults, bracketPicks),
    });
  }

  /** Elimina una predicción. */
  async remove(id: string, userId: string): Promise<void> {
    await this.assertOwnership(id, userId);
    await this.repository.delete(id);
  }

  /** Marca la predicción como pública. */
  async publish(id: string, userId: string): Promise<PredictionDetailResponse> {
    await this.assertOwnership(id, userId);
    const row = await this.repository.update(id, { is_public: true });
    const [groupResults, bracketPicks] = await Promise.all([
      this.repository.findGroupResults(id),
      this.repository.findBracketPicks(id),
    ]);

    return toDetail(row, {
      state: buildPredictionState(groupResults, bracketPicks),
    });
  }

  /** Verifica que la predicción exista y pertenezca al usuario. */
  async assertOwnership(id: string, userId: string) {
    const row = await this.repository.findById(id);
    if (!row) {
      throw new NotFoundException(`Predicción ${id} no encontrada`);
    }
    if (row.user_id !== userId) {
      throw new ForbiddenException('No tienes acceso a esta predicción');
    }
    return row;
  }
}
