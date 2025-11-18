# Playback System Fix - Documentation

## Problem
The Raspberry Pi client was receiving play commands but wasn't downloading or playing any videos. The issue was that the play command only contained content/schedule IDs, but the player had no way to fetch the actual content metadata (URLs, names, types) needed to download and play the media.

## Solution
Implemented a two-pronged approach:

### 1. Backend Enhancement (Web Application)
**File: `app/api/live-playback/command/route.ts`**

The command API now enriches play commands with full content/schedule data before sending to the device:

- **For single content playback**: Fetches content details from the database and includes them in `payload.contentData`
- **For schedule playback**: Fetches schedule details and all associated content items, including them in `payload.scheduleData`

This eliminates the need for the Raspberry Pi to have direct database access or make API calls.

### 2. Player Enhancement (Raspberry Pi Client)
**File: `raspberry-pi/player.py`**

Updated the player to use enriched payload data:

#### Key Changes:

1. **`execute_command` method**: Now extracts and passes `contentData` or `scheduleData` from the payload to playback methods

2. **`play_single_content` method**: 
   - Now accepts optional `content_data` parameter
   - Uses provided data if available, otherwise falls back to DynamoDB fetch (legacy support)
   - Downloads content from S3 or direct URL
   - Caches downloaded content for future playback

3. **`load_and_play_schedule` method**:
   - Now accepts optional `schedule_data` parameter
   - Supports two modes:
     - **Full data mode**: Uses complete content objects from payload (preferred)
     - **Legacy mode**: Uses content IDs and fetches metadata separately

4. **New `play_from_queue_with_data` method**:
   - Plays content from queue when full content objects are available
   - More efficient than legacy mode (no additional fetches needed)

5. **Updated `skip_content` method**:
   - Intelligently detects queue type (full objects vs IDs)
   - Calls appropriate playback method

### 3. DynamoDB Client Enhancement (Optional/Legacy Support)
**File: `raspberry-pi/dynamodb_client.py`**

Added methods to fetch content and schedule metadata from DynamoDB tables:
- `get_content_item(user_id, content_id)`
- `get_schedule(user_id, schedule_id)`

**Note**: These are only used as fallback if enriched data isn't provided in the command payload.

## How It Works Now

### Single Content Playback Flow:
1. User clicks play on content in dashboard
2. Web app fetches content details from PostgreSQL
3. Web app sends play command with full content data to DynamoDB
4. Raspberry Pi receives command with complete content info
5. Player downloads content from S3 (if not cached)
6. Player starts VLC playback in fullscreen

### Schedule Playback Flow:
1. User selects schedule and clicks play
2. Web app fetches schedule and all content items from PostgreSQL
3. Web app sends play command with full schedule + content data
4. Raspberry Pi receives command with complete schedule info
5. Player queues all content items
6. Player downloads and plays first item
7. When content ends, automatically plays next item in queue
8. Loops back to start when schedule completes

## Benefits

1. **No API Authentication Required**: Player doesn't need to make authenticated API calls
2. **Reduced Latency**: Content data is immediately available, no additional database queries
3. **Better Offline Support**: Once cached, content plays without network access
4. **Backward Compatible**: Falls back to legacy mode if enriched data isn't available
5. **Simplified Architecture**: Less coupling between player and web app

## Testing

To test the fix:

1. **Start the player** on Raspberry Pi:
   ```bash
   cd raspberry-pi
   python3 player.py
   ```

2. **Link the device** in the dashboard (if not already linked)

3. **Upload a video** to the content library

4. **Send play command** from Live Control page or Content page

5. **Verify**:
   - Player logs show "Content loaded: [name]"
   - Download progress appears (if not cached)
   - VLC opens fullscreen and plays video
   - Dashboard shows "playing" status

## Troubleshooting

### Content not downloading:
- Check AWS credentials in `config.json`
- Verify S3 bucket name is correct
- Check internet connectivity
- Look for download errors in player logs

### VLC not playing:
- Ensure VLC is installed: `sudo apt install vlc`
- Check file downloaded successfully (should be in `content/` folder)
- Verify video file format is supported

### Command not received:
- Check device is linked in dashboard
- Verify DynamoDB tables exist and are accessible
- Check player logs for command polling activity
- Ensure device_id and device_key are correct in config.json

## Files Modified

1. `app/api/live-playback/command/route.ts` - Enriches commands with content data
2. `raspberry-pi/player.py` - Updated playback logic to use enriched data
3. `raspberry-pi/dynamodb_client.py` - Added fallback metadata fetch methods

## Next Steps

Consider these future enhancements:
- Pre-download scheduled content ahead of time
- Add progress indicators during download
- Implement pause/resume support
- Add playback quality settings
- Support for image slideshows with duration
