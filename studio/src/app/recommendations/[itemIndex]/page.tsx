
'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRecommendations } from '@/contexts/RecommendationContext';
import { Button } from '@/components/ui/button';
import { ReviewForm } from '@/components/mood-recommender/ReviewForm';
import { Header } from '@/components/layout/Header';
import { Star, PlayCircle, User, Video as VideoIcon, Users, BookOpen as BookIcon, Music2 as MusicIcon, Mic2 as MicIcon, Palette, ChevronLeft, AlertTriangle, MessageSquare, Loader2, CalendarDays, CheckCircle2, BookCheck, Headphones as HeadphonesIcon, CheckSquare as DefaultCheckIcon } from 'lucide-react';
import { useEffect, useState, use as ReactUse } from 'react';
import type { RecommendationItem } from '@/ai/flows/generate-recommendation';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/firebase/AuthContext';
import { addViewedRecommendationToHistory } from '@/lib/firebase/historyServerActions';
import { useToast } from '@/hooks/use-toast';
import { CONTENT_TYPES } from '@/lib/constants';
import { getReviewsForContent, type ReviewEntry } from '@/lib/firebase/reviewService';
import { PublicReviewCard } from '@/components/reviews/PublicReviewCard';

interface RecommendationDetailPageProps {
  params: { itemIndex: string } | Promise<{ itemIndex: string }>;
}

const getContentTypeDisplayData = (type: string | undefined) => {
  const foundType = CONTENT_TYPES.find(ct => ct.id === type);
  return {
    icon: foundType?.icon || Palette,
    label: foundType?.label || type || "Content"
  };
};


export default function RecommendationDetailPage({ params: paramsProp }: RecommendationDetailPageProps) {
  console.log('[DetailPage] Component RENDER START');
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  const actualParams = paramsProp instanceof Promise ? ReactUse(paramsProp) : paramsProp;
  const { recommendations, currentHistoryDocId } = useRecommendations();

  const [item, setItem] = useState<RecommendationItem | null | undefined>(undefined);
  const [hasRecordedView, setHasRecordedView] = useState(false);
  const [publicReviews, setPublicReviews] = useState<ReviewEntry[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [reviewFetchError, setReviewFetchError] = useState<string | null>(null);
  const [isMarking, setIsMarking] = useState(false);

  const itemIndexStr = Array.isArray(actualParams.itemIndex) ? actualParams.itemIndex[0] : actualParams.itemIndex;
  const itemIndex = typeof itemIndexStr === 'string' ? parseInt(itemIndexStr, 10) : -1;
  console.log(`[DetailPage] Parsed itemIndex: ${itemIndex}`);

  useEffect(() => {
    console.log('[DetailPage] Item Setup useEffect. Recommendations:', recommendations ? `Array[${recommendations.length}]` : recommendations, `itemIndex: ${itemIndex}`);
    setPublicReviews([]);
    setIsLoadingReviews(false);
    setReviewFetchError(null);
    setHasRecordedView(false); // Reset view status when item changes, user must click again

    if (recommendations === null) {
      setItem(undefined);
    } else if (recommendations && itemIndex >= 0 && itemIndex < recommendations.length) {
      const currentItem = recommendations[itemIndex];
      setItem(currentItem);
      if (currentItem?.title) {
        setIsLoadingReviews(true);
        getReviewsForContent(currentItem.title)
          .then(reviews => {
            setPublicReviews(reviews);
            if (reviews.length === 0) {
              console.log(`[DetailPage] No public reviews found for "${currentItem.title}"`);
            }
          })
          .catch(err => {
            console.error(`[DetailPage] Error fetching public reviews for "${currentItem.title}":`, err);
            setReviewFetchError(err.message || "Failed to load reviews. Please check permissions or try again.");
          })
          .finally(() => setIsLoadingReviews(false));
      }
    } else {
      setItem(null);
    }
  }, [recommendations, itemIndex]);


  const handleReviewSubmitted = () => {
    if (item?.title) {
      setIsLoadingReviews(true);
      getReviewsForContent(item.title)
        .then(setPublicReviews)
        .catch(err => {
          console.error(`[DetailPage] Error re-fetching public reviews for "${item.title}":`, err);
          setReviewFetchError(err.message || "Failed to reload reviews.");
        })
        .finally(() => setIsLoadingReviews(false));
    }
  };

  const getActionDetails = (contentTypeRec: string | undefined) => {
    switch (contentTypeRec) {
      case 'movie':
      case 'tvShow':
      case 'anime':
        return { label: 'Watched', Icon: CheckCircle2 };
      case 'book':
        return { label: 'Read', Icon: BookCheck };
      case 'music':
      case 'podcast':
        return { label: 'Listened', Icon: HeadphonesIcon };
      default:
        return { label: 'Completed', Icon: DefaultCheckIcon };
    }
  };

  const handleMarkAsCompleted = async () => {
    if (!user || !item || !currentHistoryDocId || hasRecordedView || isMarking) {
        console.log('[DetailPage] handleMarkAsCompleted: Pre-flight check failed.', {user:!!user, item:!!item, currentHistoryDocId, hasRecordedView, isMarking});
        return;
    }

    setIsMarking(true);
    try {
      const idToken = await user.getIdToken();
      const sanitizedItemForHistory: RecommendationItem = {
            title: item.title ?? 'Untitled',
            contentType: item.contentType ?? 'unknown',
            summary: item.summary ?? 'No summary.',
            releaseYear: item.releaseYear === undefined ? null : item.releaseYear,
            rating: item.rating === undefined ? null : item.rating,
            ratingSource: item.ratingSource === undefined ? null : item.ratingSource,
            streamingInfo: item.streamingInfo === undefined ? null : item.streamingInfo,
            director: item.director === undefined ? null : item.director,
            cast: item.cast === undefined ? null : item.cast,
            author: item.author === undefined ? null : item.author,
            artist: item.artist === undefined ? null : item.artist,
            creatorOrHost: item.creatorOrHost === undefined ? null : item.creatorOrHost,
            keyCreatorForSimilar: item.keyCreatorForSimilar === undefined ? null : item.keyCreatorForSimilar,
      };
      const result = await addViewedRecommendationToHistory(idToken, user.uid, currentHistoryDocId, sanitizedItemForHistory);
      if (result.success) {
        setHasRecordedView(true);
        toast({ title: "Seen", description: `"${item.title}" marked as viewed in your history.`, duration: 3000 });
      } else {
        toast({
          title: "Marking Error",
          description: result.message || `Could not mark "${item.title}" as completed.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('[DetailPage] Error in handleMarkAsCompleted:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while marking as completed.",
        variant: "destructive",
      });
    } finally {
      setIsMarking(false);
    }
  };


  if (item === undefined) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-grow w-full max-w-3xl">
          <div className="mb-6">
            <Skeleton className="h-9 w-48 rounded" />
          </div>
          <div className="bg-card p-6 sm:p-8 rounded-lg shadow-xl">
            <div className="flex items-center mb-2">
              <Skeleton className="h-7 w-7 mr-3 rounded-full" />
              <Skeleton className="h-10 w-3/4 rounded" />
            </div>
            <Skeleton className="h-6 w-1/4 mb-4 rounded" />
            <Skeleton className="h-24 w-full mb-6 rounded" />
            <div className="space-y-4">
              <Skeleton className="h-5 w-full rounded" />
              <Skeleton className="h-5 w-5/6 rounded" />
              <Skeleton className="h-5 w-full rounded" />
              <Skeleton className="h-5 w-4/6 rounded" />
            </div>
            <div className="my-6">
              <Skeleton className="h-12 w-full sm:w-48 rounded-lg" />
            </div>
            <div className="mt-8 border-t pt-6">
               <Skeleton className="h-8 w-1/3 mb-4 rounded" />
               <Skeleton className="h-20 w-full mb-4 rounded" />
               <Skeleton className="h-10 w-28 rounded" />
            </div>
             <div className="mt-8 border-t pt-6">
               <Skeleton className="h-8 w-1/2 mb-4 rounded" />
               <Skeleton className="h-24 w-full mb-2 rounded" />
               <Skeleton className="h-24 w-full rounded" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (item === null) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-grow w-full max-w-3xl text-center">
          <div className="bg-destructive/10 p-8 rounded-lg shadow-lg border border-destructive">
            <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-semibold text-destructive mb-2">Recommendation Not Found</h1>
            <p className="text-muted-foreground mb-6">The recommendation you are looking for is not available or the link may be invalid.</p>
            <Button onClick={() => router.push('/')} variant="outline">
              <ChevronLeft className="mr-2 h-4 w-4" /> Back to Home
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const {
    title, contentType, summary, rating, ratingSource, streamingInfo,
    director, cast, author, artist, creatorOrHost, releaseYear
  } = item;

  const contentTypeDisplay = getContentTypeDisplayData(contentType);
  const HeaderIcon = contentTypeDisplay.icon;
  const actionDetails = getActionDetails(contentType);
  const markButtonText = hasRecordedView ? `Marked as ${actionDetails.label}` : `Mark as ${actionDetails.label}`;
  const MarkActionIconComponent = actionDetails.Icon;

  const renderDetailItem = (IconComponent: React.ElementType, label: string, value: string | number | null | undefined) => {
    if (value === null || value === undefined || String(value).trim() === '') return null;
    const displayValue = String(value);
    return (
      <div className="flex items-start space-x-3 py-2 border-b border-border/50 last:border-b-0">
        <IconComponent className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-foreground/90">{label}</p>
          <p className="text-sm text-foreground/80">{displayValue}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/30 selection:text-primary-foreground">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-grow w-full max-w-3xl">
        <Button onClick={() => router.back()} variant="outline" size="sm" className="mb-6 group">
          <ChevronLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Recommendations
        </Button>

        <article className="bg-card p-6 sm:p-8 rounded-lg shadow-xl">
          <header className="mb-2">
            <div className="flex items-start sm:items-center flex-col sm:flex-row">
                <HeaderIcon className="h-7 w-7 mr-3 text-primary/80" />
                <h1 className="text-3xl sm:text-4xl text-primary leading-tight">{title}</h1>
            </div>
            {releaseYear && (
                <p className="text-md text-muted-foreground ml-10 sm:ml-10 -mt-1 sm:mt-0">({releaseYear})</p>
            )}
          </header>

          {summary && <p className="font-body text-foreground/80 mb-6 text-lg leading-relaxed">{summary}</p>}

          <section className="space-y-3 mb-8">
            {releaseYear && renderDetailItem(CalendarDays, "Release Year", releaseYear)}
            {rating && renderDetailItem(Star, ratingSource || "Rating", rating)}
            {streamingInfo && (contentType === 'movie' || contentType === 'tvShow' || contentType ==='anime') && renderDetailItem(PlayCircle, "Where to Watch", streamingInfo)}
            {director && (contentType === 'movie' || contentType === 'tvShow' || contentType === 'anime') && renderDetailItem(User, "Director(s)/Studio", director)}
            {cast && (contentType === 'movie' || contentType === 'tvShow' || contentType === 'anime') && renderDetailItem(Users, "Main Cast/VAs", cast)}
            {author && (contentType === 'book' || (contentType === 'anime' && author)) && renderDetailItem(BookIcon, "Author(s)", author)}
            {artist && contentType === 'music' && renderDetailItem(MusicIcon, "Artist(s)", artist)}
            {creatorOrHost && contentType === 'podcast' && renderDetailItem(MicIcon, "Creator/Host(s)", creatorOrHost)}
          </section>

          {user && item && (
            <div className="my-8 flex justify-center">
              <Button
                onClick={handleMarkAsCompleted}
                disabled={!user || !item || !currentHistoryDocId || hasRecordedView || isMarking}
                variant={hasRecordedView ? "secondary" : "default"}
                size="lg"
                className="w-full sm:w-auto py-3 text-base"
              >
                {isMarking ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <MarkActionIconComponent className="mr-2 h-5 w-5" />
                )}
                {isMarking ? `Marking...` : markButtonText}
              </Button>
            </div>
          )}

          <ReviewForm contentTitle={title ?? 'This Content'} onReviewSubmitted={handleReviewSubmitted} />

          <section className="mt-10 pt-6 border-t border-border">
            <h3 className="text-2xl font-headline text-foreground/90 mb-6 flex items-center">
              <MessageSquare className="mr-3 h-6 w-6 text-primary" />
              Community Reviews
            </h3>
            {isLoadingReviews && (
              <div className="flex justify-center items-center py-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-3 text-muted-foreground">Loading reviews...</p>
              </div>
            )}
            {reviewFetchError && (
              <div className="text-center py-6 px-4 bg-destructive/10 rounded-md border border-destructive">
                <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-3" />
                <p className="text-destructive font-semibold">Could not load reviews</p>
                <p className="text-sm text-destructive/80 mt-1">{reviewFetchError}</p>
                <p className="text-xs text-muted-foreground mt-3">
                  This might be a temporary issue or a permissions problem. If it persists, ensure Firestore rules allow reading the 'contentReviews' collection and that the necessary index is in place.
                </p>
              </div>
            )}
            {!isLoadingReviews && !reviewFetchError && publicReviews.length === 0 && (
              <p className="text-muted-foreground text-center py-4">Be the first to review &quot;{title}&quot;!</p>
            )}
            {!isLoadingReviews && !reviewFetchError && publicReviews.length > 0 && (
              <div className="space-y-6">
                {publicReviews.map(review => (
                  <PublicReviewCard key={review.id} review={review} />
                ))}
              </div>
            )}
          </section>
        </article>
      </main>
       <footer className="w-full py-6 mt-12 border-t border-border">
        <p className="text-center text-sm text-muted-foreground font-body">
          &copy; {new Date().getFullYear()} Rasika. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
