-- Tablas de referencia del torneo: lectura pública, escritura solo service role
ALTER TABLE tournament_teams    ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_fixtures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read tournament teams"
  ON tournament_teams FOR SELECT
  USING (true);

CREATE POLICY "public read tournament fixtures"
  ON tournament_fixtures FOR SELECT
  USING (true);

-- official_results: lectura pública (scoring), escritura vía service role (API admin)
ALTER TABLE official_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read official results"
  ON official_results FOR SELECT
  USING (true);
