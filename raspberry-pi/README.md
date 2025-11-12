# PanelSena Raspberry Pi Player Setup Guide

This guide will help you set up a Raspberry Pi as a digital signage player that connects to your PanelSena cloud dashboard.

## Prerequisites

- Raspberry Pi (3B+, 4, or 5 recommended)
- Raspberry Pi OS (Bullseye or later)
- Internet connection
- Display/Monitor connected via HDMI
- Keyboard and mouse (for initial setup)

## Hardware Setup

1. Install Raspberry Pi OS on your SD card
2. Connect your display via HDMI
3. Boot up the Raspberry Pi and complete initial setup
4. Connect to WiFi or Ethernet

## Software Installation

### 1. Update System

```bash
sudo apt-get update
sudo apt-get upgrade -y
```

### 2. Install System Dependencies

```bash
# Install VLC media player
sudo apt-get install -y vlc

# Install Python 3 and pip
sudo apt-get install -y python3 python3-pip

# Install Git
sudo apt-get install -y git

# Install VLC development libraries
sudo apt-get install -y libvlc-dev
```

### 3. Create Project Directory

```bash
mkdir -p ~/panelsena
cd ~/panelsena
```

### 4. Copy Player Files

Copy the following files from this directory to your Raspberry Pi:
- `player.py`
- `requirements.txt`
- `config.example.json`

Or clone the repository:

```bash
git clone <your-repo-url>
cd PanelSena/raspberry-pi
```

### 5. Install Python Dependencies

```bash
pip3 install -r requirements.txt
```

## Firebase Configuration

### 1. Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Download the JSON file and save it as `serviceAccountKey.json` in the same directory

### 2. Enable Firebase Realtime Database

1. In Firebase Console, go to **Build** → **Realtime Database**
2. Click **Create Database**
3. Choose your region
4. Start in **Test Mode** (you can secure it later)
5. Copy the database URL (e.g., `https://your-project.firebaseio.com`)

### 3. Configure Realtime Database Rules

In the Firebase Console, go to **Realtime Database** → **Rules** and set:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

### 4. Update Environment Variables

Update your web app's `.env` file to include:

```env
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

### 5. Create Configuration File

Copy the example config and edit it:

```bash
cp config.example.json config.json
nano config.json
```

Update the values:

```json
{
  "user_id": "your-firebase-user-id",
  "display_id": "display-001",
  "display_name": "Main Lobby Display",
  "database_url": "https://your-project.firebaseio.com",
  "storage_bucket": "your-project.appspot.com",
  "service_account_path": "serviceAccountKey.json"
}
```

**How to get your User ID:**
1. Log into your PanelSena dashboard
2. Open browser Developer Tools (F12)
3. Go to Console tab
4. Type: `firebase.auth().currentUser.uid`
5. Copy the displayed user ID

**How to get your Display ID:**
1. Go to the Displays page in PanelSena dashboard
2. Click on a display
3. Copy the display ID from the URL or display details

## Running the Player

### Manual Start

```bash
cd ~/panelsena
python3 player.py
```

### Auto-Start on Boot

Create a systemd service:

```bash
sudo nano /etc/systemd/system/panelsena.service
```

Add the following content:

```ini
[Unit]
Description=PanelSena Digital Signage Player
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/panelsena
ExecStart=/usr/bin/python3 /home/pi/panelsena/player.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable panelsena.service
sudo systemctl start panelsena.service
```

Check status:

```bash
sudo systemctl status panelsena.service
```

View logs:

```bash
sudo journalctl -u panelsena.service -f
```

## Display Configuration

### Disable Screen Blanking

```bash
# Edit the lightdm config
sudo nano /etc/lightdm/lightdm.conf
```

Add under `[Seat:*]`:

```ini
xserver-command=X -s 0 -dpms
```

Or disable via command line:

```bash
# Disable screen blanking
xset s off
xset -dpms
xset s noblank
```

Add to autostart:

```bash
sudo nano /etc/xdg/lxsession/LXDE-pi/autostart
```

Add these lines:

```
@xset s off
@xset -dpms
@xset s noblank
```

### Auto-Hide Mouse Cursor

```bash
sudo apt-get install -y unclutter
```

Add to autostart:

```bash
echo "@unclutter -idle 0" | sudo tee -a /etc/xdg/lxsession/LXDE-pi/autostart
```

## Usage

### From Dashboard

1. Log into your PanelSena dashboard
2. Go to **Live Control** page
3. Your Raspberry Pi display should appear with status "Online"
4. Select a schedule and click **Play Schedule**
5. Use the playback controls to manage the display

### Supported Commands

- **Play Schedule**: Start playing a scheduled content queue
- **Pause**: Pause current playback
- **Stop**: Stop playback completely
- **Skip**: Skip to next content in queue
- **Volume**: Adjust playback volume
- **Restart**: Restart the Raspberry Pi device

## Troubleshooting

### Display Not Showing in Dashboard

1. Check config.json has correct user_id and display_id
2. Verify Firebase service account key is valid
3. Check network connectivity
4. View logs: `sudo journalctl -u panelsena.service -f`

### VLC Not Playing Content

1. Test VLC manually: `vlc --no-xlib test_video.mp4`
2. Check file permissions
3. Ensure content directory exists
4. Verify content was downloaded successfully

### Connection Issues

1. Check database URL in config.json
2. Verify Firebase Realtime Database is enabled
3. Check database rules allow access
4. Test internet connectivity: `ping google.com`

### Permission Denied Errors

```bash
chmod +x player.py
chmod 600 serviceAccountKey.json
```

## File Structure

```
~/panelsena/
├── player.py                   # Main player script
├── config.json                 # Configuration file
├── serviceAccountKey.json      # Firebase credentials
├── requirements.txt            # Python dependencies
├── content/                    # Downloaded content storage
└── cache/                      # Temporary cache files
```

## Content Storage

Content is automatically downloaded from Firebase Storage to the `content/` directory:
- Videos: `.mp4`, `.avi`, `.mkv`
- Images: `.jpg`, `.png`, `.gif`
- Documents: `.pdf`

## Performance Optimization

### For Raspberry Pi 3B+

```bash
# Increase GPU memory
sudo nano /boot/config.txt

# Add or modify:
gpu_mem=256

# Reboot
sudo reboot
```

### For 4K Displays (Pi 4/5)

```bash
# Edit config
sudo nano /boot/config.txt

# Add:
hdmi_enable_4kp60=1
```

## Security Best Practices

1. **Keep serviceAccountKey.json secure** - Never commit to Git
2. **Use strong WiFi password** - Secure your network
3. **Update regularly** - Keep OS and packages updated
4. **Restrict physical access** - Secure the Raspberry Pi device
5. **Monitor logs** - Check for unauthorized access

## Advanced Configuration

### Custom Content Directory

Edit `player.py` and change:

```python
CONTENT_DIR = "/mnt/usb/content"  # Use external USB drive
```

### Network Monitoring

Install network monitoring:

```bash
sudo apt-get install -y iftop nethogs
```

### Remote Access

Enable SSH for remote management:

```bash
sudo systemctl enable ssh
sudo systemctl start ssh
```

## Support

For issues or questions:
- Check the logs: `sudo journalctl -u panelsena.service -f`
- Verify configuration in `config.json`
- Test Firebase connectivity
- Review Firebase Console for errors

## License

[Your License Here]
