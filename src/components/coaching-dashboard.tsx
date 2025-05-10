import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { motion } from "framer-motion";
import { getSummonerByName, getMatchHistory, getMatchDetails, calculateDetailedStats } from "@/lib/riot-api";
import { FiSearch, FiTrendingUp, FiAward, FiEye, FiClock, FiTarget, FiShield } from "react-icons/fi";

interface DetailedStats {
  averageKDA: {
    kills: number;
    deaths: number;
    assists: number;
  };
  averageCS: number;
  averageVisionScore: number;
  winRate: number;
  gamesPlayed: number;
  championStats: Record<string, { games: number; wins: number }>;
  roleStats: Record<string, {
    games: number;
    wins: number;
    averageKDA: { kills: number; deaths: number; assists: number };
    averageCS: number;
    averageVisionScore: number;
    averageDamageDealt: number;
    averageDamageTaken: number;
    averageGoldEarned: number;
  }>;
  recentMatches: Array<{
    matchId: string;
    champion: string;
    role: string;
    result: 'Victory' | 'Defeat';
    kda: { kills: number; deaths: number; assists: number };
    cs: number;
    duration: number;
    timestamp: number;
  }>;
  strengthsAndWeaknesses: {
    strengths: string[];
    weaknesses: string[];
  };
}

export function CoachingDashboard() {
  const [summonerName, setSummonerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<DetailedStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!summonerName) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Get summoner data
      const summoner = await getSummonerByName(summonerName);
      
      // Get match history
      const matchIds = await getMatchHistory(summoner.puuid, 20);
      
      // Get match details for each match
      const matchDetails = await Promise.all(
        matchIds.map(id => getMatchDetails(id))
      );
      
      // Calculate detailed stats
      const playerStats = calculateDetailedStats(matchDetails, summoner.puuid);
      setStats(playerStats);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex gap-4">
        <Input
          placeholder="Enter summoner name..."
          value={summonerName}
          onChange={(e) => setSummonerName(e.target.value)}
          className="max-w-sm"
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? (
            <div className="animate-spin">⌛</div>
          ) : (
            <>
              <FiSearch className="mr-2" />
              Search
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="text-red-500 bg-red-100 p-4 rounded-lg">
          {error}
        </div>
      )}

      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Overall Stats */}
          <Card className="p-6 glass-effect">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FiTrendingUp className="mr-2" />
              Overall Performance
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">KDA</p>
                <p className="text-2xl font-bold">
                  {stats.averageKDA.kills.toFixed(1)} / {stats.averageKDA.deaths.toFixed(1)} / {stats.averageKDA.assists.toFixed(1)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Win Rate</p>
                <p className="text-2xl font-bold">{stats.winRate.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average CS per Game</p>
                <p className="text-2xl font-bold">{stats.averageCS.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vision Score</p>
                <p className="text-2xl font-bold">{stats.averageVisionScore.toFixed(1)}</p>
              </div>
            </div>
          </Card>

          {/* Role Stats */}
          <Card className="p-6 glass-effect">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FiTarget className="mr-2" />
              Role Performance
            </h3>
            <div className="space-y-4">
              {Object.entries(stats.roleStats).map(([role, data]) => (
                <div key={role} className="border-b border-border/50 pb-3 last:border-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{role}</span>
                    <span className="text-sm text-muted-foreground">
                      {((data.wins / data.games) * 100).toFixed(1)}% WR ({data.games} games)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">KDA: </span>
                      {data.averageKDA.kills.toFixed(1)}/{data.averageKDA.deaths.toFixed(1)}/{data.averageKDA.assists.toFixed(1)}
                    </div>
                    <div>
                      <span className="text-muted-foreground">CS: </span>
                      {data.averageCS.toFixed(1)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Champion Stats */}
          <Card className="p-6 glass-effect">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FiAward className="mr-2" />
              Top Champions
            </h3>
            <div className="space-y-4">
              {Object.entries(stats.championStats)
                .sort((a, b) => b[1].games - a[1].games)
                .slice(0, 5)
                .map(([champion, data]) => (
                  <div key={champion} className="flex justify-between items-center">
                    <span>{champion}</span>
                    <div className="text-sm text-muted-foreground">
                      {((data.wins / data.games) * 100).toFixed(1)}% WR
                      ({data.games} games)
                    </div>
                  </div>
                ))}
            </div>
          </Card>

          {/* Strengths & Weaknesses */}
          <Card className="p-6 glass-effect">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FiShield className="mr-2" />
              Strengths & Weaknesses
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-green-500 mb-2">Strengths</h4>
                <ul className="space-y-1">
                  {stats.strengthsAndWeaknesses.strengths.map((strength, index) => (
                    <li key={index} className="text-sm flex items-center gap-2">
                      <span className="text-green-500">•</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-red-500 mb-2">Areas for Improvement</h4>
                <ul className="space-y-1">
                  {stats.strengthsAndWeaknesses.weaknesses.map((weakness, index) => (
                    <li key={index} className="text-sm flex items-center gap-2">
                      <span className="text-red-500">•</span>
                      {weakness}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          {/* Recent Matches */}
          <Card className="p-6 glass-effect md:col-span-2">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FiClock className="mr-2" />
              Recent Matches
            </h3>
            <div className="space-y-4">
              {stats.recentMatches.map((match, index) => (
                <motion.div
                  key={match.matchId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    match.result === 'Victory' ? 'bg-green-500/10' : 'bg-red-500/10'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`text-sm font-medium ${
                      match.result === 'Victory' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {match.result}
                    </div>
                    <div>
                      <div className="font-medium">{match.champion}</div>
                      <div className="text-sm text-muted-foreground">{match.role}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="font-medium">
                        {match.kda.kills}/{match.kda.deaths}/{match.kda.assists}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {match.cs} CS ({(match.cs / (match.duration / 60)).toFixed(1)}/min)
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div>{formatDuration(match.duration)}</div>
                      <div>{formatTimestamp(match.timestamp)}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
} 