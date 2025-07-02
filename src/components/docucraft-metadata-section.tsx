"use client";

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { suggestAppFeatures } from '@/ai/flows/suggest-app-features';
import type { AppMetadata } from './docucraft-client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const metadataSchema = z.object({
  name: z.string().min(2, 'App name must be at least 2 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  industry: z.string().min(2, 'Industry must be at least 2 characters.'),
});

type MetadataFormProps = {
  onSubmit: (data: AppMetadata) => void;
  onSuggestions: (suggestions: string[]) => void;
  suggestions: string[];
};

export function MetadataSection({ onSubmit, onSuggestions, suggestions }: MetadataFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof metadataSchema>>({
    resolver: zodResolver(metadataSchema),
    defaultValues: { name: '', description: '', industry: '' },
  });

  const handleFormSubmit = async (values: z.infer<typeof metadataSchema>) => {
    setIsLoading(true);
    onSubmit(values);
    try {
      const result = await suggestAppFeatures(values);
      onSuggestions(result.features);
    } catch (error) {
      console.error('Error suggesting features:', error);
      toast({
        title: 'Suggestion Failed',
        description: 'Could not suggest features. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card id="metadata">
        <CardHeader>
          <CardTitle>Project Setup</CardTitle>
          <CardDescription>Enter your app details to get started. Our AI will use this to generate content.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>App Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Stellar Social" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>App Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="A social media platform for astronomy enthusiasts." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Social Networking" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : <Lightbulb />}
                <span>{isLoading ? 'Analyzing...' : 'Suggest Features'}</span>
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {suggestions.length > 0 && (
        <Card id="features">
          <CardHeader>
            <CardTitle>AI-Suggested Features</CardTitle>
            <CardDescription>Here are some features our AI thinks would be a great fit for your app.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((feature, index) => (
                <Badge key={index} variant="secondary" className="text-sm">
                  {feature}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
