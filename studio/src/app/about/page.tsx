
'use client';

import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Home, InfoIcon } from 'lucide-react';
import type { Metadata } from 'next';

// Although metadata is typically for Server Components,
// we can define it here for reference or if this page becomes one.
// For client components, document.title can be set in useEffect if needed.
// export const metadata: Metadata = {
//   title: 'About Rasika',
//   description: 'Learn more about Rasika, your mood-based content discovery app.',
// };

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center selection:bg-primary/30 selection:text-primary-foreground">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-grow w-full max-w-2xl">
        <div className="mb-8">
            <Button variant="outline" size="sm" asChild>
                <Link href="/" className="flex items-center">
                    <Home className="mr-2 h-4 w-4" />
                    Back to Home
                </Link>
            </Button>
        </div>

        <Card className="shadow-xl rounded-lg">
          <CardHeader className="text-center border-b pb-6 bg-card rounded-t-lg">
            <div className="mx-auto mb-2 text-primary">
                <InfoIcon size={48} strokeWidth={1.5} />
            </div>
            <CardTitle className="text-4xl font-headline text-primary font-normal">
              Your Mood, Your Stories.
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8 px-6 sm:px-8 space-y-6 font-body text-lg leading-relaxed text-foreground/90">
            <p>
              <span className="font-headline text-primary text-xl">Rasika</span> is a mood-based content discovery app that helps you find the right movie, TV show, anime, podcast, music, or book — based on how you&apos;re feeling.
            </p>
            <p>
              We created <span className="font-headline text-primary text-xl">Rasika</span> to simplify your choices in a world overloaded with options. By tuning into your emotions, <span className="font-headline text-primary text-xl">Rasika</span> cuts through the noise and reduces decision fatigue — so you don’t have to scroll endlessly to find something that truly fits your mood.
            </p>
            <p>
              The name <span className="font-headline text-primary text-xl">Rasika</span> means “one who appreciates beauty and emotion” — and that’s what we help you do: connect with meaningful content that resonates.
            </p>
            <p>
              Whether you&apos;re overwhelmed, inspired, or just bored — <span className="font-headline text-primary text-xl">Rasika</span> gently guides you to something that feels just right.
            </p>
            <p className="font-semibold text-primary/90">
              Let your feelings lead the way. We’ll handle the rest.
            </p>
            <p className="text-right italic text-foreground/80 pt-4">
              — Team Rasika
            </p>
          </CardContent>
        </Card>
      </main>
      <footer className="w-full py-6 mt-12 border-t border-border">
        <p className="text-center text-sm text-muted-foreground font-body">
          &copy; {new Date().getFullYear()} Rasika. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

