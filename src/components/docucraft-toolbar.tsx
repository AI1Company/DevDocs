import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BookUser, ChevronDown, File, FileCode, FileDown, Trello } from 'lucide-react';

export function DocuCraftToolbar() {
  return (
    <div className="ml-auto flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            Export
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <FileDown className="mr-2" />
            Export to PDF
          </DropdownMenuItem>
          <DropdownMenuItem>
            <File className="mr-2" />
            Export to DOCX
          </DropdownMenuItem>
          <DropdownMenuItem>
            <FileCode className="mr-2" />
            Export to Google Docs
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Trello className="mr-2" />
            Export to Trello
          </DropdownMenuItem>
          <DropdownMenuItem>
            <BookUser className="mr-2" />
            Export to Notion
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
