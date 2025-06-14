
// src/ai/flows/generate-recommendation.ts
'use server';

/**
 * @fileOverview A content recommendation AI agent.
 *
 * - generateRecommendation - A function that handles the content recommendation process.
 * - GenerateRecommendationInput - The input type for the generateRecommendation function.
 * - GenerateRecommendationOutput - The return type for the generateRecommendation function, now an array of four recommendations with more details.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Re-using RecommendationItem for watched content consistency
const SingleRecommendationSchema = z.object({
  title: z.string().describe('The title of the recommended content.'),
  contentType: z.string().describe('The specific type of this recommended content (e.g., "movie", "book", "music", "tvShow", "podcast", "anime"). This MUST be one of the types the user initially requested in contentTypes. For example, if user asked for "movie" and "book", this field for a movie recommendation must be "movie".'),
  summary: z.string().describe('A summary of the recommended content. For movies, TV shows, anime, books, and podcasts, provide a detailed summary (e.g., 3-5 sentences covering main plot points, premise, or key themes). For music, a description (2-3 sentences) of the album/song or artist style is sufficient.'),
  releaseYear: z.number().int().nullable().optional().describe('The release year of the content as a number (e.g., 2023). For ongoing series or podcasts, this can be the start year. Return null if not found or not applicable.'),
  rating: z.string().nullable().optional().describe('The rating of the content (e.g., "8.5/10", "4.2/5 stars"). Include the scale if possible. Return null if not found or not applicable.'),
  ratingSource: z.string().nullable().optional().describe('The source of the rating (e.g., "IMDb", "MyAnimeList", "Goodreads"). If a rating is provided, diligently try to provide its source. Return null if not found or not applicable.'),
  streamingInfo: z.string().nullable().optional().describe('For movies, TV shows, or anime, CONCISE information on where to stream or watch (e.g., "Available on Netflix", "Rent on Prime Video", "Stream on Crunchyroll"). Limit to 1-2 primary sources if multiple exist. Return null if not found or not applicable.'),

  director: z.string().nullable().optional().describe('For movies, TV shows or anime, the director(s) or main studio. Return null if not applicable or not found.'),
  cast: z.string().nullable().optional().describe('For movies, TV shows or anime, a comma-separated string of 2-4 main voice actors or cast members. Return null if not applicable or not found.'),
  author: z.string().nullable().optional().describe('For books, the author(s). For anime (if based on manga/light novel), original author(s). Return null if not applicable or not found.'),
  artist: z.string().nullable().optional().describe('For music, the primary artist(s). Return null if not applicable or not found.'),
  creatorOrHost: z.string().nullable().optional().describe('For podcasts, the creator(s) or main host(s). Return null if not applicable or not found.'),
  
  keyCreatorForSimilar: z.string().nullable().optional().describe('The primary creative figure (e.g., director/studio for movies/TV/anime, author name for books, artist name for music, main host/creator name for podcasts) associated with this item. This will be used to find similar content. Return null if not clearly identifiable or not applicable.')
});

const PastRequestSchema = z.object({
  mood: z.string().describe("A mood from a past request."),
  keywords: z.string().describe("Keywords from a past request, comma-separated."),
  // We could add contentTypes if it becomes relevant for deeper history analysis
});

const GenerateRecommendationInputSchema = z.object({
  mood: z.string().describe('The mood for which to generate recommendations.'),
  contentTypes: z
    .array(z.string())
    .describe('The content types to consider (e.g., movies, tv shows, books, music, podcasts, anime).'),
  keywords: z.string().describe('Keywords to refine the content recommendations.'),
  imdbRatingFilter: z.string().optional().describe('Optional minimum IMDb rating for movies/TV shows/anime (e.g., "7.5"). If empty or not provided, any rating is acceptable.'),
  language: z.string().optional().describe('The preferred language for the content (e.g., "English", "Spanish"). If not provided, recommendations may be in any language, prioritizing English or widely available content.'),
  watchedContent: z.array(SingleRecommendationSchema).optional().describe("An array of content items the user has previously marked as watched, read, or listened to. Use this to understand preferences and avoid re-recommending unless very relevant to the current query."),
  pastRequests: z.array(PastRequestSchema).optional().describe("An array of the user's past recommendation requests (mood and keywords). Use this to get a broader sense of their tastes over time.")
});
export type GenerateRecommendationInput = z.infer<typeof GenerateRecommendationInputSchema>;

const GenerateRecommendationOutputSchema = z.array(SingleRecommendationSchema)
  .describe('An array of four content recommendations, each with detailed information.');

export type GenerateRecommendationOutput = z.infer<typeof GenerateRecommendationOutputSchema>;
// Utility type for a single recommendation item
export type RecommendationItem = GenerateRecommendationOutput extends (infer U)[] ? U : never;


export async function generateRecommendation(
  input: GenerateRecommendationInput
): Promise<GenerateRecommendationOutput> {
  return generateRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRecommendationPrompt',
  input: {schema: GenerateRecommendationInputSchema},
  output: {schema: GenerateRecommendationOutputSchema},
  prompt: `You are a highly personalized content recommendation expert. Based on the user's current request AND their past interactions, you will recommend four distinct pieces of content.
Content types can include movies, tv shows, books, music, podcasts, and anime.
Return your response as an array of four recommendation objects.

User's Current Request:
Mood: {{{mood}}}
Content Types Requested: {{#each contentTypes}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
Keywords: {{{keywords}}}
{{#if imdbRatingFilter}}
IMDb Rating Filter for Movies/TV Shows/Anime: An IMDb rating filter of {{{imdbRatingFilter}}} or higher is active. This is a strict requirement for any movie, TV show, or anime recommendations. For anime, also consider MyAnimeList (MAL) ratings if IMDb is not available, but try to meet the numerical threshold.
{{else}}
IMDb Rating Filter for Movies/TV Shows/Anime: No specific minimum IMDb/MAL rating is set, but still prioritize favorably rated content.
{{/if}}
{{#if language}}
Preferred Language for Content: {{{language}}}. Please try to find content primarily in this language, or with good availability (e.g., subtitles/dubs) in this language. If not strictly possible for all 4 recommendations, prioritize it where feasible. For music, consider the language of the lyrics or the origin of the artist. For podcasts, the language of the podcast.
{{else}}
Preferred Language for Content: No specific language preference. Prioritize English or widely available content.
{{/if}}

User's Personalization Data (Use this to tailor recommendations):
{{#if watchedContent}}
Previously Watched/Read/Listened Content (Avoid re-recommending these unless the current request is very similar and explicitly asks for more of the same. Use these items to understand their taste):
{{#each watchedContent}}
- Title: {{{this.title}}}, Type: {{{this.contentType}}}{{#if this.keyCreatorForSimilar}}, Key Creator: {{{this.keyCreatorForSimilar}}}{{/if}}
{{/each}}
{{else}}
No specific watched content history provided. Focus on the current request.
{{/if}}

{{#if pastRequests}}
Summary of Past Recommendation Requests (Use this to understand evolving tastes or recurring interests):
{{#each pastRequests}}
- Mood: {{{this.mood}}}, Keywords: "{{{this.keywords}}}"
{{/each}}
{{else}}
No past request history provided.
{{/if}}

Recommendation Guidelines:
1.  **Personalize Heavily**: Prioritize recommendations that align with the user's taste as indicated by their watched content and past requests. If they liked content by a specific director/author/artist (keyCreatorForSimilar), consider other works by them or similar creators if it fits the current request.
2.  **Diversity with Relevance**: Offer a diverse set of recommendations that still fit the current request. If the user's history is very focused, try to suggest something new but related, rather than only more of the same, unless the current request is very specific (e.g. "more movies like X").
3.  **Avoid Repetition**: Do NOT recommend items listed in "Previously Watched/Read/Listened Content" unless the current request *strongly* implies they want something very similar to one of those items (e.g. keywords mention a title from their watched list). Even then, try to find something new but related first.
4.  **Freshness**: Try to include at least one or two newer or less commonly known recommendations if possible, alongside more popular ones, assuming they fit the user's profile.

For EACH of the FOUR recommendations in the array, ensure ALL the following fields are populated as accurately as possible. For any optional field, if the information is not found or not applicable to the content type, you MUST return null for that field.

1.  "title": A clear title for the content.
2.  "contentType": CRITICAL - The specific type of this single recommended item (e.g., "movie", "tvShow", "book", "music", "podcast", "anime"). This MUST be one of the types the user initially specified in their 'Content Types Requested' list.
3.  "summary": CRITICAL - A summary of the content.
    - For "movie", "tvShow", "anime", "book", and "podcast" contentTypes: Provide a detailed summary (e.g., 3-5 sentences) covering main plot points, premise, key themes, or series overview for anime. Make it engaging and informative.
    - For "music" contentType: A description (2-3 sentences) of the album, song, or artist's style, perhaps mentioning key tracks or overall vibe.
4.  "releaseYear" (number | null, optional): The release year of the content as a number (e.g., 2023). For ongoing series or podcasts, this can be the start year. Return null if not found or not applicable.
5.  "rating" (string | null, optional): The rating of the content (e.g., "8.5/10", "4.2/5 stars"). Include the scale if possible. If not found or not applicable, return null.
    - For Movie/TV Show/Anime: This should be the IMDb or MyAnimeList (MAL) rating.
        {{#if imdbRatingFilter}}
        - CRITICAL IMDb/MAL RATING: Adhere strictly to the '{{{imdbRatingFilter}}}' or higher filter for movies/TV/anime. If no suitable item meets this, explicitly state no suitable item found for this slot or omit the movie/TV/anime recommendation, then return null for rating and ratingSource.
        {{else}}
        - Prioritize favorably rated items (e.g., 7/10+ on IMDb/MAL).
        {{/if}}
    - For Book: This should be the Goodreads rating.
6.  "ratingSource" (string | null, optional): If a rating value is given, you MUST diligently try to provide its source (e.g., "IMDb", "MyAnimeList", "Goodreads"). If the source is unknown despite best efforts or not applicable, return null.
7.  "streamingInfo" (string | null, optional): For EVERY movie, TV show, or anime, diligently attempt to find and provide CONCISE information on where it can be streamed/watched (e.g., "Available on Netflix", "Stream on Crunchyroll", "Rent on Prime Video"). IMPORTANT: Limit this to 1-2 primary streaming sources if multiple exist. Be very brief. If not found or not applicable (e.g. for a book), return null.

8.  Detailed Information (Return null for a field if not applicable to the contentType or genuinely not found):
    - "director" (string | null): For "movie", "tvShow", or "anime" contentType. Director(s) of the film/show. For anime, can also be the animation studio.
    - "cast" (string | null): For "movie", "tvShow", or "anime" contentType. Comma-separated string of 2-4 main cast members or key voice actors for anime.
    - "author" (string | null): For "book" contentType. For "anime" (if based on a manga/light novel), the original creator/author of the source material.
    - "artist" (string | null): For "music" contentType. Primary artist(s) of the music.
    - "creatorOrHost" (string | null): For "podcast" contentType. Creator(s) or main host(s) of the podcast.

9.  "keyCreatorForSimilar" (string | null): Based on the item's contentType, provide the most relevant primary creative name for finding similar works:
    - For "movie", "tvShow", "anime": The main director's name or animation studio.
    - For "book": The main author's name.
    - For "music": The main artist's name.
    - For "podcast": The main creator or host's name.
    Return null if not clearly identifiable or not applicable. This field is important for future "find similar" features and personalization.
`
});

const generateRecommendationFlow = ai.defineFlow(
  {
    name: 'generateRecommendationFlow',
    inputSchema: GenerateRecommendationInputSchema,
    outputSchema: GenerateRecommendationOutputSchema,
  },
  async (input: GenerateRecommendationInput): Promise<GenerateRecommendationOutput> => {
    const {output: aiOutput} = await prompt(input);

    const sanitizeNullableStringField = (val: string | undefined | null): string | null => {
      if (val === undefined || val === null) {
        return null;
      }
      const trimmedVal = String(val).trim(); // Ensure val is treated as string
      if (trimmedVal.toLowerCase() === 'null' || trimmedVal === '' || trimmedVal.toLowerCase() === 'n/a' || trimmedVal.toLowerCase() === 'none') {
        return null;
      }
      return trimmedVal;
    };

    const sanitizeNullableNumberField = (val: number | undefined | null): number | null => {
        if (val === undefined || val === null || isNaN(Number(val))) {
            return null;
        }
        return Number(val);
    };

    if (Array.isArray(aiOutput)) {
      const processedOutput = aiOutput.map((item) => {
        return {
          title: item.title ?? 'Untitled Recommendation',
          contentType: item.contentType ?? 'unknown',
          summary: item.summary ?? 'No summary available.',
          releaseYear: sanitizeNullableNumberField(item.releaseYear),
          rating: sanitizeNullableStringField(item.rating),
          ratingSource: sanitizeNullableStringField(item.ratingSource),
          streamingInfo: sanitizeNullableStringField(item.streamingInfo),
          director: sanitizeNullableStringField(item.director),
          cast: sanitizeNullableStringField(item.cast),
          author: sanitizeNullableStringField(item.author),
          artist: sanitizeNullableStringField(item.artist),
          creatorOrHost: sanitizeNullableStringField(item.creatorOrHost),
          keyCreatorForSimilar: sanitizeNullableStringField(item.keyCreatorForSimilar),
        };
      });
      return processedOutput;
    }
    
    console.warn('[generateRecommendationFlow] AI output was not a valid array. Input was:', input, 'Output was:', aiOutput);
    return [];
  }
);
