
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/AuthContext';
import { Header } from '@/components/layout/Header';
import { RecommendationForm } from '@/components/mood-recommender/RecommendationForm';
import { RecommendationCard } from '@/components/mood-recommender/RecommendationCard';
import { Skeleton } from '@/components/ui/skeleton';
import { RecommendationProvider, useRecommendations } from '@/contexts/RecommendationContext';
import type { GenerateRecommendationOutput, RecommendationItem } from '@/ai/flows/generate-recommendation';

// Inner component to access context after Provider is set up
function PageContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { recommendations, setRecommendations } = useRecommendations();
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleRecommendationsFetched = (data: GenerateRecommendationOutput | null) => {
    console.log('[HomePage/PageContent] handleRecommendationsFetched called with data:', data ? `Array[${data.length}]` : data);
    setRecommendations(data); // This will use the setRecommendationsWithLog from the provider
  };

  if (authLoading || (!user && !authLoading)) { // Show skeleton if auth is loading OR if not authenticated yet (to avoid flash of form)
    return (
      <>
        <Skeleton className="h-10 w-1/2 mb-4" />
        <Skeleton className="h-8 w-3/4 mb-8" />
        <div className="space-y-8 w-full">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </>
    );
  }
  
  // User is authenticated by this point if we didn't return above
  return (
    <>
      <h2 className="text-3xl font-headline text-center text-foreground/90 mb-2">
        Discover Your Next Obsession
      </h2>
      <p className="text-center text-foreground/70 font-body mb-10 text-lg">
        Tell us how you feel, what you like, and we&apos;ll find something special for you.
      </p>
      <RecommendationForm
        onRecommendationsFetched={handleRecommendationsFetched}
        setIsLoading={setIsLoadingRecommendations}
        isLoading={isLoadingRecommendations}
      />
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        {isLoadingRecommendations && (
          Array.from({ length: 4 }).map((_, index) => (
            <RecommendationCard key={`skeleton-${index}`} recommendation={null} isLoading={true} index={index} />
          ))
        )}
        {!isLoadingRecommendations && recommendations && recommendations.map((rec, index) => (
          <RecommendationCard key={(rec.title ?? 'untitled') + index} recommendation={rec} isLoading={false} index={index} />
        ))}
        {!isLoadingRecommendations && recommendations && recommendations.length === 0 && (
          <div className="mt-12 flex justify-center col-span-full">
            <p className="text-muted-foreground">No recommendations found. Try adjusting your selections.</p>
          </div>
        )}
      </div>
    </>
  );
}


export default function HomePage() {
  // RecommendationProvider is now in RootLayout, so it's not needed here directly.
  // However, PageContent needs to be a child of where the context is effectively established if it consumes it.
  // Since RootLayout now has RecommendationProvider, PageContent will correctly access it.
  return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center selection:bg-primary/30 selection:text-primary-foreground">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-grow w-full max-w-3xl">
          <PageContent />
        </main>
        <footer className="w-full py-6 mt-12 border-t border-border">
          <p className="text-center text-sm text-muted-foreground font-body">
            &copy; {new Date().getFullYear()} Rasika. All rights reserved.
          </p>
        </footer>
      </div>
  );
}
  