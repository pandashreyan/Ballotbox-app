'use server';
/**
 * @fileOverview A chatbot flow for answering questions about election processes and history.
 *
 * - electionChatbot - A function that handles chatbot queries.
 * - ElectionChatbotInput - The input type for the electionChatbot function.
 * - ElectionChatbotOutput - The return type for the electionChatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ElectionChatbotInputSchema = z.object({
  query: z.string().describe('The user question about elections.'),
  history: z.array(z.object({
    user: z.string().optional().describe("The user's query."),
    model: z.string().optional().describe("The model's response."),
  })).optional().describe('The history of the conversation.'),
});
export type ElectionChatbotInput = z.infer<typeof ElectionChatbotInputSchema>;

const ElectionChatbotOutputSchema = z.object({
  response: z
    .string()
    .describe('The chatbot\'s answer to the query.'),
});
export type ElectionChatbotOutput = z.infer<typeof ElectionChatbotOutputSchema>;

export async function electionChatbot(
  input: ElectionChatbotInput
): Promise<ElectionChatbotOutput> {
  return electionChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'electionChatbotPrompt',
  input: {schema: ElectionChatbotInputSchema},
  output: {schema: ElectionChatbotOutputSchema},
  prompt: `You are a helpful and informative AI assistant specializing in election processes and the history of elections around the world, including different countries and general global election history.
Your goal is to provide clear, concise, and accurate answers to user questions on these topics.
Avoid expressing personal opinions or speculating.
If a question is outside the scope of election processes or history (e.g., candidate-specific information for an ongoing election, or topics unrelated to elections), politely state that you can only answer questions related to election systems, procedures, and historical facts about elections.

Conversation History:
{{#if history}}
  {{#each history}}
    User: {{{user}}}
    Model: {{{model}}}
  {{/each}}
{{/if}}

User Query: {{{query}}}
Your Response:`,
});

const electionChatbotFlow = ai.defineFlow(
  {
    name: 'electionChatbotFlow',
    inputSchema: ElectionChatbotInputSchema,
    outputSchema: ElectionChatbotOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
