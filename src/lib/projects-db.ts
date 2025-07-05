"use client";

import { sql } from "./database";
import type { Section } from "@/components/docucraft-content-section";
import type { Persona } from "@/ai/flows/generate-personas";

export type { Persona };

export type AppMetadata = {
  name: string;
  description: string;
  industry: string;
  targetUsers: string;
  platform: "Web" | "Mobile" | "SaaS" | "Desktop";
};

export type RawSuggestions = {
  core: string[];
  optional: string[];
};

export type ProjectStatus = "In Progress" | "Completed";

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
  personas: Persona[];
  status: ProjectStatus;
  createdAt: string;
  lastModified: string;
  branding?: BrandingSettings;
}

export const ALL_POSSIBLE_SECTIONS: Omit<Section, "content">[] = [
  { id: "product-vision", title: "Product Vision" },
  { id: "overview", title: "App Overview" },
  { id: "personas", title: "User Personas" },
  { id: "ui-ux-specs", title: "UI/UX Specs" },
  { id: "user-flows", title: "User Flows" },
  { id: "feature-list", title: "Feature List" },
  { id: "architecture", title: "Technical Architecture" },
  { id: "db-schema", title: "DB Schema" },
  { id: "api-endpoints", title: "API Endpoints" },
  { id: "security", title: "Security" },
  { id: "monetization", title: "Monetization" },
  { id: "marketing", title: "Marketing Plan" },
  { id: "deployment", title: "Deployment Plan" },
];

const DEFAULT_SECTION_IDS = [
  "product-vision",
  "overview",
  "personas",
  "feature-list",
  "ui-ux-specs",
  "architecture",
  "api-endpoints",
  "deployment",
];

export const getProjects = async (userId?: string): Promise<Project[]> => {
  try {
    const projects = userId
      ? await sql`
          SELECT * FROM projects
          WHERE user_id = ${userId}
          ORDER BY last_modified DESC
        `
      : await sql`
          SELECT * FROM projects
          WHERE user_id IS NULL
          ORDER BY last_modified DESC
        `;

    const result: Project[] = [];

    for (const project of projects) {
      // Get sections
      const sections = await sql`
        SELECT section_id as id, title, content
        FROM sections
        WHERE project_id = ${project.id}
        ORDER BY section_id
      `;

      // Get personas
      const personas = await sql`
        SELECT name, age_range as demographics, goals, pain_points as frustrations
        FROM personas
        WHERE project_id = ${project.id}
      `;

      // Get features
      const features = await sql`
        SELECT feature_text, is_core, is_selected
        FROM feature_suggestions
        WHERE project_id = ${project.id}
        ORDER BY is_core DESC, feature_text
      `;

      const selectedFeatures = features
        .filter((f) => f.is_selected)
        .map((f) => f.feature_text);

      const rawSuggestions = {
        core: features.filter((f) => f.is_core).map((f) => f.feature_text),
        optional: features.filter((f) => !f.is_core).map((f) => f.feature_text),
      };

      result.push({
        id: project.id,
        metadata: {
          name: project.name,
          description: project.description || "",
          industry: project.industry || "",
          targetUsers: project.target_users || "",
          platform: project.platform,
        },
        sections: sections as Section[],
        featureSuggestions: selectedFeatures,
        rawSuggestions,
        personas: personas.map((p) => ({
          name: p.name,
          demographics: p.demographics || "",
          goals: p.goals ? JSON.parse(p.goals) : [],
          frustrations: p.frustrations ? JSON.parse(p.frustrations) : [],
        })),
        status: project.status,
        createdAt: project.created_at,
        lastModified: project.last_modified,
        branding: {
          logo: project.logo_data_url || "",
          primaryColor: project.primary_color || "",
        },
      });
    }

    return result;
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
};

export const getProject = async (
  id: string,
  userId?: string,
): Promise<Project | undefined> => {
  try {
    const projects = await getProjects(userId);
    return projects.find((p) => p.id === id);
  } catch (error) {
    console.error("Error fetching project:", error);
    return undefined;
  }
};

export const createProject = async (
  metadata: AppMetadata,
  suggestions: RawSuggestions,
  userId?: string,
): Promise<Project> => {
  const projectId = `proj_${Date.now()}`;
  const now = new Date().toISOString();

  try {
    // Insert project
    await sql`
      INSERT INTO projects (
        id, name, description, industry, target_users, platform,
        created_at, last_modified, user_id
      ) VALUES (
        ${projectId}, ${metadata.name}, ${metadata.description},
        ${metadata.industry}, ${metadata.targetUsers}, ${metadata.platform},
        ${now}, ${now}, ${userId || null}
      )
    `;

    // Insert default sections
    const initialSections = ALL_POSSIBLE_SECTIONS.filter((section) =>
      DEFAULT_SECTION_IDS.includes(section.id),
    );

    for (const section of initialSections) {
      await sql`
        INSERT INTO sections (project_id, section_id, title, content)
        VALUES (${projectId}, ${section.id}, ${section.title}, '')
      `;
    }

    // Insert feature suggestions
    for (const feature of suggestions.core) {
      await sql`
        INSERT INTO feature_suggestions (project_id, feature_text, is_core, is_selected)
        VALUES (${projectId}, ${feature}, true, true)
      `;
    }

    for (const feature of suggestions.optional) {
      await sql`
        INSERT INTO feature_suggestions (project_id, feature_text, is_core, is_selected)
        VALUES (${projectId}, ${feature}, false, false)
      `;
    }

    const project = await getProject(projectId);
    if (!project) {
      throw new Error("Failed to create project");
    }

    return project;
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
};

export const updateProject = async (
  id: string,
  data: Partial<Omit<Project, "id" | "createdAt">>,
): Promise<Project | undefined> => {
  try {
    const now = new Date().toISOString();

    // Update project metadata
    if (data.metadata) {
      await sql`
        UPDATE projects SET
          name = ${data.metadata.name},
          description = ${data.metadata.description},
          industry = ${data.metadata.industry},
          target_users = ${data.metadata.targetUsers},
          platform = ${data.metadata.platform},
          last_modified = ${now}
        WHERE id = ${id}
      `;
    }

    // Update status
    if (data.status) {
      await sql`
        UPDATE projects SET
          status = ${data.status},
          last_modified = ${now}
        WHERE id = ${id}
      `;
    }

    // Update branding
    if (data.branding) {
      await sql`
        UPDATE projects SET
          logo_data_url = ${data.branding.logo || ""},
          primary_color = ${data.branding.primaryColor || ""},
          last_modified = ${now}
        WHERE id = ${id}
      `;
    }

    // Update sections
    if (data.sections) {
      for (const section of data.sections) {
        await sql`
          UPDATE sections SET
            content = ${section.content}
          WHERE project_id = ${id} AND section_id = ${section.id}
        `;
      }
    }

    // Update personas
    if (data.personas) {
      // Delete existing personas and insert new ones
      await sql`DELETE FROM personas WHERE project_id = ${id}`;

      for (const persona of data.personas) {
        await sql`
          INSERT INTO personas (
            project_id, name, age_range, goals, pain_points
          ) VALUES (
            ${id}, ${persona.name}, ${persona.demographics},
            ${JSON.stringify(persona.goals)}, ${JSON.stringify(persona.frustrations)}
          )
        `;
      }
    }

    // Update feature selections
    if (data.featureSuggestions) {
      // Reset all selections
      await sql`
        UPDATE feature_suggestions SET is_selected = false
        WHERE project_id = ${id}
      `;

      // Set selected features
      for (const feature of data.featureSuggestions) {
        await sql`
          UPDATE feature_suggestions SET is_selected = true
          WHERE project_id = ${id} AND feature_text = ${feature}
        `;
      }
    }

    return await getProject(id);
  } catch (error) {
    console.error("Error updating project:", error);
    return undefined;
  }
};

export const deleteProject = async (id: string): Promise<void> => {
  try {
    await sql`DELETE FROM projects WHERE id = ${id}`;
  } catch (error) {
    console.error("Error deleting project:", error);
    throw error;
  }
};

export const renameProject = async (
  id: string,
  newName: string,
): Promise<void> => {
  try {
    const now = new Date().toISOString();
    await sql`
      UPDATE projects SET
        name = ${newName},
        last_modified = ${now}
      WHERE id = ${id}
    `;
  } catch (error) {
    console.error("Error renaming project:", error);
    throw error;
  }
};

// Migration function to move localStorage data to database
export const migrateFromLocalStorage = async (): Promise<void> => {
  if (typeof window === "undefined") return;

  const projectsJson = localStorage.getItem("docuCraftProjects");
  if (!projectsJson) return;

  try {
    const localProjects: Project[] = JSON.parse(projectsJson);

    for (const project of localProjects) {
      // Check if project already exists
      const existing = await getProject(project.id);
      if (existing) continue;

      // Insert project
      await sql`
        INSERT INTO projects (
          id, name, description, industry, target_users, platform,
          status, created_at, last_modified, logo_data_url, primary_color
        ) VALUES (
          ${project.id}, ${project.metadata.name}, ${project.metadata.description},
          ${project.metadata.industry}, ${project.metadata.targetUsers}, ${project.metadata.platform},
          ${project.status}, ${project.createdAt}, ${project.lastModified},
          ${project.branding?.logo || ""}, ${project.branding?.primaryColor || ""}
        )
      `;

      // Insert sections
      for (const section of project.sections) {
        await sql`
          INSERT INTO sections (project_id, section_id, title, content)
          VALUES (${project.id}, ${section.id}, ${section.title}, ${section.content})
        `;
      }

      // Insert personas
      for (const persona of project.personas) {
        await sql`
          INSERT INTO personas (
            project_id, name, age_range, description, goals, pain_points, tech_savviness
          ) VALUES (
            ${project.id}, ${persona.name}, ${persona.ageRange}, ${persona.description},
            ${persona.goals}, ${persona.painPoints}, ${persona.techSavviness}
          )
        `;
      }

      // Insert features
      if (project.rawSuggestions) {
        for (const feature of project.rawSuggestions.core) {
          const isSelected = project.featureSuggestions.includes(feature);
          await sql`
            INSERT INTO feature_suggestions (project_id, feature_text, is_core, is_selected)
            VALUES (${project.id}, ${feature}, true, ${isSelected})
          `;
        }

        for (const feature of project.rawSuggestions.optional) {
          const isSelected = project.featureSuggestions.includes(feature);
          await sql`
            INSERT INTO feature_suggestions (project_id, feature_text, is_core, is_selected)
            VALUES (${project.id}, ${feature}, false, ${isSelected})
          `;
        }
      }
    }

    // Clear localStorage after successful migration
    localStorage.removeItem("docuCraftProjects");
    console.log("Successfully migrated projects from localStorage to database");
  } catch (error) {
    console.error("Error migrating from localStorage:", error);
    throw error;
  }
};
