# Firebase Setup Guide for DormDeals

This guide explains how to set up Firebase Authentication and Firestore for user classification in DormDeals.

## Prerequisites

1. A Firebase account (free tier is sufficient)
2. Node.js and npm installed
3. Firebase CLI installed (optional, for advanced features)

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard:
   - Enter project name: `dormdeals` (or your preferred name)
   - Enable/disable Google Analytics (optional)
   - Click "Create project"

## Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable **Email/Password** authentication:
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"

## Step 3: Create Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click "Create database"
3. Choose **Start in test mode** (for development)
4. Select a location closest to your users
5. Click "Enable"

### Security Rules (Important!)

After creating the database, update the Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      // Users can read their own profile
      allow read: if request.auth != null && request.auth.uid == userId;
      // Users can create their own profile
      allow create: if request.auth != null && request.auth.uid == userId;
      // Users can update their own profile (except userType - only admins can change this)
      allow update: if request.auth != null && request.auth.uid == userId 
                     && (!('userType' in request.resource.data.diff(resource.data).affectedKeys()) 
                         || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.userType == 'admin');
    }
  }
}
```

## Step 4: Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps" section
3. Click the web icon (`</>`) to add a web app
4. Register your app with a nickname (e.g., "DormDeals Web")
5. Copy the Firebase configuration object

## Step 5: Configure Environment Variables

1. Create a `.env` file in the project root (if it doesn't exist)
2. Add the following variables (from Step 4):

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

**Important:** 
- Never commit the `.env` file to version control
- Make sure `.env` is in your `.gitignore`
- For production, set these as environment variables in your hosting platform

## Step 6: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the signup page (`/register`)
3. Create a test account
4. Check Firebase Console:
   - **Authentication** > **Users** - should show your new user
   - **Firestore Database** > **users** collection - should have a document with the user's UID

## User Types

The system supports four user types:

- **`admin`**: Full system access, can manage users and listings
- **`premium`**: Enhanced features (if implemented)
- **`regular`**: Standard user (default for new signups)
- **`guest`**: Limited access (if implemented)

### Default User Type

All new users are automatically assigned `regular` user type upon signup.

### Changing User Types

Currently, only admins can change user types through the Firebase Console or by updating the Firestore document directly. In the future, you can add an admin panel to manage this.

## Troubleshooting

### "Firebase configuration is incomplete" warning

- Make sure all environment variables are set in your `.env` file
- Restart your development server after adding/changing environment variables
- Check that variable names start with `VITE_` (required for Vite)

### "User profile not found" error

- This can happen if a user was created before the profile system was implemented
- The system will automatically create a default profile with `regular` user type
- Check Firestore console to verify the profile was created

### Authentication errors

- Verify Email/Password authentication is enabled in Firebase Console
- Check that your domain is authorized in Firebase Console > Authentication > Settings > Authorized domains
- For local development, `localhost` should be automatically authorized

## Firestore Structure

### Users Collection

```
users/
  {userId}/
    - email: string
    - displayName: string
    - userType: 'admin' | 'premium' | 'regular' | 'guest'
    - createdAt: timestamp
    - updatedAt: timestamp
    - phone?: string
    - school?: string
    - major?: string
    - profileImage?: string
    - isVerified: boolean
    - rating: number
    - reviewCount: number
    - totalSales: number
```

## Next Steps

1. **Set up admin users**: Manually update user documents in Firestore to set `userType: 'admin'` for admin accounts
2. **Implement user type restrictions**: Add checks in your components/pages to restrict access based on user type
3. **Add premium features**: Implement premium-only features and check user type before allowing access
4. **Create admin panel**: Build a UI for admins to manage users and their types

## Security Best Practices

1. **Never expose admin credentials** in client-side code
2. **Use Firestore security rules** to enforce data access
3. **Validate user types** on the server side for critical operations
4. **Regularly audit** admin users and their permissions
5. **Monitor** authentication logs in Firebase Console

## Support

For issues or questions:
- Check [Firebase Documentation](https://firebase.google.com/docs)
- Review the code in `src/config/firebase.ts` and `src/services/userService.ts`
- Check browser console for detailed error messages

