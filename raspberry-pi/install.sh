#!/bin/bash

# PanelSena Raspberry Pi Player Installation Script
# Run this script on your Raspberry Pi to set up the player

set -e

echo "================================================"
echo "PanelSena Raspberry Pi Player Installation"
echo "================================================"
echo ""

# Check if running on Raspberry Pi
if ! grep -q "Raspberry Pi" /proc/cpuinfo 2>/dev/null; then
    echo "Warning: This doesn't appear to be a Raspberry Pi"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Update system
echo "[1/7] Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install system dependencies
echo "[2/7] Installing system dependencies..."
sudo apt-get install -y \
    vlc \
    libvlc-dev \
    python3 \
    python3-pip \
    git \
    unclutter

# Create project directory
echo "[3/7] Creating project directory..."
# mkdir -p ~/panelsena
# cd ~/panelsena

# Install Python dependencies
echo "[4/7] Installing Python dependencies..."
pip3 install -r requirements.txt

# Disable screen blanking
echo "[5/7] Configuring display settings..."
if [ ! -f /etc/xdg/lxsession/LXDE-pi/autostart.backup ]; then
    sudo cp /etc/xdg/lxsession/LXDE-pi/autostart /etc/xdg/lxsession/LXDE-pi/autostart.backup
fi

# Add display settings if not already present
grep -qxF "@xset s off" /etc/xdg/lxsession/LXDE-pi/autostart || \
    echo "@xset s off" | sudo tee -a /etc/xdg/lxsession/LXDE-pi/autostart
grep -qxF "@xset -dpms" /etc/xdg/lxsession/LXDE-pi/autostart || \
    echo "@xset -dpms" | sudo tee -a /etc/xdg/lxsession/LXDE-pi/autostart
grep -qxF "@xset s noblank" /etc/xdg/lxsession/LXDE-pi/autostart || \
    echo "@xset s noblank" | sudo tee -a /etc/xdg/lxsession/LXDE-pi/autostart
grep -qxF "@unclutter -idle 0" /etc/xdg/lxsession/LXDE-pi/autostart || \
    echo "@unclutter -idle 0" | sudo tee -a /etc/xdg/lxsession/LXDE-pi/autostart

# Create config file if it doesn't exist
echo "[6/7] Setting up configuration..."
if [ ! -f config.json ]; then
    cp config.example.json config.json
    echo "Created config.json - Please edit this file with your Firebase credentials"
fi

# Add player to LXDE autostart instead of systemd service
echo "[7/7] Adding player to desktop autostart..."
grep -qxF "@python3 $HOME/panelsena/player.py" /etc/xdg/lxsession/LXDE-pi/autostart || \
    echo "@python3 $HOME/panelsena/player.py" | sudo tee -a /etc/xdg/lxsession/LXDE-pi/autostart

echo ""
echo "================================================"
echo "Installation Complete!"
echo "================================================"
echo ""
echo "IMPORTANT: Make sure your Raspberry Pi is set to boot into Desktop mode:"
echo "  1. Run: sudo raspi-config"
echo "  2. Go to 'System Options' -> 'Boot / Auto Login' -> 'Desktop Autologin'"
echo "  3. Reboot your Raspberry Pi"
echo ""
echo "Next steps:"
echo "1. Download your Firebase service account key and save as:"
echo "   ~/panelsena/serviceAccountKey.json"
echo ""
echo "2. Edit the configuration file:"
echo "   nano ~/panelsena/config.json"
echo ""
echo "3. Enable and start the service:"
echo "   sudo systemctl enable panelsena.service"
echo "   sudo systemctl start panelsena.service"
echo ""
echo "4. Check the status:"
echo "   sudo systemctl status panelsena.service"
echo ""
echo "5. View logs:"
echo "   sudo journalctl -u panelsena.service -f"
echo ""
echo "================================================"
