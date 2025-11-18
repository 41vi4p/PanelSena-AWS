#!/bin/bash

echo "========================================"
echo "PanelSena Player Update Script"
echo "========================================"
echo ""

# Stop existing player processes
echo "Stopping existing player processes..."
pkill -f "python.*player.py" || echo "No player processes found"
sleep 2

# Pull latest code (if using git)
if [ -d ".git" ]; then
    echo ""
    echo "Pulling latest code from git..."
    cd "$(dirname "$0")/.."
    git pull
    cd raspberry-pi
else
    echo ""
    echo "Not a git repository. Please manually copy the updated files."
fi

echo ""
echo "========================================"
echo "Starting player..."
echo "========================================"
echo ""

# Start the player
python3 player.py
