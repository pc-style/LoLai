export interface MatchStats {
  matchId: string;
  kda: string;
  visionScore: number;
  cs: number;
  csPerMinute: number;
  winRate: number;
  champion: string;
  timestamp: string;
  kills: number;
  deaths: number;
  assists: number;
  damageDealt: number;
  goldEarned: number;
  role: string;
}

export interface MatchAnalysis {
  averageKDA: number;
  averageVisionScore: number;
  averageCS: string;
  winRate: number;
}

export interface MatchHistoryParams {
  gameName: string;
  tagLine: string;
  platform: string;
  page?: number;
  matchesPerPage?: number;
} 