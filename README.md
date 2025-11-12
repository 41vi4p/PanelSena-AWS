<div align="center">

# 🖥️ PanelSena
*Your Army of Displays*

### Cloud-Based Digital Signage Management Platform

[![Version](https://img.shields.io/badge/version-1.7.2-blue.svg)](https://github.com/41vi4p/PanelSena)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10-orange.svg)](https://firebase.google.com/)

**A powerful, modern digital signage platform for managing multiple displays using Raspberry Pi devices.**

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Demo](#-demo) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Raspberry Pi Setup](#-raspberry-pi-setup)
- [Usage](#-usage)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [Team](#-team)
- [License](#-license)

---

## 🎯 About

PanelSena is a comprehensive cloud-based digital signage management system that enables you to control and monitor multiple displays from a single dashboard. Built with modern web technologies and designed for Raspberry Pi integration, it's perfect for businesses, schools, retail stores, restaurants, and any organization needing dynamic content display.

### Why PanelSena?

- 🚀 **Easy Setup** - Get your first display running in minutes
- 💰 **Cost-Effective** - Uses affordable Raspberry Pi devices
- ☁️ **Cloud-Based** - Access from anywhere, no on-premise servers
- 🔒 **Secure** - Device-based authentication and Firebase security
- 📊 **Analytics** - Real-time monitoring and performance metrics
- 🎨 **Modern UI** - Beautiful, responsive interface built with Next.js
- 🔄 **Real-Time** - Live updates and instant content changes

---

## ✨ Features

## ✨ Features

### 🖥️ Display Management
- Real-time display monitoring and status tracking
- Online/offline detection with heartbeat monitoring
- Display configuration (brightness, orientation, resolution)
- Group organization for multiple displays
- Uptime tracking and performance metrics
- Device linking with secure authentication

### 📁 Content Management
- Upload images, videos, and documents
- Firebase Storage integration with CDN
- Content categorization and search
- Upload progress tracking
- Thumbnail generation
- Multi-file uploads

### 📅 Smart Scheduling
- Schedule content to specific displays
- Recurring schedules (daily, weekly, monthly)
- Time-based content rotation
- Multiple displays and content per schedule
- Schedule status management (active, paused, completed)
- Calendar view for easy planning

### 🎮 Live Playback Control
- Real-time display monitoring and control
- Remote playback management (play, pause, stop, skip)
- Volume control and adjustment
- Live status updates with heartbeat monitoring
- Schedule execution tracking
- Command queue management
- Error reporting and diagnostics
- Raspberry Pi player integration

### 📊 Analytics & Monitoring
- Real-time activity feed
- Performance metrics and KPIs
- Display analytics and statistics
- Content engagement tracking
- Uptime monitoring
- System health dashboard

### 🔐 Authentication & Security
- Email/Password authentication
- Google Sign-In integration
- Protected routes with middleware
- User data isolation
- Device-based authentication
- Firebase security rules
- Secure credential management

### 🎨 User Experience
- Modern, responsive UI with Tailwind CSS
- Dark/Light theme support
- Mobile-optimized interface
- Intuitive navigation
- Real-time updates
- Toast notifications
- Accessibility features

---

## 🛠️ Technology Stack

### Frontend
- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[React 18](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS
- **[Shadcn/ui](https://ui.shadcn.com/)** - Component library
- **[Radix UI](https://www.radix-ui.com/)** - Accessible components
- **[Lucide React](https://lucide.dev/)** - Icon library

### Backend & Infrastructure
- **[Firebase Authentication](https://firebase.google.com/products/auth)** - User authentication
- **[Cloud Firestore](https://firebase.google.com/products/firestore)** - NoSQL database
- **[Firebase Realtime Database](https://firebase.google.com/products/realtime-database)** - Real-time sync
- **[Firebase Storage](https://firebase.google.com/products/storage)** - File storage
- **[Firebase Hosting](https://firebase.google.com/products/hosting)** - Web hosting

### Raspberry Pi Player
- **[Python 3](https://www.python.org/)** - Player runtime
- **[VLC](https://www.videolan.org/)** - Media playback
- **[Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)** - Backend integration
- **[python-vlc](https://pypi.org/project/python-vlc/)** - VLC Python bindings

### Development Tools
- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting
- **[Git](https://git-scm.com/)** - Version control

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm/pnpm
- **Firebase** account ([Sign up](https://firebase.google.com/))
- **Raspberry Pi** 3 or higher (for display player)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/41vi4p/PanelSena.git
   cd PanelSena
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up Firebase**
   
   Create a Firebase project at [firebase.google.com](https://firebase.google.com/)
   
   Enable these services:
   - Authentication (Email/Password & Google)
   - Cloud Firestore
   - Realtime Database
   - Storage

4. **Configure environment variables**
   
   Create `.env.local` in the root directory:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_database_url
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🥧 Raspberry Pi Setup

### Quick Setup

1. **Prepare your Raspberry Pi**
   - Raspberry Pi 3 or higher
   - Raspbian OS installed
   - Internet connection
   - Display connected via HDMI

2. **Run the installation script**
   ```bash
   cd raspberry-pi
   chmod +x install.sh
   ./install.sh
   ```

3. **Run the setup wizard**
   ```bash
   python3 setup_device.py
   ```
   
   This will:
   - Generate device credentials
   - Create configuration file
   - Save device ID and key

4. **Link the device to your account**
   - Go to your PanelSena dashboard
   - Click "Add Display"
   - Enter the device ID and key from setup
   - Your display is now linked!

5. **Start the player**
   ```bash
   python3 player.py
   ```

### Manual Setup

See [raspberry-pi/README.md](raspberry-pi/README.md) for detailed instructions.

## Project Structure

```
PanelSena/
├── app/                      # Next.js app directory
│   ├── dashboard/           # Dashboard pages
│   ├── page.tsx            # Login page
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles
├── components/              # React components
│   ├── ui/                 # UI components (Radix)
│   ├── display-grid.tsx    # Display management
│   ├── content-library.tsx # Content management
│   ├── protected-route.tsx # Auth guard
│   └── ...
├── hooks/                   # Custom React hooks
│   ├── use-auth.ts         # Authentication hook
│   ├── use-displays.ts     # Display management hook
│   ├── use-content.ts      # Content management hook
│   ├── use-activities.ts   # Activity logging hook
│   ├── use-schedules.ts    # Schedule management hook
│   └── use-analytics.ts    # Analytics hook
├── lib/                     # Utility libraries
│   ├── firebase.ts         # Firebase initialization
│   ├── auth.ts             # Authentication functions
│   ├── firestore.ts        # Firestore operations
│   ├── storage.ts          # Storage operations
│   ├── types.ts            # TypeScript types
│   └── utils.ts            # Helper functions
├── firestore.rules          # Firestore security rules
├── storage.rules            # Storage security rules
├── FIREBASE_SETUP.md        # Firebase setup guide
└── README.md               # This file
```

## Firebase Collections

### users
User profiles and account information

### displays
Digital display configurations and status

### content
Uploaded content metadata (images, videos, documents)

### schedules
Content scheduling information

### activities
User activity logs and system events

### analytics
Performance metrics and usage data

## Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
```

## Security

- All data is isolated per user using Firebase security rules
- Users can only access their own resources
- File uploads are validated for type and size (max 100MB)
- Authentication required for all operations
- HTTPS enforced in production

## Firebase Security Rules

Security rules are provided in:
- `firestore.rules` - Database security
- `storage.rules` - File storage security

Deploy them using:
```bash
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

## Key Features Implementation

### Real-time Updates
All display data, content, and activities update in real-time using Firestore listeners.

### File Upload
Files are uploaded to Firebase Storage with progress tracking. Metadata is stored in Firestore.

### Authentication
Firebase Authentication with Email/Password and Google Sign-In. Protected routes ensure only authenticated users can access the dashboard.

### Activity Logging
All user actions are logged to the activities collection for audit trails.

### Analytics Tracking
System automatically tracks metrics like display uptime, content views, and user engagement.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📖 Usage

### Adding Your First Display

1. **Login to Dashboard**
   - Sign in with your account

2. **Add a Display**
   - Click "Add Display" button
   - Enter device credentials from Raspberry Pi setup
   - Display will appear in your dashboard

3. **Upload Content**
   - Go to Content Library
   - Click "Upload Content"
   - Select images, videos, or documents
   - Add to your library

4. **Create a Schedule**
   - Navigate to Schedules
   - Click "Create Schedule"
   - Select displays and content
   - Set time and recurrence
   - Save and activate

5. **Monitor in Real-Time**
   - View live status on Dashboard
   - Control playback remotely
   - Check analytics and metrics

---

## 📚 Documentation

- **[Firebase Setup Guide](FIREBASE_SETUP.md)** - Complete Firebase configuration
- **[Device Authentication](docs/DEVICE_AUTHENTICATION.md)** - Device linking system
- **[Live Control Setup](docs/LIVE_CONTROL_SETUP.md)** - Real-time playback control
- **[Raspberry Pi Guide](raspberry-pi/README.md)** - Pi setup and configuration
- **[Device Linking Guide](docs/DEVICE_LINKING_GUIDE.md)** - Step-by-step linking process
- **[Configuration Status](docs/CONFIGURATION_STATUS.md)** - System configuration

---

## 🎯 Use Cases

- 🏢 **Corporate** - Office announcements, KPIs, company news
- 🛍️ **Retail** - Product showcases, promotions, pricing
- 🎓 **Education** - Schedules, events, educational content
- 🏥 **Healthcare** - Wait times, directions, health information
- 🍽️ **Restaurants** - Menus, specials, promotional offers
- 🏨 **Hospitality** - Guest information, facilities, local attractions

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Ways to Contribute

- 🐛 **Report bugs** - Open an issue with details
- 💡 **Suggest features** - Share your ideas
- 📖 **Improve docs** - Help others understand
- 🔧 **Submit PRs** - Fix bugs or add features
- ⭐ **Star the repo** - Show your support

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow TypeScript best practices
- Use ESLint and Prettier
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation

---

## 👥 Team

<div align="center">

### Development Team

| [David Porathur](https://github.com/davidporathur) | [Soham Marathe](https://github.com/sohammarathe) | [Arpith Poojary](https://github.com/arpithpoojary) | [Anuj Naik](https://github.com/anujnaik) |
|:---:|:---:|:---:|:---:|
| Developer | Developer | Developer | Developer |

</div>

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 PanelSena Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI Components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Backend powered by [Firebase](https://firebase.google.com/)
- Media playback via [VLC](https://www.videolan.org/)

---

## 📞 Support

- 📧 **Email**: support@panelsena.com
- 📖 **Documentation**: [docs](docs/)
- 🐛 **Issues**: [GitHub Issues](https://github.com/41vi4p/PanelSena/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/41vi4p/PanelSena/discussions)

---

<div align="center">

**Built with ❤️ by the PanelSena Team**

⭐ Star us on GitHub — it helps!

[Documentation](docs/) • [Report Bug](https://github.com/41vi4p/PanelSena/issues) • [Request Feature](https://github.com/41vi4p/PanelSena/issues)

</div>

## Documentation

Comprehensive documentation is available in the `docs/` folder:

### Getting Started
- **[Quick Start Guide](raspberry-pi/QUICK_START.md)** - 5-minute Raspberry Pi setup
- **[Firebase Setup](FIREBASE_SETUP.md)** - Firebase configuration guide

### Features & Implementation
- **[Live Control System](docs/LIVE_CONTROL_SETUP.md)** - Real-time playback control guide
- **[Device Authentication](docs/DEVICE_AUTHENTICATION.md)** - Device-based auth system
- **[Implementation Summary](docs/IMPLEMENTATION_SUMMARY.md)** - Technical details

### Raspberry Pi
- **[Raspberry Pi Setup](raspberry-pi/README.md)** - Complete setup guide
- **[Quick Start](raspberry-pi/QUICK_START.md)** - Rapid deployment

### Browse All
- **[Documentation Index](docs/README.md)** - Complete documentation overview

## Troubleshooting

See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for common issues and solutions.

For specific issues:
- **Live Control**: [docs/LIVE_CONTROL_SETUP.md#troubleshooting](docs/LIVE_CONTROL_SETUP.md#troubleshooting)
- **Device Auth**: [docs/DEVICE_AUTHENTICATION.md#troubleshooting](docs/DEVICE_AUTHENTICATION.md#troubleshooting)
- **Raspberry Pi**: [raspberry-pi/QUICK_START.md#troubleshooting](raspberry-pi/QUICK_START.md#troubleshooting)

## Support

For issues or questions, please open an issue on GitHub.

## Roadmap

- [x] Live playback control and monitoring
- [x] Raspberry Pi player integration
- [ ] Mobile app for display control
- [ ] Advanced analytics dashboard
- [ ] Content approval workflow
- [ ] Multi-user collaboration
- [ ] Display health monitoring
- [ ] Automated content scheduling
- [ ] Integration with external content sources
- [ ] Report generation

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Icons from [Lucide](https://lucide.dev/)
- Backend by [Firebase](https://firebase.google.com/)
