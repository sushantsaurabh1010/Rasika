
'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface InteractiveStarRatingProps {
  value: number | undefined; // Current rating (0.5-10)
  onChange: (value: number) => void;
  totalVisualStars?: number; // Number of stars to display (e.g., 5)
  maxRatingValue?: number; // The maximum value the input rating can be (e.g., 10)
  size?: number; // Size of the stars in pixels
  className?: string;
  disabled?: boolean;
}

export function InteractiveStarRating({
  value,
  onChange,
  totalVisualStars = 5,
  maxRatingValue = 10,
  size = 28, // Corresponds to h-7 w-7 for lucide icons
  className,
  disabled = false,
}: InteractiveStarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | undefined>(undefined);

  // How many points on the maxRatingValue scale each visual star represents
  const pointsPerVisualStar = maxRatingValue / totalVisualStars; // e.g., 10 / 5 = 2 points

  const handleStarPartClick = (starIndex: number, isSecondHalf: boolean) => {
    if (disabled) return;
    // starIndex is 0 to totalVisualStars-1
    // Value for the first half of a star: (starIndex * pointsPerVisualStar) + (pointsPerVisualStar / 2)
    // Value for the second half of a star (full star): (starIndex + 1) * pointsPerVisualStar
    const rating = isSecondHalf
      ? (starIndex + 1) * pointsPerVisualStar
      : starIndex * pointsPerVisualStar + pointsPerVisualStar / 2;
    onChange(rating);
  };

  const handleStarPartHover = (starIndex: number, isSecondHalf: boolean) => {
    if (disabled) return;
    const rating = isSecondHalf
      ? (starIndex + 1) * pointsPerVisualStar
      : starIndex * pointsPerVisualStar + pointsPerVisualStar / 2;
    setHoverValue(rating);
  };

  const handleMouseLeaveContainer = () => {
    if (disabled) return;
    setHoverValue(undefined);
  };

  const currentDisplayValue = hoverValue !== undefined ? hoverValue : value;

  return (
    <div
      className={cn(
        "flex items-center space-x-0.5", // Minimal space between full star elements
        className,
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
      )}
      onMouseLeave={handleMouseLeaveContainer}
      role="radiogroup"
      aria-label={`Rating input: ${value !== undefined ? value.toFixed(1) : 'Not set'} out of ${maxRatingValue.toFixed(1)}`}
    >
      {[...Array(totalVisualStars)].map((_, starIdx) => {
        // Thresholds for this specific star on the 0-10 scale
        const firstHalfThreshold = starIdx * pointsPerVisualStar + (pointsPerVisualStar / 2); // e.g., star 0: 1; star 1: 3
        const secondHalfThreshold = (starIdx + 1) * pointsPerVisualStar; // e.g., star 0: 2; star 1: 4

        let fillPercentage = '0%';
        if (currentDisplayValue !== undefined) {
          if (currentDisplayValue >= secondHalfThreshold) {
            fillPercentage = '100%';
          } else if (currentDisplayValue >= firstHalfThreshold) {
            fillPercentage = '50%';
          }
        }

        return (
          <div
            key={starIdx}
            className="relative" // Container for one visual star
            style={{ width: size, height: size }}
            role="radio" // Each star acts like a radio button conceptually
            aria-checked={value !== undefined && value >= firstHalfThreshold} // Simplistic checked state
            tabIndex={disabled ? -1 : 0}
            // Basic keyboard interaction could be added here if needed
            // For example, onFocus could set hoverValue, onKeyDown could change value
             onFocus={() => { if (!disabled) handleStarPartHover(starIdx, currentDisplayValue !== undefined && currentDisplayValue >= secondHalfThreshold);}} // Tentative focus behavior
             onBlur={handleMouseLeaveContainer} // Reset hover on blur
             onKeyDown={(e) => {
                if (disabled) return;
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    // Determine if to set half or full based on current hover or a default
                    // This part can be complex for keyboard only. For now, rely on prior hover or focus.
                    if (hoverValue !== undefined) {
                         onChange(hoverValue);
                    } else if (value !== undefined) {
                        // If no hover, maybe cycle current star's value or do nothing
                    }
                }
             }}
          >
            {/* Clickable regions for half-stars */}
            <div
              className="absolute left-0 top-0 h-full w-1/2 z-10" // Left half
              onClick={() => handleStarPartClick(starIdx, false)}
              onMouseEnter={() => handleStarPartHover(starIdx, false)}
              aria-label={`Rate ${firstHalfThreshold.toFixed(1)}`}
            />
            <div
              className="absolute right-0 top-0 h-full w-1/2 z-10" // Right half
              onClick={() => handleStarPartClick(starIdx, true)}
              onMouseEnter={() => handleStarPartHover(starIdx, true)}
              aria-label={`Rate ${secondHalfThreshold.toFixed(1)}`}
            />

            {/* Visual star appearance (empty background + conditional fill) */}
            <Star
              className="absolute text-muted-foreground/30" // Empty star background
              style={{ width: size, height: size }}
              strokeWidth={1.5}
            />
            <div
              className="absolute top-0 left-0 h-full overflow-hidden" // Fill container
              style={{ width: fillPercentage }}
            >
              <Star
                className={cn(
                  "fill-current flex-shrink-0", // Important: flex-shrink-0 for clipped image
                  disabled ? "text-muted-foreground/50" : "text-primary"
                )}
                style={{ width: size, height: size }}
                strokeWidth={1.5}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
