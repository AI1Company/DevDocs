
"use client";

import * as React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import type { Project } from '@/lib/projects';
import { FileDown, FileText, FileCode, FileUp, Loader2 } from 'lucide-react';
import { saveAs } from 'file-saver';
import htmlToDocx from 'html-to-docx';

interface ExportDialogProps {
  project: Project | null;
  children: React.ReactNode;
}

export function ExportDialog({ project, children }: ExportDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState<string | null>(null);
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
  
  const getSanitizedFileName = (name: string) => {
    return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  }

  const handleExport = async (format: 'PDF' | 'DOCX' | 'Markdown') => {
    if (!project) return;
    setIsExporting(format);

    const fileName = getSanitizedFileName(project.metadata.name);
    const sectionsToExport = project.sections.filter(s => selectedSections.includes(s.id));

    try {
        if (format === 'Markdown') {
            let markdownContent = `# ${project.metadata.name}\n\n`;
            sectionsToExport.forEach(section => {
                markdownContent += `## ${section.title}\n\n${section.content}\n\n---\n\n`;
            });
            const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
            saveAs(blob, `${fileName}.md`);
        } else if (format === 'DOCX' || format === 'PDF') {
            const showdown = (await import('showdown')).default;
            const converter = new showdown.Converter({
                tables: true,
                strikethrough: true,
                tasklists: true,
                simpleLineBreaks: true,
            });

            let htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${project.metadata.name}</title>
                    <meta charset="UTF-8">
                     <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.6; }
                        h1, h2, h3 { color: #333; }
                        img { max-width: 100px; max-height: 100px; margin-bottom: 1rem;}
                        hr { border: 0; border-top: 1px solid #ccc; margin: 2rem 0; }
                        h2 { page-break-before: always; }
                        table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; }
                        blockquote { border-left: 4px solid #ccc; padding-left: 1rem; margin-left: 0; color: #666; }
                        pre { background-color: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; white-space: pre-wrap; word-wrap: break-word; }
                        code { font-family: 'Courier New', Courier, monospace; }
                    </style>
                </head>
                <body>
                    ${project.branding?.logo ? `<img src="${project.branding.logo}" alt="Project Logo" />` : ''}
                    <h1>${project.metadata.name}</h1>
            `;
            sectionsToExport.forEach(section => {
                htmlContent += `<hr><h2>${section.title}</h2>${converter.makeHtml(section.content)}`;
            });
            htmlContent += '</body></html>';

            if (format === 'DOCX') {
                const docxBlob = await htmlToDocx(htmlContent, undefined, {
                    margins: { top: 720, bottom: 720, left: 720, right: 720 },
                });
                saveAs(docxBlob, `${fileName}.docx`);
            } else if (format === 'PDF') {
                const iframe = document.createElement('iframe');
                iframe.style.position = 'absolute';
                iframe.style.width = '0';
                iframe.style.height = '0';
                iframe.style.border = 'none';
                document.body.appendChild(iframe);

                iframe.contentDocument!.write(htmlContent);
                iframe.contentDocument!.close();
                
                const printPromise = new Promise<void>(resolve => {
                    const timer = setTimeout(() => resolve(), 2000); // Failsafe
                    if (iframe.contentWindow) {
                        iframe.contentWindow.onafterprint = () => {
                            clearTimeout(timer);
                            resolve();
                        };
                        iframe.contentWindow.focus();
                        iframe.contentWindow.print();
                    } else {
                        resolve();
                    }
                });
                
                await printPromise;
                document.body.removeChild(iframe);
            }
        }
        toast({
            title: 'Export Successful',
            description: `Your project has been exported as a ${format} file.`,
        });
    } catch (error) {
        console.error(`Error exporting to ${format}:`, error);
        toast({
            title: 'Export Failed',
            description: `There was an error while exporting to ${format}.`,
            variant: 'destructive',
        });
    } finally {
        setIsExporting(null);
        if (format !== 'PDF') { // Don't close for PDF, as it can interrupt the print dialog
           setOpen(false);
        }
    }
  };

  const isExportDisabled = !project || selectedSections.length === 0 || !!isExporting;

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
                {isExporting === 'PDF' ? <Loader2 className="animate-spin" /> : <FileDown />} Export PDF
            </Button>
            <Button variant="outline" onClick={() => handleExport('DOCX')} disabled={isExportDisabled}>
                {isExporting === 'DOCX' ? <Loader2 className="animate-spin" /> : <FileText />} Export DOCX
            </Button>
            <Button variant="outline" onClick={() => handleExport('Markdown')} disabled={isExportDisabled}>
                {isExporting === 'Markdown' ? <Loader2 className="animate-spin" /> : <FileCode />} Export Markdown
            </Button>
            <Button variant="outline" onClick={() => {}} disabled>
                <FileUp /> Send to Google Docs
            </Button>
            <Button variant="outline" onClick={() => {}} disabled>
                <FileUp /> Upload to Google Drive
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
