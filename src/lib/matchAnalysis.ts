import { MatchStats, MatchHistoryParams } from '@/types/match';
import { getSummonerByName, getMatchHistory, getMatchDetails, REGIONS } from './riot-api';

export async function fetchMatchHistory({
  gameName,
  tagLine,
  platform,
  page = 1,
  matchesPerPage = 10
}: MatchHistoryParams): Promise<{ matches: MatchStats[]; hasMore: boolean; summoner: { puuid: string } }> {
  try {
    // Find the region for the given platform
    const regionInfo = Object.values(REGIONS)
      .flatMap(regions => Object.values(regions))
      .find(r => r.platform === platform);

    if (!regionInfo) {
      throw new Error(`Invalid platform: ${platform}`);
    }

    // Get summoner data using Riot ID
    const summoner = await getSummonerByName(gameName, tagLine, platform);
    
    // Get match IDs with one extra to check if there are more
    const matchIds = await getMatchHistory(summoner.puuid, matchesPerPage + 1, regionInfo.region);
    
    // Check if there are more matches
    const hasMore = matchIds.length > matchesPerPage;
    // Remove the extra match if it exists
    const paginatedMatchIds = matchIds.slice((page - 1) * matchesPerPage, page * matchesPerPage);
    
    // Get match details for each match
    const matchDetailsPromises = paginatedMatchIds.map(id => getMatchDetails(id, platform));
    const matchDetails = await Promise.all(matchDetailsPromises);
    
    // Transform match details into MatchStats format
    const matches = matchDetails.map(match => {
      const participant = match.info.participants.find(
        p => p.puuid === summoner.puuid
      );
      
      if (!participant) {
        throw new Error(`Participant not found in match ${match.metadata.matchId}`);
      }

      const gameDurationMinutes = match.info.gameDuration / 60;
      
      return {
        matchId: match.metadata.matchId,
        kda: `${participant.kills}/${participant.deaths}/${participant.assists}`,
        visionScore: participant.visionScore,
        cs: participant.totalMinionsKilled + participant.neutralMinionsKilled,
        csPerMinute: (participant.totalMinionsKilled + participant.neutralMinionsKilled) / gameDurationMinutes,
        winRate: participant.win ? 1 : 0,
        champion: participant.championName,
        timestamp: new Date(match.info.gameCreation).toISOString(),
        kills: participant.kills,
        deaths: participant.deaths,
        assists: participant.assists,
        damageDealt: participant.totalDamageDealtToChampions,
        goldEarned: participant.goldEarned,
        role: participant.teamPosition || 'UNKNOWN'
      };
    });

    return { matches, hasMore, summoner: { puuid: summoner.puuid } };
  } catch (error) {
    if (error instanceof Error) {
      // Handle specific error types
      if (error.message.includes('429')) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (error.message.includes('404')) {
        throw new Error('Summoner not found. Please check the name and tag line and try again.');
      } else if (error.message.includes('403')) {
        throw new Error('API key expired or invalid. Please try again later.');
      }
    }
    console.error('Error fetching match history:', error);
    throw error;
  }
}

export function calculateAverageStats(matches: MatchStats[]) {
  if (!matches.length) return null;

  return {
    averageKDA: matches.reduce((acc, match) => {
      const [k, d, a] = match.kda.split('/').map(Number);
      return acc + (k + a) / Math.max(1, d);
    }, 0) / matches.length,
    
    averageVisionScore: Math.round(
      matches.reduce((acc, match) => acc + match.visionScore, 0) / matches.length
    ),
    
    averageCS: (
      matches.reduce((acc, match) => acc + match.cs, 0) / matches.length
    ).toFixed(1),
    
    winRate: Math.round(
      (matches.reduce((acc, match) => acc + (match.winRate * 100), 0) / matches.length)
    ),
  };
}

export function getPerformanceInsights(matches: MatchStats[]) {
  if (!matches.length) return [];

  const insights: string[] = [];
  const stats = calculateAverageStats(matches);
  
  if (stats) {
    if (stats.averageKDA > 3) {
      insights.push("Great KDA ratio! Keep up the aggressive but safe playstyle.");
    } else if (stats.averageKDA < 2) {
      insights.push("Try playing more safely and focus on positioning in teamfights.");
    }

    if (stats.averageVisionScore > 30) {
      insights.push("Excellent vision control! Your map awareness is helping the team.");
    } else if (stats.averageVisionScore < 20) {
      insights.push("Consider buying more control wards and helping with vision control.");
    }

    if (parseFloat(stats.averageCS) > 7) {
      insights.push("Strong CS numbers! Your farming efficiency is paying off.");
    } else if (parseFloat(stats.averageCS) < 5) {
      insights.push("Practice last hitting in custom games to improve CS efficiency.");
    }
  }

  return insights;
} 