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
  action: z.enum(['fill_info', 'rewrite_technical', 'rewrite_friendly', 'rewrite_pitch', 'rewrite_instructional']).describe('The action to perform on the content.'),
  existingContent: z.string().optional().describe('Existing content to improve or expand upon.'),
  completionMode: z.enum(['strict', 'creative']).describe('The mode for content generation. "strict" for factual, "creative" for embellished.'),
  otherSectionsContent: z.string().optional().describe('JSON string of other completed sections to provide context.'),
  personas: z.string().optional().describe('JSON string of generated user personas to provide context.'),
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
  prompt: `You are an AI expert in generating content for app documentation. Your task is to process content for a document section, using the provided context from other completed sections and user personas.

Action to perform: {{{action}}}
Completion Mode: {{{completionMode}}}
Section Name: {{{sectionName}}}
App Metadata: {{{appMetadata}}}
{{#if personas}}
Context from User Personas:
{{{personas}}}
{{/if}}
Context from other sections:
{{{otherSectionsContent}}}

Existing Content:
{{{existingContent}}}

Instructions:
- If action is "fill_info": Generate content for the section. If "Existing Content" is provided, expand on it. If not, create it from scratch using the "App Metadata" and context from other sections and personas.
- If action is "rewrite_technical": Rewrite the "Existing Content" for a technical audience, like a development team. Be precise, use appropriate technical jargon, and focus on implementation details and system logic.
- If action is "rewrite_friendly": Rewrite the "Existing Content" for non-technical clients. The tone should be simple, welcoming, and clear. Avoid jargon and focus on the benefits and how to use the feature.
- If action is "rewrite_pitch": Rewrite the "Existing Content" to appeal to investors. Focus on business value, market potential, and return on investment. The tone should be professional and persuasive.
- If action is "rewrite_instructional": Rewrite the "Existing Content" for team onboarding. The tone should be educational, clear, and structured for learning, possibly in a step-by-step format.

Completion Mode Guidance:
- If completion mode is "strict": Be factual and concise. Stick closely to the provided metadata and context. Avoid making assumptions or adding speculative details.
- If completion mode is "creative": Be more descriptive and engaging. You can make reasonable, intelligent inferences based on the app's concept to flesh out the content and make it more comprehensive.

Specific guidance for "fill_info" action:
- If "Section Name" is "Product Vision": Create a compelling and professional vision statement. It should describe the long-term goal and impact of the application, be aspirational, and clearly articulate the core purpose and what the future looks like for the product and its users. The tone should be professional and clear.
- If "Section Name" is "App Overview": Provide a concise but comprehensive summary. It should cover the core functionality, its primary value proposition, and the intended audience, serving as a high-level introduction. The tone should be professional and clear.

Based on the specified action, completion mode, and section name, generate the final content below.`,
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
