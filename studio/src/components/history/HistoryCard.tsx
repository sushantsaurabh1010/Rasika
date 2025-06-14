
'use client';

import type { HistoryEntry } from '@/lib/firebase/historyService'; 
import { CardContent } from '@/components/ui/card'; // Removed Card, CardHeader, CardTitle, CardDescription
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Star, Tag, Eye, Languages, Palette, Film, Tv2, BookOpenText, Music2, Mic2, SmileIcon, ListChecks, TagsIcon, CalendarDays as CalendarIcon } from 'lucide-react';
import { CONTENT_TYPES, MOODS, SUPPORTED_LANGUAGES } from '@/lib/constants';
import type { Timestamp } from 'firebase/firestore';

interface HistoryCardProps {
  entry: HistoryEntry;
}

const getContentTypeData = (typeId: string | undefined) => {
  if (!typeId) return { icon: Palette, label: 'Content' };
  const contentType = CONTENT_TYPES.find(ct => ct.id === typeId);
  return {
    icon: contentType?.icon || Palette,
    label: contentType?.label || typeId
  };
};

const getMoodLabel = (moodId: string) => {
  const mood = MOODS.find(m => m.id === moodId);
  return mood?.label || moodId;
}

const getLanguageLabel = (languageValue?: string) => {
  if (!languageValue || languageValue === 'any_language') return null;
  const language = SUPPORTED_LANGUAGES.find(lang => lang.value === languageValue);
  return language?.label || languageValue;
}

const formatDate = (dateValue: Timestamp | Date | undefined): string => {
  if (!dateValue) return 'Date not available';
  const date = (dateValue as Timestamp).toDate ? (dateValue as Timestamp).toDate() : new Date(dateValue as any);
  return date.toLocaleString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};


export function HistoryCard({ entry }: HistoryCardProps) {
  const requestDate = formatDate(entry.createdAt);
  const moodLabel = getMoodLabel(entry.mood);
  const languageLabel = getLanguageLabel(entry.language);

  return (
    <div className="p-4 bg-muted/20">
      {/* Removed CardHeader */}
      <CardContent className="space-y-4 px-0 pb-0 pt-2">
        <div>
          <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1 tracking-wider">Original Request Details</h4>
          <div className="space-y-2 text-sm">
             <div className="flex items-center">
                <SmileIcon className="h-4 w-4 mr-2 text-primary/80" />
                <span className="font-medium text-foreground/80">Mood:</span>
                <span className="ml-2 text-foreground/90">{moodLabel}</span>
             </div>
             <div className="flex items-center">
                <ListChecks className="h-4 w-4 mr-2 text-primary/80" />
                <span className="font-medium text-foreground/80">Content Types:</span>
                <span className="ml-2 text-foreground/90">{entry.contentTypes.map(type => getContentTypeData(type).label).join(', ')}</span>
             </div>
             {entry.keywords && entry.keywords.trim() !== '' && (
                 <div className="flex items-start">
                    <TagsIcon className="h-4 w-4 mr-2 mt-0.5 text-primary/80 flex-shrink-0" />
                    <span className="font-medium text-foreground/80">Keywords:</span>
                    <span className="ml-2 text-foreground/90">{entry.keywords}</span>
                </div>
             )}
             {entry.imdbRatingFilter && entry.imdbRatingFilter !== 'any_rating' && (
                <div className="flex items-center">
                    <Star className="h-4 w-4 mr-2 text-primary/80" />
                    <span className="font-medium text-foreground/80">Min. IMDb Rating:</span>
                    <span className="ml-2 text-foreground/90">{entry.imdbRatingFilter}+</span>
                </div>
             )}
             {languageLabel && (
                <div className="flex items-center">
                    <Languages className="h-4 w-4 mr-2 text-primary/80" />
                    <span className="font-medium text-foreground/80">Language:</span>
                    <span className="ml-2 text-foreground/90">{languageLabel}</span>
                </div>
             )}
            <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-2 text-primary/80" />
                <span className="font-medium text-foreground/80">Requested On:</span>
                <span className="ml-2 text-foreground/90">{requestDate}</span>
             </div>
          </div>
        </div>
        
        {entry.viewedRecommendations && entry.viewedRecommendations.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/70">
            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2 tracking-wider flex items-center">
              <Eye className="h-4 w-4 mr-1.5" />
              Content Viewed From This Session
            </h4>
            <div className="space-y-1.5">
              {entry.viewedRecommendations.map((rec, index) => {
                const { icon: Icon } = getContentTypeData(rec.contentType);
                return (
                    <div key={`${rec.title || 'viewed-rec'}-${index}`} className="flex items-center p-2 rounded-md border border-border/60 bg-card/60 shadow-xs hover:bg-card transition-colors">
                        <Icon className="h-5 w-5 mr-2.5 text-primary/70 flex-shrink-0" />
                        <span className="text-sm text-foreground/90">{rec.title}</span>
                         {rec.releaseYear && <span className="text-xs text-muted-foreground ml-2">({rec.releaseYear})</span>}
                    </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </div>
  );
}

