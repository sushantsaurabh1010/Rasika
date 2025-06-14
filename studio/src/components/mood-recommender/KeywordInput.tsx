

'use client';

import type { Control } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles } from 'lucide-react'; // Sparkles might not be needed anymore, Loader2 still useful
import { useState, useEffect, useCallback } from 'react';
import { suggestKeywords } from '@/ai/flows/suggest-keywords-flow';
import { useToast } from '@/hooks/use-toast';

// Debounce function
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };

  return debounced as (...args: Parameters<F>) => ReturnType<F>;
}


interface KeywordInputProps {
  control: Control<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export function KeywordInput({ control }: KeywordInputProps) {
  const [suggestedKeywords, setSuggestedKeywords] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const { toast } = useToast();

  const fetchSuggestions = useCallback(async (keywords: string) => {
    if (!keywords.trim()) {
      setSuggestedKeywords([]);
      return;
    }
    setIsSuggesting(true);
    try {
      const result = await suggestKeywords({ currentKeywords: keywords });
      if (result.suggestedKeywords && result.suggestedKeywords.length > 0) {
        setSuggestedKeywords(result.suggestedKeywords);
      } else {
        setSuggestedKeywords([]); // Clear if no new suggestions
      }
    } catch (error) {
      console.error("Error suggesting keywords:", error);
      toast({
        title: "Suggestion Error",
        description: (error instanceof Error) ? error.message : "Could not fetch keyword suggestions.",
        variant: "destructive",
      });
      setSuggestedKeywords([]);
    } finally {
      setIsSuggesting(false);
    }
  }, [toast]); // Include toast in dependencies

  const debouncedFetchSuggestions = useCallback(debounce(fetchSuggestions, 750), [fetchSuggestions]);

  const addKeywordToInput = (keywordToAdd: string, currentFieldValue: string, onChange: (value: string) => void) => {
    const trimmedCurrentValue = currentFieldValue.trim();
    let newValue: string;
    if (trimmedCurrentValue === '') {
      newValue = keywordToAdd;
    } else {
      const existingKeywords = trimmedCurrentValue.split(',').map(kw => kw.trim().toLowerCase());
      if (!existingKeywords.includes(keywordToAdd.toLowerCase())) {
        newValue = `${trimmedCurrentValue}, ${keywordToAdd}`;
      } else {
        newValue = trimmedCurrentValue;
        toast({
          description: `Keyword "${keywordToAdd}" is already included.`,
        });
      }
    }
    onChange(newValue);
    setSuggestedKeywords(prev => prev.filter(kw => kw.toLowerCase() !== keywordToAdd.toLowerCase())); // Remove added keyword from suggestions
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-body text-xl">Add Keywords (Optional)</CardTitle>
      </CardHeader>
      <CardContent>
        <FormField
          control={control}
          name="keywords"
          render={({ field }) => {
            // useEffect for debouncing
            useEffect(() => {
              if (field.value && field.value.trim().length > 0) { // Only suggest if input is not empty
                debouncedFetchSuggestions(field.value);
              } else {
                setSuggestedKeywords([]); // Clear suggestions if input is empty
                setIsSuggesting(false); // Ensure loading state is reset
              }
            // eslint-disable-next-line react-hooks/exhaustive-deps
            }, [field.value, debouncedFetchSuggestions]);

            return (
              <FormItem>
                <FormLabel htmlFor="keywords-input" className="font-body">Enter keywords to refine your search (e.g., specific actors, themes, artists). Suggestions will appear automatically.</FormLabel>
                <div className="flex flex-col sm:flex-row gap-2 items-start">
                  <FormControl className="flex-grow">
                    <div className="relative w-full">
                       <Input 
                        id="keywords-input" 
                        placeholder="e.g., space opera, feel-good, 90s rock" 
                        {...field} 
                        className={isSuggesting ? 'pr-10' : ''}
                       />
                       {isSuggesting && (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />
                       )}
                    </div>
                  </FormControl>
                  {/* Button removed for automatic suggestions */}
                </div>
                <FormMessage />
                {suggestedKeywords.length > 0 && !isSuggesting && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-2">Suggestions (click to add):</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedKeywords.map((keyword) => (
                        <Badge
                          key={keyword}
                          variant="secondary"
                          onClick={() => addKeywordToInput(keyword, field.value, field.onChange)}
                          className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault(); // Prevent form submission or space in input
                              addKeywordToInput(keyword, field.value, field.onChange);
                            }
                          }}
                        >
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </FormItem>
            );
          }}
        />
      </CardContent>
    </Card>
  );
}

