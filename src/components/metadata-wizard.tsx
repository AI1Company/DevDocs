"use client";

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';

import type { AppMetadata } from '@/lib/projects';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Loader2, Lightbulb, ArrowLeft, ArrowRight } from 'lucide-react';

const metadataSchema = z.object({
  name: z.string().min(2, 'App name must be at least 2 characters.'),
  industry: z.string().min(2, 'Industry must be at least 2 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  targetUsers: z.string().min(10, 'Target users description must be at least 10 characters.'),
  platform: z.enum(['Web', 'Mobile', 'SaaS', 'Desktop']),
});

type WizardProps = {
  onSubmit: (data: AppMetadata) => Promise<void>;
};

const steps = [
  { id: 1, name: 'Basic Info', fields: ['name', 'industry'] as const },
  { id: 2, name: 'App Details', fields: ['description', 'targetUsers'] as const },
  { id: 3, name: 'Platform', fields: ['platform'] as const },
];

export function MetadataWizard({ onSubmit }: WizardProps) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<z.infer<typeof metadataSchema>>({
    resolver: zodResolver(metadataSchema),
    defaultValues: { name: '', industry: '', description: '', targetUsers: '', platform: 'Web' },
    mode: 'onTouched'
  });

  const handleNext = async () => {
    const fields = steps[currentStep].fields;
    const output = await form.trigger(fields, { shouldFocus: true });
    if (!output) return;
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleFormSubmit = async (values: z.infer<typeof metadataSchema>) => {
    setIsLoading(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error("Submission failed in wizard:", error);
      // The client component will show a toast on error
    } finally {
      setIsLoading(false);
    }
  };
  
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Create New Project</CardTitle>
        <CardDescription>Step {currentStep + 1} of {steps.length}: {steps[currentStep].name}</CardDescription>
        <Progress value={progress} className="mt-4" />
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
            {currentStep === 0 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
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
              </motion.div>
            )}
            {currentStep === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>App Purpose / Description</FormLabel>
                    <FormControl><Textarea className="min-h-24" placeholder="A social media platform for astronomy enthusiasts." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="targetUsers" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Users</FormLabel>
                    <FormControl><Textarea className="min-h-24" placeholder="e.g., Amateur astronomers, students, and space lovers." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </motion.div>
            )}
            {currentStep === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
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
              </motion.div>
            )}

            <div className="flex justify-between pt-4">
              {currentStep > 0 ? (
                <Button type="button" variant="outline" onClick={handlePrev}>
                  <ArrowLeft /> Previous
                </Button>
              ) : <div />}
              {currentStep < steps.length - 1 ? (
                <Button type="button" onClick={handleNext}>
                  Next <ArrowRight />
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin" /> : <Lightbulb />}
                  <span>{isLoading ? 'Analyzing...' : 'Create Project & Suggest Features'}</span>
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
