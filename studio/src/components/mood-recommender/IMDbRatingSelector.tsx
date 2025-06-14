

'use client';

import type { Control } from 'react-hook-form';
import { IMDB_RATING_OPTIONS } from '@/lib/constants';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface IMDbRatingSelectorProps {
  control: Control<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export function IMDbRatingSelector({ control }: IMDbRatingSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-body text-xl">IMDb Rating (Movies/TV)</CardTitle>
      </CardHeader>
      <CardContent>
        <FormField
          control={control}
          name="imdbRatingFilter"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="imdb-rating-select" className="font-body">Minimum IMDb rating</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger id="imdb-rating-select">
                    <SelectValue placeholder="Select minimum IMDb rating" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {IMDB_RATING_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}

