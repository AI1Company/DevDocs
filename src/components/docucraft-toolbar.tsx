
import { Button } from '@/components/ui/button';
import { ExportDialog } from './export-dialog';
import type { Project } from '@/lib/projects';
import { Download } from 'lucide-react';
import { CollaborationFeatures } from './collaboration-features';
import Image from 'next/image';

export function DocuCraftToolbar({ project }: { project: Project | null }) {
  const logo = project?.branding?.logo;
  return (
    <div className="ml-auto flex items-center gap-4">
      {logo && (
        <Image
          src={logo}
          alt="Project Logo"
          width={32}
          height={32}
          className="h-8 w-8 rounded-md object-contain"
        />
      )}
      <CollaborationFeatures />
      <ExportDialog project={project}>
        <Button variant="outline">
          <Download />
          Export
        </Button>
      </ExportDialog>
    </div>
  );
}
