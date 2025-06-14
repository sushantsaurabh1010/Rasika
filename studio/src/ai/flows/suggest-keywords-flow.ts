
'use server';
/**
 * @fileOverview An AI agent for suggesting related keywords.
 *
 * - suggestKeywords - A function that suggests keywords based on current input.
 * - SuggestKeywordsInput - The input type for the suggestKeywords function.
 * - SuggestKeywordsOutput - The return type for the suggestKeywords function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestKeywordsInputSchema = z.object({
  currentKeywords: z.string().describe("A comma-separated string of current keywords provided by the user, for which related suggestions are sought. This could be empty."),
});
export type SuggestKeywordsInput = z.infer<typeof SuggestKeywordsInputSchema>;

const SuggestKeywordsOutputSchema = z.object({
  suggestedKeywords: z.array(z.string()).describe("An array of 3-5 unique keywords or short phrases related to the input keywords. Suggestions should be distinct from the input keywords if possible. If no input keywords are provided, suggest generally popular or interesting keywords for content discovery."),
});
export type SuggestKeywordsOutput = z.infer<typeof SuggestKeywordsOutputSchema>;

export async function suggestKeywords(input: SuggestKeywordsInput): Promise<SuggestKeywordsOutput> {
  return suggestKeywordsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestKeywordsPrompt',
  input: {schema: SuggestKeywordsInputSchema},
  output: {schema: SuggestKeywordsOutputSchema},
  prompt: `You are a helpful assistant that suggests related keywords for refining content searches.
Based on the user's current keywords (which may be empty), please provide 3-5 unique and relevant keyword suggestions.
The suggestions should be keywords or short phrases that can help the user discover more specific or related content.
If the current keywords are empty, suggest some generally popular or diverse keywords to start a search (e.g., "adventure", "comedy", "inspiring documentaries", "ambient music", "tech podcasts").
Avoid simply rephrasing the input if keywords are provided; aim for additive or alternative suggestions.

Current User Keywords: {{{currentKeywords}}}

Generate your suggestions.
`,
});

const suggestKeywordsFlow = ai.defineFlow(
  {
    name: 'suggestKeywordsFlow',
    inputSchema: SuggestKeywordsInputSchema,
    outputSchema: SuggestKeywordsOutputSchema,
  },
  async (input: SuggestKeywordsInput) => {
    const {output} = await prompt(input);
    if (output && output.suggestedKeywords) {
      const currentKeywordsLower = input.currentKeywords.toLowerCase().split(',').map(k => k.trim()).filter(k => k);
      const uniqueSuggestions = Array.from(new Set(output.suggestedKeywords))
        .filter(suggestion => !currentKeywordsLower.includes(suggestion.toLowerCase()));
      return { suggestedKeywords: uniqueSuggestions.slice(0, 5) }; // Limit to 5
    }
    return { suggestedKeywords: [] }; // Fallback
  }
);
