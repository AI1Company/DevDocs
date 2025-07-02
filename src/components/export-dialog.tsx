"use client";

import * as React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import type { Project } from '@/lib/projects';
import { FileDown, FileText, FileCode, FileUp } from 'lucide-react';

interface ExportDialogProps {
  project: Project | null;
  children: React.ReactNode;
}

export function ExportDialog({ project, children }: ExportDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  
  const [selectedSections, setSelectedSections] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (project?.sections) {
      setSelectedSections(project.sections.map(s => s.id));
    }
  }, [project, open]);

  const handleToggleSection = (sectionId: string, isChecked: boolean) => {
    setSelectedSections(prev => 
      isChecked ? [...prev, sectionId] : prev.filter(id => id !== sectionId)
    );
  };
  
  const handleExport = (format: string) => {
    toast({
        title: 'Export Initiated',
        description: `Exporting to ${format} is not yet fully implemented.`,
    });
    console.log('Exporting to', format, 'with sections:', selectedSections);
    setOpen(false);
  };

  const isExportDisabled = !project || selectedSections.length === 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild disabled={!project}>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Document</DialogTitle>
          <DialogDescription>
            Select the sections you want to include in your export.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-60 pr-4">
            <div className="space-y-2">
                {project?.sections.map(section => (
                    <div key={section.id} className="flex items-center space-x-2">
                        <Checkbox
                            id={`export-${section.id}`}
                            checked={selectedSections.includes(section.id)}
                            onCheckedChange={(checked) => handleToggleSection(section.id, !!checked)}
                        />
                        <Label htmlFor={`export-${section.id}`} className="font-normal">{section.title}</Label>
                    </div>
                ))}
                {project?.sections.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No sections to export.</p>}
            </div>
        </ScrollArea>

        <DialogFooter className="grid grid-cols-2 sm:grid-cols-none sm:flex sm:flex-wrap sm:justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => handleExport('PDF')} disabled={isExportDisabled}>
                <FileDown /> Export PDF
            </Button>
            <Button variant="outline" onClick={() => handleExport('DOCX')} disabled={isExportDisabled}>
                <FileText /> Export DOCX
            </Button>
            <Button variant="outline" onClick={() => handleExport('Markdown')} disabled={isExportDisabled}>
                <FileCode /> Export Markdown
            </Button>
            <Button variant="outline" onClick={() => handleExport('Google Docs')} disabled>
                <FileUp /> Send to Google Docs
            </Button>
            <Button variant="outline" onClick={() => handleExport('Google Drive')} disabled>
                <FileUp /> Upload to Google Drive
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
