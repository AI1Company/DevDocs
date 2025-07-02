"use client";

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SidebarProvider } from '@/components/ui/sidebar';
import { DocuCraftSidebar } from '@/components/docucraft-sidebar';
import { DocuCraftToolbar } from '@/components/docucraft-toolbar';
import { MetadataSection } from '@/components/docucraft-metadata-section';
import { MetadataWizard } from '@/components/metadata-wizard';
import { ContentSection, type Section } from '@/components/docucraft-content-section';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getProject, createProject, updateProject, Project, AppMetadata, RawSuggestions, ALL_POSSIBLE_SECTIONS, BrandingSettings } from '@/lib/projects';
import { suggestAppFeatures } from '@/ai/flows/suggest-app-features';
import { generateContentSection } from '@/ai/flows/generate-content-section';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { DocuCraftLogo } from './docucraft-logo';

export function DocuCraftClient({ projectId }: { projectId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [project, setProject] = React.useState<Project | null>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);

  const generateAndOrUpdateSections = React.useCallback(async (
    projectId: string,
    metadata: AppMetadata,
    sectionsToUpdate: string[],
    forceRegenerate: boolean
  ) => {
    const projectToUpdate = getProject(projectId);
    if (!projectToUpdate) return;
    
    const sections = projectToUpdate.sections ?? [];

    const updatedSectionsPromises = sections.map(async (section) => {
      // If section is in the list and we either force regeneration OR its content is empty
      if (sectionsToUpdate.includes(section.id) && (forceRegenerate || !section.content)) {
        try {
          const result = await generateContentSection({
            sectionName: section.title,
            appMetadata: JSON.stringify(metadata),
            action: 'fill_info',
            existingContent: '', // forceRegenerate will ignore existing content anyway
          });
          return { ...section, content: result.content };
        } catch (error) {
          console.error(`Failed to generate content for ${section.title}`, error);
          if (forceRegenerate) { // only show toast on manual regen
            toast({
              title: `Failed to regenerate ${section.title}`,
              variant: 'destructive'
            });
          }
          return section; // Return original on error
        }
      }
      return section;
    });

    const updatedSections = await Promise.all(updatedSectionsPromises);
    const updated = updateProject(projectId, { sections: updatedSections });
    if(updated) setProject(updated);
    return updated; // Return the updated project
  }, [toast]);

  React.useEffect(() => {
    if (projectId) {
      if (projectId === 'new') {
        setProject(null);
      } else {
        const existingProject = getProject(projectId);
        if (existingProject) {
          setProject(existingProject);
          const shouldGenerate = searchParams.get('generate') === 'true';
          if (shouldGenerate) {
            router.replace(`/project/${projectId}`, { scroll: false }); 
            generateAndOrUpdateSections(existingProject.id, existingProject.metadata, ['product-vision', 'overview'], false);
          }
        } else {
          toast({
            title: 'Project not found',
            description: 'The requested project does not exist.',
            variant: 'destructive'
          });
          router.push('/');
        }
      }
      setIsLoaded(true);
    }
  }, [projectId, router, toast, searchParams, generateAndOrUpdateSections]);

  // This effect applies the project's custom primary color
  React.useEffect(() => {
    const primaryColor = project?.branding?.primaryColor;
    if (primaryColor) {
      document.documentElement.style.setProperty('--primary', primaryColor);
      
      // Basic logic to decide foreground color based on lightness
      try {
        const lightness = parseInt(primaryColor.split(' ')[2], 10);
        if (lightness > 50) {
          document.documentElement.style.setProperty('--primary-foreground', '0 0% 10%'); // Dark text for light backgrounds
        } else {
          document.documentElement.style.setProperty('--primary-foreground', '0 0% 100%'); // Light text for dark backgrounds
        }
      } catch (e) {
        // Fallback if parsing fails
        document.documentElement.style.setProperty('--primary-foreground', '0 0% 100%');
      }

    } else {
      // Clean up when navigating away or no color is set
      document.documentElement.style.removeProperty('--primary');
      document.documentElement.style.removeProperty('--primary-foreground');
    }

    // Cleanup function to run when component unmounts or project changes
    return () => {
      document.documentElement.style.removeProperty('--primary');
      document.documentElement.style.removeProperty('--primary-foreground');
    };
  }, [project?.branding?.primaryColor]);

  const handleMetadataUpdate = (data: AppMetadata) => {
    if (project) {
        const updated = updateProject(project.id, { metadata: data });
        if(updated) setProject(updated);
    }
  };
  
  const handleBrandingUpdate = (branding: BrandingSettings) => {
    if (project) {
        const updated = updateProject(project.id, { branding });
        if(updated) setProject(updated);
    }
  };

  const handleSuggestionsUpdate = (suggestions: RawSuggestions) => {
    if (!project?.id) return;
    const updated = updateProject(project.id, {
        rawSuggestions: suggestions,
        featureSuggestions: suggestions.core, // Default to core features
    });
    if(updated) setProject(updated);
  };

  const handleSelectedFeaturesUpdate = (features: string[]) => {
    if (!project?.id) return;
    const updated = updateProject(project.id, { featureSuggestions: features });
    if(updated) setProject(updated);
  };

  const handleWizardSubmit = async (data: AppMetadata) => {
    try {
      const suggestions = await suggestAppFeatures(data);
      const newProject = createProject(data, suggestions);
      router.replace(`/project/${newProject.id}?generate=true`);
    } catch (error) {
      console.error('Error during project creation:', error);
      toast({
        title: 'Creation Failed',
        description: 'Could not create project. Please try again.',
        variant: 'destructive',
      });
      throw error; // Re-throw to allow wizard to stop its loading spinner
    }
  };

  const handleSectionUpdate = (id: string, content: string) => {
    if (!project?.id) return;
    const newSections = (project.sections ?? []).map((section) =>
      section.id === id ? { ...section, content } : section
    );
    const updated = updateProject(project.id, { sections: newSections });
    if(updated) setProject(updated);
  };

  const handleActiveSectionsUpdate = (newActiveIds: string[]) => {
    if (!project) return;

    const currentSections = project.sections ?? [];
    const newSections: Section[] = newActiveIds.map(id => {
        const existingSection = currentSections.find(s => s.id === id);
        if (existingSection) {
            return existingSection;
        }
        const sectionBlueprint = ALL_POSSIBLE_SECTIONS.find(s => s.id === id)!;
        return { ...sectionBlueprint, content: '' };
    });

    const updated = updateProject(project.id, { sections: newSections });
    if(updated) setProject(updated);
  };

  const handleRegenerateInitialSections = async () => {
    if (!project) return;

    toast({
        title: 'Generating sections...',
        description: 'AI is drafting your Product Vision and App Overview.',
    });

    const updatedProject = await generateAndOrUpdateSections(project.id, project.metadata, ['product-vision', 'overview'], true);

    if (updatedProject) {
      toast({
        title: 'Sections Regenerated!',
        description: 'Product Vision and App Overview have been updated.',
      });
    }
  };

  const metadata = project?.metadata ?? null;
  const sections = project?.sections ?? [];
  const rawSuggestions = project?.rawSuggestions ?? null;
  const selectedFeatures = project?.featureSuggestions ?? [];
  const branding = project?.branding ?? { logo: '', primaryColor: '' };


  if (!isLoaded) {
      return (
        <div className="p-6">
          <Skeleton className="h-10 w-1/4 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      )
  }

  if (!project && projectId === 'new') {
    return (
      <main className="flex w-full min-h-screen flex-col items-center justify-center bg-muted/40 p-4 gap-8">
        <DocuCraftLogo />
        <MetadataWizard onSubmit={handleWizardSubmit} />
      </main>
    );
  }

  return (
    <SidebarProvider>
      <DocuCraftSidebar contentSections={sections} />
      <SidebarInset className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
          <SidebarTrigger className="md:hidden" />
          <h1 className="text-lg font-semibold md:text-xl truncate">
            {project ? project.metadata.name : 'New Project'}
          </h1>
          <DocuCraftToolbar project={project} />
        </header>
        <ScrollArea className="flex-1">
          <main className="flex flex-1 flex-col gap-4 p-4 sm:gap-6 sm:p-6">
            <MetadataSection
              key={project?.id} // Add key to force re-render on project change
              initialData={metadata}
              branding={branding}
              onSubmit={handleMetadataUpdate}
              onBrandingUpdate={handleBrandingUpdate}
              onSuggestionsUpdate={handleSuggestionsUpdate}
              onSelectedFeaturesUpdate={handleSelectedFeaturesUpdate}
              onActiveSectionsUpdate={handleActiveSectionsUpdate}
              onRegenerate={handleRegenerateInitialSections}
              rawSuggestions={rawSuggestions}
              selectedFeatures={selectedFeatures}
              activeSections={sections}
              allPossibleSections={ALL_POSSIBLE_SECTIONS}
            />
            {sections.map((section) => (
              <ContentSection
                key={`${project?.id}-${section.id}`}
                id={section.id}
                title={section.title}
                initialContent={section.content}
                appMetadata={metadata}
                onUpdate={handleSectionUpdate}
                disabled={!project}
              />
            ))}
          </main>
        </ScrollArea>
      </SidebarInset>
    </SidebarProvider>
  );
}
