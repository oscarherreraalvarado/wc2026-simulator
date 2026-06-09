import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'node:path';
import configuration, { validationSchema } from './config/configuration';
import { AuthModule } from './auth/auth.module';
import { BracketModule } from './bracket/bracket.module';
import { GroupsModule } from './groups/groups.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { PredictionsModule } from './predictions/predictions.module';
import { ScoringModule } from './scoring/scoring.module';
import { SupabaseModule } from './supabase/supabase.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
      validationOptions: { abortEarly: true },
      envFilePath: [
        join(process.cwd(), '..', '..', '.env'),
        join(process.cwd(), '.env'),
      ],
    }),
    SupabaseModule,
    AuthModule,
    PredictionsModule,
    GroupsModule,
    BracketModule,
    LeaderboardModule,
    ScoringModule,
  ],
})
export class AppModule {}
