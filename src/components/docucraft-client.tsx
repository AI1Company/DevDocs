"use client";

import * as React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { DocuCraftSidebar } from '@/components/docucraft-sidebar';
import { DocuCraftToolbar } from '@/components/docucraft-toolbar';
import { MetadataSection } from '@/components/docucraft-metadata-section';
import { ContentSection, type Section } from '@/components/docucraft-content-section';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';

export type AppMetadata = {
  name: string;
  description: string;
  industry: string;
};

export function DocuCraftClient() {
  const [metadata, setMetadata] = React.useState<AppMetadata | null>(null);
  const [featureSuggestions, setFeatureSuggestions] = React.useState<string[]>([]);
  const [sections, setSections] = React.useState<Section[]>([
    { id: 'feature-list', title: 'Feature List', content: '' },
    { id: 'tech-stack', title: 'Tech Stack', content: '' },
    { id: 'api-design', title: 'API Design', content: '' },
  ]);

  const handleMetadataSubmit = (data: AppMetadata) => {
    setMetadata(data);
  };

  const handleSuggestions = (suggestions: string[]) => {
    setFeatureSuggestions(suggestions);
  };

  const handleSectionUpdate = (id: string, content: string) => {
    setSections((prevSections) =>
      prevSections.map((section) =>
        section.id === id ? { ...section, content } : section
      )
    );
  };

  return (
    <SidebarProvider>
      <DocuCraftSidebar />
      <SidebarInset className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
          <SidebarTrigger className="md:hidden" />
          <h1 className="text-lg font-semibold md:text-xl">Document Editor</h1>
          <DocuCraftToolbar />
        </header>
        <ScrollArea className="flex-1">
          <main className="flex flex-1 flex-col gap-4 p-4 sm:gap-6 sm:p-6">
            <MetadataSection
              onSubmit={handleMetadataSubmit}
              onSuggestions={handleSuggestions}
              suggestions={featureSuggestions}
            />
            {sections.map((section) => (
              <ContentSection
                key={section.id}
                id={section.id}
                title={section.title}
                initialContent={section.content}
                appMetadata={metadata}
                onUpdate={handleSectionUpdate}
              />
            ))}
          </main>
        </ScrollArea>
      </SidebarInset>
    </SidebarProvider>
  );
}
