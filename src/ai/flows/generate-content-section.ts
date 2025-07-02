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
  action: z.enum(['improve', 'rewrite_investor', 'fill_info']).describe('The action to perform on the content.'),
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
  prompt: `You are an AI expert in generating content for app documentation. Your task is to process content for a document section.

Action to perform: {{{action}}}
Section Name: {{{sectionName}}}
App Metadata: {{{appMetadata}}}
Existing Content:
{{{existingContent}}}

Instructions:
- If action is "fill_info": Generate content for the section. If "Existing Content" is provided, expand on it. If not, create it from scratch using the "App Metadata".
- If action is "rewrite_investor": Rewrite the "Existing Content" to appeal to investors. Focus on business value, market potential, and return on investment. The tone should be professional and persuasive.
- If action is "improve": Rewrite the "Existing Content" to improve its clarity, grammar, and overall readability. Fix any mistakes and make the text more engaging.

Specific guidance for "fill_info" action:
- If "Section Name" is "Product Vision": Create a compelling and professional vision statement. It should describe the long-term goal and impact of the application, be aspirational, and clearly articulate the core purpose and what the future looks like for the product and its users. The tone should be professional and clear.
- If "Section Name" is "App Overview": Provide a concise but comprehensive summary. It should cover the core functionality, its primary value proposition, and the intended audience, serving as a high-level introduction. The tone should be professional and clear.

Based on the specified action and section name, generate the final content below.`,
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
