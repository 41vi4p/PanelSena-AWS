# Quick Testing Guide

## Test the Playback Fix

### Prerequisites
1. Raspberry Pi with player installed
2. Device linked to your account in dashboard
3. At least one video uploaded to content library
4. Web app running

### Test 1: Single Content Playback

1. **On Raspberry Pi** - Start the player:
   ```bash
   cd /home/davidporathur/Documents/PanelSena-AWS/raspberry-pi
   python3 player.py
   ```

2. **In Dashboard** - Navigate to Content page

3. Click the **Play icon** on any video

4. **Expected Result**:
   - Player logs show: `[INFO] Playing content: <content-id>`
   - Logs show: `[INFO] Content loaded: <content-name>`
   - If not cached: `[INFO] Content not in cache, downloading...`
   - VLC opens fullscreen and plays video
   - Dashboard status updates to "playing"

### Test 2: Schedule Playback

1. **In Dashboard** - Navigate to Schedules page

2. Create a schedule with 2-3 videos

3. Navigate to Live Control page

4. Select your display and the schedule you just created

5. Click **Play Schedule**

6. **Expected Result**:
   - Player logs show: `[INFO] Loading schedule: <schedule-id>`
   - Logs show: `[INFO] Schedule has X content items with full data`
   - First video starts playing
   - When video ends, next video automatically plays
   - After last video, loops back to first

### What to Check

#### Player Logs (Raspberry Pi Terminal)
✅ Good signs:
- `[INFO] Content loaded: VideoName`
- `[INFO] Downloaded to: content/xyz.mp4`
- `[INFO] VLC process started successfully`
- `[DEBUG] DynamoDB status updated successfully`

❌ Problems:
- `[ERROR] Content not found`
- `[ERROR] No URL or storage reference`
- `[ERROR] Failed to download content`
- `[WARN] Content loading not fully implemented` (means old code is still running)

#### Dashboard
✅ Good signs:
- Display status changes to "playing"
- Current content info appears
- Heartbeat updates every 10 seconds

#### VLC Player
✅ Good signs:
- Opens in fullscreen automatically
- Video plays without user interaction
- No title bar or controls visible

### Troubleshooting

**Problem**: "Content loading not fully implemented"
- **Solution**: Make sure you pulled the latest code changes

**Problem**: "Failed to download content"
- **Check**: AWS credentials in config.json
- **Check**: S3 bucket name is correct
- **Check**: Internet connection
- **Run**: `aws s3 ls s3://your-bucket-name` to test S3 access

**Problem**: "VLC process exited immediately"
- **Check**: VLC is installed: `which vlc`
- **Install**: `sudo apt install vlc`
- **Check**: Video file format (should be .mp4, .avi, .mkv, etc.)

**Problem**: Video downloads but doesn't play
- **Check**: File exists: `ls -lh raspberry-pi/content/`
- **Test VLC**: `vlc --fullscreen raspberry-pi/content/*.mp4`
- **Check**: X11 display: `echo $DISPLAY`

### Success Criteria

✅ Test Passed if:
1. Video downloads (first time) or loads from cache
2. VLC opens fullscreen automatically
3. Video plays without manual intervention
4. Dashboard shows "playing" status with content name
5. Schedule mode: Videos play in sequence and loop

## Debug Mode

For more detailed logging, edit player.py and check the DEBUG prints are uncommented, especially:
- `[DEBUG] Payload: {payload}`
- `[DEBUG] Content type/URL/Storage ref`
- `[DEBUG] Absolute file path`
- `[DEBUG] MIME type`
