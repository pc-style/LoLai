'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState, useRef } from "react";
import { MatchStats } from "@/types/match";
import { fetchMatchHistory, calculateAverageStats, getPerformanceInsights } from "@/lib/matchAnalysis";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { REGIONS } from "@/lib/riot-api";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { motion } from "framer-motion";

interface ExtendedMatchStats extends MatchStats {
  kdaValue: number;
  matchNumber: number;
  kills: number;
  deaths: number;
  assists: number;
}

export default function SessionSummaries() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [matches, setMatches] = useState<MatchStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<string[]>([]);
  const [summonerName, setSummonerName] = useState("");
  const [tagLine, setTagLine] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState("NA1");
  const [summoner, setSummoner] = useState<{ puuid: string } | null>(null);
  const matchesPerPage = 10;

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

  // Load default values from settings
  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      if (settings.region) {
        // Find the matching platform from REGIONS
        const platform = Object.values(REGIONS)
          .flatMap(regions => Object.values(regions))
          .find(r => r.platform.toUpperCase() === settings.region)?.platform;
        
        if (platform) {
          setSelectedRegion(platform);
        }
      }
      if (settings.summonerName) {
        setSummonerName(settings.summonerName);
      }
      if (settings.summonerTag) {
        setTagLine(settings.summonerTag);
      }
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summonerName.trim() || !tagLine.trim()) return;

    setLoading(true);
    setError(null);
    setCurrentPage(1);
    try {
      const { matches: matchData, hasMore: hasMoreMatches, summoner: summonerData } = await fetchMatchHistory({
        gameName: summonerName,
        tagLine,
        platform: selectedRegion,
        page: 1,
        matchesPerPage
      });
      setMatches(matchData);
      setHasMore(hasMoreMatches);
      setSummoner(summonerData);
      setInsights(getPerformanceInsights(matchData));
    } catch (error) {
      console.error("Error loading match data:", error);
      setError(
        error instanceof Error 
          ? error.message 
          : "Failed to load summoner data. Please check the summoner name and tag line and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = async (newPage: number) => {
    if (newPage < 1 || (newPage > currentPage && !hasMore)) return;

    setLoading(true);
    try {
      const { matches: matchData, hasMore: hasMoreMatches } = await fetchMatchHistory({
        gameName: summonerName,
        tagLine,
        platform: selectedRegion,
        page: newPage,
        matchesPerPage
      });
      setMatches(matchData);
      setHasMore(hasMoreMatches);
      setCurrentPage(newPage);
    } catch (error) {
      console.error("Error loading match data:", error);
      setError("Failed to load match data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Transform match data for graphs
  const prepareGraphData = (matches: MatchStats[]): ExtendedMatchStats[] => {
    return matches.map((match, index) => {
      const [kills, deaths, assists] = match.kda.split('/').map(Number);
      const kdaValue = deaths === 0 ? kills + assists : (kills + assists) / deaths;
      
      return {
        ...match,
        matchNumber: index + 1,
        kdaValue,
        kills,
        deaths,
        assists
      };
    }).reverse(); // Show oldest match first
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500" />
      </div>
    );
  }

  const stats = calculateAverageStats(matches);

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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Session Summaries</h1>
          <Button
            variant="outline"
            onClick={() => router.push('/chat')}
            className="glass-effect hover:glass-effect-strong"
          >
            Back to Chat
          </Button>
        </div>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <div className="flex-1 max-w-md">
              <Input
                type="text"
                placeholder="Enter game name"
                value={summonerName}
                onChange={(e) => setSummonerName(e.target.value)}
                className="glass-effect hover:glass-effect-strong"
              />
            </div>
            <div className="w-32">
              <Input
                type="text"
                placeholder="Tag (e.g. NA1)"
                value={tagLine}
                onChange={(e) => setTagLine(e.target.value)}
                className="glass-effect hover:glass-effect-strong"
              />
            </div>
            <Select
              value={selectedRegion}
              onValueChange={setSelectedRegion}
            >
              <SelectTrigger className="w-[180px] glass-effect hover:glass-effect-strong">
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(REGIONS).map(([regionGroup, platforms]) => (
                  <SelectGroup key={regionGroup}>
                    <SelectLabel>{regionGroup}</SelectLabel>
                    {Object.entries(platforms).map(([key, value]) => (
                      <SelectItem key={key} value={value.platform}>
                        {value.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" className="glass-effect-strong hover:glass-effect text-foreground">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </form>
        
        {matches.length > 0 ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* KDA Trend Graph */}
              <Card className="glass-effect-strong">
                <CardHeader>
                  <CardTitle>KDA Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={prepareGraphData(matches)}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-10" />
                        <XAxis 
                          dataKey="matchNumber" 
                          label={{ value: 'Recent Matches', position: 'bottom' }}
                          reversed 
                          className="text-foreground opacity-50"
                        />
                        <YAxis className="text-foreground opacity-50" />
                        <Tooltip
                          formatter={(value: number, name: string) => [value.toFixed(2), name]}
                          labelFormatter={(label) => `Match ${label}`}
                          contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="kills" 
                          stroke="hsl(var(--success))"
                          name="Kills"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="deaths" 
                          stroke="hsl(var(--destructive))" 
                          name="Deaths"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="assists" 
                          stroke="hsl(var(--primary))" 
                          name="Assists"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Win Rate Graph */}
              <Card className="glass-effect-strong">
                <CardHeader>
                  <CardTitle>Win Rate by Champion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={prepareGraphData(matches).reduce((acc, match) => {
                        const existing = acc.find(item => item.champion === match.champion);
                        if (existing) {
                          existing.games++;
                          if (match.winRate > 0) existing.wins++;
                          existing.winRate = (existing.wins / existing.games) * 100;
                        } else {
                          acc.push({
                            champion: match.champion,
                            games: 1,
                            wins: match.winRate > 0 ? 1 : 0,
                            winRate: match.winRate * 100
                          });
                        }
                        return acc;
                      }, [] as Array<{ champion: string; games: number; wins: number; winRate: number }>)}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-10" />
                        <XAxis dataKey="champion" className="text-foreground opacity-50" />
                        <YAxis 
                          domain={[0, 100]}
                          label={{ value: 'Win Rate %', angle: -90, position: 'insideLeft' }}
                          className="text-foreground opacity-50"
                        />
                        <Tooltip 
                          formatter={(value: number) => [`${value.toFixed(1)}%`, 'Win Rate']}
                          labelFormatter={(label) => `Champion: ${label}`}
                          contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Legend />
                        <Bar 
                          dataKey="winRate" 
                          name="Win Rate" 
                          fill="hsl(var(--primary))"
                          radius={[4, 4, 0, 0]}
                        >
                          {prepareGraphData(matches).map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`}
                              fill={entry.winRate > 50 ? 'hsl(var(--success))' : 'hsl(var(--destructive))'}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="glass-effect-strong">
                <CardHeader>
                  <CardTitle>Average KDA</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-bold">
                  {stats?.averageKDA.toFixed(2) ?? "N/A"}
                </CardContent>
              </Card>

              <Card className="glass-effect-strong">
                <CardHeader>
                  <CardTitle>Vision Score</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-bold">
                  {stats?.averageVisionScore ?? "N/A"}
                </CardContent>
              </Card>

              <Card className="glass-effect-strong">
                <CardHeader>
                  <CardTitle>CS/min</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-bold">
                  {stats?.averageCS ?? "N/A"}
                </CardContent>
              </Card>

              <Card className="glass-effect-strong">
                <CardHeader>
                  <CardTitle>Win Rate</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-bold">
                  {stats ? `${stats.winRate}%` : "N/A"}
                </CardContent>
              </Card>
            </div>

            {insights.length > 0 && (
              <Card className="mb-8 glass-effect-strong">
                <CardHeader>
                  <CardTitle>Performance Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2">
                    {insights.map((insight, index) => (
                      <li key={index}>{insight}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Recent Matches</h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="glass-effect hover:glass-effect-strong"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!hasMore}
                    className="glass-effect hover:glass-effect-strong"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {matches.map((match, index) => (
                <Card 
                  key={index} 
                  className="cursor-pointer glass-effect hover:glass-effect-strong transition-all duration-300"
                  onClick={() => {
                    if (summoner) {
                      router.push(`/match/${match.matchId}?region=${selectedRegion}&puuid=${summoner.puuid}`);
                    }
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold">{match.champion}</p>
                        <p className="text-sm text-muted-foreground">KDA: {match.kda}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {new Date(match.timestamp).toLocaleDateString()}
                        </p>
                        <p className="text-sm">Vision Score: {match.visionScore}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center text-muted-foreground mt-8">
            Enter a summoner name to view their match history and statistics.
          </div>
        )}
      </div>
    </main>
  );
} 