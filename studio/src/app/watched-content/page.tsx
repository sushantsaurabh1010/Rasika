
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/firebase/AuthContext';
import { getUserHistory, type HistoryEntry } from '@/lib/firebase/historyService';
import type { RecommendationItem } from '@/ai/flows/generate-recommendation';
import { Header } from '@/components/layout/Header';
import { WatchedItemCard } from '@/components/watched-content/WatchedItemCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Eye, AlertTriangle, Inbox } from 'lucide-react';

export default function WatchedContentPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [watchedItems, setWatchedItems] = useState<RecommendationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const fetchWatchedContent = async () => {
    if (user) {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch a larger number of history entries to get comprehensive viewed items
        const historyEntries = await getUserHistory(user.uid, 100); 
        const allViewedRaw = historyEntries.flatMap(entry => entry.viewedRecommendations || []);
        
        const uniqueViewedItemsMap = new Map<string, RecommendationItem>();
        allViewedRaw.forEach(item => {
          if (item && item.title && item.contentType) {
            const key = `${item.title}-${item.contentType}`; // Simple key for deduplication
            if (!uniqueViewedItemsMap.has(key)) {
              uniqueViewedItemsMap.set(key, item);
            }
          }
        });
        setWatchedItems(Array.from(uniqueViewedItemsMap.values()));
      } catch (err) {
        console.error("[WatchedContentPage] Error fetching watched content:", err);
        setError(err instanceof Error ? err.message : "Failed to load watched content.");
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (!authLoading && user) {
      fetchWatchedContent();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-grow w-full max-w-3xl flex flex-col items-center justify-center">
          <p className="text-xl mb-4 text-muted-foreground">Authenticating user...</p>
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-8 w-1/2 mb-8" />
          <div className="space-y-4 w-full">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center selection:bg-primary/30 selection:text-primary-foreground">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-grow w-full max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <Button variant="outline" size="sm" asChild>
            <Link href="/profile" className="flex items-center">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Profile
            </Link>
          </Button>
          <h2 className="text-3xl font-headline text-center text-foreground/90 flex items-center">
            <Eye className="mr-3 h-8 w-8 text-primary" />
            My Watched Content
          </h2>
          <div className="w-36 md:w-44"></div> {/* Spacer for balance */}
        </div>

        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        )}

        {error && (
          <div className="text-center py-10 bg-destructive/10 p-6 rounded-lg border-2 border-destructive shadow-lg">
            <div className="flex justify-center items-center mb-4">
                <AlertTriangle className="h-12 w-12 text-destructive" />
                <p className="text-destructive text-xl font-semibold ml-3">Error Loading Watched Content</p>
            </div>
            <p className="text-destructive/90 mt-2 text-md text-left whitespace-pre-wrap">{error}</p>
            <Button onClick={fetchWatchedContent} className="mt-6">
              Try Again
            </Button>
          </div>
        )}

        {!isLoading && !error && watchedItems.length === 0 && (
          <div className="text-center py-16">
            <Inbox className="h-20 w-20 text-muted-foreground mx-auto mb-6 opacity-50" />
            <p className="text-muted-foreground text-xl mb-2">No Watched Content Yet</p>
            <p className="text-muted-foreground">You haven&apos;t marked any recommendations as watched/read/listened to. When you do, they&apos;ll appear here!</p>
             <Button variant="link" asChild className="mt-4 text-primary">
                <Link href="/">Find Something New</Link>
            </Button>
          </div>
        )}

        {!isLoading && !error && watchedItems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {watchedItems.map((item, index) => (
              // Using a composite key if item IDs are not guaranteed or not present
              <WatchedItemCard key={`${item.title}-${item.contentType}-${index}`} item={item} />
            ))}
          </div>
        )}
      </main>
      <footer className="w-full py-6 mt-12 border-t border-border">
        <p className="text-center text-sm text-muted-foreground font-body">
          &copy; {new Date().getFullYear()} Rasika. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
