// Environment variables utility

interface WindowWithEnv extends Window {
  __env?: {
    GEMINI_API_KEY?: string;
    RIOT_API_KEY?: string;
  };
}

// Initialize client-side environment variables
if (typeof window !== 'undefined') {
  (window as WindowWithEnv).__env = {
    GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '',
    RIOT_API_KEY: process.env.NEXT_PUBLIC_RIOT_API_KEY || process.env.RIOT_API_KEY || '',
  };
}

export const getGeminiApiKey = (): string => {
  // For server-side
  if (typeof process !== 'undefined' && process.env) {
    return process.env.GEMINI_API_KEY || '';
  }
  
  // For client-side
  if (typeof window !== 'undefined') {
    return (window as WindowWithEnv).__env?.GEMINI_API_KEY || '';
  }
  
  return '';
};

export const getRiotApiKey = (): string => {
  // For server-side
  if (typeof process !== 'undefined' && process.env) {
    return process.env.RIOT_API_KEY || '';
  }
  
  // For client-side
  if (typeof window !== 'undefined') {
    return (window as WindowWithEnv).__env?.RIOT_API_KEY || '';
  }
  
  return '';
};

export const env = {
  RIOT_API_KEY: process.env.NEXT_PUBLIC_RIOT_API_KEY || "",
}; 