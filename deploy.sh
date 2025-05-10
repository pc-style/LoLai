#!/bin/bash

# Exit on any error
set -e

echo "Starting deployment process..."

# Navigate to project directory
cd /root/lol-ai

echo "Stopping PM2 process..."
pm2 stop lol-ai

echo "Pulling latest changes from GitHub..."
git pull

echo "Installing dependencies..."
npm install

echo "Building the application..."
npm run build

echo "Starting PM2 process..."
pm2 start lol-ai

echo "Deployment completed successfully!"
