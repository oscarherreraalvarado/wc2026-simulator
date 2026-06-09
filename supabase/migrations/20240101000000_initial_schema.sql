-- profiles: extiende auth.users de Supabase
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT UNIQUE NOT NULL,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- predictions: predicción completa de un usuario
CREATE TABLE predictions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL DEFAULT 'Mi Predicción',
  is_public   BOOLEAN DEFAULT FALSE,
  champion    TEXT,
  total_score INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- group_results: marcadores de la fase de grupos
CREATE TABLE group_results (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prediction_id  UUID NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,
  group_letter   CHAR(1) NOT NULL CHECK (group_letter IN ('A','B','C','D','E','F','G','H','I','J','K','L')),
  home_team      TEXT NOT NULL,
  away_team      TEXT NOT NULL,
  home_goals     SMALLINT CHECK (home_goals >= 0),
  away_goals     SMALLINT CHECK (away_goals >= 0)
);

-- bracket_picks: picks en la llave eliminatoria
CREATE TABLE bracket_picks (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prediction_id  UUID NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,
  round          TEXT NOT NULL CHECK (round IN ('R32','R16','QF','SF','FINAL','TP')),
  match_index    SMALLINT NOT NULL,
  winner         TEXT,
  pen_win        BOOLEAN DEFAULT FALSE,
  UNIQUE(prediction_id, round, match_index)
);

-- official_results: resultados reales (admin) para scoring
CREATE TABLE official_results (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage       TEXT NOT NULL,
  home_team   TEXT NOT NULL,
  away_team   TEXT NOT NULL,
  home_goals  SMALLINT,
  away_goals  SMALLINT,
  winner      TEXT,
  played_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_group_results_prediction ON group_results(prediction_id);
CREATE INDEX idx_bracket_picks_prediction ON bracket_picks(prediction_id);
CREATE INDEX idx_predictions_user ON predictions(user_id);
CREATE INDEX idx_predictions_public_score ON predictions(is_public, total_score DESC);

-- Trigger: updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER predictions_updated_at
  BEFORE UPDATE ON predictions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
