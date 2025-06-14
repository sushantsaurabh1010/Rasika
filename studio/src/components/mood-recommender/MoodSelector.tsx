
'use client';

import type { Control } from 'react-hook-form';
import { MOODS, type SelectableItem } from '@/lib/constants';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { useRecommendations } from '@/contexts/RecommendationContext';
interface MoodSelectorProps {
  control: Control<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export function MoodSelector({ control }: MoodSelectorProps) {
  const { setMood } = useRecommendations(); // Moved to the correct scope

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-body text-xl">Choose Your Mood</CardTitle>
      </CardHeader>
      <CardContent>
        <FormField
          control={control}
          name="mood"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormControl>
                <RadioGroup
                  onValueChange={(value) => {
                    field.onChange(value);
                    setMood(value);
                  }}
                  defaultValue={field.value}
                  className="grid grid-cols-2 sm:grid-cols-3 gap-4"
                >
                  {MOODS.map((mood: SelectableItem) => (
                    <FormItem key={mood.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={mood.id} id={`mood-${mood.id}`} />
                      <Label
                        htmlFor={`mood-${mood.id}`}
                        className="flex items-center gap-2 cursor-pointer p-3 rounded-md border border-transparent hover:border-primary hover:bg-primary/10 transition-colors data-[state=checked]:border-primary data-[state=checked]:bg-primary/10 w-full justify-center"
                      >
                        {mood.icon && <mood.icon className="h-5 w-5 text-primary" />}
                        <span className="font-body text-xl">{mood.label}</span>
                      </Label>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}

