import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { getMatchDetails } from '@/lib/riot-api';
import { generateMatchAnalysis } from '@/lib/match-analysis';
import { BarChart, LineChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Loader2 } from "lucide-react";

interface MatchDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchId: string;
  region: string; // This is actually the platform (e.g., 'na1', 'euw1')
  puuid: string;
}

interface DetailedMatchData {
  matchId: string;
  region: string;
  puuid: string;
  playerStats: {
    kills: number;
    deaths: number;
    assists: number;
    totalDamageDealt: number;
    totalDamageTaken: number;
    goldEarned: number;
    visionScore: number;
    wardsPlaced: number;
    wardsKilled: number;
    controlWardsPlaced: number;
    cs: number;
    csPerMinute: number;
    killParticipation: number;
    championName: string;
    role: string;
    win: boolean;
  };
  teamStats: {
    totalKills: number;
    totalGold: number;
    totalDamage: number;
  };
  timeline: {
    csPerMinDeltas: number[];
    goldPerMinDeltas: number[];
    xpPerMinDeltas: number[];
    damagePerMinDeltas: number[];
  };
  aiAnalysis: string[];
}

export function MatchDetailsModal({ isOpen, onClose, matchId, region, puuid }: MatchDetailsModalProps) {
  const [loading, setLoading] = useState(true);
  const [matchData, setMatchData] = useState<DetailedMatchData | null>(null);
  const [aiTips, setAiTips] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && matchId) {
      loadMatchDetails();
    }
  }, [isOpen, matchId]);

  const loadMatchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const details = await getMatchDetails(matchId, region);
      const player = details.info.participants.find(p => p.puuid === puuid);
      if (!player) throw new Error('Player not found in match');

      const team = details.info.participants.filter(p => p.teamId === player.teamId);
      const teamKills = team.reduce((sum, p) => sum + p.kills, 0);
      const gameDurationMinutes = details.info.gameDuration / 60;

      const matchData: DetailedMatchData = {
        matchId: matchId,
        region: region,
        puuid: puuid,
        playerStats: {
          kills: player.kills,
          deaths: player.deaths,
          assists: player.assists,
          totalDamageDealt: player.totalDamageDealtToChampions,
          totalDamageTaken: player.totalDamageTaken,
          goldEarned: player.goldEarned,
          visionScore: player.visionScore,
          wardsPlaced: player.wardsPlaced,
          wardsKilled: player.wardsKilled,
          controlWardsPlaced: player.controlWardsPlaced,
          cs: player.totalMinionsKilled + player.neutralMinionsKilled,
          csPerMinute: (player.totalMinionsKilled + player.neutralMinionsKilled) / gameDurationMinutes,
          killParticipation: ((player.kills + player.assists) / Math.max(1, teamKills)) * 100,
          championName: player.championName,
          role: player.teamPosition,
          win: player.win
        },
        teamStats: {
          totalKills: teamKills,
          totalGold: team.reduce((sum, p) => sum + p.goldEarned, 0),
          totalDamage: team.reduce((sum, p) => sum + p.totalDamageDealtToChampions, 0)
        },
        timeline: {
          csPerMinDeltas: [/* Would come from timeline data */],
          goldPerMinDeltas: [/* Would come from timeline data */],
          xpPerMinDeltas: [/* Would come from timeline data */],
          damagePerMinDeltas: [/* Would come from timeline data */]
        },
        aiAnalysis: []
      };

      setMatchData(matchData);
      await generateAiTips(matchData);
    } catch (error) {
      console.error('Error loading match details:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const generateAiTips = async (data: DetailedMatchData) => {
    try {
      const matchData = await getMatchDetails(data.matchId, data.region);
      const player = matchData.info.participants.find(p => p.puuid === data.puuid);
      
      if (!player) {
        throw new Error('Player not found in match data');
      }

      const tips = await generateMatchAnalysis(matchData, player);
      setAiTips(tips);
    } catch (error) {
      console.error('Error generating AI tips:', error);
      setAiTips([
        "Unable to generate analysis at this time.",
        "Please try again later."
      ]);
    }
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Loading Match Details</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error Loading Match Details</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <p className="text-sm text-muted-foreground">
              Please check your API key configuration or try again later.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!matchData) return null;

  const performanceData = [
    {
      name: 'Damage',
      value: matchData.playerStats.totalDamageDealt,
      average: matchData.teamStats.totalDamage / 5
    },
    {
      name: 'Gold',
      value: matchData.playerStats.goldEarned,
      average: matchData.teamStats.totalGold / 5
    },
    {
      name: 'Vision',
      value: matchData.playerStats.visionScore,
      average: 20 // Placeholder average
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Match Details: {matchData.playerStats.championName} - {matchData.playerStats.role}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="vision">Vision</TabsTrigger>
            <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Match Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Result:</span>
                      <span className={matchData.playerStats.win ? "text-green-500" : "text-red-500"}>
                        {matchData.playerStats.win ? "Victory" : "Defeat"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>KDA:</span>
                      <span>{matchData.playerStats.kills}/{matchData.playerStats.deaths}/{matchData.playerStats.assists}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CS/min:</span>
                      <span>{matchData.playerStats.csPerMinute.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Kill Participation:</span>
                      <span>{matchData.playerStats.killParticipation.toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Your Performance" fill="#8884d8" />
                      <Bar dataKey="average" name="Team Average" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Performance</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[
                    { minute: 0, cs: 0, gold: 0 },
                    { minute: 10, cs: matchData.playerStats.cs * 0.3, gold: matchData.playerStats.goldEarned * 0.3 },
                    { minute: 20, cs: matchData.playerStats.cs * 0.7, gold: matchData.playerStats.goldEarned * 0.7 },
                    { minute: 30, cs: matchData.playerStats.cs, gold: matchData.playerStats.goldEarned }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="minute" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="cs" name="CS" stroke="#8884d8" />
                    <Line yAxisId="right" type="monotone" dataKey="gold" name="Gold" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vision">
            <Card>
              <CardHeader>
                <CardTitle>Vision Control</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Ward Statistics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Vision Score:</span>
                        <span>{matchData.playerStats.visionScore}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Wards Placed:</span>
                        <span>{matchData.playerStats.wardsPlaced}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Control Wards:</span>
                        <span>{matchData.playerStats.controlWardsPlaced}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Wards Killed:</span>
                        <span>{matchData.playerStats.wardsKilled}</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Vision Score', value: matchData.playerStats.visionScore },
                        { name: 'Wards Placed', value: matchData.playerStats.wardsPlaced },
                        { name: 'Control Wards', value: matchData.playerStats.controlWardsPlaced }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis">
            <Card>
              <CardHeader>
                <CardTitle>AI Analysis & Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {aiTips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-500">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 