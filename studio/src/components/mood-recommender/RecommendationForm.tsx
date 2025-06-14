
'use client';

import { useEffect, useState as useLocalStateHook } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { MoodSelector } from './MoodSelector';
import { ContentTypeSelector } from './ContentTypeSelector';
import { GenreSelector } from './GenreSelector';
import { KeywordInput } from './KeywordInput';
import { IMDbRatingSelector } from './IMDbRatingSelector';
import { LanguageSelector } from './LanguageSelector';
import { generateRecommendation, type GenerateRecommendationInput, type GenerateRecommendationOutput, type RecommendationItem as AIRecommendationItem } from '@/ai/flows/generate-recommendation';
import { addHistoryRequest } from '@/lib/firebase/historyServerActions'; 
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/firebase/AuthContext';
import { auth } from '@/lib/firebase/config';
import { useRecommendations } from '@/contexts/RecommendationContext';
import { getUserHistory, type HistoryEntry } from '@/lib/firebase/historyService';

const formSchema = z.object({
  mood: z.string().min(1, { message: 'Please select a mood.' }),
  contentTypes: z.array(z.string()).min(1, { message: 'Please select at least one content type.' }),
  genres: z.array(z.string()).optional(),
  keywords: z.string().optional(),
  imdbRatingFilter: z.string().optional(),
  language: z.string().optional(),
});

type RecommendationFormValues = z.infer<typeof formSchema>;

interface RecommendationFormProps {
  onRecommendationsFetched: (recommendations: GenerateRecommendationOutput | null) => void;
  setIsLoading: (loading: boolean) => void;
  isLoading: boolean;
}

const RELEVANT_CONTENT_TYPES_FOR_LANGUAGE_FILTER = ['movie', 'tvShow', 'book', 'music', 'podcast'];

export function RecommendationForm({ onRecommendationsFetched, setIsLoading, isLoading }: RecommendationFormProps) {
  const { toast } = useToast();
  const { user: contextUser, loading: authLoading, isSettingUpNewProfile } = useAuth();
  const { setCurrentHistoryDocId } = useRecommendations();

  const form = useForm<RecommendationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mood: '',
      contentTypes: [],
      genres: [],
      keywords: '',
      imdbRatingFilter: 'any_rating',
      language: 'any_language',
    },
  });

  const selectedContentTypes = form.watch('contentTypes');
  const [showIMDbFilter, setShowIMDbFilterLocally] = useLocalStateHook(false); 
  const [showLanguageFilter, setShowLanguageFilterLocally] = useLocalStateHook(false);

  useEffect(() => {
    const hasMovieOrTvShow = selectedContentTypes?.some(type => type === 'movie' || type === 'tvShow' || type === 'anime');
    setShowIMDbFilterLocally(!!hasMovieOrTvShow);
    if (!hasMovieOrTvShow) {
      form.setValue('imdbRatingFilter', 'any_rating');
    }

    const hasRelevantTypeForLanguage = selectedContentTypes?.some(type => RELEVANT_CONTENT_TYPES_FOR_LANGUAGE_FILTER.includes(type));
    setShowLanguageFilterLocally(!!hasRelevantTypeForLanguage);
    if (!hasRelevantTypeForLanguage) {
      form.setValue('language', 'any_language');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedContentTypes, form.setValue]);

  const onSubmit: SubmitHandler<RecommendationFormValues> = async (data) => {
    if (authLoading || isSettingUpNewProfile) {
      toast({
        variant: "destructive",
        title: "Authentication Not Ready",
        description: isSettingUpNewProfile ? "Profile setup is in progress. Please wait." : "Please wait for authentication to finish before generating recommendations.",
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    onRecommendationsFetched(null); 
    setCurrentHistoryDocId(null);

    let watchedContentForAI: AIRecommendationItem[] | undefined = undefined;
    let pastRequestsForAI: { mood: string; keywords: string; }[] | undefined = undefined;
    const currentFirebaseUser = auth.currentUser;

    if (currentFirebaseUser && currentFirebaseUser.uid && !currentFirebaseUser.isAnonymous) {
      try {
        const userHistoryEntries: HistoryEntry[] = await getUserHistory(currentFirebaseUser.uid, 20); // Fetch up to 20 recent history items
        
        // Process viewed recommendations
        const allViewedItems = userHistoryEntries.flatMap(entry => entry.viewedRecommendations || []);
        if (allViewedItems.length > 0) {
          const uniqueTitles = new Set<string>();
          watchedContentForAI = allViewedItems.reduce((acc, item) => {
            if (item.title && !uniqueTitles.has(item.title.toLowerCase())) {
              uniqueTitles.add(item.title.toLowerCase());
              // Map to AIRecommendationItem, ensuring all fields are present or null
              acc.push({
                title: item.title,
                contentType: item.contentType,
                summary: item.summary, // Summary might be long, consider if needed or shorten
                releaseYear: item.releaseYear,
                rating: item.rating,
                ratingSource: item.ratingSource,
                streamingInfo: item.streamingInfo,
                director: item.director,
                cast: item.cast,
                author: item.author,
                artist: item.artist,
                creatorOrHost: item.creatorOrHost,
                keyCreatorForSimilar: item.keyCreatorForSimilar,
              });
            }
            return acc;
          }, [] as AIRecommendationItem[]).slice(0, 10); // Limit to 10 most recent unique viewed items
        }

        // Process past requests
        if (userHistoryEntries.length > 0) {
          pastRequestsForAI = userHistoryEntries.map(entry => ({
            mood: entry.mood,
            keywords: entry.keywords || '',
          })).slice(0, 5); // Limit to 5 most recent past requests
        }

      } catch (historyError) {
        console.warn("[RecommendationForm] Could not fetch user history for personalization:", historyError);
        // Continue without personalization if history fetch fails
      }
    }


    const combinedKeywords = [
        data.keywords || '',
        ...(data.genres || []).map(genre => genre) 
    ].filter(kw => kw.trim() !== '').join(', ');

    const inputForAI: GenerateRecommendationInput = {
      mood: data.mood,
      contentTypes: data.contentTypes,
      keywords: combinedKeywords,
      imdbRatingFilter: data.imdbRatingFilter === 'any_rating' ? undefined : data.imdbRatingFilter,
      language: data.language === 'any_language' ? undefined : data.language,
      watchedContent: watchedContentForAI,
      pastRequests: pastRequestsForAI,
    };

    try {
      if (currentFirebaseUser && currentFirebaseUser.uid) {
        let idToken: string | null = null;
        try {
          idToken = await currentFirebaseUser.getIdToken(true);
        } catch (tokenError) {
          console.error("[RecommendationForm] Error getting ID token from auth.currentUser:", tokenError);
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "Could not retrieve user token. Please try signing in again.",
          });
          setIsLoading(false);
          return;
        }

        if (idToken) {
          const aiResult = await generateRecommendation(inputForAI);
          onRecommendationsFetched(aiResult);

          // Log the request even if it was personalized (inputForAI now contains personalization data for logging)
          const historyResult = await addHistoryRequest(idToken, currentFirebaseUser.uid, inputForAI);
          if (historyResult.success && historyResult.historyDocId) {
            setCurrentHistoryDocId(historyResult.historyDocId);
          } else {
            toast({
              variant: "destructive",
              title: "History Log Failed",
              description: historyResult.message,
            });
          }
        } else {
           toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "Failed to obtain a valid session token.",
          });
        }
      } else {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "User session not ready or user data is incomplete. Please try signing in again.",
        });
      }
    } catch (error) {
      console.error('[RecommendationForm] Error generating recommendation:', error);
      toast({
        variant: "destructive",
        title: "Error Generating Recommendation",
        description: (error as Error)?.message || "Failed to generate recommendation.",
      });
      onRecommendationsFetched([]); 
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <MoodSelector control={form.control} />
          <ContentTypeSelector control={form.control} />
          {showIMDbFilter && <IMDbRatingSelector control={form.control} />}
          {showLanguageFilter && <LanguageSelector control={form.control} />} 
          <GenreSelector control={form.control} />
          <KeywordInput control={form.control} />

          <Button
            type="submit"
            disabled={isLoading || !contextUser || authLoading || isSettingUpNewProfile}
            size="lg"
            className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : (
              'Get Recommendations'
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
