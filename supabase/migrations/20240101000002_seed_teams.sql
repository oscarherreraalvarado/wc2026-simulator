-- Seed placeholder: reemplazar con los 48 equipos reales y 72 fixtures
-- Tabla de referencia para equipos del torneo (opcional, fuera del schema principal)

CREATE TABLE IF NOT EXISTS tournament_teams (
  id           SERIAL PRIMARY KEY,
  name         TEXT NOT NULL UNIQUE,
  group_letter CHAR(1) NOT NULL CHECK (group_letter IN ('A','B','C','D','E','F','G','H','I','J','K','L')),
  flag_emoji   TEXT
);

CREATE TABLE IF NOT EXISTS tournament_fixtures (
  id           SERIAL PRIMARY KEY,
  group_letter CHAR(1) NOT NULL,
  home_team    TEXT NOT NULL,
  away_team    TEXT NOT NULL,
  matchday     SMALLINT NOT NULL DEFAULT 1
);

-- 48 equipos placeholder (4 por grupo)
INSERT INTO tournament_teams (name, group_letter, flag_emoji)
SELECT
  'Team ' || g.letter || n.n,
  g.letter,
  '🏳️'
FROM (
  VALUES ('A'),('B'),('C'),('D'),('E'),('F'),('G'),('H'),('I'),('J'),('K'),('L')
) AS g(letter)
CROSS JOIN generate_series(1, 4) AS n(n);

-- 72 fixtures placeholder (6 por grupo, round-robin)
INSERT INTO tournament_fixtures (group_letter, home_team, away_team, matchday)
SELECT
  t1.group_letter,
  t1.name,
  t2.name,
  1
FROM tournament_teams t1
JOIN tournament_teams t2
  ON t1.group_letter = t2.group_letter
 AND t1.name < t2.name;
