
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays } from 'lucide-react';
import type { ReviewEntry } from '@/lib/firebase/reviewService';
import { StarRatingDisplay } from '@/components/ui/star-rating-display'; 

interface MyReviewCardProps {
  review: ReviewEntry;
}

const formatDate = (dateValue: Date | undefined): string => {
  if (!dateValue) return 'Date not available';
  if (dateValue instanceof Date) {
    return dateValue.toLocaleString();
  }
  try {
    return new Date(dateValue as any).toLocaleString();
  } catch (e) {
    return 'Invalid date';
  }
};

export function MyReviewCard({ review }: MyReviewCardProps) {
  const reviewDate = formatDate(review.createdAt as Date);

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex justify-between items-start flex-wrap gap-2">
          <CardTitle className="font-headline text-xl text-primary">{review.contentTitle}</CardTitle>
          <div className="flex items-center gap-2 shrink-0">
            <StarRatingDisplay rating={review.rating} maxRating={10} totalStars={5} size={20} />
            <span className="text-sm text-muted-foreground">({(review.rating / 2).toFixed(1)}/5)</span>
          </div>
        </div>
        <CardDescription className="flex items-center text-sm text-muted-foreground mt-1">
          <CalendarDays className="h-4 w-4 mr-2 opacity-70" />
          Reviewed on: {reviewDate}
        </CardDescription>
      </CardHeader>
      {review.reviewText && review.reviewText.trim() !== '' && (
        <CardContent>
          <p className="text-foreground/80 whitespace-pre-wrap font-body leading-relaxed">{review.reviewText}</p>
        </CardContent>
      )}
      {!review.reviewText || review.reviewText.trim() === '' && (
         <CardContent>
          <p className="text-muted-foreground italic">No review text provided.</p>
        </CardContent>
      )}
    </Card>
  );
}
