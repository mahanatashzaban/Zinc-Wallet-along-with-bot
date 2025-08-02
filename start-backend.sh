#!/bin/bash

echo "Starting backend services..."

# Activate Python environment if needed
# source venv/bin/activate

# Start Python services in background
python server/api.py &     # Replace with your main Python backend
python server/backtest.py &  # Replace with your backtesting script
python server/bitfinex.py &  # Replace with your Bitfinex integration script
python server/strategy.py &  # Replace with your strategy script
python server/live_bot.py &

# Start Node.js backend
cd server
npm run start  # or: node server.js

# Start Node.js backend
cd server_tabs
npm run start  # or: node server.js
