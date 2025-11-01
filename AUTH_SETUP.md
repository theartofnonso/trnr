# Authentication Setup Guide

## Overview
The app requires Supabase OTP (One-Time Password) authentication via email before users can start training sessions.

## Environment Variables Required

Add these to your `.env.local` file:

```env
# Supabase Configuration (required for auth)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI (existing)
OPENAI_API_KEY=your_openai_api_key

# Mem0 (existing)
MEM0_API_KEY=your_mem0_api_key
```

## Supabase Configuration Steps

### 1. Enable Email Auth in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Providers**
3. Enable **Email** authentication
4. Email OTP is enabled by default - no additional configuration needed!

### 2. Configure Email Settings (Optional)

In Supabase dashboard → **Authentication** → **Email Templates**:
- Customize the OTP email template (optional)
- Add your branding and messaging
- Default template works great out of the box

### 3. Configure Auth Settings

In Supabase dashboard → **Authentication** → **Settings**:
- Set **Site URL**: `http://localhost:3000` (development)
- Add production URL when deploying
- Configure redirect URLs if needed

### 4. Get Your Keys

- **Project URL**: Found in **Settings** → **API**
- **Anon Key**: Found in **Settings** → **API** → **Project API keys**
- **Service Role Key**: Found in **Settings** → **API** → **Project API keys** (keep secret!)

## How It Works

### Authentication Flow

1. **User visits app** → Shows beautiful email input form
2. **User enters email** → App sends OTP code via email
3. **User enters OTP** → App verifies and grants access
4. **User can train** → All sessions are tied to their user ID
5. **User signs out** → Returns to login screen

### Features

- **Protected Routes**: Training interface only accessible when authenticated
- **Persistent Sessions**: Users stay logged in across page refreshes
- **User-Specific Data**: All workout data, memories, and sessions are tied to the authenticated user
- **Graceful Sign Out**: Minimalist button in top-right corner
- **Auto-create Users**: New users are automatically created on first login

### User Experience

#### Login Screen
- Minimalist, beautiful email input
- Sparkles icon and "trnr" branding
- Glassmorphism with subtle glow effects
- Monospace font throughout
- Smooth hover animations with shimmer effect

#### Verification Screen
- Large 6-digit code input with letter-spacing
- Shows which email the code was sent to
- Easy back button to change email
- Auto-focuses for quick entry
- Monospace font for code readability

#### Authenticated View
- Subtle "sign out" button in top-right corner
- Full access to training features
- Mic toggle only shows when connected
- Everything styled with monospace font

## Security Notes

- **Never commit** `.env.local` to git
- **Keep Service Role Key secret** - only use server-side
- **Anon Key is public** - safe to use client-side
- **Emails are hashed** in Supabase
- **OTP codes expire** after 60 seconds

## Testing

### Development Testing

No special setup needed! Just use your real email address to test. The OTP will be sent to your inbox immediately.

### Using Test Emails (Optional)

For automated testing, you can disable email confirmation in development:
- Go to **Authentication** → **Settings**
- Disable "Enable email confirmations" for development only
- Re-enable for production!

## Troubleshooting

### "Missing Supabase environment variables"
- Check `.env.local` has all three variables
- Restart Next.js dev server after adding env vars

### "Failed to send code"
- Verify email provider is enabled in Supabase
- Check email address format
- Look in spam folder for OTP email

### "Invalid code"
- OTP codes expire after 60 seconds
- Request a new code if expired
- Check for typos in the 6-digit code
- Codes are case-sensitive

## Data Privacy

- User email addresses are stored securely by Supabase
- All workout data is scoped to the authenticated user ID
- Memories and exercises are private per user
- No data is shared between users

## Production Deployment

When deploying to production:

1. Update Supabase **Site URL** to your production domain
2. Add production domain to **Redirect URLs**
3. Set environment variables in your hosting platform
4. Customize email templates with your branding (optional)
5. Test the complete flow with real email addresses

## Files Modified

- ✅ `lib/supabase-client.ts` - Client-side Supabase auth client
- ✅ `hooks/useAuth.ts` - Authentication state management
- ✅ `components/AuthForm.tsx` - OTP login UI
- ✅ `app/page.tsx` - Protected route logic
- ✅ `components/ConnectButton.tsx` - Accepts userId prop
- ✅ `hooks/useVoiceAgent.ts` - Uses authenticated userId
- ✅ `hooks/useOfflineSync.ts` - Uses authenticated userId

## Support

For Supabase auth issues, refer to:
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Email Auth Guide](https://supabase.com/docs/guides/auth/auth-email)
- [Email Templates](https://supabase.com/docs/guides/auth/auth-email#customizing-email-templates)

