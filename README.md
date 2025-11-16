# Jai Banteng - Your Minimal Budgeting App

This is a [Next.js](https://nextjs.org) project optimized for **LINE LIFF** and **responsive design** (mobile, iPad, and desktop).

## Features

- ✅ **LINE LIFF Optimized**: Configured with proper viewport, meta tags, and safe area insets
- ✅ **Responsive Design**: Works seamlessly on mobile, iPad, and desktop
- ✅ **Safe Area Support**: Handles iOS notch and bottom bar correctly
- ✅ **Touch Optimized**: Prevents unwanted zoom, tap highlights, and text selection

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## LINE LIFF Setup

### 1. Create LINE LIFF App in LINE Developers Console

1. Go to [LINE Developers Console](https://developers.line.biz/console/)
2. Select your provider (or create a new one)
3. Create a new **LIFF app**
4. Configure the LIFF app:
   - **App name**: Your app name
   - **Size**: Full (recommended) or other sizes
   - **Endpoint URL**: Your app's URL (e.g., `https://your-domain.com` or `https://your-app.vercel.app`)
   - **Scope**: `profile`, `openid`, `email` (if needed)
   - **Bot link feature**: Enable if you want to link with a bot
5. Copy the **LIFF ID** (you'll need this for the next step)

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
# LINE LIFF Configuration
NEXT_PUBLIC_LINE_LIFF_ID=your-liff-id-here

# Optional: App URL (for production)
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

**Important Notes:**
- `NEXT_PUBLIC_LINE_LIFF_ID` is **required** - without it, LIFF initialization will fail
- The `NEXT_PUBLIC_` prefix makes the variable available in the browser
- Never commit `.env.local` to version control (it's already in `.gitignore`)

### 3. Install LINE LIFF SDK

```bash
pnpm add @line/liff
```

### 4. Using LIFF in Your Components

The app uses a centralized authentication system via `useAuth()` hook:

```tsx
'use client';

import { useAuth } from '@/app/hooks/use-auth';

export default function MyComponent() {
  const { user, isLoading, isAuthenticated, error, login } = useAuth();

  // Auto-login on mount
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      login();
    }
  }, [isAuthenticated, isLoading, login]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!isAuthenticated) return <div>Not authenticated</div>;

  return <div>Hello, {user?.displayName}!</div>;
}
```

### 5. Testing LIFF Login

#### Testing in Development

1. **Start the development server:**
   ```bash
   pnpm dev
   ```

2. **Access via LIFF URL:**
   - The app must be accessed through LINE's LIFF URL, not directly
   - LIFF URL format: `https://liff.line.me/YOUR_LIFF_ID`
   - Open this URL in LINE app or LINE web browser

3. **Debug Panel:**
   - The Debug Panel appears automatically in development mode or when in LIFF environment
   - Check the Debug Panel for:
     - LIFF Provider status
     - LIFF Ready status
     - LIFF ID configuration
     - Authentication state
     - Any errors

#### Testing Checklist

- [ ] `NEXT_PUBLIC_LINE_LIFF_ID` is set in `.env.local`
- [ ] App is deployed and accessible via HTTPS (required for LIFF)
- [ ] LIFF Endpoint URL in LINE Developers Console matches your app URL
- [ ] Opening `https://liff.line.me/YOUR_LIFF_ID` redirects to your app
- [ ] Debug Panel shows "LIFF Provider Ready: ✅"
- [ ] Debug Panel shows "LIFF Ready: ✅"
- [ ] User can successfully login and see their profile

#### Common Issues

**Issue: "Failed to initialize LIFF"**
- Check that `NEXT_PUBLIC_LINE_LIFF_ID` is set correctly
- Verify the LIFF ID matches the one in LINE Developers Console
- Ensure the app is accessed via HTTPS (LIFF requires HTTPS)

**Issue: "Not in LIFF environment"**
- Make sure you're accessing the app via `https://liff.line.me/YOUR_LIFF_ID`
- Don't access the app directly via your domain URL (it won't work for login)

**Issue: Login redirect loop**
- Check that the Endpoint URL in LINE Developers Console matches your app URL exactly
- Verify CORS settings if using a custom domain

### 6. LIFF Utilities

The app provides utility functions in `app/utils/liff.util.ts`:

- `initLiff()` - Initialize LIFF SDK
- `isLiff()` - Check if running in LIFF environment
- `isLiffReady()` - Check if LIFF is initialized and ready
- `getLiffProfile()` - Get user profile (triggers login if not logged in)
- `getLiffUserInfo()` - Get complete user info including email/phone
- `getLiffAccessToken()` - Get access token
- `getLiffIdToken()` - Get ID token (contains email/phone if available)

## Responsive Design

### Breakpoints

- **Mobile**: `< 768px` - Full width with padding
- **Tablet (iPad)**: `≥ 768px` - Max width 768px, centered
- **Desktop/iPad Pro**: `≥ 1024px` - Max width 1024px, centered

### Using Container Component

```tsx
import Container from '@/app/components/layout/container.component';

export default function Page() {
  return (
    <Container maxWidth="tablet">
      {/* Your content */}
    </Container>
  );
}
```

### Using Safe Area Component

```tsx
import SafeArea from '@/app/components/layout/safe-area.component';

export default function Page() {
  return (
    <SafeArea useSafeArea={true}>
      {/* Your content with safe area padding */}
    </SafeArea>
  );
}
```

## Project Structure

```
app/
├── components/
│   ├── layout/
│   │   ├── container.component.tsx    # Responsive container
│   │   └── safe-area.component.tsx    # Safe area wrapper
│   └── svg/
│       └── loading.component.tsx      # Loading component
├── utils/
│   └── liff.util.ts                   # LINE LIFF utilities
├── globals.css                        # Global styles with responsive rules
├── layout.tsx                         # Root layout with LIFF meta tags
└── page.tsx                           # Home page
```

## Responsive Features

- **Viewport**: Optimized for mobile-first with `viewport-fit=cover` for iOS
- **Safe Area**: CSS variables for safe area insets (`env(safe-area-inset-*)`)
- **Touch Actions**: Prevents unwanted zoom and text selection
- **Dynamic Viewport**: Uses `100dvh` for proper mobile browser height

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
