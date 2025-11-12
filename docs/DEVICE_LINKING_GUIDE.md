# Device Linking System - Complete Guide

## Overview

The PanelSena device linking system allows you to securely connect Raspberry Pi devices to your dashboard account using a device ID and secret key authentication mechanism.

## How It Works

### 1. Device Credential Generation

When you set up a new Raspberry Pi device:

```bash
python3 setup_device.py
```

This generates:
- **Device ID**: Unique identifier (e.g., `DEVICE_20251031143055_A7K9F2`)
- **Device Key**: 32-character secret key for authentication

These credentials are saved in:
- `config.json` - Used by the player
- `device_credentials_TIMESTAMP.txt` - For your records

### 2. Device Registration

When the Raspberry Pi player starts (`python3 player.py`):

1. Player reads `device_id` and `device_key` from `config.json`
2. Connects to Firebase Realtime Database
3. Registers itself in `device_registry/{device_id}`:
   ```json
   {
     "deviceId": "DEVICE_...",
     "deviceKey": "secret_key",
     "displayName": "Raspberry Pi Display - Main",
     "registeredAt": timestamp,
     "status": "registered",
     "linkedToUser": null
   }
   ```
4. Waits for linking (polls every 5 seconds)

### 3. Dashboard Linking

In your PanelSena dashboard:

**Option A: When Adding a New Display**
1. Click "Add Display"
2. Fill in display details (name, location, etc.)
3. Click "Save" - This creates a display in Firestore
4. Automatically opens "Link Device" dialog
5. Enter Device ID and Device Key from Raspberry Pi
6. Click "Link Device"

**Option B: For Existing Displays**
1. Find the display in your displays list
2. Click the "Link Device" button (visible for offline displays)
3. Enter Device ID and Device Key
4. Click "Link Device"

### 4. Linking Process

When you click "Link Device":

1. Dashboard calls `linkDeviceToUser(deviceId, deviceKey, userId, displayId)`
2. Firebase verifies the device credentials
3. Creates link in `device_links/{deviceId}`:
   ```json
   {
     "deviceId": "DEVICE_...",
     "userId": "user123",
     "displayId": "display456",
     "linkedAt": timestamp,
     "status": "active"
   }
   ```
4. Updates device registry with user link
5. Returns success to dashboard

### 5. Device Connection

Once linked:

1. Raspberry Pi detects the link (polling loop)
2. Retrieves `userId` and `displayId` from link
3. Starts writing status to:
   ```
   users/{userId}/displays/{displayId}/status
   ```
4. Display shows as "Online" in dashboard
5. Dashboard can now send commands to the device

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  Raspberry Pi   │         │  Firebase        │         │  Dashboard      │
│                 │         │  Realtime DB     │         │  (Web App)      │
└────────┬────────┘         └────────┬─────────┘         └────────┬────────┘
         │                           │                            │
         │ 1. Register with          │                            │
         │    device_id + key        │                            │
         ├──────────────────────────>│                            │
         │                           │                            │
         │ 2. Poll for link          │                            │
         │<─────────────────────────>│                            │
         │                           │                            │
         │                           │  3. User links device      │
         │                           │<───────────────────────────┤
         │                           │                            │
         │ 4. Detect link,           │                            │
         │    get userId/displayId   │                            │
         │<──────────────────────────┤                            │
         │                           │                            │
         │ 5. Write status updates   │  6. Read status            │
         ├──────────────────────────>├───────────────────────────>│
         │                           │                            │
         │ 7. Receive commands       │  8. Send commands          │
         │<──────────────────────────┤<───────────────────────────┤
         │                           │                            │
```

## Firebase Structure

### Device Registry (`/device_registry/{deviceId}`)
Stores all registered devices:
```json
{
  "DEVICE_20251031_ABC123": {
    "deviceId": "DEVICE_20251031_ABC123",
    "deviceKey": "32_char_secret_key",
    "displayName": "Lobby Display",
    "registeredAt": 1698765432000,
    "lastSeen": 1698765532000,
    "linkedToUser": "user123",
    "linkedDisplayId": "display456",
    "status": "linked"
  }
}
```

### Device Links (`/device_links/{deviceId}`)
Maps devices to users and displays:
```json
{
  "DEVICE_20251031_ABC123": {
    "deviceId": "DEVICE_20251031_ABC123",
    "userId": "user123",
    "displayId": "display456",
    "linkedAt": 1698765432000,
    "status": "active"
  }
}
```

### Display Status (`/users/{userId}/displays/{displayId}/status`)
Real-time status from Raspberry Pi:
```json
{
  "displayId": "display456",
  "displayName": "Lobby Display",
  "status": "online",
  "lastHeartbeat": 1698765532000,
  "volume": 80,
  "currentContent": {
    "id": "content123",
    "name": "welcome.mp4",
    "type": "video"
  }
}
```

## Security

### Authentication
- Device Key acts as a password
- Stored in Firebase, verified on linking
- Only valid device_id + device_key pairs can be linked

### Authorization
- Devices can only be linked to one user at a time
- Users can only send commands to their own displays
- Status updates go to user-specific paths

### Best Practices
1. **Keep Device Keys Secret** - Don't share or commit to git
2. **Generate New Credentials** - For each Raspberry Pi device
3. **Save Credentials File** - Keep `device_credentials_*.txt` secure
4. **Rotate Keys** - If compromised, generate new credentials

## Usage Examples

### Setup New Device
```bash
# On your computer
cd raspberry-pi/
python3 setup_device.py

# Transfer files to Raspberry Pi
scp config.json pi@192.168.1.100:~/panelsena/
scp serviceAccountKey.json pi@192.168.1.100:~/panelsena/

# On Raspberry Pi
cd ~/panelsena
python3 player.py
```

### Link Device
1. **In Dashboard**: Displays → Add Display → Enter details → Link Device
2. **Enter Credentials**: Copy Device ID and Key from Raspberry Pi output
3. **Confirm**: Click "Link Device"
4. **Wait**: Raspberry Pi will connect automatically (< 5 seconds)

### Unlink Device
```typescript
await unlinkDevice(deviceId)
```
This removes the link and resets device status to "registered"

## Troubleshooting

### "Invalid device credentials"
- Verify Device ID matches exactly
- Check Device Key has no extra spaces
- Ensure device has been registered (player ran at least once)

### "Device already linked to another user"
- Device can only be linked to one user
- Unlink from other user first
- Or generate new credentials

### Device shows offline after linking
- Check Raspberry Pi is running player
- Verify internet connection on Pi
- Check Firebase Realtime Database rules
- Review player console for errors

### Link not detected by player
- Player polls every 5 seconds - wait a moment
- Check Firebase connectivity
- Restart player: `python3 player.py`

## Files Reference

### Raspberry Pi Files
- `setup_device.py` - Setup wizard (generates credentials, creates config)
- `player.py` - Main player application
- `config.json` - Device configuration (auto-generated)
- `device_credentials_*.txt` - Saved credentials (for your records)
- `serviceAccountKey.json` - Firebase admin credentials

### Dashboard Files
- `lib/realtime-db.ts` - Device linking functions
- `components/device-link-dialog.tsx` - Link device UI
- `app/dashboard/displays/page.tsx` - Displays management
- `components/display-list.tsx` - Display list with link buttons

## API Reference

### `linkDeviceToUser(deviceId, deviceKey, userId, displayId)`
Links a device to a user's display.

**Returns**: `Promise<{success: boolean, error?: string}>`

### `verifyDeviceCredentials(deviceId, deviceKey)`
Verifies device credentials are valid.

**Returns**: `Promise<boolean>`

### `getDeviceLink(deviceId)`
Gets the user/display link for a device.

**Returns**: `Promise<{userId: string, displayId: string} | null>`

### `unlinkDevice(deviceId)`
Unlinks a device from a user.

**Returns**: `Promise<void>`

---

## Next Steps

1. ✅ Run `python3 setup_device.py` on your computer
2. ✅ Transfer files to Raspberry Pi
3. ✅ Start player with `python3 player.py`
4. ✅ Link device in dashboard
5. 🎉 Start managing your digital signage!
