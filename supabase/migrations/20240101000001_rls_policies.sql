-- Habilitar RLS en todas las tablas
ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_results  ENABLE ROW LEVEL SECURITY;
ALTER TABLE bracket_picks  ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- predictions
CREATE POLICY "owner full access"
  ON predictions FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "public predictions"
  ON predictions FOR SELECT
  USING (is_public = TRUE);

-- group_results (acceso a través de su prediction)
CREATE POLICY "owner via prediction"
  ON group_results FOR ALL
  USING (
    prediction_id IN (
      SELECT id FROM predictions WHERE user_id = auth.uid()
    )
  );

-- bracket_picks
CREATE POLICY "owner via prediction"
  ON bracket_picks FOR ALL
  USING (
    prediction_id IN (
      SELECT id FROM predictions WHERE user_id = auth.uid()
    )
  );
