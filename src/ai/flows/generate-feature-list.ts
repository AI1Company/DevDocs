'use server';

/**
 * @fileOverview A content generation AI agent for a feature list section.
 *
 * - generateFeatureList - A function that handles the feature list content generation.
 * - GenerateFeatureListInput - The input type for the generateFeatureList function.
 * - GenerateFeatureListOutput - The return type for the generateFeatureList function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFeatureListInputSchema = z.object({
  appMetadata: z.string().describe('The app metadata including name, description, and industry.'),
  featureNames: z.array(z.string()).describe('An array of feature names to be described.'),
});
export type GenerateFeatureListInput = z.infer<typeof GenerateFeatureListInputSchema>;

const GenerateFeatureListOutputSchema = z.object({
  content: z.string().describe('The generated content for the feature list section in Markdown format.'),
});
export type GenerateFeatureListOutput = z.infer<typeof GenerateFeatureListOutputSchema>;

export async function generateFeatureList(input: GenerateFeatureListInput): Promise<GenerateFeatureListOutput> {
  return generateFeatureListFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFeatureListPrompt',
  input: {schema: GenerateFeatureListInputSchema},
  output: {schema: GenerateFeatureListOutputSchema},
  prompt: `You are an expert product manager and technical writer. Your task is to generate a detailed feature list in Markdown format.

App Metadata:
{{{appMetadata}}}

Based on the metadata above, write a 2-3 sentence description for each of the following features. The description should be concise and clearly explain the value of the feature to the end-user, tailored to the app's specific purpose and industry.

Features to describe:
{{#each featureNames}}
- {{{this}}}
{{/each}}

Format the entire output as a single Markdown block. Use Markdown headings and bullet points to structure the list. For each feature, use its name as bolded text followed by its description.
Example Format:
*   **Feature Name:** This is a 2-3 sentence description of the feature, explaining its benefit to the user within the context of the app.
`,
});

const generateFeatureListFlow = ai.defineFlow(
  {
    name: 'generateFeatureListFlow',
    inputSchema: GenerateFeatureListInputSchema,
    outputSchema: GenerateFeatureListOutputSchema,
  },
  async input => {
    // If there are no features, return an empty content string.
    if (input.featureNames.length === 0) {
      return { content: 'No features selected. Please select features in the "AI-Suggested Features" card to generate this section.' };
    }
    const {output} = await prompt(input);
    return output!;
  }
);
