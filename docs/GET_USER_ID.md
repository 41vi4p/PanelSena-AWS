# How to Get Your Firebase User ID

The `config.json` file has been pre-configured with your Firebase project details:

```json
{
  "user_id": "your-firebase-user-id-here",  ← You need to update this
  "display_id": "display-001",               ← You can customize this
  "display_name": "Raspberry Pi Display - Main",
  "database_url": "https://panelsena-default-rtdb.firebaseio.com",  ✓ Already set
  "storage_bucket": "panelsena.firebasestorage.app",                ✓ Already set
  "service_account_path": "serviceAccountKey.json"
}
```

## Step 1: Get Your User ID

### Method 1: From Browser Console (Recommended)

1. Open your PanelSena dashboard in a web browser
2. Log in to your account
3. Open **Developer Tools** (F12 or Right-click → Inspect)
4. Go to the **Console** tab
5. Type the following command and press Enter:

```javascript
firebase.auth().currentUser.uid
```

6. Copy the user ID that appears (it looks like: `"xYz123AbC456DeF789..."`)
7. Paste it into the `config.json` file

### Method 2: From Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **panelsena**
3. Go to **Authentication** → **Users**
4. Find your user account in the list
5. Copy the **User UID** column value
6. Paste it into the `config.json` file

### Method 3: From Browser Developer Tools

1. Open your PanelSena dashboard
2. Log in to your account
3. Open **Developer Tools** (F12)
4. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
5. Expand **IndexedDB** → **firebaseLocalStorage**
6. Look for your user object and find the `uid` field

## Step 2: Get Display ID (Optional)

You can use any unique identifier for your display. Some options:

### Option 1: Use Default
```json
"display_id": "display-001"
```

### Option 2: Create from Dashboard
1. Go to Dashboard → **Displays** page
2. Add a new display
3. Copy the generated display ID
4. Use it in config.json

### Option 3: Use Custom Name
```json
"display_id": "lobby-main-display"
"display_id": "cafeteria-screen-1"
"display_id": "pi-raspberry-001"
```

**Important**: The `display_id` must match the ID in your Dashboard's Displays page!

## Step 3: Update config.json

Edit the file on your Raspberry Pi:

```bash
nano ~/panelsena/config.json
```

Update the `user_id` field:

```json
{
  "user_id": "xYz123AbC456DeF789GhI",  ← Replace with your actual user ID
  "display_id": "display-001",
  "display_name": "Raspberry Pi Display - Main",
  "database_url": "https://panelsena-default-rtdb.firebaseio.com",
  "storage_bucket": "panelsena.firebasestorage.app",
  "service_account_path": "serviceAccountKey.json"
}
```

Save the file (Ctrl+O, Enter, Ctrl+X)

## Step 4: Get Firebase Service Account Key

You also need the Firebase service account key file:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **panelsena**
3. Click the **gear icon** → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Download the JSON file
7. Rename it to `serviceAccountKey.json`
8. Copy it to your Raspberry Pi:

```bash
# From your computer
scp serviceAccountKey.json pi@<raspberry-pi-ip>:~/panelsena/
```

Or if you're on the Pi, use FileZilla, SCP, or USB drive to transfer the file.

## Example Final Configuration

```json
{
  "user_id": "AbCdEfGhIjKlMnOpQrStUvWxYz",
  "display_id": "lobby-screen-main",
  "display_name": "Main Lobby Display",
  "database_url": "https://panelsena-default-rtdb.firebaseio.com",
  "storage_bucket": "panelsena.firebasestorage.app",
  "service_account_path": "serviceAccountKey.json"
}
```

## Verification

After updating the config, you can verify it works:

```bash
# On Raspberry Pi
cd ~/panelsena
python3 player.py
```

You should see:
```
==================================================
PanelSena Raspberry Pi Player
==================================================
[INFO] PanelSena Player initialized for display: Main Lobby Display
[INFO] Firebase initialized successfully
[INFO] Listening for commands...
[INFO] Player is running. Press Ctrl+C to exit.
```

Then check your dashboard at **Live Control** page - your display should appear as "Online"!

## Troubleshooting

### "User not authenticated" error
- Make sure the `user_id` matches your logged-in Firebase user
- Try Method 1 to get the correct user ID

### "Permission denied" error
- Check that Realtime Database rules are set correctly
- Verify the service account key is valid

### Display not appearing in dashboard
- Confirm `user_id` is correct
- Ensure Realtime Database is enabled in Firebase
- Check network connectivity on Raspberry Pi

## Quick Start Command

Once everything is configured:

```bash
sudo systemctl start panelsena.service
sudo systemctl status panelsena.service
```

Then open your dashboard and go to **Live Control** to see your display online!
