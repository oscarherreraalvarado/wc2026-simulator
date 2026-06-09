import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PredictionsModule } from '../predictions/predictions.module';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';

@Module({
  imports: [AuthModule, PredictionsModule],
  controllers: [GroupsController],
  providers: [GroupsService],
})
export class GroupsModule {}
