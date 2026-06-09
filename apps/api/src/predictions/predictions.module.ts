import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PREDICTIONS_REPOSITORY } from './interfaces/predictions-repository.interface';
import { PredictionsController } from './predictions.controller';
import { SupabasePredictionsRepository } from './predictions.repository';
import { PredictionsService } from './predictions.service';

@Module({
  imports: [AuthModule],
  controllers: [PredictionsController],
  providers: [
    PredictionsService,
    {
      provide: PREDICTIONS_REPOSITORY,
      useClass: SupabasePredictionsRepository,
    },
  ],
  exports: [PredictionsService, PREDICTIONS_REPOSITORY],
})
export class PredictionsModule {}
