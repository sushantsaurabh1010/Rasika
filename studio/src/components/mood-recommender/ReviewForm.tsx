
'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/firebase/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addContentReview } from '@/lib/firebase/reviewServerActions';
import type { ContentReviewInput } from '@/lib/firebase/reviewServerActions';
import { InteractiveStarRating } from '@/components/ui/interactive-star-rating'; 

interface ReviewFormProps {
  contentTitle: string;
  onReviewSubmitted?: () => void; 
}

export function ReviewForm({ contentTitle, onReviewSubmitted }: ReviewFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [rating, setRating] = useState<number | undefined>(undefined);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: 'Authentication Error', description: 'You must be logged in to submit a review.', variant: 'destructive' });
      return;
    }
    if (rating === undefined) {
      toast({ title: 'Missing Rating', description: 'Please select a rating.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    setSubmissionSuccess(false);

    try {
      const idToken = await user.getIdToken();
      const reviewData: ContentReviewInput = {
        contentTitle,
        rating, 
        reviewText,
      };
      
      const result = await addContentReview(idToken, user.uid, reviewData);

      if (result.success) {
        toast({ title: 'Review Submitted!', description: result.message });
        setSubmissionSuccess(true);
        if (onReviewSubmitted) {
          onReviewSubmitted();
        }
      } else {
        toast({ title: 'Submission Failed', description: result.message, variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({ title: 'Error', description: 'An unexpected error occurred while submitting your review.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submissionSuccess) {
    return (
      <div className="p-4 my-4 border-t border-border bg-accent/10 rounded-md text-center">
        <p className="text-accent-foreground font-semibold">Thank you for your review!</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 my-6 pt-6 border-t border-border">
      <h4 className="text-lg font-semibold text-foreground/90">Rate and Review &quot;{contentTitle}&quot;</h4>
      
      <div>
        <Label className="block mb-2 font-body text-foreground/80">
          Your Rating ({rating !== undefined ? (rating / 2).toFixed(1) : 'Not set'} / 5.0):
        </Label>
        <InteractiveStarRating
          value={rating}
          onChange={setRating}
          maxRatingValue={10} 
          totalVisualStars={5} 
          size={28} 
        />
      </div>

      <div>
        <Label htmlFor="reviewText" className="block mb-2 font-body text-foreground/80">Your Review (Optional):</Label>
        <Textarea
          id="reviewText"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Share your thoughts..."
          rows={3}
          className="bg-card"
        />
      </div>

      <Button type="submit" disabled={isSubmitting || rating === undefined} className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Review'
        )}
      </Button>
    </form>
  );
}
