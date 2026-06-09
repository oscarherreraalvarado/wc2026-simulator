-- Reemplaza equipos placeholder con los 48 equipos reales del WC2026

DELETE FROM tournament_fixtures;
DELETE FROM tournament_teams;

INSERT INTO tournament_teams (name, group_letter, flag_emoji) VALUES
  ('México', 'A', '🇲🇽'),
  ('Corea del Sur', 'A', '🇰🇷'),
  ('Sudáfrica', 'A', '🇿🇦'),
  ('Chequia', 'A', '🇨🇿'),
  ('Canadá', 'B', '🇨🇦'),
  ('Bosnia y Herzegovina', 'B', '🇧🇦'),
  ('Catar', 'B', '🇶🇦'),
  ('Suiza', 'B', '🇨🇭'),
  ('Brasil', 'C', '🇧🇷'),
  ('Marruecos', 'C', '🇲🇦'),
  ('Haití', 'C', '🇭🇹'),
  ('Escocia', 'C', '🏴󠁧󠁢󠁳󠁣󠁴󠁿'),
  ('Estados Unidos', 'D', '🇺🇸'),
  ('Paraguay', 'D', '🇵🇾'),
  ('Australia', 'D', '🇦🇺'),
  ('Türkiye', 'D', '🇹🇷'),
  ('Alemania', 'E', '🇩🇪'),
  ('Curazao', 'E', '🇨🇼'),
  ('Costa de Marfil', 'E', '🇨🇮'),
  ('Ecuador', 'E', '🇪🇨'),
  ('Países Bajos', 'F', '🇳🇱'),
  ('Japón', 'F', '🇯🇵'),
  ('Suecia', 'F', '🇸🇪'),
  ('Túnez', 'F', '🇹🇳'),
  ('Bélgica', 'G', '🇧🇪'),
  ('Egipto', 'G', '🇪🇬'),
  ('IR Irán', 'G', '🇮🇷'),
  ('Nueva Zelanda', 'G', '🇳🇿'),
  ('España', 'H', '🇪🇸'),
  ('Uruguay', 'H', '🇺🇾'),
  ('Arabia Saudita', 'H', '🇸🇦'),
  ('Cabo Verde', 'H', '🇨🇻'),
  ('Francia', 'I', '🇫🇷'),
  ('Senegal', 'I', '🇸🇳'),
  ('Noruega', 'I', '🇳🇴'),
  ('Irak', 'I', '🇮🇶'),
  ('Argentina', 'J', '🇦🇷'),
  ('Argelia', 'J', '🇩🇿'),
  ('Austria', 'J', '🇦🇹'),
  ('Jordania', 'J', '🇯🇴'),
  ('Portugal', 'K', '🇵🇹'),
  ('Colombia', 'K', '🇨🇴'),
  ('Uzbekistán', 'K', '🇺🇿'),
  ('Congo DR', 'K', '🇨🇩'),
  ('Inglaterra', 'L', '🏴󠁧󠁢󠁥󠁮󠁧󠁿'),
  ('Croacia', 'L', '🇭🇷'),
  ('Ghana', 'L', '🇬🇭'),
  ('Panamá', 'L', '🇵🇦');

-- 72 fixtures (round-robin: 6 por grupo)
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
