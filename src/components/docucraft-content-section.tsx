"use client";

import * as React from 'react';
import { generateContentSection } from '@/ai/flows/generate-content-section';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Wand2 } from 'lucide-react';
import type { AppMetadata } from './docucraft-client';
import { useToast } from '@/hooks/use-toast';

export type Section = {
  id: string;
  title: string;
  content: string;
};

type ContentSectionProps = {
  id: string;
  title: string;
  initialContent: string;
  appMetadata: AppMetadata | null;
  onUpdate: (id: string, content: string) => void;
};

export function ContentSection({ id, title, initialContent, appMetadata, onUpdate }: ContentSectionProps) {
  const [content, setContent] = React.useState(initialContent);
  const [tone, setTone] = React.useState<'technical' | 'investor-friendly'>('technical');
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!appMetadata) {
      toast({
        title: 'Metadata required',
        description: 'Please fill out the project setup form first.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await generateContentSection({
        sectionName: title,
        appMetadata: JSON.stringify(appMetadata),
        tone,
        existingContent: content,
      });
      if (result.content) {
        setContent(result.content);
        onUpdate(id, result.content);
      }
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: 'Generation Failed',
        description: 'Could not generate content. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  return (
    <Card id={id}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Use the rich text editor below or generate content with AI.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <Textarea
            placeholder={`Enter content for ${title}...`}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              onUpdate(id, e.target.value);
            }}
            className="min-h-[200px] text-base"
          />
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Label>Tone:</Label>
              <RadioGroup
                defaultValue="technical"
                onValueChange={(value: 'technical' | 'investor-friendly') => setTone(value)}
                className="flex items-center"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="technical" id={`${id}-technical`} />
                  <Label htmlFor={`${id}-technical`}>Technical</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="investor-friendly" id={`${id}-investor`} />
                  <Label htmlFor={`${id}-investor`}>Investor</Label>
                </div>
              </RadioGroup>
            </div>
            <Button onClick={handleGenerate} disabled={isLoading || !appMetadata}>
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Wand2 />
              )}
              <span>{isLoading ? 'Generating...' : 'Generate with AI'}</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
