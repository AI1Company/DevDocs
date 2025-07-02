"use client";

import * as React from 'react';
import type { Persona, AppMetadata } from '@/lib/projects';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, User, Target, ThumbsDown } from 'lucide-react';

type PersonaSectionProps = {
  initialPersonas: Persona[];
  appMetadata: AppMetadata | null;
  onUpdate: (personas: Persona[]) => void;
  onRegenerate: () => Promise<void>;
  disabled?: boolean;
};

export function PersonaSection({ initialPersonas, onUpdate, onRegenerate, disabled }: PersonaSectionProps) {
  const [personas, setPersonas] = React.useState(initialPersonas);
  const [isRegenerating, setIsRegenerating] = React.useState(false);

  React.useEffect(() => {
    setPersonas(initialPersonas);
  }, [initialPersonas]);

  const handleFieldChange = (personaIndex: number, field: keyof Persona, value: string | string[]) => {
    const updatedPersonas = [...personas];
    // @ts-ignore
    updatedPersonas[personaIndex][field] = value;
    setPersonas(updatedPersonas);
  };
  
  const handleArrayFieldChange = (personaIndex: number, field: 'goals' | 'frustrations', value: string) => {
    const updatedPersonas = [...personas];
    updatedPersonas[personaIndex][field] = value.split('\n').filter(item => item.trim() !== '');
    setPersonas(updatedPersonas);
    onUpdate(updatedPersonas);
  };

  const handleRegenerateClick = async () => {
    setIsRegenerating(true);
    await onRegenerate();
    setIsRegenerating(false);
  };

  return (
    <Card id="personas">
      <CardHeader>
        <CardTitle>User Personas</CardTitle>
        <CardDescription>
          AI-generated user personas based on your app details. Edit the fields directly.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {personas.length === 0 && !disabled ? (
          <div className="text-center text-muted-foreground">
            <p>No user personas generated yet.</p>
            <p>Click "Regenerate with AI" to create some.</p>
          </div>
        ) : null}
        <div className="grid md:grid-cols-2 gap-6">
          {personas.map((persona, index) => (
            <Card key={index} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="text-muted-foreground" />
                  <Input
                    value={persona.name}
                    className="text-lg font-semibold border-none shadow-none focus-visible:ring-1 p-0 h-auto"
                    onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                    onBlur={() => onUpdate(personas)}
                    disabled={disabled}
                  />
                </div>
                <Input
                    value={persona.demographics}
                    className="text-sm text-muted-foreground border-none shadow-none focus-visible:ring-1 p-0 h-auto"
                    onChange={(e) => handleFieldChange(index, 'demographics', e.target.value)}
                    onBlur={() => onUpdate(personas)}
                    disabled={disabled}
                />
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Target className="text-muted-foreground" />
                    Goals
                  </Label>
                  <Textarea
                    value={persona.goals.join('\n')}
                    placeholder="List user goals, one per line."
                    className="font-mono text-sm"
                    onChange={(e) => handleArrayFieldChange(index, 'goals', e.target.value)}
                    disabled={disabled}
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <ThumbsDown className="text-muted-foreground" />
                    Frustrations
                  </Label>
                  <Textarea
                    value={persona.frustrations.join('\n')}
                    placeholder="List user frustrations, one per line."
                    className="font-mono text-sm"
                    onChange={(e) => handleArrayFieldChange(index, 'frustrations', e.target.value)}
                    disabled={disabled}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleRegenerateClick} disabled={isRegenerating || disabled}>
          {isRegenerating ? <Loader2 className="animate-spin" /> : <Sparkles />}
          Regenerate Personas
        </Button>
      </CardFooter>
    </Card>
  );
}
