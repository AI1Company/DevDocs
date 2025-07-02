"use client";

import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import { generateContentSection } from '@/ai/flows/generate-content-section';
import { improveWriting } from '@/ai/flows/improve-writing';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, PenLine, BrainCircuit, Sparkles } from 'lucide-react';
import type { AppMetadata, Persona } from '@/lib/projects';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';

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
  sections: Section[];
  onUpdate: (id: string, content: string) => void;
  disabled?: boolean;
  personas: Persona[];
};

type ActionType = 'rewrite_technical' | 'rewrite_friendly' | 'rewrite_pitch' | 'rewrite_instructional' | 'fill_info';
type RewriteTone = 'technical' | 'friendly' | 'pitch' | 'instructional';


export function ContentSection({ id, title, initialContent, appMetadata, sections, onUpdate, disabled = false, personas }: ContentSectionProps) {
  const [content, setContent] = React.useState(initialContent);
  const [loadingAction, setLoadingAction] = React.useState<ActionType | 'improve' | null>(null);
  const [completionMode, setCompletionMode] = React.useState<'strict' | 'creative'>('creative');
  const [rewriteTone, setRewriteTone] = React.useState<RewriteTone>('friendly');
  const { toast } = useToast();

  const [selectedText, setSelectedText] = React.useState('');
  const [selectionRange, setSelectionRange] = React.useState<{ start: number; end: number } | null>(null);
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const [isSuggestionsOpen, setSuggestionsOpen] = React.useState(false);

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
      const otherSectionsContent = JSON.stringify(
        sections
          .filter(s => s.id !== id && s.content)
          .map(s => ({ title: s.title, content: s.content }))
      );

      const result = await generateContentSection({
        sectionName: title,
        appMetadata: JSON.stringify(appMetadata),
        action,
        existingContent: content,
        completionMode,
        otherSectionsContent,
        personas: JSON.stringify(personas),
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

  const handleRewrite = () => {
    handleGenerate(`rewrite_${rewriteTone}` as ActionType);
  }

  const handleSelect = (event: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const { selectionStart, selectionEnd, value } = event.currentTarget;
    if (selectionStart !== selectionEnd) {
      setSelectedText(value.substring(selectionStart, selectionEnd));
      setSelectionRange({ start: selectionStart, end: selectionEnd });
    } else {
      setSelectedText('');
      setSelectionRange(null);
    }
  };

  const handleImproveWriting = async () => {
    if (!selectedText) return;
    
    setLoadingAction('improve');
    try {
      const result = await improveWriting({ text: selectedText });
      if (result.suggestions && result.suggestions.length > 0) {
        setSuggestions(result.suggestions);
        setSuggestionsOpen(true);
      } else {
        toast({
          title: "Couldn't find any improvements",
          description: "Your text looks good already!",
        });
      }
    } catch (error) {
      console.error('Error improving writing:', error);
      toast({
        title: 'Improvement Failed',
        description: 'Could not get suggestions. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoadingAction(null);
    }
  };
  
  const handleAcceptSuggestion = (suggestion: string) => {
    if (!selectionRange) return;
    const newContent = 
      content.substring(0, selectionRange.start) + 
      suggestion + 
      content.substring(selectionRange.end);
      
    setContent(newContent);
    onUpdate(id, newContent);
    setSuggestionsOpen(false);
    setSelectedText('');
    setSelectionRange(null);
  };

  React.useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  return (
    <>
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
                onSelect={handleSelect}
                className="min-h-[300px] text-base font-mono"
                disabled={disabled}
              />
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id={`completion-mode-${id}`}
                    checked={completionMode === 'creative'}
                    onCheckedChange={(checked) => setCompletionMode(checked ? 'creative' : 'strict')}
                    disabled={isLoading || disabled}
                  />
                  <Label htmlFor={`completion-mode-${id}`} className="text-sm font-normal">
                    {completionMode === 'creative' ? 'Creative Completion' : 'Strict Factual'}
                  </Label>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <Button
                    onClick={handleImproveWriting}
                    disabled={!selectedText || isLoading || disabled}
                    variant="outline"
                  >
                    {loadingAction === 'improve' ? <Loader2 className="animate-spin" /> : <Sparkles />}
                    Improve Writing
                  </Button>
                  <div className="flex items-center gap-2">
                    <Select
                      value={rewriteTone}
                      onValueChange={(value: RewriteTone) => setRewriteTone(value)}
                      disabled={isLoading || disabled || !content}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a tone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="pitch">Pitch (for Investors)</SelectItem>
                        <SelectItem value="instructional">Instructional</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleRewrite} disabled={isLoading || disabled || !appMetadata || !content}>
                      {loadingAction?.startsWith('rewrite_') ? <Loader2 className="animate-spin" /> : <PenLine />}
                      Rewrite
                    </Button>
                  </div>
                  <Button onClick={() => handleGenerate('fill_info')} disabled={isLoading || disabled || !appMetadata}>
                    {loadingAction === 'fill_info' ? <Loader2 className="animate-spin" /> : <BrainCircuit />}
                    {content ? 'Expand with AI' : 'Suggest with AI'}
                  </Button>
                </div>
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
      <Dialog open={isSuggestionsOpen} onOpenChange={setSuggestionsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Writing Suggestions</DialogTitle>
            <DialogDescription>
              Here are a few suggestions to improve your selected text. Click a suggestion to accept it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 border-dashed border rounded-md bg-muted">
              <p className="text-sm text-muted-foreground italic">Original Text:</p>
              <blockquote className="mt-2 border-l-2 pl-6 italic">
                {selectedText}
              </blockquote>
            </div>
            {suggestions.map((suggestion, index) => (
              <Card key={index} className="cursor-pointer hover:bg-muted/50" onClick={() => handleAcceptSuggestion(suggestion)}>
                <CardContent className="p-4">
                  <p className="text-sm">{suggestion}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
