import { 
  AI_PROVIDERS, 
  ChatMessage, 
  ChatSettings
} from "./api-config";
import OpenAI from "openai";
import { GoogleGenerativeAI, Tool } from "@google/generative-ai";
import type { ChatCompletionMessageParam } from "openai/resources";

// Default system prompt for League of Legends assistant
const DEFAULT_SYSTEM_PROMPT = 
  "You’re a concise, energetic League of Legends assistant who only answers strictly League-related questions (champions, items, builds, meta, mechanics), formats replies cleanly, stays in-character, double-checks sources, uses search when needed, and never includes off-topic content.";

export async function sendChatMessage(
  messages: ChatMessage[],
  settings: ChatSettings
): Promise<string> {
  const provider = AI_PROVIDERS.find(p => p.id === settings.provider);
  
  if (!provider) {
    throw new Error(`Provider ${settings.provider} not found`);
  }

  // Include system message if not already present
  const hasSystemMessage = messages.some(msg => msg.role === "system");
  const messagesWithSystem = hasSystemMessage 
    ? messages 
    : [{ role: "system", content: DEFAULT_SYSTEM_PROMPT }, ...messages];

  try {
    // Create the appropriate client based on provider
    const client = provider.getClient(settings.apiKey);

    if (provider.id === "openai") {
      const openaiClient = client as OpenAI;
      
      // Convert messages to OpenAI format
      const openAIMessages: ChatCompletionMessageParam[] = messagesWithSystem.map(msg => ({
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content
      }));
      
      const response = await openaiClient.chat.completions.create({
        model: settings.model,
        messages: openAIMessages,
      });

      return response.choices[0].message.content || "";
    } 
    else if (provider.id === "gemini") {
      // Gemini API requires different formatting
      // Access the model directly from the client
      const geminiClient = client as GoogleGenerativeAI;
      const generativeModel = geminiClient.getGenerativeModel({ 
        model: settings.model,
        tools: [{ googleSearch: {} } as Tool] // Enable web search
      });
      
      // Convert messages to Gemini format
      const formattedMessages = [];
      
      // Add system prompt as a user message since Gemini doesn't support system role
      const systemMessage = messagesWithSystem.find(msg => msg.role === "system");
      if (systemMessage) {
        formattedMessages.push({
          role: "user",
          parts: [{ text: `[System Instructions]: ${systemMessage.content}` }],
        });
        formattedMessages.push({
          role: "model",
          parts: [{ text: "I'll follow these instructions." }],
        });
      }
      
      // Add the rest of the messages
      for (const msg of messagesWithSystem.filter(msg => msg.role !== "system")) {
        formattedMessages.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        });
      }

      // Create a chat session with web search enabled
      const chat = generativeModel.startChat({
        history: formattedMessages.slice(0, -1),
        tools: [{ googleSearch: {} } as Tool], // Enable web search for chat
      });
      
      // Send the last message
      const lastMessage = formattedMessages[formattedMessages.length - 1];
      const result = await chat.sendMessage(lastMessage.parts[0].text);
      
      // Get response text and any grounding metadata
      const responseText = result.response.text();
      const groundingMetadata = result.response.candidates?.[0]?.groundingMetadata;
      
      // If there are grounding sources, append them to the response
      if (groundingMetadata?.groundingChunks?.length) {
        const sources = groundingMetadata.groundingChunks
          .map(chunk => chunk.web?.title || chunk.web?.uri)
          .filter(Boolean);
        
        if (sources.length) {
          return `${responseText}\n\nSources:\n${sources.map(s => `- ${s}`).join('\n')}`;
        }
      }
      
      return responseText;
    } 
    
    throw new Error(`Unsupported provider: ${provider.id}`);
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
} 