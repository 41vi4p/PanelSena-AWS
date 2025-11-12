# PanelSena Raspberry Pi - Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### Step 1: Run Setup Wizard (2 min)

```bash
cd raspberry-pi/
python3 setup_device.py
```

The wizard will guide you through:
- ✅ Generating unique Device ID and Key
- ✅ Configuring display name
- ✅ Setting up Firebase credentials
- ✅ Creating config.json automatically

**You'll get output like:**
```
Device ID:  DEVICE_20251031143055_A7K9F2
Device Key: k3mN9pQ2rT5vW8xY1zB4cD6eF9gH2jK5

✨ Setup Complete!
Credentials saved to: device_credentials_20251031_143055.txt
```

### Step 2: Copy to Raspberry Pi (1 min)

```bash
# Copy config and service account key to your Pi
scp config.json pi@<raspberry-pi-ip>:~/panelsena/
scp serviceAccountKey.json pi@<raspberry-pi-ip>:~/panelsena/
```

### Step 3: Start Player (1 min)

```bash
# SSH into your Raspberry Pi
ssh pi@<raspberry-pi-ip>

# Navigate to directory
cd ~/panelsena

# Run the player
python3 player.py
```

**You'll see:**
```
[INFO] Device not linked yet
Please link this device in the dashboard:
  Device ID:  DEVICE_20251031143055_A7K9F2
  Device Key: k3mN9pQ2rT5vW8xY1zB4cD6eF9gH2jK5

Waiting for device to be linked...
```

### Step 4: Link in Dashboard (1 min)

1. Open PanelSena dashboard in browser
2. Go to **Displays** page
3. Find or create a display
4. Click **"Link Device"** button
5. Enter:
   - Device ID: `DEVICE_20251031143055_A7K9`
   - Device Key: `k3mN9pQ2rT5vW8xY1zB4cD6eF9gH2jK5`
6. Click **"Link Device"**

**Raspberry Pi console updates:**
```
[INFO] Device linked! User: abc123, Display: display-001
[INFO] Listening for commands...
[INFO] Player is running.
```

### Step 5: Verify (30 sec)

1. Go to **Live Control** page in dashboard
2. Your device shows as **"Online"** 🟢
3. Select a schedule and click **"Play Schedule"**
4. Done! 🎉

---

## 📝 Config File Format

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

---

## 🔧 Common Commands

### Generate New Credentials
```bash
python3 generate_device_credentials.py
```

### Test Connection
```bash
python3 player.py
```

### Auto-Start on Boot
```bash
sudo systemctl enable panelsena.service
sudo systemctl start panelsena.service
```

### View Logs
```bash
sudo journalctl -u panelsena.service -f
```

### Restart Service
```bash
sudo systemctl restart panelsena.service
```

---

## ❓ Troubleshooting

### Device Won't Link

**Problem:** "Invalid device credentials"

✅ **Solution:**
- Check Device ID is exact match (case-sensitive)
- Verify Device Key is correct
- Ensure no extra spaces

### Device Not in Dashboard

**Problem:** Device linked but not showing

✅ **Solution:**
- Check player is running: `ps aux | grep player.py`
- View logs: `sudo journalctl -u panelsena.service -f`
- Restart player: `sudo systemctl restart panelsena.service`

### Connection Error

**Problem:** "Failed to initialize Firebase"

✅ **Solution:**
- Verify `serviceAccountKey.json` exists
- Check internet connection: `ping google.com`
- Verify database_url is correct

---

## 📚 Full Documentation

- **Complete Setup**: `README.md`
- **Device Auth Guide**: `../DEVICE_AUTHENTICATION.md`
- **Live Control**: `../LIVE_CONTROL_SETUP.md`

---

## 🎯 What You Get

✅ Remote playback control
✅ Real-time status monitoring
✅ Schedule management
✅ Volume control
✅ Device restart capability
✅ Automatic content downloading
✅ VLC-based media playback

---

## 🔐 Security Notes

- **Keep Device Key secret** - Don't share publicly
- **Service account key** - Never commit to Git
- **Firestore rules** - Configured automatically
- **HTTPS** - Firebase uses secure connections

---

## 💡 Pro Tips

1. **Save credentials** - Keep device_credentials_*.txt file safe
2. **Multiple devices** - Generate unique credentials for each Pi
3. **Test first** - Run player manually before enabling auto-start
4. **Monitor logs** - Check logs regularly for errors
5. **Update software** - Keep OS and packages updated

---

## ✅ Checklist

Setup checklist:

- [ ] Generate device credentials
- [ ] Copy config.json to Pi
- [ ] Copy serviceAccountKey.json to Pi
- [ ] Install dependencies (`./install.sh`)
- [ ] Test player manually
- [ ] Link device in dashboard
- [ ] Verify in Live Control
- [ ] Enable auto-start service
- [ ] Test reboot (device should auto-start)

---

**Need Help?** Check the full documentation in `README.md` or `DEVICE_AUTHENTICATION.md`

**Ready to scale?** Generate more credentials and repeat for additional Raspberry Pis!
