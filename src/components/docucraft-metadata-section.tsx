"use client";

import * as React from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { suggestAppFeatures } from '@/ai/flows/suggest-app-features';
import type { AppMetadata, RawSuggestions, BrandingSettings } from '@/lib/projects';
import type { Section } from './docucraft-content-section';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Lightbulb, Loader2, Plus, X, UploadCloud, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';


const metadataSchema = z.object({
  name: z.string().min(2, 'App name must be at least 2 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  industry: z.string().min(2, 'Industry must be at least 2 characters.'),
  targetUsers: z.string().min(10, 'Target users description must be at least 10 characters.'),
  platform: z.enum(['Web', 'Mobile', 'SaaS', 'Desktop']),
});

// Predefined color swatches in HSL string format ("H S% L%")
const colorSwatches = [
  { name: 'Default', value: '262 52% 50%' },
  { name: 'Red', value: '0 72% 51%' },
  { name: 'Orange', value: '25 95% 53%' },
  { name: 'Green', value: '142 76% 36%' },
  { name: 'Blue', value: '221 83% 53%' },
  { name: 'Slate', value: '215 28% 17%' },
];

type MetadataFormProps = {
  initialData: AppMetadata | null;
  branding: BrandingSettings;
  onSubmit: (data: AppMetadata) => void;
  onBrandingUpdate: (data: BrandingSettings) => void;
  onSuggestionsUpdate: (suggestions: RawSuggestions) => void;
  onSelectedFeaturesUpdate: (features: string[]) => void;
  onActiveSectionsUpdate: (sectionIds: string[]) => void;
  onRegenerate: () => Promise<void>;
  rawSuggestions: RawSuggestions | null;
  selectedFeatures: string[];
  activeSections: Section[];
  allPossibleSections: Omit<Section, 'content'>[];
};

function FeatureCheckbox({ feature, isChecked, onToggle, idPrefix }: { feature: string; isChecked: boolean; onToggle: (checked: boolean) => void; idPrefix?: string }) {
  const id = `${idPrefix}-${feature.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted">
      <Checkbox id={id} checked={isChecked} onCheckedChange={onToggle} />
      <Label htmlFor={id} className="font-normal cursor-pointer flex-1">{feature}</Label>
    </div>
  );
}

export function MetadataSection({
  initialData,
  branding,
  onSubmit,
  onBrandingUpdate,
  onSuggestionsUpdate,
  onSelectedFeaturesUpdate,
  onActiveSectionsUpdate,
  onRegenerate,
  rawSuggestions,
  selectedFeatures,
  activeSections,
  allPossibleSections
}: MetadataFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isRegenerating, setIsRegenerating] = React.useState(false);
  const [customFeatureInput, setCustomFeatureInput] = React.useState('');
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
      onSuggestionsUpdate(result);
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

  const handleRegenerateClick = async () => {
    setIsRegenerating(true);
    try {
      await onRegenerate();
    } finally {
      setIsRegenerating(false);
    }
  };
  
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onBrandingUpdate({ ...branding, logo: reader.result as string });
        toast({ title: "Logo updated!" });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleColorSelect = (color: string) => {
    const newColor = branding.primaryColor === color ? '' : color; // Unset if same color is clicked
    onBrandingUpdate({ ...branding, primaryColor: newColor });
  };


  const handleFeatureToggle = (feature: string, isChecked: boolean) => {
    const newSelected = isChecked
      ? [...selectedFeatures, feature]
      : selectedFeatures.filter((f) => f !== feature);
    onSelectedFeaturesUpdate(newSelected);
  };

  const handleAddCustomFeature = () => {
    const trimmedInput = customFeatureInput.trim();
    if (trimmedInput && !selectedFeatures.includes(trimmedInput)) {
      onSelectedFeaturesUpdate([...selectedFeatures, trimmedInput]);
      setCustomFeatureInput('');
    }
  };

  const handleRemoveCustomFeature = (feature: string) => {
    onSelectedFeaturesUpdate(selectedFeatures.filter((f) => f !== feature));
  };

  const handleSectionToggle = (sectionId: string, isChecked: boolean) => {
    const activeSectionIds = activeSections.map(s => s.id);
    const newActiveIds = isChecked
      ? [...activeSectionIds, sectionId]
      : activeSectionIds.filter(id => id !== sectionId);
    onActiveSectionsUpdate(newActiveIds);
  };
  
  const allAISuggestions = React.useMemo(() => [
    ...(rawSuggestions?.core ?? []),
    ...(rawSuggestions?.optional ?? [])
  ], [rawSuggestions]);

  const customFeatures = selectedFeatures.filter(f => !allAISuggestions.includes(f));
  const activeSectionIds = React.useMemo(() => activeSections.map(s => s.id), [activeSections]);

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
              <div className="flex flex-wrap items-center gap-2">
                <Button type="submit" disabled={isLoading || isRegenerating}>
                  {isLoading ? <Loader2 className="animate-spin" /> : <Lightbulb />}
                  <span>{isLoading ? 'Re-analyzing...' : 'Update & Re-suggest Features'}</span>
                </Button>
                <Button type="button" variant="outline" onClick={handleRegenerateClick} disabled={isLoading || isRegenerating}>
                  {isRegenerating ? <Loader2 className="animate-spin" /> : <Sparkles />}
                  <span>Regenerate Initial Content</span>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card id="branding">
        <CardHeader>
          <CardTitle>Branding & Appearance</CardTitle>
          <CardDescription>Customize the look of your project and exports.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="logo-upload">Project Logo</Label>
            <div className="flex items-center gap-4 mt-2">
              <div className="w-20 h-20 rounded-md border border-dashed flex items-center justify-center bg-muted">
                {branding.logo ? (
                  <Image src={branding.logo} alt="Project Logo" width={80} height={80} className="object-contain rounded-md" />
                ) : (
                  <UploadCloud className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <Input id="logo-upload" type="file" accept="image/png, image/jpeg, image/svg+xml" onChange={handleLogoUpload} className="max-w-xs" />
                <p className="text-xs text-muted-foreground mt-1">Recommended: Square image (PNG, JPG, SVG).</p>
              </div>
            </div>
          </div>
          <div>
            <Label>Primary Color</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {colorSwatches.map((swatch) => (
                <button
                  key={swatch.name}
                  title={swatch.name}
                  onClick={() => handleColorSelect(swatch.value)}
                  className={cn(
                    "h-8 w-8 rounded-full border-2 transition-transform",
                    branding.primaryColor === swatch.value ? 'border-ring scale-110' : 'border-muted hover:border-muted-foreground/50'
                  )}
                  style={{ backgroundColor: `hsl(${swatch.value})` }}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card id="structure">
        <CardHeader>
          <CardTitle>Document Structure</CardTitle>
          <CardDescription>Select the sections to include in your project documentation.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2">
            {allPossibleSections.map((section) => (
              <FeatureCheckbox
                key={section.id}
                idPrefix={`section-${section.id}`}
                feature={section.title}
                isChecked={activeSectionIds.includes(section.id)}
                onToggle={(checked) => handleSectionToggle(section.id, !!checked)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {rawSuggestions && (
        <Card id="features">
          <CardHeader>
            <CardTitle>AI-Suggested Features</CardTitle>
            <CardDescription>Select the features to include. The full list of selected features will be available in the "Feature List" section.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Core Features</h3>
              <CardDescription>Essential features for your application. These are selected by default.</CardDescription>
              <div className="grid md:grid-cols-2 gap-x-4 gap-y-2 mt-4">
                {rawSuggestions.core.map((feature) => (
                  <FeatureCheckbox
                    key={feature}
                    idPrefix="feature"
                    feature={feature}
                    isChecked={selectedFeatures.includes(feature)}
                    onToggle={(checked) => handleFeatureToggle(feature, !!checked)}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Optional Features</h3>
              <CardDescription>Nice-to-have features that could enhance your app.</CardDescription>
              <div className="grid md:grid-cols-2 gap-x-4 gap-y-2 mt-4">
                {rawSuggestions.optional.map((feature) => (
                  <FeatureCheckbox
                    key={feature}
                    idPrefix="feature"
                    feature={feature}
                    isChecked={selectedFeatures.includes(feature)}
                    onToggle={(checked) => handleFeatureToggle(feature, !!checked)}
                  />
                ))}
              </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-2">Custom Features</h3>
                <CardDescription>Manually added features for your project.</CardDescription>
                <div className="space-y-2 mt-4">
                    {customFeatures.map((feature) => (
                        <div key={feature} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                            <Label className="font-normal">{feature}</Label>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRemoveCustomFeature(feature)}>
                                <X className="h-4 w-4" />
                                <span className="sr-only">Remove feature</span>
                            </Button>
                        </div>
                    ))}
                    {customFeatures.length === 0 && <p className="text-sm text-muted-foreground pt-2">No custom features added yet.</p>}
                </div>
                <div className="flex items-center gap-2 mt-4">
                    <Input
                        placeholder="Add a custom feature..."
                        value={customFeatureInput}
                        onChange={(e) => setCustomFeatureInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomFeature(); } }}
                    />
                    <Button onClick={handleAddCustomFeature} type="button">
                        <Plus /> Add Feature
                    </Button>
                </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
