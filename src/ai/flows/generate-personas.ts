'use server';

/**
 * @fileOverview An AI agent for generating user personas for an application.
 *
 * - generatePersonas - A function that handles the persona generation process.
 * - GeneratePersonasInput - The input type for the generatePersonas function.
 * - GeneratePersonasOutput - The return type for the generatePersonas function.
 * - Persona - The type for a single user persona.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GeneratePersonasInputSchema = z.object({
  appMetadata: z.string().describe('The app metadata including name, description, industry, and target users.'),
});
export type GeneratePersonasInput = z.infer<typeof GeneratePersonasInputSchema>;

const PersonaSchema = z.object({
    name: z.string().describe("A plausible name for the user persona."),
    demographics: z.string().describe("A brief description of the persona's demographics (e.g., age, occupation, location)."),
    goals: z.array(z.string()).describe("A list of 2-4 primary goals this user has when using the application."),
    frustrations: z.array(z.string()).describe("A list of 2-4 potential frustrations or pain points this user might experience."),
});
export type Persona = z.infer<typeof PersonaSchema>;

const GeneratePersonasOutputSchema = z.object({
  personas: z.array(PersonaSchema).describe('An array of 2-3 detailed user personas.'),
});
export type GeneratePersonasOutput = z.infer<typeof GeneratePersonasOutputSchema>;

export async function generatePersonas(input: GeneratePersonasInput): Promise<GeneratePersonasOutput> {
  return generatePersonasFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePersonasPrompt',
  input: { schema: GeneratePersonasInputSchema },
  output: { schema: GeneratePersonasOutputSchema },
  prompt: `You are an expert user experience (UX) researcher. Based on the following application metadata, generate 2-3 detailed user personas.

App Metadata:
{{{appMetadata}}}

For each persona, create a plausible name, a brief demographic description, a list of their primary goals with the app, and a list of their potential frustrations. The personas should be distinct from each other and reflect the app's target users.
`,
});

const generatePersonasFlow = ai.defineFlow(
  {
    name: 'generatePersonasFlow',
    inputSchema: GeneratePersonasInputSchema,
    outputSchema: GeneratePersonasOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
