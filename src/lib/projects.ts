'use client';

import type { Section } from '@/components/docucraft-content-section';

export type AppMetadata = {
  name: string;
  description: string;
  industry: string;
  targetUsers: string;
  platform: 'Web' | 'Mobile' | 'SaaS' | 'Desktop';
};

export type RawSuggestions = {
  core: string[];
  optional: string[];
};

export type ProjectStatus = 'In Progress' | 'Completed';

export type BrandingSettings = {
  logo?: string; // data URL
  primaryColor?: string; // HSL string e.g., "262 52% 50%"
};

export interface Project {
  id: string;
  metadata: AppMetadata;
  sections: Section[];
  featureSuggestions: string[]; // This will hold the SELECTED features.
  rawSuggestions?: RawSuggestions;
  status: ProjectStatus;
  createdAt: string;
  lastModified: string;
  branding?: BrandingSettings;
}

export const ALL_POSSIBLE_SECTIONS: Omit<Section, 'content'>[] = [
    { id: 'product-vision', title: 'Product Vision' },
    { id: 'overview', title: 'App Overview' },
    { id: 'personas', title: 'User Personas' },
    { id: 'ui-ux-specs', title: 'UI/UX Specs' },
    { id: 'user-flows', title: 'User Flows' },
    { id: 'feature-list', title: 'Feature List' },
    { id: 'architecture', title: 'Technical Architecture' },
    { id: 'db-schema', title: 'DB Schema' },
    { id: 'api-endpoints', title: 'API Endpoints' },
    { id: 'security', title: 'Security' },
    { id: 'monetization', title: 'Monetization' },
    { id: 'marketing', title: 'Marketing Plan' },
    { id: 'deployment', title: 'Deployment Plan' },
];

const DEFAULT_SECTION_IDS = ['product-vision', 'overview', 'feature-list', 'ui-ux-specs', 'architecture', 'api-endpoints', 'deployment'];


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

export const createProject = (metadata: AppMetadata, suggestions: RawSuggestions): Project => {
  const projects = getProjectsFromStorage();
  const now = new Date().toISOString();
  
  const initialSections: Section[] = ALL_POSSIBLE_SECTIONS
    .filter(section => DEFAULT_SECTION_IDS.includes(section.id))
    .map(section => ({
        ...section,
        content: '',
    }));

  const newProject: Project = {
    id: `proj_${Date.now()}`,
    metadata,
    sections: initialSections,
    rawSuggestions: suggestions,
    featureSuggestions: suggestions.core, // Default to selecting all core features
    status: 'In Progress',
    createdAt: now,
    lastModified: now,
    branding: {
        logo: '',
        primaryColor: ''
    }
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
