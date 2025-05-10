#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Path to .env.local
const envPath = path.join(__dirname, '..', '.env.local');

// Check if .env.local already exists
if (fs.existsSync(envPath)) {
  console.log('\n⚠️  .env.local already exists. Delete it first if you want to start over.');
  rl.close();
  process.exit(0);
}

console.log('\n🔑  LoL AI Assistant - Setup Environment');
console.log('----------------------------------------');
console.log('This script will help you create your .env.local file with your API keys.');
console.log('You can get a Gemini API key from https://ai.google.dev/');
console.log('You can get a Riot API key from https://developer.riotgames.com/\n');

const apiKeys = {
  gemini: '',
  riot: ''
};

rl.question('Enter your Gemini API key: ', (geminiApiKey) => {
  if (!geminiApiKey.trim()) {
    console.log('❌ Gemini API key cannot be empty. Please try again.');
    rl.close();
    return;
  }
  
  apiKeys.gemini = geminiApiKey.trim();
  
  rl.question('Enter your Riot API key: ', (riotApiKey) => {
    if (!riotApiKey.trim()) {
      console.log('⚠️  No Riot API key provided. Player data functionality will be limited to mock data.');
    } else {
      apiKeys.riot = riotApiKey.trim();
    }
    
    // Create .env.local file
    const envContent = `# Gemini API Key
GEMINI_API_KEY=${apiKeys.gemini}

# Riot API Key
RIOT_API_KEY=${apiKeys.riot}
`;

    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ .env.local file has been created successfully!');
    console.log('🚀 You can now run: npm run dev\n');
    
    rl.close();
  });
}); 