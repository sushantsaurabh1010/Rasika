
'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingDisplayProps {
  rating: number; // Expected to be on a 0-10 scale
  totalStars?: number; // Number of stars to display (e.g., 5)
  maxRating?: number; // The maximum value the input rating can be (e.g., 10)
  size?: number; // Size of the stars in pixels
  className?: string;
}

export function StarRatingDisplay({
  rating,
  totalStars = 5,
  maxRating = 10,
  size = 20, // Default size for stars (h-5 w-5 is 20px)
  className,
}: StarRatingDisplayProps) {
  const scaledRating = (rating / maxRating) * totalStars;

  return (
    <div className={cn("flex items-center", className)} aria-label={`Rating: ${rating} out of ${maxRating}`}>
      {[...Array(totalStars)].map((_, index) => {
        const starValue = index + 1;
        let fillPercentage = '0%';
        if (scaledRating >= starValue) {
          fillPercentage = '100%';
        } else if (scaledRating > index && scaledRating < starValue) {
          // Calculate partial fill for half-star effect or finer granularity
          // For a simple half-star, if scaledRating is (index + 0.5) or more, fill 50%
          if (scaledRating >= index + 0.4 && scaledRating <= index + 0.6) { // A bit of tolerance for 0.5
             fillPercentage = '50%';
          } else if (scaledRating >= index + 0.5) { // More general partial fill
            fillPercentage = '50%'; // Simplified to 50% for typical half-star
          }
          // More precise fill:
          // fillPercentage = `${((scaledRating - index) * 100).toFixed(0)}%`;
        }

        return (
          <div key={index} className="relative" style={{ width: size, height: size }}>
            {/* Background (empty) star */}
            <Star
              className="absolute text-muted-foreground/50"
              style={{ width: size, height: size }}
              strokeWidth={1.5}
            />
            {/* Filled portion of the star */}
            <div
              className="absolute top-0 left-0 h-full overflow-hidden"
              style={{ width: fillPercentage }}
            >
              <Star
                className="text-primary fill-primary"
                style={{ width: size, height: size, flexShrink: 0 }}
                strokeWidth={1.5}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
