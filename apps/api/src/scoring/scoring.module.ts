import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PredictionsModule } from '../predictions/predictions.module';
import { AdminGuard } from './admin.guard';
import { OfficialResultsRepository } from './official-results.repository';
import { ScoringController } from './scoring.controller';
import { ScoringService } from './scoring.service';

@Module({
  imports: [AuthModule, PredictionsModule],
  controllers: [ScoringController],
  providers: [ScoringService, OfficialResultsRepository, AdminGuard],
  exports: [ScoringService],
})
export class ScoringModule {}
