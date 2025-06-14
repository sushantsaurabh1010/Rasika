
'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { RecommendationItem } from '@/ai/flows/generate-recommendation';
import { Palette, Star } from 'lucide-react'; // Default icon, Added Star
import { CONTENT_TYPES } from '@/lib/constants';

interface RecommendationCardProps {
  recommendation: RecommendationItem | null;
  isLoading: boolean;
  index: number; // Index for linking to detail page
}

export function RecommendationCard({ recommendation, isLoading, index }: RecommendationCardProps) {
  const title = recommendation?.title ?? 'Loading...';
  const summary = recommendation?.summary ?? 'Please wait while we fetch details.';
  const contentType = recommendation?.contentType;
  const releaseYear = recommendation?.releaseYear;
  const rating = recommendation?.rating;
  const ratingSource = recommendation?.ratingSource;

  const getContentTypeDisplayData = (type: string | undefined) => {
    const foundType = CONTENT_TYPES.find(ct => ct.id === type);
    return {
        icon: foundType?.icon || Palette,
        label: foundType?.label || type || "Content"
    };
  };

  const contentTypeDisplay = getContentTypeDisplayData(contentType);
  const ContentTypeIcon = contentTypeDisplay.icon;

  if (isLoading || !recommendation) {
    return (
      <Card className="w-full max-w-md animate-pulse shadow-xl rounded-lg overflow-hidden flex flex-col h-full">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-grow pr-2">
              <Skeleton className="h-7 w-3/4 mb-1" /> {/* Title */}
              <Skeleton className="h-4 w-1/4" /> {/* Release Year */}
            </div>
            <Skeleton className="h-6 w-6 rounded-full flex-shrink-0" /> {/* Content Type Icon */}
          </div>
          <Skeleton className="h-5 w-1/3 mt-2" /> {/* Rating skeleton */}
        </CardHeader>
        <CardContent className="space-y-4 flex-grow">
          <Skeleton className="h-4 w-full mt-2" />
          <Skeleton className="h-4 w-5/6 mt-2" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Link
      href={`/recommendations/${index}`}
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg h-full group"
    >
      <Card className="w-full max-w-md animate-fade-in duration-500 shadow-xl rounded-lg overflow-hidden flex flex-col h-full hover:shadow-2xl transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-2xl text-primary group-hover:text-primary/80 transition-colors">
              {title}
              {releaseYear && <span className="text-lg text-muted-foreground font-normal ml-2">({releaseYear})</span>}
            </CardTitle>
            {contentType && (
              <ContentTypeIcon className="h-6 w-6 text-muted-foreground flex-shrink-0" aria-label={contentTypeDisplay.label} />
            )}
          </div>
          {rating && (
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <Star className="h-4 w-4 mr-1.5 text-yellow-400 fill-yellow-400" />
              <span>{rating} {ratingSource && <span className="text-xs">({ratingSource})</span>}</span>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4 flex-grow flex flex-col">
          <CardDescription className="font-body text-base text-foreground/80 leading-relaxed line-clamp-3 flex-grow">
            {summary}
          </CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
}

