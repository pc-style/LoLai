import { MatchStats, MatchAnalysis, MatchHistoryParams } from '@/types/match';
import { getSummonerByName, getMatchHistory, getMatchDetails, REGIONS } from './riot-api';
import { sendChatMessage } from './chat-service';
import { AI_MODELS } from './api-config';
import { getGeminiApiKey } from './env';

interface MatchParticipant {
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
  controlWardsPlaced: number;
  championName: string;
  teamPosition: string;
  win: boolean;
}

interface MatchData {
  info: {
    gameDuration: number;
    participants: MatchParticipant[];
    gameMode: string;
  };
}

export async function generateMatchAnalysis(
  matchData: MatchData, 
  playerStats: MatchParticipant
): Promise<string[]> {
  const settings = {
    provider: "gemini",
    model: AI_MODELS.GEMINI.GEMINI_FLASH,
    apiKey: getGeminiApiKey()
  };

  // Format match data for analysis
  const matchContext = `
    Analyze this League of Legends ${matchData.info.gameMode} match performance:
    Champion: ${playerStats.championName}
    ${matchData.info.gameMode !== 'ARAM' && matchData.info.gameMode !== 'ARENA' ? `Role: ${playerStats.teamPosition}` : ''}
    Result: ${playerStats.win ? 'Victory' : 'Defeat'}
    KDA: ${playerStats.kills}/${playerStats.deaths}/${playerStats.assists}
    ${matchData.info.gameMode !== 'ARENA' ? `CS/min: ${((playerStats.totalMinionsKilled + (matchData.info.gameMode === 'ARAM' ? 0 : playerStats.neutralMinionsKilled)) / (matchData.info.gameDuration / 60)).toFixed(1)}` : ''}
    ${matchData.info.gameMode !== 'ARAM' && matchData.info.gameMode !== 'ARENA' ? `Vision Score: ${playerStats.visionScore}` : ''}
    Kill Participation: ${((playerStats.kills + playerStats.assists) / Math.max(1, playerStats.teamId === 100 ? 
      matchData.info.participants.filter(p => p.teamId === 100).reduce((sum: number, p: MatchParticipant) => sum + p.kills, 0) :
      matchData.info.participants.filter(p => p.teamId === 200).reduce((sum: number, p: MatchParticipant) => sum + p.kills, 0)
    ) * 100).toFixed(1)}%
    Damage Dealt: ${playerStats.totalDamageDealtToChampions}
    Damage Taken: ${playerStats.totalDamageTaken}
    Gold Earned: ${playerStats.goldEarned}
    ${matchData.info.gameMode !== 'ARAM' && matchData.info.gameMode !== 'ARENA' ? `
    Wards Placed: ${playerStats.wardsPlaced}
    Control Wards: ${playerStats.controlWardsPlaced}
    ` : ''}

    Please provide your analysis in two parts using markdown format, considering this is a ${matchData.info.gameMode} match:
    
    ## Tips
    * Provide 3-4 specific, actionable bullet points about the player's performance
    * Focus on both strengths and areas for improvement
    * Consider the champion and game mode being played
    * ${matchData.info.gameMode === 'ARAM' ? 'Focus on teamfighting, positioning, and target selection' : 
       matchData.info.gameMode === 'ARENA' ? 'Focus on champion mastery, teamwork, and combat mechanics' : 
       'Consider all aspects of gameplay including farming, vision control, and objective control'}
    
    ## Summary
    Write a brief 2-3 sentence summary of the overall performance and key takeaways, keeping in mind this is a ${matchData.info.gameMode} match.
  `;

  try {
    const analysis = await sendChatMessage(
      [{ role: "user", content: matchContext }],
      settings
    );

    // Split the analysis into separate parts
    return analysis
      .split('\n')
      .filter(line => line.trim());
  } catch (error) {
    console.error('Error generating match analysis:', error);
    return [
      "## Tips",
      "* Unable to generate analysis at this time.",
      "* Please try again later or check your API configuration.",
      "",
      "## Summary",
      "Analysis not available. Please check your API configuration and try again later."
    ];
  }
} 