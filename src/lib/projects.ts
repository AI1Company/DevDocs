'use client';

import type { Section } from '@/components/docucraft-content-section';

export type AppMetadata = {
  name: string;
  description: string;
  industry: string;
  targetUsers: string;
  platform: 'Web' | 'Mobile' | 'SaaS' | 'Desktop';
};

export type ProjectStatus = 'In Progress' | 'Completed';

export interface Project {
  id: string;
  metadata: AppMetadata;
  sections: Section[];
  featureSuggestions: string[];
  status: ProjectStatus;
  createdAt: string;
  lastModified: string;
}

const getProjectsFromStorage = (): Project[] => {
  if (typeof window === 'undefined') return [];
  const projectsJson = localStorage.getItem('docuCraftProjects');
  return projectsJson ? JSON.parse(projectsJson) : [];
};

const saveProjectsToStorage = (projects: Project[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('docuCraftProjects', JSON.stringify(projects));
};

export const getProjects = (): Project[] => {
  return getProjectsFromStorage();
};

export const getProject = (id: string): Project | undefined => {
  const projects = getProjectsFromStorage();
  return projects.find((p) => p.id === id);
};

export const createProject = (metadata: AppMetadata, suggestions: string[] = []): Project => {
  const projects = getProjectsFromStorage();
  const now = new Date().toISOString();
  const newProject: Project = {
    id: `proj_${Date.now()}`,
    metadata,
    sections: [
        { id: 'prd', title: 'Product Requirements Document', content: '' },
        { id: 'ui-ux-specs', title: 'UI/UX Specs', content: '' },
        { id: 'user-flows', title: 'User Flows', content: '' },
        { id: 'feature-list', title: 'Feature List', content: '' },
        { id: 'tech-stack', title: 'Precise Tech Stack', content: '' },
        { id: 'api-design', title: 'API Design', content: '' },
    ],
    featureSuggestions: suggestions,
    status: 'In Progress',
    createdAt: now,
    lastModified: now,
  };
  const updatedProjects = [...projects, newProject];
  saveProjectsToStorage(updatedProjects);
  return newProject;
};

export const updateProject = (id: string, data: Partial<Omit<Project, 'id' | 'createdAt'>>): Project | undefined => {
    const projects = getProjectsFromStorage();
    const projectIndex = projects.findIndex((p) => p.id === id);
    if (projectIndex === -1) return undefined;
    
    const updatedProject = {
        ...projects[projectIndex],
        ...data,
        lastModified: new Date().toISOString(),
    };
    
    projects[projectIndex] = updatedProject;
    saveProjectsToStorage(projects);
    return updatedProject;
};

export const deleteProject = (id: string): void => {
  let projects = getProjectsFromStorage();
  projects = projects.filter((p) => p.id !== id);
  saveProjectsToStorage(projects);
};

export const renameProject = (id: string, newName: string): void => {
    const projects = getProjectsFromStorage();
    const projectIndex = projects.findIndex((p) => p.id === id);
    if (projectIndex !== -1) {
        projects[projectIndex].metadata.name = newName;
        projects[projectIndex].lastModified = new Date().toISOString();
        saveProjectsToStorage(projects);
    }
};
