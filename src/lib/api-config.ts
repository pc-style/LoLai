import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

// OpenAI client configuration
export const createOpenAIClient = (apiKey: string) => {
  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true, // Allow client-side usage
  });
};

// Google Gemini client configuration
export const createGeminiClient = (apiKey: string) => {
  return new GoogleGenerativeAI(apiKey);
};

export const AI_MODELS = {
  OPENAI: {
    GPT3: "gpt-3.5-turbo",
    GPT4: "gpt-4-turbo",
  },
  GEMINI: {
    GEMINI_FLASH: "gemini-2.5-flash-preview-04-17",
    GEMINI_PRO: "gemini-2.5-pro-preview-0415",
  },
};

export type ClientType = OpenAI | GoogleGenerativeAI;

export interface AIProvider {
  id: string;
  name: string;
  models: { id: string; name: string }[];
  getClient: (apiKey: string) => ClientType;
}

export const AI_PROVIDERS: AIProvider[] = [
  {
    id: "openai",
    name: "OpenAI",
    models: [
      { id: AI_MODELS.OPENAI.GPT3, name: "GPT-3.5 Turbo" },
      { id: AI_MODELS.OPENAI.GPT4, name: "GPT-4 Turbo" },
    ],
    getClient: createOpenAIClient,
  },
  {
    id: "gemini",
    name: "Google Gemini",
    models: [
      { id: AI_MODELS.GEMINI.GEMINI_FLASH, name: "Gemini 2.5 Flash" },
      { id: AI_MODELS.GEMINI.GEMINI_PRO, name: "Gemini 2.5 Pro" },
    ],
    getClient: createGeminiClient,
  },
];

export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export interface ChatSettings {
  provider: string;
  model: string;
  apiKey: string;
} 