
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette, CalendarDays } from 'lucide-react'; // Default icon
import type { RecommendationItem } from '@/ai/flows/generate-recommendation';
import { CONTENT_TYPES } from '@/lib/constants';

interface WatchedItemCardProps {
  item: RecommendationItem;
}

const getContentTypeDisplayData = (type: string | undefined) => {
  const foundType = CONTENT_TYPES.find(ct => ct.id === type);
  return {
      icon: foundType?.icon || Palette,
      label: foundType?.label || type || "Content"
  };
};

export function WatchedItemCard({ item }: WatchedItemCardProps) {
  const { title, contentType, releaseYear } = item;
  const contentTypeDisplay = getContentTypeDisplayData(contentType);
  const ContentTypeIcon = contentTypeDisplay.icon;

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="font-headline text-xl text-primary leading-tight flex-grow">
            {title}
          </CardTitle>
          <ContentTypeIcon className="h-6 w-6 text-muted-foreground flex-shrink-0" aria-label={contentTypeDisplay.label} />
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        {releaseYear && (
          <div className="flex items-center text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4 mr-2 opacity-70" />
            <span>Released: {releaseYear}</span>
          </div>
        )}
        {!releaseYear && (
            <p className="text-sm text-muted-foreground italic">Release year not available.</p>
        )}
        {/* You could add a snippet of the summary here if desired and available */}
        {/* item.summary && <p className="text-sm text-foreground/80 mt-2 line-clamp-2">{item.summary}</p> */}
      </CardContent>
    </Card>
  );
}
