

'use client';

import type { Control } from 'react-hook-form';
import { useWatch, useFormContext } from 'react-hook-form';
import { GENRES, type SelectableGenre } from '@/lib/constants';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useMemo } from 'react';
import { Info } from 'lucide-react';

interface GenreSelectorProps {
  control: Control<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export function GenreSelector({ control }: GenreSelectorProps) {
  const { getValues, setValue } = useFormContext();

  const selectedContentTypes: string[] = useWatch({
    control,
    name: 'contentTypes',
    defaultValue: []
  });

  const availableGenres = useMemo(() => {
    if (!selectedContentTypes || selectedContentTypes.length === 0) {
      return [];
    }
    return GENRES.filter(genre =>
      genre.applicableToContentTypes.some(applicableType =>
        selectedContentTypes.includes(applicableType)
      )
    ).sort((a,b) => a.label.localeCompare(b.label));
  }, [selectedContentTypes]);

  useEffect(() => {
    const currentSelectedGenres: string[] = getValues('genres') || [];

    if (selectedContentTypes.length === 0) {
      // If no content types are selected, ensure genres are cleared if they aren't already
      if (currentSelectedGenres.length > 0) {
        setValue('genres', [], { shouldValidate: true, shouldDirty: true });
      }
      return; // No further processing needed for genres
    }

    // Content types are selected, filter currently selected genres if any are selected
    if (currentSelectedGenres.length > 0) {
      const validSelectedGenres = currentSelectedGenres.filter(genreId => {
        const genreDetails = GENRES.find(g => g.id === genreId);
        if (!genreDetails) return false;
        return genreDetails.applicableToContentTypes.some(applicableType =>
          selectedContentTypes.includes(applicableType)
        );
      });

      // Check if the filtered list is different from the current list
      const currentSet = new Set(currentSelectedGenres);
      const validSet = new Set(validSelectedGenres);
      const areDifferent = currentSelectedGenres.length !== validSelectedGenres.length ||
                           !currentSelectedGenres.every(g => validSet.has(g)) ||
                           !validSelectedGenres.every(g => currentSet.has(g));

      if (areDifferent) {
        setValue('genres', validSelectedGenres, { shouldValidate: true, shouldDirty: true });
      }
    }
    // If currentSelectedGenres is empty and contentTypes are selected, no action needed for genres.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedContentTypes, getValues, setValue]);

  // If no content types are selected, don't render the card at all
  if (!selectedContentTypes || selectedContentTypes.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-body text-xl">Select Genres (Optional)</CardTitle>
      </CardHeader>
      <CardContent>
        {/* This message is now effectively for when content types ARE selected, but NO genres apply */}
        {availableGenres.length === 0 ? (
          <div className="flex items-center text-sm text-muted-foreground p-4 bg-muted/50 rounded-md">
            <Info className="h-5 w-5 mr-3 text-primary" />
            No specific genres found for your current selection of content types. You can still add keywords.
          </div>
        ) : (
          <FormField
            control={control}
            name="genres"
            render={() => (
              <FormItem className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-4">
                {availableGenres.map((item: SelectableGenre) => (
                  <FormField
                    key={item.id}
                    control={control}
                    name="genres"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={item.id}
                          className="flex flex-row items-center space-x-2 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...(field.value || []), item.id])
                                  : field.onChange(
                                      (field.value || []).filter(
                                        (value: string) => value !== item.id
                                      )
                                    );
                              }}
                              id={`genre-${item.id}`}
                            />
                          </FormControl>
                          <Label htmlFor={`genre-${item.id}`} className="font-body cursor-pointer hover:text-primary transition-colors">
                            {item.label}
                          </Label>
                        </FormItem>
                      );
                    }}
                  />
                ))}
                <FormMessage className="col-span-full" />
              </FormItem>
            )}
          />
        )}
      </CardContent>
    </Card>
  );
}

