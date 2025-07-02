import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { DocuCraftLogo } from './docucraft-logo';
import { Cpu, ListChecks, Settings, Code2 } from 'lucide-react';

const sections = [
  { id: 'metadata', title: 'Project Setup', icon: Settings },
  { id: 'features', title: 'AI Suggestions', icon: ListChecks },
  { id: 'feature-list', title: 'Feature List', icon: ListChecks },
  { id: 'tech-stack', title: 'Tech Stack', icon: Cpu },
  { id: 'api-design', title: 'API Design', icon: Code2 },
];

export function DocuCraftSidebar() {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <DocuCraftLogo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {sections.map((section) => (
            <SidebarMenuItem key={section.id}>
              <SidebarMenuButton
                onClick={() => scrollToSection(section.id)}
                className="w-full justify-start"
                variant="ghost"
              >
                <section.icon className="h-4 w-4" />
                <span>{section.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
