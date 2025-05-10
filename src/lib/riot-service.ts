interface MatchSummary {
  gameId: string;
  champion: string;
  role: string;
  lane: string;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  timestamp: number;
}

interface MatchParticipant {
  puuid: string;
  championName: string;
  role: string;
  lane: string;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
}

export interface PlayerData {
  summonerId?: string;
  puuid?: string;
  summonerLevel?: number;
  profileIconId?: number;
  recentMatches: MatchSummary[];
  mostPlayedChampions: { championId: string; championName: string; count: number }[];
}

import { getRiotApiKey } from './env';

// Helper function to get regional routing value from platform routing value
function getRegionalRoute(platformRouting: string): string {
  // Map platform routing values to regional routing values
  const routingMap: Record<string, string> = {
    'br1': 'americas',
    'la1': 'americas',
    'la2': 'americas',
    'na1': 'americas',
    'eun1': 'europe',
    'euw1': 'europe',
    'tr1': 'europe',
    'ru': 'europe',
    'jp1': 'asia',
    'kr': 'asia',
    'oc1': 'sea',
    'ph2': 'sea',
    'sg2': 'sea',
    'th2': 'sea',
    'tw2': 'sea',
    'vn2': 'sea'
  };
  
  const normalizedPlatform = platformRouting.toLowerCase();
  return routingMap[normalizedPlatform] || 'americas';
}

// Function to fetch player data from Riot API
export async function fetchPlayerData(
  region: string,
  gameName: string,
  tagLine: string
): Promise<PlayerData> {
  try {
    const apiKey = getRiotApiKey();
    
    console.log("API Key available:", apiKey ? "Yes" : "No");
    
    if (!apiKey) {
      console.error("Riot API key not found. Using mock data instead.");
      return getMockPlayerData();
    }

    // Normalize region to lowercase for API calls
    const normalizedRegion = region.toLowerCase();
    const regionalRoute = getRegionalRoute(normalizedRegion);
    
    console.log(`Fetching data for ${gameName}#${tagLine} in region ${normalizedRegion} (routing through ${regionalRoute})`);
    
    // Step 1: Get account info by Riot ID
    const accountResponse = await fetch(`https://${regionalRoute}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`, {
      headers: {
        "X-Riot-Token": apiKey
      }
    });
    
    if (!accountResponse.ok) {
      throw new Error(`Failed to fetch account data: ${accountResponse.status}`);
    }
    
    const accountData = await accountResponse.json();
    const puuid = accountData.puuid;
    
    // Step 2: Get summoner data by PUUID
    const summonerResponse = await fetch(`https://${normalizedRegion}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`, {
      headers: {
        "X-Riot-Token": apiKey
      }
    });
    
    if (!summonerResponse.ok) {
      throw new Error(`Failed to fetch summoner data: ${summonerResponse.status}`);
    }
    
    const summonerData = await summonerResponse.json();
    
    // Step 3: Get recent match IDs
    const matchIdsResponse = await fetch(`https://${regionalRoute}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?count=5`, {
      headers: {
        "X-Riot-Token": apiKey
      }
    });
    
    if (!matchIdsResponse.ok) {
      throw new Error(`Failed to fetch match IDs: ${matchIdsResponse.status}`);
    }
    
    const matchIds = await matchIdsResponse.json();
    
    // Step 4: Get match details for each match ID
    const matchPromises = matchIds.map((matchId: string) => 
      fetch(`https://${regionalRoute}.api.riotgames.com/lol/match/v5/matches/${matchId}`, {
        headers: {
          "X-Riot-Token": apiKey
        }
      }).then(res => {
        if (!res.ok) {
          console.error(`Failed to fetch match data for ${matchId}: ${res.status}`);
          return null;
        }
        return res.json();
      })
    );
    
    const matchResults = await Promise.all(matchPromises);
    const validMatches = matchResults.filter(match => match !== null);
    
    // Process match data
    const recentMatches = validMatches.map(match => {
      const participant = match.info.participants.find((p: MatchParticipant) => p.puuid === puuid);
      
      return {
        gameId: match.metadata.matchId,
        champion: participant.championName,
        role: participant.role,
        lane: participant.lane,
        win: participant.win,
        kills: participant.kills,
        deaths: participant.deaths,
        assists: participant.assists,
        timestamp: match.info.gameCreation
      };
    });
    
    // Calculate most played champions
    const championCounts: Record<string, { championId: string; championName: string; count: number }> = {};
    
    recentMatches.forEach(match => {
      if (!championCounts[match.champion]) {
        championCounts[match.champion] = {
          championId: match.champion, // This is actually the champion name from the API
          championName: match.champion,
          count: 0
        };
      }
      championCounts[match.champion].count++;
    });
    
    const mostPlayedChampions = Object.values(championCounts)
      .sort((a, b) => b.count - a.count);
    
    return {
      summonerId: summonerData.id,
      puuid: puuid,
      summonerLevel: summonerData.summonerLevel,
      profileIconId: summonerData.profileIconId,
      recentMatches,
      mostPlayedChampions
    };
    
  } catch (error) {
    console.error("Error fetching player data:", error);
    
    // For development purposes, return mock data if API calls fail
    if (process.env.NODE_ENV === 'development') {
      console.warn("Using mock data for development");
      return getMockPlayerData();
    }
    
    throw new Error("Failed to fetch player data");
  }
}

// Mock data for development or when API calls fail
function getMockPlayerData(): PlayerData {
  return {
    summonerId: "mock-summoner-id",
    puuid: "mock-puuid",
    summonerLevel: 150,
    profileIconId: 4321,
    recentMatches: [
      {
        gameId: "NA_1234567890",
        champion: "Ahri",
        role: "MIDDLE",
        lane: "MID",
        win: true,
        kills: 8,
        deaths: 3,
        assists: 12,
        timestamp: Date.now() - 86400000, // 1 day ago
      },
      {
        gameId: "NA_1234567891",
        champion: "Lux",
        role: "SUPPORT",
        lane: "BOTTOM",
        win: false,
        kills: 2,
        deaths: 5,
        assists: 15,
        timestamp: Date.now() - 172800000, // 2 days ago
      },
      {
        gameId: "NA_1234567892",
        champion: "Jinx",
        role: "CARRY",
        lane: "BOTTOM",
        win: true,
        kills: 12,
        deaths: 4,
        assists: 6,
        timestamp: Date.now() - 259200000, // 3 days ago
      },
      {
        gameId: "NA_1234567893",
        champion: "Ahri",
        role: "MIDDLE",
        lane: "MID",
        win: true,
        kills: 10,
        deaths: 2,
        assists: 8,
        timestamp: Date.now() - 345600000, // 4 days ago
      },
      {
        gameId: "NA_1234567894",
        champion: "Yasuo",
        role: "MIDDLE",
        lane: "MID",
        win: false,
        kills: 5,
        deaths: 9,
        assists: 3,
        timestamp: Date.now() - 432000000, // 5 days ago
      }
    ],
    mostPlayedChampions: [
      { championId: "103", championName: "Ahri", count: 2 },
      { championId: "99", championName: "Lux", count: 1 },
      { championId: "222", championName: "Jinx", count: 1 },
      { championId: "157", championName: "Yasuo", count: 1 }
    ]
  };
}

// Function to format player data for AI context
export function formatPlayerDataForAI(playerData: PlayerData): string {
  if (!playerData || !playerData.recentMatches) {
    return "";
  }

  // Create a summary of the player's recent activity
  const matchSummaries = playerData.recentMatches
    .map((match, index) => {
      const date = new Date(match.timestamp).toLocaleDateString();
      return `Match ${index + 1}: ${match.champion} (${match.lane}) - ${match.kills}/${match.deaths}/${match.assists}, ${match.win ? 'Win' : 'Loss'} on ${date}`;
    })
    .join('\n');

  // Create a summary of most played champions
  const championSummary = playerData.mostPlayedChampions
    .map(champ => `${champ.championName}: ${champ.count} games`)
    .join(', ');

  return `
Player Data:
Summoner Level: ${playerData.summonerLevel}

Recent Matches:
${matchSummaries}

Most Played Champions:
${championSummary}
`;
} 