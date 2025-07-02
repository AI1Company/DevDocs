import { Button } from '@/components/ui/button';
import { ExportDialog } from './export-dialog';
import type { Project } from '@/lib/projects';
import { Download } from 'lucide-react';

export function DocuCraftToolbar({ project }: { project: Project | null }) {
  return (
    <div className="ml-auto flex items-center gap-2">
      <ExportDialog project={project}>
        <Button variant="outline">
          <Download />
          Export
        </Button>
      </ExportDialog>
    </div>
  );
}
