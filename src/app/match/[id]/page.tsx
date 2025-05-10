'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMatchDetails } from '@/lib/riot-api';
import { generateMatchAnalysis } from '@/lib/match-analysis';
import { BarChart, LineChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Loader2, ArrowLeft } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { motion } from 'framer-motion';

interface MatchParticipant {
  puuid: string;
  summonerName: string;
  championName: string;
  teamPosition: string;
  teamId: number;
  kills: number;
  deaths: number;
  assists: number;
  totalMinionsKilled: number;
  neutralMinionsKilled: number;
  visionScore: number;
  totalDamageDealtToChampions: number;
  totalDamageTaken: number;
  goldEarned: number;
  wardsPlaced: number;
  wardsKilled: number;
  controlWardsPlaced: number;
  win: boolean;
  // Additional stats
  totalHeal: number;
  totalHealsOnTeammates: number;
  damageSelfMitigated: number;
  totalTimeSpentDead: number;
  longestTimeSpentLiving: number;
  // Arena specific
  arenaPoints?: number;
  augments?: string[];
  // ARAM specific
  summonSpells?: Array<{
    id: number;
    hits?: number;
    casts?: number;
  }>;
}

interface DetailedMatchData {
  matchId: string;
  region: string;
  puuid: string;
  gameMode: string;
  gameDuration: number;
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
    damagePerMinute: number;
    damagePerGold: number;
    healingDone: number;
    damageMitigated: number;
    timeSpentDead: number;
    longestTimeSpentLiving: number;
    killsPerMinute: number;
    deathsPerMinute: number;
    arenaPoints?: number;
    augments?: string[];
    snowballsHit?: number;
    snowballsThrown?: number;
  };
  teamStats: {
    totalKills: number;
    totalGold: number;
    totalDamage: number;
    totalDamageTaken: number;
    totalHealingDone: number;
    averageTimeSpentDead: number;
  };
  timeline: {
    csPerMinDeltas: number[];
    goldPerMinDeltas: number[];
    xpPerMinDeltas: number[];
    damagePerMinDeltas: number[];
  };
  aiAnalysis: string[];
}

export default function MatchDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [matchData, setMatchData] = useState<DetailedMatchData | null>(null);
  const [aiTips, setAiTips] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [routeParams, setRouteParams] = useState({
    matchId: '',
    region: '',
    puuid: ''
  });

  // For glow effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const elements = document.querySelectorAll('.glow-effect');
    elements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      (element as HTMLElement).style.setProperty('--mouse-x', `${x}px`);
      (element as HTMLElement).style.setProperty('--mouse-y', `${y}px`);
    });
  };

  // Set route params once on mount
  useEffect(() => {
    const id = params?.id as string;
    const region = searchParams?.get('region') || '';
    const puuid = searchParams?.get('puuid') || '';

    if (!id || !region || !puuid) {
      setError('Missing required parameters');
      setLoading(false);
      return;
    }

    // Normalize region to match platform format
    const normalizedRegion = region.toLowerCase();

    setRouteParams({
      matchId: id,
      region: normalizedRegion,
      puuid: puuid
    });
  }, [params, searchParams]);

  useEffect(() => {
    if (routeParams.matchId && routeParams.region && routeParams.puuid) {
      loadMatchDetails();
    }
  }, [routeParams]);

  const loadMatchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const details = await getMatchDetails(routeParams.matchId, routeParams.region);
      const player = details.info.participants.find(p => p.puuid === routeParams.puuid) as unknown as MatchParticipant;
      if (!player) throw new Error('Player not found in match');

      const team = details.info.participants.filter(p => p.teamId === player.teamId) as unknown as MatchParticipant[];
      const teamKills = team.reduce((sum, p) => sum + p.kills, 0);
      const gameDurationMinutes = details.info.gameDuration / 60;

      // Normalize game mode for consistent comparison
      const rawGameMode = details.info.gameMode?.toUpperCase() || '';
      const gameMode = rawGameMode === 'CHERRY' ? 'ARENA' : rawGameMode;
      console.log('Raw Game Mode:', rawGameMode, 'Normalized Game Mode:', gameMode);

      // Calculate additional stats
      const damagePerMinute = player.totalDamageDealtToChampions / gameDurationMinutes;
      const damagePerGold = player.totalDamageDealtToChampions / Math.max(1, player.goldEarned) * 1000;
      const killsPerMinute = player.kills / gameDurationMinutes;
      const deathsPerMinute = player.deaths / gameDurationMinutes;

      // Initialize stats with default values
      let adjustedStats = {
        cs: player.totalMinionsKilled + player.neutralMinionsKilled,
        visionScore: player.visionScore,
        wardsPlaced: player.wardsPlaced,
        wardsKilled: player.wardsKilled,
        controlWardsPlaced: player.controlWardsPlaced,
        role: player.teamPosition || 'NONE',
        damagePerMinute,
        damagePerGold,
        healingDone: player.totalHeal + player.totalHealsOnTeammates,
        damageMitigated: player.damageSelfMitigated,
        timeSpentDead: player.totalTimeSpentDead,
        longestTimeSpentLiving: player.longestTimeSpentLiving,
        killsPerMinute,
        deathsPerMinute,
        // Initialize mode-specific stats
        snowballsHit: 0,
        snowballsThrown: 0,
        arenaPoints: 0,
        augments: [] as string[]
      };

      // Adjust stats based on game mode
      switch (gameMode) {
        case 'ARAM':
          adjustedStats = {
            ...adjustedStats,
            cs: player.totalMinionsKilled,
            visionScore: 0,
            wardsPlaced: 0,
            wardsKilled: 0,
            controlWardsPlaced: 0,
            role: 'NONE',
            // Add ARAM specific stats
            snowballsHit: player.summonSpells?.find(spell => spell.id === 32)?.hits || 0,
            snowballsThrown: player.summonSpells?.find(spell => spell.id === 32)?.casts || 0
          };
          break;
        case 'ARENA':
          adjustedStats = {
            ...adjustedStats,
            cs: 0,
            visionScore: 0,
            wardsPlaced: 0,
            wardsKilled: 0,
            controlWardsPlaced: 0,
            role: 'NONE',
            // Add Arena specific stats
            arenaPoints: player.arenaPoints || 0,
            augments: player.augments || []
          };
          break;
      }

      const matchData: DetailedMatchData = {
        matchId: routeParams.matchId,
        region: routeParams.region,
        puuid: routeParams.puuid,
        gameMode: gameMode,
        gameDuration: details.info.gameDuration,
        playerStats: {
          kills: player.kills,
          deaths: player.deaths,
          assists: player.assists,
          totalDamageDealt: player.totalDamageDealtToChampions,
          totalDamageTaken: player.totalDamageTaken,
          goldEarned: player.goldEarned,
          visionScore: adjustedStats.visionScore,
          wardsPlaced: adjustedStats.wardsPlaced,
          wardsKilled: adjustedStats.wardsKilled,
          controlWardsPlaced: adjustedStats.controlWardsPlaced,
          cs: adjustedStats.cs,
          csPerMinute: adjustedStats.cs / gameDurationMinutes,
          killParticipation: ((player.kills + player.assists) / Math.max(1, teamKills)) * 100,
          championName: player.championName,
          role: adjustedStats.role,
          win: player.win,
          damagePerMinute: adjustedStats.damagePerMinute,
          damagePerGold: adjustedStats.damagePerGold,
          healingDone: adjustedStats.healingDone,
          damageMitigated: adjustedStats.damageMitigated,
          timeSpentDead: adjustedStats.timeSpentDead,
          longestTimeSpentLiving: adjustedStats.longestTimeSpentLiving,
          killsPerMinute: adjustedStats.killsPerMinute,
          deathsPerMinute: adjustedStats.deathsPerMinute,
          ...(gameMode === 'ARAM' && {
            snowballsHit: adjustedStats.snowballsHit,
            snowballsThrown: adjustedStats.snowballsThrown
          }),
          ...(gameMode === 'ARENA' && {
            arenaPoints: adjustedStats.arenaPoints,
            augments: adjustedStats.augments
          })
        },
        teamStats: {
          totalKills: teamKills,
          totalGold: team.reduce((sum, p) => sum + p.goldEarned, 0),
          totalDamage: team.reduce((sum, p) => sum + p.totalDamageDealtToChampions, 0),
          totalDamageTaken: team.reduce((sum, p) => sum + p.totalDamageTaken, 0),
          totalHealingDone: team.reduce((sum, p) => sum + p.totalHeal + p.totalHealsOnTeammates, 0),
          averageTimeSpentDead: team.reduce((sum, p) => sum + p.totalTimeSpentDead, 0) / team.length
        },
        timeline: {
          csPerMinDeltas: [],
          goldPerMinDeltas: [],
          xpPerMinDeltas: [],
          damagePerMinDeltas: []
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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Error Loading Match Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <p className="text-sm text-muted-foreground">
                Please check your API key configuration or try again later.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
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
    ...(matchData.gameMode !== 'ARAM' && matchData.gameMode !== 'ARENA' ? [{
      name: 'Vision',
      value: matchData.playerStats.visionScore,
      average: 20 // Placeholder average
    }] : [])
  ];

  return (
    <main 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="flex min-h-screen flex-col bg-background relative overflow-hidden noise-bg"
    >
      {/* Background effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background/90" />
        <div className="absolute inset-0">
          <motion.div 
            animate={{ 
              x: [0, 10, 0, -10, 0],
              y: [0, -10, 0, 10, 0],
              rotate: [0, 2, 0, -2, 0]
            }}
            transition={{ 
              duration: 20, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
            className="absolute top-0 -left-4 w-96 h-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-[100px]" 
          />
          <motion.div 
            animate={{ 
              x: [0, -15, 0, 15, 0],
              y: [0, 15, 0, -15, 0],
              rotate: [0, -2, 0, 2, 0]
            }}
            transition={{ 
              duration: 25, 
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 dark:bg-secondary/10 rounded-full blur-[100px]" 
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1, 0.9, 1],
              x: [0, 5, 0, -5, 0],
              y: [0, -5, 0, 5, 0]
            }}
            transition={{ 
              duration: 30, 
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/3 dark:bg-accent/5 rounded-full blur-[100px]" 
          />
        </div>
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]" 
          style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, hsl(var(--foreground)) 1px, transparent 0)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <div className="container mx-auto p-6 relative z-10">
        <div className="mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="mb-4 glass-effect hover:glass-effect-strong"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Summaries
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <Card className="glass-effect-strong">
            <CardHeader>
              <CardTitle>Error Loading Match Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center text-center">
                <p className="text-destructive mb-4">{error}</p>
                <p className="text-sm text-muted-foreground">
                  Please check your API key configuration or try again later.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : matchData && (
          <>
            <Card className="mb-6 glass-effect-strong">
              <CardHeader>
                <CardTitle>
                  {matchData.gameMode} Match - {matchData.playerStats.championName}
                  {matchData.gameMode !== 'ARAM' && matchData.gameMode !== 'ARENA' && matchData.playerStats.role !== 'NONE' && ` - ${matchData.playerStats.role}`}
                </CardTitle>
              </CardHeader>
            </Card>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="glass-effect">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="combat">Combat</TabsTrigger>
                {matchData.gameMode !== 'ARAM' && matchData.gameMode !== 'ARENA' && (
                  <TabsTrigger value="vision">Vision Control</TabsTrigger>
                )}
                {matchData.gameMode === 'ARENA' && (
                  <TabsTrigger value="arena">Arena Stats</TabsTrigger>
                )}
                {matchData.gameMode === 'ARAM' && (
                  <TabsTrigger value="aram">ARAM Stats</TabsTrigger>
                )}
                <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <Card className="glass-effect-strong">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="stat-card glass-effect p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Result</h3>
                        <p className={matchData.playerStats.win ? "text-success text-xl font-semibold" : "text-destructive text-xl font-semibold"}>
                          {matchData.playerStats.win ? "Victory" : "Defeat"}
                        </p>
                      </div>
                      
                      <div className="stat-card glass-effect p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">KDA</h3>
                        <p className="text-xl font-semibold">{matchData.playerStats.kills}/{matchData.playerStats.deaths}/{matchData.playerStats.assists}</p>
                      </div>

                      <div className="stat-card glass-effect p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Duration</h3>
                        <p className="text-xl font-semibold">{Math.floor(matchData.gameDuration / 60)}:{(matchData.gameDuration % 60).toString().padStart(2, '0')}</p>
                      </div>

                      {matchData.gameMode !== 'ARENA' && (
                        <div className="stat-card glass-effect p-4 rounded-lg">
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">CS</h3>
                          <p className="text-xl font-semibold">{matchData.playerStats.cs} ({matchData.playerStats.csPerMinute.toFixed(1)}/min)</p>
                        </div>
                      )}

                      <div className="stat-card glass-effect p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Kill Participation</h3>
                        <p className="text-xl font-semibold">{matchData.playerStats.killParticipation.toFixed(1)}%</p>
                      </div>

                      <div className="stat-card glass-effect p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Gold Earned</h3>
                        <p className="text-xl font-semibold">{matchData.playerStats.goldEarned.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="combat">
                <Card className="glass-effect-strong">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="stat-card glass-effect p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Damage Dealt</h3>
                        <p className="text-xl font-semibold">{matchData.playerStats.totalDamageDealt.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">
                          {matchData.playerStats.damagePerMinute.toFixed(0)} / min
                        </p>
                      </div>

                      <div className="stat-card glass-effect p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Damage Taken</h3>
                        <p className="text-xl font-semibold">{matchData.playerStats.totalDamageTaken.toLocaleString()}</p>
                      </div>

                      <div className="stat-card glass-effect p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Damage Mitigated</h3>
                        <p className="text-xl font-semibold">{matchData.playerStats.damageMitigated.toLocaleString()}</p>
                      </div>

                      <div className="stat-card glass-effect p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Healing Done</h3>
                        <p className="text-xl font-semibold">{matchData.playerStats.healingDone.toLocaleString()}</p>
                      </div>

                      <div className="stat-card glass-effect p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Time Dead</h3>
                        <p className="text-xl font-semibold">{Math.floor(matchData.playerStats.timeSpentDead / 60)}:{(matchData.playerStats.timeSpentDead % 60).toString().padStart(2, '0')}</p>
                      </div>

                      <div className="stat-card glass-effect p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Longest Time Alive</h3>
                        <p className="text-xl font-semibold">{Math.floor(matchData.playerStats.longestTimeSpentLiving / 60)}:{(matchData.playerStats.longestTimeSpentLiving % 60).toString().padStart(2, '0')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {matchData.gameMode === 'ARENA' && (
                <TabsContent value="arena">
                  <Card className="glass-effect-strong">
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="stat-card glass-effect p-4 rounded-lg">
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Arena Points</h3>
                          <p className="text-xl font-semibold">{matchData.playerStats.arenaPoints}</p>
                        </div>

                        <div className="stat-card glass-effect p-4 rounded-lg col-span-2">
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Augments</h3>
                          <div className="flex flex-wrap gap-2">
                            {matchData.playerStats.augments?.map((augment, index) => (
                              <span key={index} className="px-2 py-1 glass-effect rounded-md text-sm">
                                {augment}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="stat-card glass-effect p-4 rounded-lg">
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Kills per Minute</h3>
                          <p className="text-xl font-semibold">{matchData.playerStats.killsPerMinute.toFixed(2)}</p>
                        </div>

                        <div className="stat-card glass-effect p-4 rounded-lg">
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Deaths per Minute</h3>
                          <p className="text-xl font-semibold">{matchData.playerStats.deathsPerMinute.toFixed(2)}</p>
                        </div>

                        <div className="stat-card glass-effect p-4 rounded-lg">
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Damage per 1k Gold</h3>
                          <p className="text-xl font-semibold">{matchData.playerStats.damagePerGold.toFixed(0)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {matchData.gameMode === 'ARAM' && (
                <TabsContent value="aram">
                  <Card className="glass-effect-strong">
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="stat-card glass-effect p-4 rounded-lg">
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Snowball Accuracy</h3>
                          <p className="text-xl font-semibold">
                            {matchData.playerStats.snowballsHit || 0} / {matchData.playerStats.snowballsThrown || 0}
                            {(matchData.playerStats.snowballsThrown || 0) > 0 && (
                              <span className="text-sm text-muted-foreground ml-2">
                                ({(((matchData.playerStats.snowballsHit || 0) / (matchData.playerStats.snowballsThrown || 1)) * 100).toFixed(1)}%)
                              </span>
                            )}
                          </p>
                        </div>

                        <div className="stat-card glass-effect p-4 rounded-lg">
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Damage per Minute</h3>
                          <p className="text-xl font-semibold">{matchData.playerStats.damagePerMinute.toFixed(0)}</p>
                        </div>

                        <div className="stat-card glass-effect p-4 rounded-lg">
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Damage per 1k Gold</h3>
                          <p className="text-xl font-semibold">{matchData.playerStats.damagePerGold.toFixed(0)}</p>
                        </div>

                        <div className="stat-card glass-effect p-4 rounded-lg">
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Time Dead</h3>
                          <p className="text-xl font-semibold">{Math.floor(matchData.playerStats.timeSpentDead / 60)}:{(matchData.playerStats.timeSpentDead % 60).toString().padStart(2, '0')}</p>
                          <p className="text-sm text-muted-foreground">
                            Team Avg: {Math.floor(matchData.teamStats.averageTimeSpentDead / 60)}:{(matchData.teamStats.averageTimeSpentDead % 60).toString().padStart(2, '0')}
                          </p>
                        </div>

                        <div className="stat-card glass-effect p-4 rounded-lg">
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Healing Done</h3>
                          <p className="text-xl font-semibold">{matchData.playerStats.healingDone.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">
                            {((matchData.playerStats.healingDone / matchData.teamStats.totalHealingDone) * 100).toFixed(1)}% of team
                          </p>
                        </div>

                        <div className="stat-card glass-effect p-4 rounded-lg">
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Damage Mitigated</h3>
                          <p className="text-xl font-semibold">{matchData.playerStats.damageMitigated.toLocaleString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {matchData.gameMode !== 'ARAM' && matchData.gameMode !== 'ARENA' && (
                <TabsContent value="vision">
                  <Card className="glass-effect-strong">
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="stat-card glass-effect p-4 rounded-lg">
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Vision Score</h3>
                          <p className="text-xl font-semibold">{matchData.playerStats.visionScore}</p>
                        </div>
                        <div className="stat-card glass-effect p-4 rounded-lg">
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Wards Placed</h3>
                          <p className="text-xl font-semibold">{matchData.playerStats.wardsPlaced}</p>
                        </div>
                        <div className="stat-card glass-effect p-4 rounded-lg">
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Control Wards</h3>
                          <p className="text-xl font-semibold">{matchData.playerStats.controlWardsPlaced}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              <TabsContent value="analysis">
                <Card className="glass-effect-strong">
                  <CardContent className="pt-6">
                    <div className="prose dark:prose-invert max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw, rehypeSanitize]}
                      >
                        {aiTips.join('\n')}
                      </ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </main>
  );
} 