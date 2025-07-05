# Stack Auth Setup Instructions

Your DocuCraft AI app now has authentication infrastructure set up! To complete the configuration and enable Google & GitHub login:

## 1. Create Stack Auth Project

1. Go to [stack-auth.com](https://stack-auth.com)
2. Create a new project
3. Configure OAuth providers:
   - **Google OAuth**: Add your Google Client ID/Secret
   - **GitHub OAuth**: Add your GitHub App ID/Secret

## 2. Update Environment Variables

Replace the values in `.env.local`:

```env
# Stack Auth Configuration
NEXT_PUBLIC_STACK_PROJECT_ID="your-actual-project-id"
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY="your-actual-publishable-key"
STACK_SECRET_SERVER_KEY="your-actual-secret-key"
```

## 3. OAuth Provider Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI: `https://your-domain.com/api/auth/callback/google`

### GitHub OAuth

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create new OAuth App
3. Set Authorization callback URL: `https://your-domain.com/api/auth/callback/github`

## 4. Features Available

✅ **Email/Password Authentication**
✅ **Google OAuth Login**
✅ **GitHub OAuth Login**
✅ **User Session Management**
✅ **Protected Routes**
✅ **User-Specific Projects**
✅ **Automatic Database Integration**

## 5. Current Status

- ✅ Database schema updated with user support
- ✅ Authentication UI components created
- ✅ Protected routes configured
- ✅ User session integration
- ⏳ Stack Auth credentials needed for full functionality

Once you add the Stack Auth credentials, users will be able to:

- Sign up/sign in with email, Google, or GitHub
- Create and manage their own projects
- Access projects securely across devices
- Enjoy a seamless authentication experience
