'use server';

/**
 * @fileOverview Summarizes a candidate's platform using AI.
 *
 * - summarizeCandidatePlatform - A function that takes a candidate's platform text and returns an AI-generated summary.
 * - SummarizeCandidatePlatformInput - The input type for the summarizeCandidatePlatform function.
 * - SummarizeCandidatePlatformOutput - The return type for the summarizeCandidatePlatform function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeCandidatePlatformInputSchema = z.object({
  platformText: z
    .string()
    .describe("The candidate's platform text to be summarized."),
});
export type SummarizeCandidatePlatformInput = z.infer<
  typeof SummarizeCandidatePlatformInputSchema
>;

const SummarizeCandidatePlatformOutputSchema = z.object({
  summary: z.string().describe('The AI-generated summary of the platform.'),
});
export type SummarizeCandidatePlatformOutput = z.infer<
  typeof SummarizeCandidatePlatformOutputSchema
>;

export async function summarizeCandidatePlatform(
  input: SummarizeCandidatePlatformInput
): Promise<SummarizeCandidatePlatformOutput> {
  return summarizeCandidatePlatformFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeCandidatePlatformPrompt',
  input: {schema: SummarizeCandidatePlatformInputSchema},
  output: {schema: SummarizeCandidatePlatformOutputSchema},
  prompt: `Summarize the following candidate platform in a concise and objective manner:\n\n{{{platformText}}}`,
});

const summarizeCandidatePlatformFlow = ai.defineFlow(
  {
    name: 'summarizeCandidatePlatformFlow',
    inputSchema: SummarizeCandidatePlatformInputSchema,
    outputSchema: SummarizeCandidatePlatformOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
