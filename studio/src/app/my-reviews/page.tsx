
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/firebase/AuthContext';
import { getUserReviews, type ReviewEntry } from '@/lib/firebase/reviewService';
import { Header } from '@/components/layout/Header';
import { MyReviewCard } from '@/components/reviews/MyReviewCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronLeft, MessageSquareText, AlertTriangle, Inbox } from 'lucide-react';

export default function MyReviewsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState<ReviewEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const fetchReviews = () => {
     if (user) {
      setIsLoading(true);
      setError(null);
      console.log(`[MyReviewsPage] Fetching reviews for user: ${user.uid}`);
      getUserReviews(user.uid)
        .then(data => {
          console.log(`[MyReviewsPage] Received ${data.length} reviews.`);
          setReviews(data);
        })
        .catch(err => {
          console.error("[MyReviewsPage] Error fetching reviews:", err);
          let detailedErrorMessage = err.message || "Failed to load reviews. Please check your permissions or try again later.";
          
          const indexLinkRegex = /https:\/\/console\.firebase\.google\.com\/.*?firestore\/indexes\?create_composite=[a-zA-Z0-9%_-]+/;
          const hasIndexLink = indexLinkRegex.test(detailedErrorMessage);

          if (hasIndexLink) {
            setError(detailedErrorMessage + "\n\nThis query requires a Firestore index. Please follow the link provided by Firebase (usually in your browser's developer console or the error message above) to create it. The typical fields for fetching your reviews are 'userId' (Ascending) and 'createdAt' (Descending) on the 'contentReviews' collection.");
          } else if (detailedErrorMessage.toLowerCase().includes('permission-denied') || detailedErrorMessage.toLowerCase().includes('insufficient permissions')) {
            setError(detailedErrorMessage + "\n\nThis usually means your Firestore security rules for the 'contentReviews' collection are not correctly configured to allow you to read your own reviews. Ensure your rules look similar to: allow read: if request.auth != null && request.auth.uid == resource.data.userId; for the /contentReviews/{reviewId} path.");
          } else {
            setError(detailedErrorMessage);
          }
        })
        .finally(() => setIsLoading(false));
    } else {
      console.log("[MyReviewsPage] No user, cannot fetch reviews.");
      setIsLoading(false); 
    }
  };

  useEffect(() => {
    // Fetch reviews only if the user is authenticated and available
    if (!authLoading && user) {
        fetchReviews();
    } else if (!authLoading && !user) {
        // If not authenticated and auth check is done, don't keep loading indefinitely
        setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]); // Rerun when user or authLoading state changes

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-grow w-full max-w-3xl flex flex-col items-center justify-center">
          <p className="text-xl mb-4 text-muted-foreground">Authenticating user...</p>
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-8 w-1/2 mb-8" />
          <div className="space-y-6 w-full">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
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
          <Button variant="outline" size="sm" asChild className="mb-0 md:mb-0">
            <Link href="/profile" className="flex items-center">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Profile
            </Link>
          </Button>
          <h2 className="text-3xl font-headline text-center text-foreground/90 flex items-center">
            <MessageSquareText className="mr-3 h-8 w-8 text-primary" />
            My Content Reviews
          </h2>
          <div className="w-36 md:w-44"></div> {/* Spacer to balance title */}
        </div>

        {isLoading && (
          <div className="space-y-6">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        )}

        {error && (
          <div className="text-center py-10 bg-destructive/10 p-6 rounded-lg border-2 border-destructive shadow-lg">
            <div className="flex justify-center items-center mb-4">
                <AlertTriangle className="h-12 w-12 text-destructive" />
                <p className="text-destructive text-xl font-semibold ml-3">Error Loading Reviews</p>
            </div>
            <p className="text-destructive/90 mt-2 text-md text-left whitespace-pre-wrap">{error}</p>
            {/* The specific guidance is now part of the 'error' state itself based on error content */}
            <Button onClick={fetchReviews} className="mt-6">
              Try Again
            </Button>
          </div>
        )}

        {!isLoading && !error && reviews.length === 0 && (
          <div className="text-center py-16">
            <Inbox className="h-20 w-20 text-muted-foreground mx-auto mb-6 opacity-50" />
            <p className="text-muted-foreground text-xl mb-2">No Reviews Yet</p>
            <p className="text-muted-foreground">You haven&apos;t submitted any reviews. Once you do, they&apos;ll appear here!</p>
             <Button variant="link" asChild className="mt-4 text-primary">
                <Link href="/">Find Content to Review</Link>
            </Button>
          </div>
        )}

        {!isLoading && !error && reviews.length > 0 && (
          <div className="space-y-6">
            {reviews.map((review) => (
              <MyReviewCard key={review.id} review={review} />
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
