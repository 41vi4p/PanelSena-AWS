# Display Not Showing Issue - Debug Guide

## Issues Found and Fixed

### 1. **Type Definition Mismatch** ✅ FIXED
**Problem:** The `Display` type only allowed `"online" | "offline"` statuses, but the Raspberry Pi player sends `"playing"` and `"paused"` statuses.

**Fix:** Updated `/lib/types.ts` to include all possible statuses:
```typescript
status: "online" | "offline" | "playing" | "paused"
```

### 2. **Display Badge Rendering** ✅ FIXED
**Problem:** Display components only showed "Online" or "Offline" badges, ignoring "playing" and "paused" states.

**Fixes Applied:**
- Updated `/components/display-list.tsx` to show all 4 status types with appropriate colors
- Updated `/components/display-grid.tsx` to show all 4 status types with appropriate colors

Status Colors:
- **Online**: Green
- **Playing**: Blue
- **Paused**: Yellow
- **Offline**: Red

### 3. **Debug Logging Added** ✅ ADDED
Added comprehensive logging to help diagnose the issue:

#### In `/hooks/use-displays.ts`:
- Logs when Firestore updates are received
- Logs when Realtime Database updates are received
- Logs the merging process for each display
- Shows which displays have realtime status data

#### In `/lib/realtime-db.ts`:
- Logs the database path being listened to
- Shows the raw data structure from Firebase
- Logs how statuses are extracted for each display

#### In `/app/dashboard/displays/page.tsx`:
- Shows total number of displays
- Shows current filter settings
- Shows which displays pass the filter

## How to Debug

### Step 1: Open Browser Console
Open the browser console (F12) and refresh the dashboard page.

### Step 2: Check the Logs
Look for these log patterns:

```
[listenToAllDisplaysStatus] Listening to path: users/{userId}/displays
[listenToAllDisplaysStatus] Raw data: { ... }
[listenToAllDisplaysStatus] Processing displayId: {displayId}
[listenToAllDisplaysStatus] Added status for {displayId}: { ... }
```

```
[useDisplays] Firestore update: X displays
[useDisplays] Realtime update: X statuses
[useDisplays] Display {displayId}: {firestoreStatus: ..., realtimeStatus: ...}
[useDisplays] Merged displays: X
```

```
[DisplaysPage] All displays: X
[DisplaysPage] Filter status: ["online", "offline", "paused", "playing"]
[DisplaysPage] Filtered displays: X
[DisplaysPage] Display {name} ({id}): status={status}, filtered={true/false}
```

### Step 3: Verify Data Structure
The Raspberry Pi writes to: `users/{userId}/displays/{displayId}/status/`

The listener expects this structure:
```
users/
  {userId}/
    displays/
      {displayId}/
        status/
          displayId: "..."
          displayName: "..."
          status: "online" | "playing" | "paused"
          lastHeartbeat: 1234567890
          volume: 80
          brightness: 100
          currentContent: { ... }
          schedule: { ... }
```

### Step 4: Check Firestore
Make sure the display exists in Firestore with a valid `displayId` that matches what the Raspberry Pi is using.

### Step 5: Check Raspberry Pi Logs
On the Raspberry Pi terminal, you should see:
```
[INFO] Device linked! User: {userId}, Display: {displayId}
[DEBUG] Heartbeat: status=online, is_playing=False, is_paused=False
[DEBUG] Firebase status updated successfully with status=online
```

## Common Issues

### Issue: Display shows in Firestore but not on dashboard
**Possible Causes:**
1. The display's status is not in the filter (check filter includes the status)
2. The `userId` doesn't match
3. The Raspberry Pi is writing to a different `displayId`

**Solution:** Check the browser console logs to see if the display is being loaded and filtered correctly.

### Issue: Status not updating from Raspberry Pi
**Possible Causes:**
1. Raspberry Pi not authenticated/linked properly
2. Wrong path in Realtime Database
3. Firebase Realtime Database rules blocking writes

**Solution:** 
- Check Raspberry Pi logs for authentication errors
- Verify the database path: `users/{userId}/displays/{displayId}/status`
- Check Firebase Realtime Database rules (they should allow writes to this path)

### Issue: Status shows but with wrong value
**Possible Causes:**
1. Type mismatch (should be fixed now)
2. Merge logic issue in `useDisplays` hook

**Solution:** Check the console logs to see what status is being received from Realtime Database vs what's in Firestore.

## Next Steps

1. **Refresh the dashboard** and check the browser console for the debug logs
2. **Check the Raspberry Pi terminal** for any errors
3. **Verify Firebase Realtime Database** has the correct data structure
4. If the display still doesn't show, share the console logs for further debugging

## Clean Up Debug Logs

Once the issue is resolved, you can remove the console.log statements from:
- `/hooks/use-displays.ts`
- `/lib/realtime-db.ts`
- `/app/dashboard/displays/page.tsx`

Or keep them for future debugging (they don't affect production performance significantly).
