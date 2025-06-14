
'use client';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User as UserIcon, CalendarDays } from 'lucide-react'; 
import type { ReviewEntry } from '@/lib/firebase/reviewService';
import { StarRatingDisplay } from '@/components/ui/star-rating-display';

interface PublicReviewCardProps {
  review: ReviewEntry;
}

const formatDate = (dateValue: Date | undefined): string => {
  if (!dateValue) return 'Date not available';
  if (dateValue instanceof Date) {
    return dateValue.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  }
  try {
    return new Date(dateValue as any).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  } catch (e) {
    return 'Invalid date';
  }
};

export function PublicReviewCard({ review }: PublicReviewCardProps) {
  const reviewDate = formatDate(review.createdAt as Date);
  const displayName = review.userDisplayName || 'A User'; 

  return (
    <Card className="shadow-sm border border-border/70">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            {review.userPhotoURL ? (
              <AvatarImage src={review.userPhotoURL} alt={displayName} />
            ) : null}
            <AvatarFallback>
              <UserIcon className="h-5 w-5 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-md font-semibold text-foreground/90">{displayName}</CardTitle>
            <div className="flex items-center gap-1.5">
               <StarRatingDisplay rating={review.rating} maxRating={10} totalStars={5} size={16} />
               <span className="text-xs text-muted-foreground">((${(review.rating / 2).toFixed(1)}/5))</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {review.reviewText && review.reviewText.trim() !== '' && (
          <p className="text-sm text-foreground/80 whitespace-pre-wrap font-body leading-relaxed mb-2">
            {review.reviewText}
          </p>
        )}
        <div className="flex items-center text-xs text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5 mr-1.5 opacity-70" />
          <span>{reviewDate}</span>
        </div>
      </CardContent>
    </Card>
  );
}
