// src/app/layout.tsx
import type { Metadata } from 'next';
import Script from 'next/script'; // Import next/script
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/components/theme/theme-provider';
import { AuthProvider } from '@/lib/firebase/AuthContext';
import { RecommendationProvider } from '@/contexts/RecommendationContext';
import ThemeWrapper from '@/components/layout/ThemeWrapper';


export const metadata: Metadata = {
  title: 'Rasika',
  description: 'Your personal guide to delightful content discoveries.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const GA_TRACKING_ID = 'G-FNSWE0ZHSR'; // Your Google Analytics Tracking ID

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Replaced Belleza with Satisfy for headline, kept Alegreya for body */}
        <link href="https://fonts.googleapis.com/css2?family=Satisfy&family=Alegreya:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
        
        {/* Google Analytics Scripts */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_TRACKING_ID}', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <RecommendationProvider>
              <ThemeWrapper>
                {children}
              </ThemeWrapper>
            </RecommendationProvider>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
