# Live Playback Control & Raspberry Pi Setup Guide

## Overview

This document explains the new **Live Playback Control** feature added to PanelSena, which allows you to monitor and control digital signage displays in real-time using Firebase Realtime Database. It includes a web dashboard for control and a Python script for Raspberry Pi devices.

## What Was Implemented

### 1. Backend Infrastructure

#### Firebase Realtime Database Integration
- **File**: `lib/firebase.ts`
- Added Firebase Realtime Database to the existing Firebase configuration
- Exports `realtimeDb` instance for use throughout the app

#### TypeScript Types
- **File**: `lib/types.ts`
- `LivePlaybackStatus`: Real-time status of displays (online, playing, paused, error)
- `DeviceRegistration`: Device registration information
- `PlaybackCommand`: Commands sent from dashboard to devices

#### Realtime Database Helper Functions
- **File**: `lib/realtime-db.ts`
- `updateDisplayStatus()`: Update display status in real-time
- `listenToDisplayStatus()`: Subscribe to status changes
- `listenToAllDisplaysStatus()`: Monitor all displays
- `sendPlaybackCommand()`: Send control commands
- `listenToCommands()`: Device listens for commands
- `updateCommandStatus()`: Confirm command execution
- `registerDevice()`: Register new device
- `updateDeviceHeartbeat()`: Keep-alive signal

#### Custom React Hook
- **File**: `hooks/use-live-playback.ts`
- `useLivePlayback()`: Manages real-time playback state
- Provides convenient methods:
  - `playContent()`, `pauseContent()`, `stopContent()`
  - `skipContent()`, `setVolume()`, `restartDevice()`
  - `playSchedule()`: Start playing scheduled content
- Automatic cleanup of old commands

### 2. Frontend Dashboard

#### Live Control Page
- **File**: `app/dashboard/live-control/page.tsx`
- Real-time display monitoring with status indicators
- Control panel for each display:
  - Schedule selector
  - Playback controls (Play, Pause, Stop, Skip)
  - Volume slider
  - Restart device button
- Shows currently playing content
- Displays active schedule progress
- Error reporting
- Heartbeat monitoring

#### Sidebar Navigation
- **File**: `components/sidebar.tsx`
- Added "Live Control" menu item with Radio icon
- Located between Schedule and Analytics

### 3. Raspberry Pi Player

#### Python Player Script
- **File**: `raspberry-pi/player.py`
- Connects to Firebase Realtime Database
- Listens for playback commands
- Downloads content from Firebase Storage
- Plays media using VLC
- Reports status back to dashboard
- Automatic heartbeat every 10 seconds
- Command execution with error handling

#### Supporting Files
- `raspberry-pi/requirements.txt`: Python dependencies
- `raspberry-pi/config.example.json`: Configuration template
- `raspberry-pi/install.sh`: Automated installation script
- `raspberry-pi/README.md`: Comprehensive setup guide

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     PanelSena Dashboard                      │
│                    (Next.js Web App)                         │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          Live Control Page                           │  │
│  │  - Display status monitoring                         │  │
│  │  - Playback controls                                 │  │
│  │  - Schedule selection                                │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        │ Firebase SDK
                        │
        ┌───────────────▼───────────────┐
        │   Firebase Realtime Database  │
        │                               │
        │  /users/{uid}/                │
        │    /displays/{displayId}/     │
        │      /status                  │
        │      /commands                │
        └───────────────┬───────────────┘
                        │
                        │ Firebase Admin SDK
                        │
┌───────────────────────▼───────────────────────────────────┐
│              Raspberry Pi Device(s)                        │
│              (Python Player Script)                        │
│                                                            │
│  ┌────────────────────────────────────────────────────┐  │
│  │  1. Listen for commands                            │  │
│  │  2. Download content from Firebase Storage         │  │
│  │  3. Play content using VLC                         │  │
│  │  4. Report status back                             │  │
│  │  5. Send heartbeat every 10s                       │  │
│  └────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

## Database Structure

### Realtime Database Paths

```
users/
  {userId}/
    displays/
      {displayId}/
        status/
          displayId: string
          displayName: string
          status: "online" | "offline" | "playing" | "paused" | "error"
          currentContent:
            id: string
            name: string
            type: string
            url: string
            startedAt: timestamp
          schedule:
            id: string
            name: string
            contentQueue: string[]
            currentIndex: number
          lastHeartbeat: timestamp
          volume: number
          errorMessage?: string
        commands/
          {commandId}/
            commandId: string
            displayId: string
            type: "play" | "pause" | "stop" | "skip" | "volume" | "restart"
            payload:
              contentId?: string
              volume?: number
              scheduleId?: string
            timestamp: number
            status: "pending" | "executed" | "failed"
            result?: string
    devices/
      {displayId}/
        displayId: string
        userId: string
        deviceToken: string
        lastSeen: timestamp
        ipAddress: string
        macAddress: string
        osVersion: string
        appVersion: string
```

## Setup Instructions

### Web Dashboard Setup

1. **Update Environment Variables**

   Add to `.env`:
   ```env
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
   ```

2. **Enable Firebase Realtime Database**

   - Go to Firebase Console
   - Navigate to Realtime Database
   - Click "Create Database"
   - Choose your region
   - Set rules (see below)

3. **Set Database Rules**

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

4. **Build and Deploy**

   ```bash
   npm install
   npm run build
   npm start
   ```

### Raspberry Pi Setup

1. **Hardware Requirements**
   - Raspberry Pi 3B+ or newer
   - HDMI display
   - Internet connection
   - SD card with Raspberry Pi OS

2. **Quick Installation**

   ```bash
   # Copy files to Raspberry Pi
   scp -r raspberry-pi pi@<raspberry-pi-ip>:~/panelsena

   # SSH into Raspberry Pi
   ssh pi@<raspberry-pi-ip>

   # Run installation script
   cd ~/panelsena
   chmod +x install.sh
   ./install.sh
   ```

3. **Configure Firebase**

   - Download service account key from Firebase Console
   - Copy to `~/panelsena/serviceAccountKey.json`
   - Edit `config.json` with your details:
     ```json
     {
       "user_id": "your-user-id",
       "display_id": "display-001",
       "display_name": "Main Display",
       "database_url": "https://your-project.firebaseio.com",
       "storage_bucket": "your-project.appspot.com",
       "service_account_path": "serviceAccountKey.json"
     }
     ```

4. **Start the Service**

   ```bash
   sudo systemctl enable panelsena.service
   sudo systemctl start panelsena.service
   sudo systemctl status panelsena.service
   ```

## Usage Guide

### From Web Dashboard

1. Navigate to **Live Control** page
2. View all connected displays and their status
3. Select a schedule from the dropdown
4. Click **Play Schedule** to start playback
5. Use controls to manage playback:
   - **Pause**: Temporarily pause playback
   - **Stop**: Stop playback completely
   - **Skip**: Skip to next content in queue
   - **Volume**: Adjust volume (0-100%)
   - **Restart**: Reboot the device

### Display Status Indicators

- **🟢 ONLINE**: Device connected, ready to play
- **🔵 PLAYING**: Currently playing content
- **🟡 PAUSED**: Playback paused
- **⚫ OFFLINE**: Device disconnected
- **🔴 ERROR**: Device encountered an error

## Features

### Real-time Monitoring
- Live status updates every 10 seconds
- Instant command execution
- Heartbeat monitoring
- Error reporting

### Playback Control
- Play scheduled content
- Pause/resume playback
- Skip to next content
- Adjust volume remotely
- Stop playback
- Restart device

### Schedule Management
- Select schedules from dashboard
- View active schedule progress
- See current content playing
- Track queue position

### Content Delivery
- Automatic content download from Firebase Storage
- Local caching for performance
- Support for videos, images, and documents
- Progress tracking

## Troubleshooting

### Display Not Appearing in Dashboard

1. Check `config.json` has correct `user_id` and `display_id`
2. Verify Firebase credentials are valid
3. Check network connectivity
4. View logs: `sudo journalctl -u panelsena.service -f`

### Commands Not Executing

1. Check Raspberry Pi is online
2. Verify Firebase Realtime Database rules
3. Check command status in Firebase Console
4. Review player logs for errors

### Content Not Playing

1. Verify content exists in Firebase Storage
2. Check file format is supported (.mp4, .jpg, .png)
3. Ensure VLC is installed: `vlc --version`
4. Test VLC manually: `vlc --no-xlib test.mp4`

### Connection Issues

1. Check database URL in `.env` and `config.json`
2. Verify internet connectivity
3. Check Firebase Realtime Database is enabled
4. Review database rules

## Security Considerations

1. **Service Account Key**: Keep `serviceAccountKey.json` secure and never commit to Git
2. **Database Rules**: Ensure rules only allow authenticated users to access their own data
3. **Network Security**: Use secure WiFi and consider VPN for remote displays
4. **Physical Security**: Secure Raspberry Pi devices to prevent tampering
5. **Regular Updates**: Keep OS and packages updated

## Performance Optimization

### For Better Performance:
- Use H.264 encoded videos (most efficient)
- Keep content files under 100MB
- Use local caching (automatic)
- Increase GPU memory on Pi: `gpu_mem=256`
- Use wired Ethernet instead of WiFi when possible

### For 4K Displays:
```bash
# Edit /boot/config.txt
hdmi_enable_4kp60=1
gpu_mem=512
```

## Future Enhancements

Potential improvements:
- [ ] Playlist editor in dashboard
- [ ] Advanced scheduling (time-based, day-based)
- [ ] Multiple content zones on single display
- [ ] Video analytics (view counts, duration)
- [ ] Health monitoring and alerts
- [ ] Remote screenshot capture
- [ ] Bandwidth optimization
- [ ] Offline mode with cached content

## Support

For issues or questions:
- Check logs: `sudo journalctl -u panelsena.service -f`
- Review Firebase Console for errors
- Verify configuration files
- Test components individually

## File Summary

### Web App Files Created/Modified:
- `lib/firebase.ts` - Added Realtime Database
- `lib/types.ts` - Added live playback types
- `lib/realtime-db.ts` - Realtime Database helpers (NEW)
- `hooks/use-live-playback.ts` - Live playback hook (NEW)
- `app/dashboard/live-control/page.tsx` - Live control page (NEW)
- `components/sidebar.tsx` - Added Live Control menu item

### Raspberry Pi Files Created:
- `raspberry-pi/player.py` - Main player script
- `raspberry-pi/requirements.txt` - Python dependencies
- `raspberry-pi/config.example.json` - Configuration template
- `raspberry-pi/install.sh` - Installation script
- `raspberry-pi/README.md` - Setup guide

## License

Same as main project license.
