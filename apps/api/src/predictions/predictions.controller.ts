import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { PredictionDetailResponse, PredictionListItem } from '@wc2026/shared-types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreatePredictionDto } from './dto/create-prediction.dto';
import { UpdatePredictionDto } from './dto/update-prediction.dto';
import { PredictionsService } from './predictions.service';

@ApiTags('predictions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('predictions')
export class PredictionsController {
  constructor(private readonly predictionsService: PredictionsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar predicciones del usuario' })
  findAll(@CurrentUser() user: AuthenticatedUser): Promise<PredictionListItem[]> {
    return this.predictionsService.findAll(user.userId);
  }

  @Post()
  @ApiOperation({ summary: 'Crear predicción' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePredictionDto,
  ): Promise<PredictionDetailResponse> {
    return this.predictionsService.create(user.userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener predicción' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PredictionDetailResponse> {
    return this.predictionsService.findOne(id, user.userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar predicción' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdatePredictionDto,
  ): Promise<PredictionDetailResponse> {
    return this.predictionsService.update(id, user.userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar predicción' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ deleted: true }> {
    await this.predictionsService.remove(id, user.userId);
    return { deleted: true };
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: 'Publicar predicción' })
  publish(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PredictionDetailResponse> {
    return this.predictionsService.publish(id, user.userId);
  }
}
