'use server';

/**
 * @fileOverview An AI agent for improving written content.
 *
 * - improveWriting - A function that suggests improvements for a given text.
 * - ImproveWritingInput - The input type for the improveWriting function.
 * - ImproveWritingOutput - The return type for the improveWriting function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImproveWritingInputSchema = z.object({
  text: z.string().describe('The text to be improved.'),
});
export type ImproveWritingInput = z.infer<typeof ImproveWritingInputSchema>;

const ImproveWritingOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe(
      'An array of 2 to 3 improved versions of the original text. The suggestions should focus on improving grammar, clarity, and conciseness.'
    ),
});
export type ImproveWritingOutput = z.infer<typeof ImproveWritingOutputSchema>;

export async function improveWriting(input: ImproveWritingInput): Promise<ImproveWritingOutput> {
  return improveWritingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'improveWritingPrompt',
  input: {schema: ImproveWritingInputSchema},
  output: {schema: ImproveWritingOutputSchema},
  prompt: `You are an expert editor. Analyze the following text for grammar, clarity, and conciseness.
Provide 2-3 improved versions of the text. Each suggestion should be a complete rewrite of the original text, not just a comment.

Original Text:
"{{{text}}}"

Generate the improved versions and return them in the 'suggestions' array.`,
});

const improveWritingFlow = ai.defineFlow(
  {
    name: 'improveWritingFlow',
    inputSchema: ImproveWritingInputSchema,
    outputSchema: ImproveWritingOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
