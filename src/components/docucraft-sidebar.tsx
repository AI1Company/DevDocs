import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { DocuCraftLogo } from "./docucraft-logo";
import {
  Settings,
  Lightbulb,
  FileText,
  Users,
  Palette,
  Waypoints,
  ListChecks,
  Network,
  Database,
  Code2,
  Shield,
  DollarSign,
  Megaphone,
  CloudUpload,
  ClipboardList,
  ArrowLeft,
  Eye,
} from "lucide-react";
import Link from "next/link";
import type { Section } from "./docucraft-content-section";
import * as React from "react";

const staticSections = [
  { id: "metadata", title: "Project Setup", icon: Settings },
  { id: "structure", title: "Document Structure", icon: ListChecks },
  { id: "features", title: "AI Suggestions", icon: Lightbulb },
];

const sectionIcons: Record<string, React.ElementType> = {
  "product-vision": Eye,
  overview: FileText,
  personas: Users,
  "ui-ux-specs": Palette,
  "user-flows": Waypoints,
  "feature-list": ListChecks,
  architecture: Network,
  "db-schema": Database,
  "api-endpoints": Code2,
  security: Shield,
  monetization: DollarSign,
  marketing: Megaphone,
  deployment: CloudUpload,
  default: ClipboardList,
};

export function DocuCraftSidebar({
  contentSections,
}: {
  contentSections: Section[];
}) {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <DocuCraftLogo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {staticSections.map((section) => (
            <SidebarMenuItem key={section.id}>
              <SidebarMenuButton
                onClick={() => scrollToSection(section.id)}
                className="w-full justify-start"
                variant="default"
              >
                <section.icon className="h-4 w-4" />
                <span>{section.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <SidebarSeparator />
          {contentSections.map((section) => {
            const Icon = sectionIcons[section.id] || sectionIcons.default;
            return (
              <SidebarMenuItem key={section.id}>
                <SidebarMenuButton
                  onClick={() => scrollToSection(section.id)}
                  className="w-full justify-start"
                  variant="default"
                >
                  <Icon className="h-4 w-4" />
                  <span>{section.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild variant="default">
              <Link href="/">
                <ArrowLeft />
                <span>Back to Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
