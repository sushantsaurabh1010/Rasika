// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/components/theme/theme-provider';
import { AuthProvider } from '@/lib/firebase/AuthContext';
import { RecommendationProvider } from '@/contexts/RecommendationContext';
import ThemeWrapper from '@/components/layout/ThemeWrapper'; // Add this line


export const metadata: Metadata = {
  title: 'Rasika',
  description: 'Your personal guide to delightful content discoveries.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // console.log('[RootLayout] Rendering.'); // Optional: for debugging if RootLayout is invoked
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Replaced Belleza with Satisfy for headline, kept Alegreya for body */}
        <link href="https://fonts.googleapis.com/css2?family=Satisfy&family=Alegreya:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
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
