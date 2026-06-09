-- Restricción única para upsert de resultados oficiales por partido
DO $$
BEGIN
  ALTER TABLE official_results
    ADD CONSTRAINT official_results_stage_teams_unique
    UNIQUE (stage, home_team, away_team);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
