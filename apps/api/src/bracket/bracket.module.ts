import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PredictionsModule } from '../predictions/predictions.module';
import { BracketController } from './bracket.controller';
import { BracketService } from './bracket.service';

@Module({
  imports: [AuthModule, PredictionsModule],
  controllers: [BracketController],
  providers: [BracketService],
})
export class BracketModule {}
