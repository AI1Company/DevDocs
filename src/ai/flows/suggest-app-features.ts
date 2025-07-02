// src/ai/flows/suggest-app-features.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow that suggests app features based on the app's name, description, and industry.
 *
 * - suggestAppFeatures - A function that takes app metadata as input and returns a list of suggested features.
 * - SuggestAppFeaturesInput - The input type for the suggestAppFeatures function.
 * - SuggestAppFeaturesOutput - The return type for the suggestAppFeatures function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestAppFeaturesInputSchema = z.object({
  name: z.string().describe('The name of the application.'),
  description: z.string().describe('A brief description of the application.'),
  industry: z.string().describe('The industry the application belongs to.'),
  targetUsers: z.string().describe('A description of the target users for the application.'),
  platform: z.enum(['Web', 'Mobile', 'SaaS', 'Desktop']).describe('The platform the application will be built for (e.g., Web, Mobile).'),
});
export type SuggestAppFeaturesInput = z.infer<typeof SuggestAppFeaturesInputSchema>;

const SuggestAppFeaturesOutputSchema = z.object({
  core: z.array(z.string()).describe('A list of 3-5 essential core features for the application.'),
  optional: z.array(z.string()).describe('A list of 3-5 optional or nice-to-have features that could enhance the app.'),
});
export type SuggestAppFeaturesOutput = z.infer<typeof SuggestAppFeaturesOutputSchema>;

export async function suggestAppFeatures(input: SuggestAppFeaturesInput): Promise<SuggestAppFeaturesOutput> {
  return suggestAppFeaturesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestAppFeaturesPrompt',
  input: {schema: SuggestAppFeaturesInputSchema},
  output: {schema: SuggestAppFeaturesOutputSchema},
  prompt: `You are an AI assistant that suggests features for a given application based on its details.

  Application Name: {{{name}}}
  Description: {{{description}}}
  Industry: {{{industry}}}
  Target Users: {{{targetUsers}}}
  Platform: {{{platform}}}

  Suggest a list of relevant and useful features for this application. Categorize them into "core" (essential features) and "optional" (nice-to-have features). The features should be concise and easy to understand.
  Return the features as a JSON object with 'core' and 'optional' keys, each containing an array of strings.
  `,
});

const suggestAppFeaturesFlow = ai.defineFlow(
  {
    name: 'suggestAppFeaturesFlow',
    inputSchema: SuggestAppFeaturesInputSchema,
    outputSchema: SuggestAppFeaturesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
