'use server';

/**
 * @fileOverview A content generation AI agent for document sections.
 *
 * - generateContentSection - A function that handles the content generation process.
 * - GenerateContentSectionInput - The input type for the generateContentSection function.
 * - GenerateContentSectionOutput - The return type for the generateContentSection function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateContentSectionInputSchema = z.object({
  sectionName: z.string().describe('The name of the document section.'),
  appMetadata: z.string().describe('The app metadata including name, description, and industry.'),
  tone: z.enum(['technical', 'investor-friendly']).describe('The desired tone for the content.'),
  existingContent: z.string().optional().describe('Existing content to improve or expand upon.'),
});
export type GenerateContentSectionInput = z.infer<typeof GenerateContentSectionInputSchema>;

const GenerateContentSectionOutputSchema = z.object({
  content: z.string().describe('The generated content for the document section.'),
});
export type GenerateContentSectionOutput = z.infer<typeof GenerateContentSectionOutputSchema>;

export async function generateContentSection(input: GenerateContentSectionInput): Promise<GenerateContentSectionOutput> {
  return generateContentSectionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateContentSectionPrompt',
  input: {schema: GenerateContentSectionInputSchema},
  output: {schema: GenerateContentSectionOutputSchema},
  prompt: `You are an AI expert in generating content for app documentation.

You will generate content for the following document section:
Section Name: {{{sectionName}}}

Based on the following app metadata:
{{{appMetadata}}}

Desired Tone: {{{tone}}}

Existing Content (if any, improve or expand upon it):
{{{existingContent}}}

Generate content that is well-written, engaging, and appropriate for the specified tone and document section.  Pay close attention to grammar and sentence construction.
`, 
});

const generateContentSectionFlow = ai.defineFlow(
  {
    name: 'generateContentSectionFlow',
    inputSchema: GenerateContentSectionInputSchema,
    outputSchema: GenerateContentSectionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
