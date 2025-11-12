# Firebase Setup Guide for PanelSena

This guide will help you set up Firebase for your PanelSena Display Management System.

## Prerequisites

- A Google account
- Node.js and npm installed

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter your project name (e.g., "PanelSena")
4. (Optional) Enable Google Analytics
5. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project, click on "Authentication" in the left sidebar
2. Click "Get started"
3. Enable the following sign-in methods:
   - **Email/Password**: Click on it, toggle "Enable", and save
   - **Google**: Click on it, toggle "Enable", select a support email, and save

## Step 3: Create Firestore Database

1. Click on "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in production mode" (we'll add security rules later)
4. Select your preferred Cloud Firestore location
5. Click "Enable"

## Step 4: Set Up Cloud Storage

1. Click on "Storage" in the left sidebar
2. Click "Get started"
3. Start in production mode
4. Choose your storage location (same as Firestore)
5. Click "Done"

## Step 5: Get Firebase Configuration

1. In your Firebase Console, click on the gear icon (⚙️) next to "Project Overview"
2. Click "Project settings"
3. Scroll down to "Your apps" section
4. Click the Web icon (`</>`) to add a web app
5. Register your app with a nickname (e.g., "PanelSena Web")
6. Copy the Firebase configuration object

## Step 6: Configure Your Application

1. In your project root, create a `.env.local` file:

```bash
cp .env.local.example .env.local
```

2. Open `.env.local` and add your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Step 7: Deploy Security Rules

### Firestore Rules

1. In Firebase Console, go to "Firestore Database"
2. Click on the "Rules" tab
3. Copy the contents of `firestore.rules` file from your project
4. Paste it into the Firebase Console rules editor
5. Click "Publish"

Alternatively, use the Firebase CLI:

```bash
npm install -g firebase-tools
firebase login
firebase init firestore
firebase deploy --only firestore:rules
```

### Storage Rules

1. In Firebase Console, go to "Storage"
2. Click on the "Rules" tab
3. Copy the contents of `storage.rules` file from your project
4. Paste it into the Firebase Console rules editor
5. Click "Publish"

Alternatively, use the Firebase CLI:

```bash
firebase deploy --only storage:rules
```

## Step 8: Configure Google Sign-In (Optional but Recommended)

1. Go to Firebase Console > Authentication > Sign-in method
2. Click on Google
3. Enable it
4. Select a support email
5. Add your domain to the authorized domains list (for production)
6. Save

## Step 9: Run Your Application

```bash
npm install
npm run dev
```

Your application should now be running at `http://localhost:3000`

## Firebase Collections Structure

Your Firebase database will have the following collections:

### 1. `users`
```typescript
{
  uid: string
  email: string
  companyName: string
  createdAt: string
  updatedAt: string
}
```

### 2. `displays`
```typescript
{
  id: string
  userId: string
  name: string
  location: string
  status: "online" | "offline"
  resolution: string
  uptime: string
  brightness: number
  orientation: "landscape" | "portrait"
  lastUpdate: string
  group: string
  createdAt: string
  updatedAt: string
}
```

### 3. `content`
```typescript
{
  id: string
  userId: string
  name: string
  type: "image" | "video" | "document"
  size: string
  sizeBytes: number
  uploadDate: string
  category: string
  thumbnail?: string
  url: string
  storageRef: string
  createdAt: string
  updatedAt: string
}
```

### 4. `schedules`
```typescript
{
  id: string
  userId: string
  name: string
  displayIds: string[]
  contentIds: string[]
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  repeat: "once" | "daily" | "weekly" | "monthly"
  status: "active" | "paused" | "completed"
  createdAt: string
  updatedAt: string
}
```

### 5. `activities`
```typescript
{
  id: string
  userId: string
  type: "display" | "content" | "schedule" | "system"
  action: string
  description: string
  metadata?: Record<string, any>
  timestamp: string
}
```

### 6. `analytics`
```typescript
{
  id: string
  userId: string
  displayId?: string
  contentId?: string
  metric: string
  value: number
  timestamp: string
  date: string
}
```

## Firebase Storage Structure

```
users/
  {userId}/
    images/
      {timestamp}_{filename}
    videos/
      {timestamp}_{filename}
    documents/
      {timestamp}_{filename}
```

## Security Features

- All data is isolated per user (userId-based access control)
- Users can only read/write their own data
- File uploads are validated for type and size (max 100MB)
- Activities and analytics are read-only after creation
- Authentication required for all operations

## Troubleshooting

### Issue: Authentication not working
- Verify your Firebase configuration in `.env.local`
- Check if Email/Password authentication is enabled in Firebase Console
- Make sure your domain is authorized in Firebase Console

### Issue: Firestore permission denied
- Verify security rules are deployed correctly
- Check if user is authenticated
- Verify userId matches in the database

### Issue: Storage upload failing
- Check file size (max 100MB)
- Verify file type is supported
- Check storage rules are deployed

### Issue: Environment variables not loading
- Make sure `.env.local` file exists in the project root
- Restart the development server after changing environment variables
- Ensure all variable names start with `NEXT_PUBLIC_`

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication Guide](https://firebase.google.com/docs/auth)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Storage Guide](https://firebase.google.com/docs/storage)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

## Support

For issues or questions, please open an issue on the GitHub repository.
