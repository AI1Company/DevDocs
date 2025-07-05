"use client";

import * as React from "react";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import {
  getProjects,
  deleteProject,
  renameProject,
  migrateFromLocalStorage,
  Project,
} from "@/lib/projects-db";
import { ProjectCard } from "./project-card";
import { Button } from "@/components/ui/button";
import { DocuCraftLogo } from "./docucraft-logo";
import { ThemeToggle } from "./theme-toggle";
import { UserAuthButton } from "./user-auth-button";
import { useUser } from "@stackframe/stack";

export function ProjectDashboard() {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(true);
  const user = useUser();

  React.useEffect(() => {
    // Load projects from database and migrate localStorage data if needed
    const loadProjects = async () => {
      try {
        // First try to migrate any existing localStorage data
        await migrateFromLocalStorage();

        // Then load from database
        const dbProjects = await getProjects(user?.id);
        setProjects(dbProjects);
      } catch (error) {
        console.error("Error loading projects:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  const handleRenameProject = async (id: string, newName: string) => {
    try {
      await renameProject(id, newName);
      const updatedProjects = await getProjects();
      setProjects(updatedProjects); // Refresh list
    } catch (error) {
      console.error("Error renaming project:", error);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await deleteProject(id);
      const updatedProjects = await getProjects();
      setProjects(updatedProjects); // Refresh list
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
        <DocuCraftLogo />
        <div className="ml-auto flex items-center gap-4">
          <ThemeToggle />
          <UserAuthButton />
          {user && (
            <Button asChild>
              <Link href="/project/new">
                <PlusCircle className="h-4 w-4" />
                Create New Project
              </Link>
            </Button>
          )}
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">Your Projects</h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Loading projects...</div>
          </div>
        ) : projects.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onRename={handleRenameProject}
                onDelete={handleDeleteProject}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm py-12">
            <div className="flex flex-col items-center gap-1 text-center">
              <h3 className="text-2xl font-bold tracking-tight">
                No projects yet
              </h3>
              <p className="text-sm text-muted-foreground">
                Get started by creating a new project.
              </p>
              <Button className="mt-4" asChild>
                <Link href="/project/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create New Project
                </Link>
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
