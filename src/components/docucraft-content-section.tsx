"use client";

import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import { generateContentSection } from '@/ai/flows/generate-content-section';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Briefcase, FilePlus2 } from 'lucide-react';
import type { AppMetadata } from '@/lib/projects';
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
  disabled?: boolean;
};

type ActionType = 'improve' | 'rewrite_investor' | 'fill_info';

export function ContentSection({ id, title, initialContent, appMetadata, onUpdate, disabled = false }: ContentSectionProps) {
  const [content, setContent] = React.useState(initialContent);
  const [loadingAction, setLoadingAction] = React.useState<ActionType | null>(null);
  const { toast } = useToast();
  const isLoading = loadingAction !== null;

  const handleGenerate = async (action: ActionType) => {
    if (disabled || !appMetadata) {
      toast({
        title: 'Project not set up',
        description: 'Please fill out the project setup form first.',
        variant: 'destructive',
      });
      return;
    }

    setLoadingAction(action);
    try {
      const result = await generateContentSection({
        sectionName: title,
        appMetadata: JSON.stringify(appMetadata),
        action,
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
      setLoadingAction(null);
    }
  };

  React.useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  return (
    <Card id={id}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Use the editor below to write content in Markdown, or generate it with AI.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Label htmlFor={`editor-${id}`}>Editor</Label>
            <Textarea
              id={`editor-${id}`}
              placeholder={disabled ? "Please set up the project first." : `Enter content for ${title} using Markdown...`}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                onUpdate(id, e.target.value);
              }}
              className="min-h-[300px] text-base font-mono"
              disabled={disabled}
            />
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button onClick={() => handleGenerate('improve')} disabled={isLoading || disabled || !appMetadata || !content}>
                {loadingAction === 'improve' ? <Loader2 className="animate-spin" /> : <Sparkles />}
                Improve Clarity
              </Button>
              <Button onClick={() => handleGenerate('rewrite_investor')} disabled={isLoading || disabled || !appMetadata || !content}>
                {loadingAction === 'rewrite_investor' ? <Loader2 className="animate-spin" /> : <Briefcase />}
                For Investors
              </Button>
              <Button onClick={() => handleGenerate('fill_info')} disabled={isLoading || disabled || !appMetadata}>
                {loadingAction === 'fill_info' ? <Loader2 className="animate-spin" /> : <FilePlus2 />}
                {content ? 'Expand Section' : 'Fill Missing Info'}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Live Preview</Label>
            <Card className="h-full min-h-[300px] p-4 overflow-y-auto">
              <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none w-full h-full">
                <ReactMarkdown>
                  {content || "Start typing or generate content to see a preview..."}
                </ReactMarkdown>
              </div>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
