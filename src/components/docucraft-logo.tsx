import { FileText } from 'lucide-react';

export function DocuCraftLogo() {
  return (
    <div className="flex items-center gap-2">
      <FileText className="h-6 w-6 text-primary" />
      <span className="text-xl font-semibold text-primary">DocuCraft AI</span>
    </div>
  );
}
