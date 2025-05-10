// Utility to validate essential environment variables

export function validateEnvVars() {
  // On the server side, check for environment variables
  if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('⚠️ GEMINI_API_KEY is not set in your environment variables');
      console.warn('Please create a .env.local file with your Gemini API key');
    }
  }
} 