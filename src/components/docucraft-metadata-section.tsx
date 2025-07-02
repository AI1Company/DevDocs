"use client";

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { suggestAppFeatures } from '@/ai/flows/suggest-app-features';
import type { AppMetadata } from '@/lib/projects';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const metadataSchema = z.object({
  name: z.string().min(2, 'App name must be at least 2 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  industry: z.string().min(2, 'Industry must be at least 2 characters.'),
  targetUsers: z.string().min(10, 'Target users description must be at least 10 characters.'),
  platform: z.enum(['Web', 'Mobile', 'SaaS', 'Desktop']),
});

type MetadataFormProps = {
  initialData: AppMetadata | null;
  onSubmit: (data: AppMetadata) => void;
  onSuggestions: (suggestions: string[]) => void;
  suggestions: string[];
};

export function MetadataSection({ initialData, onSubmit, onSuggestions, suggestions }: MetadataFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof metadataSchema>>({
    resolver: zodResolver(metadataSchema),
    defaultValues: initialData || { name: '', description: '', industry: '', targetUsers: '', platform: 'Web' },
  });

  React.useEffect(() => {
    form.reset(initialData || { name: '', description: '', industry: '', targetUsers: '', platform: 'Web' });
  }, [initialData, form]);

  const handleFormSubmit = async (values: z.infer<typeof metadataSchema>) => {
    setIsLoading(true);
    onSubmit(values); // This will update the project metadata
    try {
      const result = await suggestAppFeatures(values);
      onSuggestions(result.features);
      toast({
        title: 'Project Updated',
        description: 'Metadata and feature suggestions have been refreshed.',
      });
    } catch (error) {
      console.error('Error suggesting features:', error);
      toast({
        title: 'Suggestion Failed',
        description: 'Could not refresh feature suggestions, but your project metadata was updated.',
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
          <CardTitle>Project Details</CardTitle>
          <CardDescription>Edit your app details. Our AI uses this to generate content.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>App Name</FormLabel>
                    <FormControl><Input placeholder="e.g., Stellar Social" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="industry" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <FormControl><Input placeholder="e.g., Social Networking" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>App Description</FormLabel>
                  <FormControl><Textarea placeholder="A social media platform for astronomy enthusiasts." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="targetUsers" render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Users</FormLabel>
                  <FormControl><Textarea placeholder="e.g., Amateur astronomers, students, and space lovers." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="platform" render={({ field }) => (
                <FormItem>
                  <FormLabel>Platform</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a platform" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Web">Web Application</SelectItem>
                      <SelectItem value="Mobile">Mobile App (iOS/Android)</SelectItem>
                      <SelectItem value="SaaS">SaaS Platform</SelectItem>
                      <SelectItem value="Desktop">Desktop Application</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : <Lightbulb />}
                <span>{isLoading ? 'Re-analyzing...' : 'Update & Re-suggest Features'}</span>
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
