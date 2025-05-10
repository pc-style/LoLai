import { getRiotApiKey } from "./env";

// Remove the direct API key access
// const RIOT_API_KEY = env.RIOT_API_KEY;

export const REGIONS = {
  AMERICAS: {
    BR1: { name: 'Brazil', platform: 'br1', region: 'americas' },
    LA1: { name: 'LAN', platform: 'la1', region: 'americas' },
    LA2: { name: 'LAS', platform: 'la2', region: 'americas' },
    NA1: { name: 'North America', platform: 'na1', region: 'americas' },
  },
  ASIA: {
    KR: { name: 'Korea', platform: 'kr', region: 'asia' },
    JP1: { name: 'Japan', platform: 'jp1', region: 'asia' },
  },
  EUROPE: {
    EUN1: { name: 'EU Nordic & East', platform: 'eun1', region: 'europe' },
    EUW1: { name: 'EU West', platform: 'euw1', region: 'europe' },
    TR1: { name: 'Turkey', platform: 'tr1', region: 'europe' },
    RU: { name: 'Russia', platform: 'ru', region: 'europe' },
  },
  SEA: {
    OC1: { name: 'Oceania', platform: 'oc1', region: 'sea' },
  },
} as const;

export type RegionKey = keyof typeof REGIONS;
export type PlatformKey = keyof (typeof REGIONS)[RegionKey];

interface SummonerData {
  id: string;
  accountId: string;
  puuid: string;
  name: string;
  profileIconId: number;
  summonerLevel: number;
}

interface MatchData {
  metadata: {
    matchId: string;
    participants: string[];
  };
  info: {
    gameCreation: number;
    gameDuration: number;
    gameMode: string;
    participants: Array<{
      puuid: string;
      summonerName: string;
      championName: string;
      teamPosition: string;
      kills: number;
      deaths: number;
      assists: number;
      totalMinionsKilled: number;
      neutralMinionsKilled: number;
      visionScore: number;
      wardsPlaced: number;
      wardsKilled: number;
      controlWardsPlaced: number;
      goldEarned: number;
      totalDamageDealtToChampions: number;
      totalDamageTaken: number;
      win: boolean;
      teamId: number;
      champLevel: number;
      summoner1Id: number;
      summoner2Id: number;
      item0: number;
      item1: number;
      item2: number;
      item3: number;
      item4: number;
      item5: number;
      item6: number;
    }>;
  };
}

interface RoleStats {
  games: number;
  wins: number;
  averageKDA: { kills: number; deaths: number; assists: number };
  averageCS: number;
  averageVisionScore: number;
  averageDamageDealt: number;
  averageDamageTaken: number;
  averageGoldEarned: number;
}

interface BasicStats {
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
}

interface DetailedStats extends BasicStats {
  roleStats: Record<string, RoleStats>;
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

async function makeRiotRequest<T>(url: string): Promise<T> {
  const apiKey = getRiotApiKey();
  
  if (!apiKey) {
    throw new Error('Riot API key is not configured. Please check your environment variables.');
  }

  const response = await fetch(url, {
    headers: {
      "X-Riot-Token": apiKey
    }
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    
    switch (response.status) {
      case 401:
        throw new Error('Invalid Riot API key. Please check your configuration.');
      case 403:
        throw new Error('Riot API key has expired or is invalid.');
      case 404:
        throw new Error('Resource not found. The requested data may not exist.');
      case 429:
        throw new Error('Rate limit exceeded. Please try again later.');
      default:
        throw new Error(`Failed to fetch data: ${errorText}`);
    }
  }

  return response.json();
}

export async function getSummonerByName(
  gameName: string,
  tagLine: string,
  platform: string
): Promise<SummonerData> {
  try {
    // First get the PUUID using the Riot ID endpoint
    const accountData = await makeRiotRequest<{puuid: string}>(
      `https://${getRegionalRoute(platform)}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`
    );
    
    const puuid = accountData.puuid;

    // Then get the summoner data using the PUUID
    return await makeRiotRequest<SummonerData>(
      `https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`
    );
  } catch (error) {
    console.error('Error in getSummonerByName:', error);
    throw error;
  }
}

// Helper function to get the regional route for the Riot ID API
function getRegionalRoute(platform: string): string {
  const region = Object.values(REGIONS)
    .flatMap(regions => Object.values(regions))
    .find(r => r.platform === platform)?.region;

  switch (region) {
    case 'americas':
      return 'americas';
    case 'asia':
      return 'asia';
    case 'europe':
      return 'europe';
    case 'sea':
      return 'sea';
    default:
      return 'americas';
  }
}

export async function getMatchHistory(
  puuid: string,
  count: number = 10,
  region: string = 'americas'
): Promise<string[]> {
  try {
    return await makeRiotRequest<string[]>(
      `https://${region}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?count=${count}`
    );
  } catch (error) {
    console.error('Error in getMatchHistory:', error);
    throw error;
  }
}

export async function getMatchDetails(
  matchId: string,
  platform: string = 'na1'
): Promise<MatchData> {
  try {
    // Normalize platform to lowercase
    const normalizedPlatform = platform.toLowerCase();
    
    // Convert platform to region
    const region = Object.values(REGIONS)
      .flatMap(regions => Object.values(regions))
      .find(r => r.platform.toLowerCase() === normalizedPlatform)?.region || 'americas';

    console.log(`Getting match details for ${matchId} using platform ${normalizedPlatform} (routing through ${region})`);

    const apiKey = getRiotApiKey();
    if (!apiKey) {
      throw new Error('API key not found');
    }

    const response = await fetch(
      `https://${region}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
      {
        headers: {
          "X-Riot-Token": apiKey
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch match details: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in getMatchDetails:', error);
    throw error;
  }
}

export function calculateStats(matches: MatchData[], puuid: string): BasicStats {
  let totalKills = 0;
  let totalDeaths = 0;
  let totalAssists = 0;
  let totalCS = 0;
  let totalVisionScore = 0;
  let wins = 0;
  let gamesPlayed = 0;
  const championStats: Record<string, { games: number; wins: number }> = {};

  matches.forEach(match => {
    const playerData = match.info.participants.find(p => p.puuid === puuid);
    if (playerData) {
      totalKills += playerData.kills;
      totalDeaths += playerData.deaths;
      totalAssists += playerData.assists;
      totalCS += playerData.totalMinionsKilled;
      totalVisionScore += playerData.visionScore;
      if (playerData.win) wins++;
      gamesPlayed++;

      // Track champion stats
      if (!championStats[playerData.championName]) {
        championStats[playerData.championName] = { games: 0, wins: 0 };
      }
      championStats[playerData.championName].games++;
      if (playerData.win) championStats[playerData.championName].wins++;
    }
  });

  return {
    averageKDA: {
      kills: totalKills / gamesPlayed,
      deaths: totalDeaths / gamesPlayed,
      assists: totalAssists / gamesPlayed,
    },
    averageCS: totalCS / gamesPlayed,
    averageVisionScore: totalVisionScore / gamesPlayed,
    winRate: (wins / gamesPlayed) * 100,
    gamesPlayed,
    championStats,
  };
}

export function calculateDetailedStats(matches: MatchData[], puuid: string): DetailedStats {
  const basicStats = calculateStats(matches, puuid);
  const roleStats: Record<string, RoleStats> = {};
  const recentMatches: DetailedStats['recentMatches'] = [];

  for (const match of matches) {
    const playerData = match.info.participants.find(p => p.puuid === puuid);
    if (!playerData) continue;

    const role = playerData.teamPosition || 'UNKNOWN';
    if (!roleStats[role]) {
      roleStats[role] = {
        games: 0,
        wins: 0,
        averageKDA: { kills: 0, deaths: 0, assists: 0 },
        averageCS: 0,
        averageVisionScore: 0,
        averageDamageDealt: 0,
        averageDamageTaken: 0,
        averageGoldEarned: 0
      };
    }

    // Update role stats
    roleStats[role].games++;
    if (playerData.win) roleStats[role].wins++;
    roleStats[role].averageKDA.kills += playerData.kills;
    roleStats[role].averageKDA.deaths += playerData.deaths;
    roleStats[role].averageKDA.assists += playerData.assists;
    roleStats[role].averageCS += playerData.totalMinionsKilled + (playerData.neutralMinionsKilled || 0);
    roleStats[role].averageVisionScore += playerData.visionScore;
    roleStats[role].averageDamageDealt += playerData.totalDamageDealtToChampions;
    roleStats[role].averageDamageTaken += playerData.totalDamageTaken;
    roleStats[role].averageGoldEarned += playerData.goldEarned;

    // Add to recent matches
    recentMatches.push({
      matchId: match.metadata.matchId,
      champion: playerData.championName,
      role: role,
      result: playerData.win ? 'Victory' : 'Defeat',
      kda: {
        kills: playerData.kills,
        deaths: playerData.deaths,
        assists: playerData.assists
      },
      cs: playerData.totalMinionsKilled + (playerData.neutralMinionsKilled || 0),
      duration: match.info.gameDuration,
      timestamp: match.info.gameCreation
    });
  }

  // Calculate averages for role stats
  Object.keys(roleStats).forEach(role => {
    const stats = roleStats[role];
    const games = stats.games;
    stats.averageKDA.kills /= games;
    stats.averageKDA.deaths /= games;
    stats.averageKDA.assists /= games;
    stats.averageCS /= games;
    stats.averageVisionScore /= games;
    stats.averageDamageDealt /= games;
    stats.averageDamageTaken /= games;
    stats.averageGoldEarned /= games;
  });

  // Analyze strengths and weaknesses
  const strengthsAndWeaknesses = analyzeStrengthsAndWeaknesses(matches, puuid);

  return {
    ...basicStats,
    roleStats,
    recentMatches,
    strengthsAndWeaknesses
  };
}

function analyzeStrengthsAndWeaknesses(matches: MatchData[], puuid: string) {
  const strengths = new Set<string>();
  const weaknesses = new Set<string>();
  
  let totalGames = 0;
  let highDamageGames = 0;
  let goodVisionGames = 0;
  let goodCSGames = 0;
  let lowDeathGames = 0;
  let highKDAGames = 0;

  matches.forEach(match => {
    const player = match.info.participants.find(p => p.puuid === puuid);
    if (!player) return;

    totalGames++;
    
    // Check various performance metrics
    const csPerMin = (player.totalMinionsKilled + (player.neutralMinionsKilled || 0)) / (match.info.gameDuration / 60);
    const kda = (player.kills + player.assists) / Math.max(1, player.deaths);
    
    if (csPerMin >= 7) goodCSGames++;
    if (player.visionScore >= 30) goodVisionGames++;
    if (player.deaths <= 3) lowDeathGames++;
    if (kda >= 3) highKDAGames++;
    
    // Compare damage to team average
    const teamPlayers = match.info.participants.filter(p => p.teamId === player.teamId);
    const teamAvgDamage = teamPlayers.reduce((sum, p) => sum + p.totalDamageDealtToChampions, 0) / teamPlayers.length;
    if (player.totalDamageDealtToChampions > teamAvgDamage * 1.2) highDamageGames++;
  });

  // Analyze patterns
  if (highDamageGames / totalGames >= 0.6) strengths.add("High damage output");
  if (goodVisionGames / totalGames >= 0.6) strengths.add("Good vision control");
  if (goodCSGames / totalGames >= 0.6) strengths.add("Strong farming");
  if (lowDeathGames / totalGames >= 0.6) strengths.add("Plays safely");
  if (highKDAGames / totalGames >= 0.6) strengths.add("Strong KDA ratio");

  if (highDamageGames / totalGames <= 0.3) weaknesses.add("Low damage output");
  if (goodVisionGames / totalGames <= 0.3) weaknesses.add("Poor vision control");
  if (goodCSGames / totalGames <= 0.3) weaknesses.add("Needs CS improvement");
  if (lowDeathGames / totalGames <= 0.3) weaknesses.add("Dies too frequently");
  if (highKDAGames / totalGames <= 0.3) weaknesses.add("Low kill participation");

  return {
    strengths: Array.from(strengths),
    weaknesses: Array.from(weaknesses)
  };
} 