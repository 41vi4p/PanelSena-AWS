# Live Playback Control & Raspberry Pi Setup Guide

## Overview

This document explains the new **Live Playback Control** feature added to PanelSena, which allows you to monitor and control digital signage displays in real-time using AWS DynamoDB. It includes a web dashboard for control and a Python script for Raspberry Pi devices.

## What Was Implemented

### 1. Backend Infrastructure

#### AWS DynamoDB Integration
- **File**: `lib/dynamodb-realtime.ts`
- Added AWS DynamoDB to replace Firebase Realtime Database
- Exports DynamoDB client for use throughout the app

#### TypeScript Types
- **File**: `lib/types.ts`
- `LivePlaybackStatus`: Real-time status of displays (online, playing, paused, error)
- `DeviceRegistration`: Device registration information
- `PlaybackCommand`: Commands sent from dashboard to devices

#### Realtime Database Helper Functions
- **File**: `lib/dynamodb-realtime.ts`
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
- Connects to AWS DynamoDB
- Listens for playback commands
- Downloads content from AWS S3
- Plays media using VLC
- Reports status back to dashboard
- Automatic heartbeat every 10 seconds
- Command execution with error handling

#### Supporting Files
- `raspberry-pi/requirements.txt`: Python dependencies (includes boto3)
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
                        │ AWS SDK
                        │
        ┌───────────────▼───────────────┐
        │        AWS DynamoDB            │
        │                               │
        │  Table: panelsena-devices      │
        │  - device_id (PK)             │
        │  - data_type (SK)             │
        │  - status, commands, etc.     │
        └───────────────┬───────────────┘
                        │
                        │ AWS SDK (boto3)
                        │
┌───────────────────────▼───────────────────────────────────┐
│              Raspberry Pi Device(s)                        │
│              (Python Player Script)                        │
│                                                            │
│  ┌────────────────────────────────────────────────────┐  │
│  │  1. Listen for commands                            │  │
│  │  2. Download content from AWS S3                   │  │
│  │  3. Play content using VLC                         │  │
│  │  4. Report status back                             │  │
│  │  5. Send heartbeat every 10s                       │  │
│  └────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

## Database Structure

### DynamoDB Table: `panelsena-devices`

**Primary Key:**
- Partition Key: `device_id` (String)
- Sort Key: `data_type` (String)

**Data Types and Attributes:**

#### Status Records (`data_type = "status"`)
```json
{
  "device_id": "display-001",
  "data_type": "status",
  "displayName": "Main Display",
  "status": "online" | "offline" | "playing" | "paused" | "error",
  "currentContent": {
    "id": "content-123",
    "name": "Welcome Video.mp4",
    "type": "video",
    "url": "https://s3.amazonaws.com/bucket/content-123.mp4",
    "startedAt": 1703123456789
  },
  "schedule": {
    "id": "schedule-456",
    "name": "Morning Schedule",
    "contentQueue": ["content-123", "content-789"],
    "currentIndex": 0
  },
  "lastHeartbeat": 1703123456789,
  "volume": 80,
  "errorMessage": "Optional error description",
  "ttl": 1703213456789
}
```

#### Command Records (`data_type = "command"`)
```json
{
  "device_id": "display-001",
  "data_type": "command",
  "commandId": "cmd-789",
  "type": "play" | "pause" | "stop" | "skip" | "volume" | "restart",
  "payload": {
    "contentId": "content-123",
    "volume": 80,
    "scheduleId": "schedule-456"
  },
  "timestamp": 1703123456789,
  "status": "pending" | "executed" | "failed",
  "result": "Optional execution result",
  "ttl": 1703213456789
}
```

#### Device Info Records (`data_type = "device_info"`)
```json
{
  "device_id": "display-001",
  "data_type": "device_info",
  "userId": "user-123",
  "displayName": "Main Display",
  "deviceToken": "secure-random-token",
  "lastSeen": 1703123456789,
  "ipAddress": "192.168.1.100",
  "macAddress": "B8:27:EB:12:34:56",
  "osVersion": "Raspberry Pi OS 11 (Bullseye)",
  "appVersion": "1.7.2",
  "ttl": 1703213456789
}
```

## Setup Instructions

### Web Dashboard Setup

1. **Update Environment Variables**

   Add to `.env.local`:
   ```env
   # AWS Configuration
   AWS_ACCESS_KEY_ID=your_access_key_id_here
   AWS_SECRET_ACCESS_KEY=your_secret_access_key_here
   AWS_REGION=us-east-1
   DYNAMODB_TABLE_NAME=panelsena-devices
   S3_BUCKET_NAME=your-bucket-name
   ```

2. **Create DynamoDB Table**

   Follow the [DynamoDB Setup Guide](DYNAMODB_SETUP_GUIDE.md) to create the `panelsena-devices` table with proper configuration.

3. **Create S3 Bucket**

   Follow the [AWS Setup Guide](AWS_SETUP.md) to create an S3 bucket for content storage.

4. **Configure IAM Permissions**

   Ensure your IAM user has permissions for:
   - DynamoDB read/write access to `panelsena-devices` table
   - S3 read/write access to your content bucket

5. **Build and Deploy**

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

3. **Configure AWS**

   - Create IAM user with DynamoDB and S3 permissions (see AWS Setup Guide)
   - Copy AWS credentials to Raspberry Pi
   - Edit `config.json` with your details:
     ```json
     {
       "user_id": "your-user-id",
       "display_id": "display-001",
       "display_name": "Main Display",
       "aws_region": "us-east-1",
       "dynamodb_table": "panelsena-devices",
       "s3_bucket": "your-bucket-name",
       "aws_access_key_id": "your-access-key-id",
       "aws_secret_access_key": "your-secret-access-key"
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
2. Verify AWS credentials are valid and have proper permissions
3. Check network connectivity
4. View logs: `sudo journalctl -u panelsena.service -f`

### Commands Not Executing

1. Check Raspberry Pi is online
2. Verify DynamoDB table name and AWS region match
3. Check command status in DynamoDB console
4. Review player logs for errors

### Content Not Playing

1. Verify content exists in S3 bucket
2. Check file format is supported (.mp4, .jpg, .png)
3. Ensure VLC is installed: `vlc --version`
4. Test VLC manually: `vlc --no-xlib test.mp4`

### Connection Issues

1. Check AWS region in `.env.local` and `config.json`
2. Verify IAM permissions include DynamoDB and S3 access
3. Check internet connectivity
4. Review AWS CloudTrail for access errors

## Security Considerations

1. **AWS Credentials**: Keep access keys secure and never commit to Git. Use IAM roles for EC2 instances.
2. **DynamoDB Access**: Use least privilege IAM policies for DynamoDB table access.
3. **S3 Security**: Keep buckets private with proper bucket policies.
4. **Network Security**: Use secure WiFi and consider VPC for remote displays.
5. **Physical Security**: Secure Raspberry Pi devices to prevent tampering.
6. **Regular Updates**: Keep OS, dependencies, and AWS SDKs updated.

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
- `lib/dynamodb-realtime.ts` - AWS DynamoDB real-time operations (NEW)
- `lib/types.ts` - Added live playback types
- `hooks/use-live-playback.ts` - Live playback hook (NEW)
- `app/dashboard/live-control/page.tsx` - Live control page (NEW)
- `components/sidebar.tsx` - Added Live Control menu item

### Raspberry Pi Files Created:
- `raspberry-pi/player.py` - Main player script (updated for AWS)
- `raspberry-pi/requirements.txt` - Python dependencies (includes boto3)
- `raspberry-pi/config.example.json` - Configuration template (AWS config)
- `raspberry-pi/install.sh` - Installation script
- `raspberry-pi/README.md` - Setup guide (updated for AWS)

## License

Same as main project license.
