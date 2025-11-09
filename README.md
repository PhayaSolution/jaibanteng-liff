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

### 1. Install LINE LIFF SDK

```bash
pnpm add @line/liff
```

### 2. Initialize LIFF in your component

```tsx
'use client';

import { useEffect } from 'react';
import { initLiff, getLiffProfile } from '@/app/utils/liff.util';

export default function MyComponent() {
  useEffect(() => {
    initLiff({ 
      liffId: 'YOUR_LIFF_ID' 
    }).then(() => {
      getLiffProfile().then(profile => {
        console.log('User profile:', profile);
      });
    });
  }, []);

  return <div>Your content</div>;
}
```

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
