"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { SidebarProvider } from '@/components/ui/sidebar';
import { DocuCraftSidebar } from '@/components/docucraft-sidebar';
import { DocuCraftToolbar } from '@/components/docucraft-toolbar';
import { MetadataSection } from '@/components/docucraft-metadata-section';
import { ContentSection, type Section } from '@/components/docucraft-content-section';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getProject, createProject, updateProject, Project } from '@/lib/projects';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export type AppMetadata = {
  name: string;
  description: string;
  industry: string;
};

const defaultSections: Section[] = [
    { id: 'prd', title: 'Product Requirements Document', content: '' },
    { id: 'ui-ux-specs', title: 'UI/UX Specs', content: '' },
    { id: 'user-flows', title: 'User Flows', content: '' },
    { id: 'feature-list', title: 'Feature List', content: '' },
    { id: 'tech-stack', title: 'Precise Tech Stack', content: '' },
    { id: 'api-design', title: 'API Design', content: '' },
];


export function DocuCraftClient({ projectId }: { projectId: string }) {
  const router = useRouter();
  const { toast } = useToast();

  const [project, setProject] = React.useState<Project | null>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    if (projectId) {
      if (projectId === 'new') {
        setProject(null);
      } else {
        const existingProject = getProject(projectId);
        if (existingProject) {
          setProject(existingProject);
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
  }, [projectId, router, toast]);

  const handleMetadataSubmit = (data: AppMetadata) => {
    if (project) {
        // Update existing project
        const updated = updateProject(project.id, { metadata: data });
        if(updated) setProject(updated);
    } else {
        // Create new project
        const newProject = createProject(data);
        setProject(newProject);
        // Redirect to the new project's URL
        router.replace(`/project/${newProject.id}`);
    }
  };

  const handleSuggestions = (suggestions: string[]) => {
    if (!project?.id) return;
    const updated = updateProject(project.id, { featureSuggestions: suggestions });
    if(updated) setProject(updated);
  };

  const handleSectionUpdate = (id: string, content: string) => {
    if (!project?.id) return;
    const newSections = project.sections.map((section) =>
      section.id === id ? { ...section, content } : section
    );
    const updated = updateProject(project.id, { sections: newSections });
    if(updated) setProject(updated);
  };

  const metadata = project?.metadata ?? null;
  const sections = project?.sections ?? (projectId === 'new' ? defaultSections : []);
  const featureSuggestions = project?.featureSuggestions ?? [];

  if (!isLoaded) {
      return (
        <div className="p-6">
          <Skeleton className="h-10 w-1/4 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      )
  }

  return (
    <SidebarProvider>
      <DocuCraftSidebar />
      <SidebarInset className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
          <SidebarTrigger className="md:hidden" />
          <h1 className="text-lg font-semibold md:text-xl truncate">
            {project ? project.metadata.name : 'New Project'}
          </h1>
          <DocuCraftToolbar />
        </header>
        <ScrollArea className="flex-1">
          <main className="flex flex-1 flex-col gap-4 p-4 sm:gap-6 sm:p-6">
            <MetadataSection
              key={project?.id} // Add key to force re-render on project change
              initialData={metadata}
              onSubmit={handleMetadataSubmit}
              onSuggestions={handleSuggestions}
              suggestions={featureSuggestions}
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
