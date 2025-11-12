# Device-Based Authentication System

## Overview

PanelSena now uses a **device-based authentication system** where each Raspberry Pi has its own unique Device ID and Device Key. This eliminates the need to manually configure user IDs and makes device management much simpler.

## How It Works

### Authentication Flow

```
1. Raspberry Pi boots up
   ↓
2. Reads device_id and device_key from config.json
   ↓
3. Registers itself in Firebase (device_registry)
   ↓
4. Waits to be linked to a user
   ↓
5. User enters Device ID + Device Key in dashboard
   ↓
6. Dashboard verifies credentials and creates link
   ↓
7. Raspberry Pi detects link and starts normal operation
   ↓
8. Device now sends status to user's displays collection
```

### Database Structure

```
Firebase Realtime Database:
├── device_registry/
│   └── {deviceId}/
│       ├── deviceId: "DEVICE_001"
│       ├── deviceKey: "abc123..." (secret)
│       ├── displayName: "Main Lobby Display"
│       ├── registeredAt: timestamp
│       ├── lastSeen: timestamp
│       ├── linkedToUser: "userId123" or null
│       └── status: "registered" | "linked" | "active"
│
├── device_links/
│   └── {deviceId}/
│       ├── deviceId: "DEVICE_001"
│       ├── userId: "userId123"
│       ├── displayId: "display-001"
│       ├── linkedAt: timestamp
│       └── status: "active"
│
└── users/
    └── {userId}/
        └── displays/
            └── {displayId}/
                ├── status/ (live playback status)
                └── commands/ (playback commands)
```

## Setup Instructions

### Step 1: Generate Device Credentials

On your computer (NOT on Raspberry Pi yet):

```bash
cd raspberry-pi/
python3 generate_device_credentials.py
```

Output:
```
============================================================
PanelSena Device Credentials Generator
============================================================

✓ Generated Device Credentials:

Device ID:  DEVICE_20251031143055_A7K9
Device Key: k3mN9pQ2rT5vW8xY1zB4cD6eF9gH2jK5

============================================================

Save these credentials to config.json? (y/n): y

✓ Credentials saved to config.json
✓ Credentials also saved to: device_credentials_20251031_143055.txt

NEXT STEPS:
1. Copy config.json to your Raspberry Pi
2. In PanelSena dashboard, go to Displays → Add Display
3. Enter the Device ID and Device Key to link the device

⚠ IMPORTANT: Keep the Device Key secure!
```

### Step 2: Configure Raspberry Pi

Copy `config.json` to your Raspberry Pi:

```bash
scp config.json pi@<raspberry-pi-ip>:~/panelsena/
```

Your `config.json` should look like:

```json
{
  "device_id": "DEVICE_20251031143055_A7K9",
  "device_key": "k3mN9pQ2rT5vW8xY1zB4cD6eF9gH2jK5",
  "display_name": "Raspberry Pi Display - Main",
  "database_url": "https://panelsena-default-rtdb.firebaseio.com",
  "storage_bucket": "panelsena.firebasestorage.app",
  "service_account_path": "serviceAccountKey.json"
}
```

### Step 3: Start Raspberry Pi Player

On the Raspberry Pi:

```bash
cd ~/panelsena
python3 player.py
```

You'll see:

```
==================================================
PanelSena Raspberry Pi Player
==================================================
[INFO] PanelSena Player initialized for display: Raspberry Pi Display - Main
[INFO] Firebase initialized successfully
[INFO] Authenticating device: DEVICE_20251031143055_A7K9
[INFO] Registering new device...
[INFO] Device registered. Please link it in the dashboard.
[WARN] Device not linked to any user yet
Please link this device in the dashboard:
  Device ID:  DEVICE_20251031143055_A7K9
  Device Key: k3mN9pQ2rT5vW8xY1zB4cD6eF9gH2jK5

Waiting for device to be linked...
[INFO] Polling for device link every 5 seconds...
```

### Step 4: Link Device in Dashboard

1. Open PanelSena dashboard
2. Navigate to **Displays** page
3. Click **Add Display** or find an existing display
4. Click **Link Device** button
5. Enter the Device ID and Device Key shown in the Pi console
6. Click **Link Device**

The Raspberry Pi will immediately detect the link:

```
[INFO] Device linked! User: abc123xyz, Display: display-001
[INFO] Listening for commands...
[INFO] Player is running. Press Ctrl+C to exit.
```

### Step 5: Verify in Live Control

1. Go to **Dashboard → Live Control**
2. Your device should appear as "Online"
3. You can now control it remotely!

## Benefits of Device-Based Auth

### ✅ **Simpler Setup**
- No need to find your user ID from browser console
- Just generate credentials and link in dashboard
- Works with any user account

### ✅ **Better Security**
- Each device has its own unique key
- Devices can't access other users' data until linked
- Easy to revoke access by unlinking

### ✅ **Flexible Management**
- Transfer devices between users easily
- Link/unlink from dashboard without reconfiguring Pi
- Support for multiple users with same hardware

### ✅ **Better UX**
- Clear visual linking process
- Device shows up immediately after linking
- No confusion about user IDs

## Advanced Usage

### Generating Multiple Devices

Generate credentials for multiple Raspberry Pis:

```bash
python3 generate_device_credentials.py  # Device 1
python3 generate_device_credentials.py  # Device 2
python3 generate_device_credentials.py  # Device 3
```

Each gets unique credentials saved to timestamped files.

### Manual Device Registration

You can also manually create device credentials:

**Device ID Format**: `DEVICE_YYYYMMDDHHMMSS_XXXX`
- Example: `DEVICE_20251031143055_A7K9`

**Device Key**: 32-character alphanumeric string
- Example: `k3mN9pQ2rT5vW8xY1zB4cD6eF9gH2jK5`

### Unlinking a Device

From the dashboard:
1. Go to Displays page
2. Find the display
3. Click "Unlink Device"
4. The Pi will wait for a new link

Or programmatically:

```typescript
import { unlinkDevice } from '@/lib/realtime-db'

await unlinkDevice('DEVICE_20251031143055_A7K9')
```

### Checking Device Status

Check if a device is registered:

```bash
# In Firebase Console
Realtime Database → device_registry → DEVICE_XXXXX
```

You'll see:
- Registration timestamp
- Last seen timestamp
- Linked user (if any)
- Current status

## Security Considerations

### ✅ Do's

- **Keep device keys secure** - Never share publicly
- **Use HTTPS** - Firebase enforces this
- **Rotate keys** - Generate new keys periodically
- **Monitor devices** - Check last seen timestamps
- **Audit links** - Review which devices are linked

### ❌ Don'ts

- **Don't commit keys to Git** - Use .gitignore
- **Don't share keys** - Each device should have unique key
- **Don't reuse keys** - Generate fresh keys for each device
- **Don't expose publicly** - Keep device registry private

## Firebase Security Rules

Update your Realtime Database rules:

```json
{
  "rules": {
    "device_registry": {
      "$deviceId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    "device_links": {
      "$deviceId": {
        ".read": "auth != null && (
          !data.exists() ||
          data.child('userId').val() === auth.uid
        )",
        ".write": "auth != null && (
          !data.exists() ||
          data.child('userId').val() === auth.uid
        )"
      }
    },
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

This ensures:
- Only authenticated users can access device registry
- Users can only link devices to their own account
- Users can only access their own display data

## Troubleshooting

### Device Won't Link

**Problem**: "Invalid device credentials" error

**Solution**:
1. Verify Device ID matches exactly (case-sensitive)
2. Verify Device Key is correct
3. Check device is registered in Firebase Console
4. Ensure device key hasn't changed

### Device Already Linked

**Problem**: "Device already linked to another user"

**Solution**:
1. Unlink device from previous user
2. Wait a few seconds
3. Try linking again

### Device Not Showing in Dashboard

**Problem**: Device linked but not appearing in Live Control

**Solution**:
1. Check Pi console for errors
2. Verify Firebase connection
3. Check database paths are correct
4. Restart the player service

### Authentication Timeout

**Problem**: Player waits forever for link

**Solution**:
1. Check internet connection on Pi
2. Verify Firebase credentials
3. Check service account key is valid
4. Try restarting the player

## Migration from User ID Auth

If you have existing devices using user_id authentication:

### Option 1: Fresh Setup
1. Generate new device credentials
2. Update config.json with device_id and device_key
3. Remove user_id field
4. Link device in dashboard

### Option 2: Keep Old System
The old user_id system still works if needed. Just don't mix both methods on the same device.

## API Reference

### Device Functions

```typescript
// Register device
await registerDeviceWithKey(deviceId, deviceKey, {
  displayName: "Main Display",
  ipAddress: "192.168.1.100",
  macAddress: "00:00:00:00:00:00",
  osVersion: "Raspberry Pi OS 11"
})

// Verify credentials
const isValid = await verifyDeviceCredentials(deviceId, deviceKey)

// Link to user
const result = await linkDeviceToUser(
  deviceId,
  deviceKey,
  userId,
  displayId
)

// Get device link
const link = await getDeviceLink(deviceId)
// Returns: { userId, displayId } or null

// Unlink device
await unlinkDevice(deviceId)

// Update last seen
await updateDeviceLastSeen(deviceId)
```

## Component Usage

### Device Link Dialog

```typescript
import { DeviceLinkDialog } from '@/components/device-link-dialog'

<DeviceLinkDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  userId={user.uid}
  displayId="display-001"
  displayName="Main Lobby Display"
  onSuccess={() => {
    console.log('Device linked!')
  }}
/>
```

## Summary

The device-based authentication system provides:
- ✅ Simpler setup process
- ✅ Better security with per-device keys
- ✅ Flexible device management
- ✅ Easy linking/unlinking
- ✅ No user ID configuration needed
- ✅ Support for device transfer between users

No more copying user IDs from browser consoles - just generate credentials, start the Pi, and link in the dashboard!
