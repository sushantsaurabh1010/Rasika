
'use client';

import type { Control } from 'react-hook-form';
import { CONTENT_TYPES, type SelectableItem } from '@/lib/constants';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ContentTypeSelectorProps {
  control: Control<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export function ContentTypeSelector({ control }: ContentTypeSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-body text-xl">Select Content Types</CardTitle>
      </CardHeader>
      <CardContent>
        <FormField
          control={control}
          name="contentTypes"
          render={() => (
            <FormItem className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {CONTENT_TYPES.map((item: SelectableItem) => (
                <FormField
                  key={item.id}
                  control={control}
                  name="contentTypes"
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
                            id={`content-${item.id}`}
                          />
                        </FormControl>
                        <Label
                          htmlFor={`content-${item.id}`}
                          className="font-body flex items-center gap-2 cursor-pointer text-xl"
                        >
                          {item.icon && <item.icon className="h-5 w-5 text-primary" />}
                          {item.label}
                        </Label>
                      </FormItem>
                    );
                  }}
                />
              ))}
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}

