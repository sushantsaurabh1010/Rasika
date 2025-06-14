

'use client';

import type { Control } from 'react-hook-form';
import { SUPPORTED_LANGUAGES } from '@/lib/constants';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Languages } from 'lucide-react';

interface LanguageSelectorProps {
  control: Control<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export function LanguageSelector({ control }: LanguageSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-body text-xl flex items-center">
          <Languages className="mr-2 h-5 w-5 text-primary/80" />
          Select Language (Optional)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <FormField
          control={control}
          name="language"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="language-select" className="font-body">Preferred language for content</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger id="language-select">
                    <SelectValue placeholder="Select preferred language" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SUPPORTED_LANGUAGES.map((option) => (
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

