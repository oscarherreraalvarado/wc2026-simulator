import type { BracketRound } from './tournament.types';

/** Resultado oficial cargado por admin (fase grupos o eliminatoria). */
export interface OfficialResult {
  id?: string;
  stage: 'GROUP' | BracketRound;
  homeTeam: string;
  awayTeam: string;
  homeGoals: number | null;
  awayGoals: number | null;
  winner: string | null;
  playedAt?: string;
}

/** Marcador predicho en fase de grupos. */
export interface PredictedGroupMatch {
  homeTeam: string;
  awayTeam: string;
  homeGoals: number;
  awayGoals: number;
}

/** Pick de llave eliminatoria. */
export interface PredictedBracketPick {
  round: BracketRound;
  matchIndex: number;
  winner: string | null;
}

/** Detalle de puntos por ítem. */
export interface ScoreBreakdownItem {
  category: 'group' | 'knockout' | 'champion';
  label: string;
  points: number;
  earned: boolean;
}

/** Resultado del cálculo de puntos. */
export interface PredictionScoreResult {
  totalScore: number;
  breakdown: ScoreBreakdownItem[];
  officialChampion: string | null;
  scoredGroupMatches: number;
  scoredKnockoutMatches: number;
}

/** Puntos por categoría (documentado en tournament-logic). */
export interface ScoringPointsConfig {
  groupExactScore: number;
  groupCorrectOutcome: number;
  knockout: Record<BracketRound, number>;
  championBonus: number;
}
