# Display Status Fix - README

## Problem
Device shows as "offline" on the dashboard even though it's linked and running.

## Root Cause
The Python player was storing the display status incorrectly in DynamoDB. It was nesting all status fields under a `status` key instead of storing them at the root level of the DynamoDB item.

### Before (Incorrect):
```json
{
  "pk": "DISPLAY_STATUS#user123",
  "sk": "DISPLAY#display456",
  "status": {
    "displayId": "display456",
    "displayName": "My Display",
    "status": "online",
    "volume": 80
  }
}
```

### After (Correct):
```json
{
  "pk": "DISPLAY_STATUS#user123",
  "sk": "DISPLAY#display456",
  "displayId": "display456",
  "displayName": "My Display",
  "status": "online",
  "volume": 80,
  "lastHeartbeat": 1234567890
}
```

## What Was Fixed

### 1. API Route for Device Linking (`/app/api/devices/link/route.ts`)
- Created a proper server-side API endpoint for device linking
- Prevents AWS credentials from being exposed to the browser
- Validates device credentials before linking

### 2. Device Link Dialog Component (`/components/device-link-dialog.tsx`)
- Updated to use the API endpoint instead of calling AWS functions directly from the browser
- Better error handling and user feedback

### 3. Python DynamoDB Client (`/raspberry-pi/dynamodb_client.py`)
- **CRITICAL FIX**: Fixed `update_display_status()` to store status fields at root level
- All status fields now properly accessible by the dashboard
- Added better error logging and debugging

## How to Test the Fix

### Step 1: Restart the Player
If your player is already running, **restart it** to use the fixed code:

```bash
cd /home/davidporathur/Documents/PanelSena-AWS/raspberry-pi

# Stop the current player (Ctrl+C if running in terminal)

# Start it again
python player.py
```

### Step 2: Verify Status in DynamoDB
Run the status checker to see if data is being written correctly:

```bash
cd /home/davidporathur/Documents/PanelSena-AWS/raspberry-pi
python check_status.py
```

This will show:
- ✓ If device is linked
- ✓ Current status in DynamoDB
- ✓ When the last heartbeat was sent
- ✓ If the data structure is correct

### Step 3: Check the Dashboard
1. Open your PanelSena dashboard
2. Go to **Displays** or **Live Control**
3. Your display should now show as **"Online"** (green)
4. Status updates every 5 seconds

## Troubleshooting

### Display Still Shows Offline
1. **Check if player is running:**
   ```bash
   cd raspberry-pi
   python player.py
   ```

2. **Verify device is linked:**
   ```bash
   python check_status.py
   ```

3. **Check player logs:**
   - Look for `[DEBUG] Heartbeat: status=online`
   - Look for `[DEBUG] DynamoDB status updated successfully`
   - If you see errors, note them down

### "Cannot update status - user_id or display_id not set"
This means the device is not linked yet. Link it from the dashboard:
1. Go to Displays → Add Display
2. Enter Device ID and Device Key
3. Click "Link Device"

### AWS Credentials Error
If you see credential errors:
1. Check `config.json` has correct AWS credentials
2. Verify credentials have DynamoDB permissions
3. Verify AWS region is correct (`ap-south-1`)

## Files Modified
- ✅ `/app/api/devices/link/route.ts` (NEW)
- ✅ `/components/device-link-dialog.tsx`
- ✅ `/raspberry-pi/dynamodb_client.py` (CRITICAL FIX)
- ✅ `/raspberry-pi/check_status.py` (NEW - diagnostic tool)
- ✅ `/raspberry-pi/verify_device.py` (NEW - diagnostic tool)

## Next Steps After Testing
Once everything works:
1. Consider rotating your AWS credentials (they were exposed in chat)
2. Keep `config.json` and `.env` files private
3. Monitor the display status on the dashboard

## Support
If issues persist:
1. Run `python check_status.py` and share output
2. Check player.py logs for errors
3. Check browser console for errors
4. Verify all DynamoDB tables exist in AWS Console
