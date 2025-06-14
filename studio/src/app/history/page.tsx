
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/AuthContext';
import { getUserHistory, type HistoryEntry } from '@/lib/firebase/historyService'; 
import { Header } from '@/components/layout/Header';
import { HistoryCard } from '@/components/history/HistoryCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft, AlertTriangle, CalendarDays, SmileIcon, ListChecks, TagsIcon, Film, Tv2, BookOpenText, Music2, Mic2, Aperture, Palette } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from '@/components/ui/badge';
import { MOODS, CONTENT_TYPES } from '@/lib/constants';
import type { Timestamp } from 'firebase/firestore';
import type { RecommendationItem } from '@/ai/flows/generate-recommendation';

const formatDateShort = (dateValue: Timestamp | Date | undefined): string => {
  if (!dateValue) return 'N/A';
  const date = (dateValue as Timestamp).toDate ? (dateValue as Timestamp).toDate() : new Date(dateValue as any);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const getMoodLabel = (moodId: string) => {
  const mood = MOODS.find(m => m.id === moodId);
  return mood?.label || moodId;
};

const getContentTypeIcon = (typeId: string | undefined) => {
  if (!typeId) return Palette;
  const contentType = CONTENT_TYPES.find(ct => ct.id === typeId);
  return contentType?.icon || Palette;
}

const formatViewedTitles = (items: RecommendationItem[] | undefined): string => {
    if (!items || items.length === 0) return "No items viewed from this session.";
    return items.map(item => item.title).slice(0, 3).join(', ') + (items.length > 3 ? '...' : '');
}

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [historyItems, setHistoryItems] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const fetchHistory = () => {
    if (user) {
      setIsLoading(true);
      setError(null);
      getUserHistory(user.uid, 50) // Fetch more to allow for filtering
        .then((data) => {
          // Filter to only include entries with viewedRecommendations
          const filteredData = data.filter(entry => entry.viewedRecommendations && entry.viewedRecommendations.length > 0);
          setHistoryItems(filteredData);
        })
        .catch((err) => {
          const errorMessage = (err instanceof Error) ? err.message : String(err);
          const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
          const firestoreRulesLink = projectId
            ? `https://console.firebase.google.com/project/${projectId}/firestore/rules`
            : 'your Firebase Console (Project Settings -> Firestore -> Rules tab)';
          const firestoreDataLink = projectId
            ? `https://console.firebase.google.com/project/${projectId}/firestore/data/userHistory` 
            : 'your Firebase Console (Project Settings -> Firestore -> Data tab, userHistory collection)';

          setError(
            'Critical Permission Error: Could not load history. This usually means your Firestore security rules are not correctly configured, OR the `userId` field in your Firestore documents does not match the logged-in user\'s UID. ' +
            'Please VERY CAREFULLY verify the following in your Firebase Console:\n\n' +
            `1. Firestore Security Rules (Rules tab - direct link if project ID configured: ${firestoreRulesLink}):\n` +
            '   - Are they PUBLISHED recently? (Changes can take a minute to apply.)\n' +
            '   - Is your collection name EXACTLY `userHistory` in the rule? (e.g., `match /userHistory/{docId}`)\n' +
            '   - Does the `read` rule for this collection look like this: `allow read: if request.auth != null && request.auth.uid == resource.data.userId;` ?\n\n' +
            `2. Data Integrity in Firestore (Data tab, userHistory collection - direct link if project ID configured: ${firestoreDataLink}):\n` +
            `   - Does each document meant for the current user have a 'userId' field?\n` +
            `   - Does the value of this 'userId' field EXACTLY match your logged-in UID ('${user?.uid || "UID not available"}' according to the app)? (This is case-sensitive!)\n\n` +
            'Details from Firestore: ' + errorMessage
          );
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false); 
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchHistory();
    } else if (!authLoading && !user) {
      setIsLoading(false); 
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-grow w-full max-w-3xl flex flex-col items-center justify-center">
          <p className="text-xl mb-4">Authenticating...</p>
          <Skeleton className="h-10 w-1/2 mb-4" />
          <Skeleton className="h-8 w-3/4 mb-8" />
          <div className="space-y-6 w-full">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center selection:bg-primary/30 selection:text-primary-foreground">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-grow w-full max-w-3xl">
           <div className="flex items-center mb-8">
             <Button variant="outline" size="sm" asChild className="mb-0 md:mb-0">
                  <Link href="/" className="flex items-center">
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Back to Home
                  </Link>
              </Button>
           </div>
          <div className="text-center py-10 bg-destructive/20 p-6 rounded-lg border-2 border-destructive shadow-lg">
            <div className="flex justify-center items-center mb-4">
              <AlertTriangle className="h-12 w-12 text-destructive" />
              <p className="text-destructive text-2xl font-semibold ml-3">Action Required: Permissions Issue</p>
            </div>
            <p className="text-destructive/90 mt-2 text-md text-left whitespace-pre-wrap">{error}</p>
            
            <p className="text-muted-foreground mt-6 text-sm font-semibold">
              Troubleshooting Steps:
            </p>
            <ol className="list-decimal list-inside text-left mt-2 mx-auto max-w-xl text-muted-foreground text-sm space-y-2">
                <li><strong>Check Firestore Rules:</strong> Go to your Firebase Console: Firestore Database → Rules tab. Ensure your rules are PUBLISHED and correctly allow users to read their own history. (See example below). Pay CAREFUL attention to the collection name in your rule (`userHistory`).</li>
                <li><strong>Verify `userId` in Data:</strong> In Firestore Database → Data tab, navigate to your `userHistory` collection. Inspect the documents. Ensure the `userId` field in each document EXACTLY matches the UID of the authenticated user who should be able to see that entry.</li>
                <li><strong>Wait a Moment:</strong> Sometimes, rule changes or new data can take a minute or two to fully propagate.</li>
            </ol>
            
            <details className="mt-4 text-xs text-muted-foreground/80 text-left max-w-lg mx-auto">
              <summary className="cursor-pointer hover:underline font-medium">Example Firestore Rule for `userHistory` (Read Access)</summary>
              <pre className="mt-1 p-3 bg-muted/50 rounded-md text-left overflow-x-auto text-xs leading-relaxed">
                {`
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Ensure "userHistory" is the exact name of your collection
    match /userHistory/{historyId} { 
      // Allow read if user is authenticated AND
      // their UID matches the userId in the existing document.
      allow read: if request.auth != null && 
                     request.auth.uid == resource.data.userId;
      
      // ... other rules (e.g., for create)
    }
  }
}
                `}
              </pre>
            </details>
            <Button onClick={fetchHistory} className="mt-8">
              Try Again
            </Button>
          </div>
        </main>
        <footer className="w-full py-6 mt-12 border-t border-border">
          <p className="text-center text-sm text-muted-foreground font-body">
            &copy; {new Date().getFullYear()} Rasika. All rights reserved.
          </p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center selection:bg-primary/30 selection:text-primary-foreground">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-grow w-full max-w-3xl">
        <div className="flex items-center justify-between mb-8">
            <Button variant="outline" size="sm" asChild className="mb-0 md:mb-0">
                <Link href="/" className="flex items-center">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to Home
                </Link>
            </Button>
            <h2 className="text-3xl font-headline text-center text-foreground/90">
                Your Recommendation History
            </h2>
            <div className="w-28"></div> {/* Spacer to balance the title */}
        </div>

        {isLoading && (
          <>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={`history-skeleton-${index}`} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          </>
        )}

        {!isLoading && historyItems.length === 0 && !error && (
          <>
            <div className="text-center py-10">
              <p className="text-muted-foreground text-lg">You have no recommendation history with viewed items yet.</p>
              <p className="text-muted-foreground">Go to the <Link href="/" className="text-primary hover:underline">home page</Link> to get some recommendations and mark them as viewed!</p>
              <Button onClick={fetchHistory} className="mt-4" variant="outline">
                Refresh History
            </Button>
            </div>
          </>
        )}

        {!isLoading && historyItems.length > 0 && !error && (
          <Accordion type="single" collapsible className="w-full space-y-2">
            {historyItems.map((entry, index) => (
              <AccordionItem value={`item-${entry.id || index}`} key={entry.id || index} className="border border-border rounded-lg shadow-sm bg-card overflow-hidden">
                <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-left w-full">
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <CalendarDays className="h-5 w-5 text-primary" />
                      <span className="font-medium text-foreground/90 text-sm">{formatDateShort(entry.createdAt)}</span>
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-1.5 mb-1 sm:mb-0">
                        <SmileIcon className="h-4 w-4 text-primary/80"/>
                        <span className="font-semibold text-sm text-foreground/80">{getMoodLabel(entry.mood)}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                        <span className="font-medium mr-1">Viewed:</span>
                        {entry.viewedRecommendations && entry.viewedRecommendations.length > 0 ? (
                           entry.viewedRecommendations.slice(0, 2).map((rec, recIdx) => {
                            const Icon = getContentTypeIcon(rec.contentType);
                            return (
                                <span key={recIdx} className="flex items-center">
                                    <Icon className="h-3.5 w-3.5 mr-1 opacity-70" />
                                    {rec.title}
                                    {recIdx < entry.viewedRecommendations!.slice(0, 2).length - 1 && ",\u00A0"} 
                                </span>
                            );
                           })
                        ) : (
                            <span>None</span>
                        )}
                        {entry.viewedRecommendations && entry.viewedRecommendations.length > 2 && (
                            <span className="text-xs text-muted-foreground ml-1">...and more</span>
                        )}
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-0 border-t border-border">
                  <HistoryCard entry={entry} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
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
