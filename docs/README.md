# PanelSena Documentation

Welcome to the PanelSena documentation! This folder contains comprehensive guides for setup, implementation, and usage.

## 📚 Documentation Index

### Getting Started

- **[Quick Start Guide](../raspberry-pi/QUICK_START.md)** - 5-minute Raspberry Pi setup
- **[Main README](../README.md)** - Project overview and features
- **[AWS Setup](AWS_SETUP.md)** - AWS services configuration guide
- **[DynamoDB Setup](DYNAMODB_SETUP_GUIDE.md)** - Database setup guide

### Live Playback Control

- **[Live Control Setup](./LIVE_CONTROL_SETUP.md)** - Complete live control system guide
  - Architecture overview
  - Database structure
  - Setup instructions for web and Raspberry Pi
  - Usage guide
  - Troubleshooting

- **[Implementation Summary](./IMPLEMENTATION_SUMMARY.md)** - Technical implementation details
  - What was built
  - Files created/modified
  - Build status
  - Next steps

### Device Authentication

- **[Device Authentication Guide](./DEVICE_AUTHENTICATION.md)** - Device-based auth system
  - How device auth works
  - Setup instructions
  - Security considerations
  - Troubleshooting
  - API reference

- **[Device Auth Implementation](./DEVICE_AUTH_IMPLEMENTATION.md)** - Technical implementation
  - Migration from user ID auth
  - Code changes
  - Database structure
  - Testing checklist

### Raspberry Pi Setup

- **[Raspberry Pi README](../raspberry-pi/README.md)** - Complete Pi setup guide
  - Hardware requirements
  - Software installation
  - AWS configuration
  - Auto-start setup
  - Display configuration

- **[Quick Start](../raspberry-pi/QUICK_START.md)** - Rapid deployment guide
  - 5-minute setup process
  - Common commands
  - Troubleshooting tips

## 🔍 Quick Links by Topic

### For First-Time Users

1. Start with [Main README](../README.md)
2. Follow [AWS Setup](AWS_SETUP.md)
3. Use [Quick Start Guide](../raspberry-pi/QUICK_START.md) for Raspberry Pi

### For Developers

1. Review [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
2. Check [Device Auth Implementation](./DEVICE_AUTH_IMPLEMENTATION.md)
3. Reference [Live Control Setup](./LIVE_CONTROL_SETUP.md)

### For Raspberry Pi Setup

1. Read [Quick Start](../raspberry-pi/QUICK_START.md) for fast setup
2. Reference [Raspberry Pi README](../raspberry-pi/README.md) for details
3. Follow [Device Authentication Guide](./DEVICE_AUTHENTICATION.md) for linking

### For Troubleshooting

1. Check [Live Control Setup - Troubleshooting](./LIVE_CONTROL_SETUP.md#troubleshooting)
2. Review [Device Authentication - Troubleshooting](./DEVICE_AUTHENTICATION.md#troubleshooting)
3. See [Quick Start - Troubleshooting](../raspberry-pi/QUICK_START.md#troubleshooting)

## 📖 Documentation Structure

```
PanelSena/
├── README.md                          # Main project overview
├── AWS_SETUP.md                       # AWS services configuration
├── DYNAMODB_SETUP_GUIDE.md            # Database setup guide
├── EC2_DEPLOYMENT_README.md           # EC2 deployment guide
├── INTEGRATION_SUMMARY.md             # Integration details
│
├── docs/                              # 📁 Documentation folder (you are here)
│   ├── README.md                      # This file
│   ├── LIVE_CONTROL_SETUP.md          # Live control system
│   ├── LOGGING_IMPLEMENTATION.md      # Logging system implementation
│   ├── IMPLEMENTATION_SUMMARY.md      # Technical implementation
│   ├── DEVICE_AUTHENTICATION.md       # Device auth guide
│   └── DEVICE_AUTH_IMPLEMENTATION.md  # Device auth technical details
│
└── raspberry-pi/                      # Raspberry Pi files
    ├── README.md                      # Complete Pi setup
    ├── QUICK_START.md                 # 5-minute setup
    ├── player.py                      # Player script
    ├── config.json                    # Configuration
    ├── generate_device_credentials.py # Credential generator
    ├── requirements.txt               # Python dependencies
    └── install.sh                     # Installation script
```

## 🎯 Common Tasks

### Setting Up a New Raspberry Pi

1. Generate credentials: `python3 raspberry-pi/generate_device_credentials.py`
2. Copy files to Pi: `scp config.json pi@<ip>:~/panelsena/`
3. Start player: `python3 player.py`
4. Link in dashboard: Displays → Link Device
5. Verify: Live Control → Check status

See: [Quick Start Guide](../raspberry-pi/QUICK_START.md)

### Configuring Live Control

1. Enable Firebase Realtime Database
2. Set database security rules
3. Add `NEXT_PUBLIC_FIREBASE_DATABASE_URL` to .env
4. Build and deploy web app
5. Access Live Control page

See: [Live Control Setup](./LIVE_CONTROL_SETUP.md)

### Understanding Device Authentication

1. Device generates unique ID and key
2. Device registers in Firebase
3. User links device in dashboard
4. Device authenticates and starts operation

See: [Device Authentication Guide](./DEVICE_AUTHENTICATION.md)

## 🔧 Technical Reference

### Database Paths

```
Firebase Realtime Database:
├── device_registry/        # Device registration
├── device_links/          # Device-to-user mappings
└── users/
    └── {userId}/
        └── displays/
            └── {displayId}/
                ├── status/    # Live status
                └── commands/  # Control commands
```

### Key Components

- **Live Control Page**: `app/dashboard/live-control/page.tsx`
- **Device Link Dialog**: `components/device-link-dialog.tsx`
- **Realtime DB Functions**: `lib/realtime-db.ts`
- **Player Script**: `raspberry-pi/player.py`
- **Credentials Generator**: `raspberry-pi/generate_device_credentials.py`

## 📊 Feature Documentation

### Live Playback Control

Real-time monitoring and control of Raspberry Pi displays:
- Play/pause/stop commands
- Volume control
- Skip functionality
- Schedule execution
- Device restart

See: [Live Control Setup](./LIVE_CONTROL_SETUP.md)

### Device Authentication

Secure device linking with unique credentials:
- Automatic device registration
- Visual linking in dashboard
- Per-device keys
- Easy revocation

See: [Device Authentication Guide](./DEVICE_AUTHENTICATION.md)

### Raspberry Pi Player

VLC-based media player with Firebase integration:
- Auto-content download
- Schedule playback
- Heartbeat monitoring
- Command execution

See: [Raspberry Pi README](../raspberry-pi/README.md)

## 🆘 Getting Help

### Documentation

- Browse this folder for detailed guides
- Check README files in each directory
- Review troubleshooting sections

### Common Issues

Most issues are covered in:
- [Live Control - Troubleshooting](./LIVE_CONTROL_SETUP.md#troubleshooting)
- [Device Auth - Troubleshooting](./DEVICE_AUTHENTICATION.md#troubleshooting)
- [Quick Start - Troubleshooting](../raspberry-pi/QUICK_START.md#troubleshooting)

### Support

For additional help:
1. Check the relevant documentation file
2. Review AWS Console for errors
3. Check player logs: `sudo journalctl -u panelsena.service -f`

## 📝 Contributing

When adding new features:
1. Update relevant documentation
2. Add troubleshooting section
3. Include code examples
4. Update this index

## 🔄 Updates

Documentation is updated with each major feature addition. Last updated: 2025-10-31

- ✅ Live Playback Control system
- ✅ Device-based authentication
- ✅ Raspberry Pi player integration
- ✅ Comprehensive setup guides

---

**Quick Navigation:**
- [← Back to Main README](../README.md)
- [↑ Back to Top](#panelsena-documentation)
