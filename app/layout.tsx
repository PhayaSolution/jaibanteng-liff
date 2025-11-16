import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LiffProvider } from "./providers/liff-provider";
import { VConsoleProvider } from "./providers/vconsole-provider";

export const metadata: Metadata = {
  title: "Jai Banteng - Your Minimal Budgeting App",
  description: "Your minimal budgeting app",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Jai Banteng",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // สำหรับ safe area บน iOS
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <head>
        {/* LINE LIFF Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#ffffff" />

  {/* Cache Control Meta Tags */}
  <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
  <meta httpEquiv="Pragma" content="no-cache" />
  <meta httpEquiv="Expires" content="0" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <LiffProvider>
          <VConsoleProvider>
            {children}
          </VConsoleProvider>
        </LiffProvider>
      </body>
    </html>
  );
}
