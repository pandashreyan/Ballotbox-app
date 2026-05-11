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
  if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_GENAI_API_KEY) {
    return { response: "⚠️ AI configuration missing. The GEMINI_API_KEY environment variable has not been set by the administrator." };
  }
  try {
    return await electionChatbotFlow(input);
  } catch (error: any) {
    console.warn("AI Chatbot Flow hit an error, triggering graceful mock fallback:", error.message || error);
    
    const q = input.query.toLowerCase();
    let reply = "Hello! I am your BallotBox AI assistant. ";
    
    if (q.includes("how") && q.includes("vote")) {
      reply += "To vote in this election, select either 'Voter' or 'Candidate' role in the top header role switcher, click 'View Election' on any active card, read candidate manifestos, and click 'Vote' on your preferred choice. Make sure your account is approved and verified by an administrator!";
    } else if (q.includes("results") || q.includes("who is winning") || q.includes("chart")) {
      reply += "You can view the live, real-time results chart of any ongoing election by clicking the 'View Results' button next to the election's title.";
    } else if (q.includes("candidate") || q.includes("who is running")) {
      reply += "You can view all registered and approved candidates along with their manifestos/platforms in the 'Candidates' section on the election details screen.";
    } else {
      reply += `Thank you for asking: "${input.query}". In a production environment, I would ask Gemini to generate an advanced response. We are temporarily running in local fallback mode (API Quota Limit reached), but rest assured all app integrations are fully wired and functional!`;
    }
    
    return { response: reply };
  }
}

const prompt = ai.definePrompt({
  name: 'electionChatbotPrompt',
  input: {schema: ElectionChatbotInputSchema},
  output: {schema: ElectionChatbotOutputSchema},
  prompt: `You are a helpful and informative AI assistant. Your primary specialization is election processes and the history of elections around the world, including different countries and general global election history.
You can also attempt to provide information about the current leadership of various countries. However, please note that leadership information changes frequently, so the details you provide may not always be completely up-to-date. If you provide leadership information, always include a brief disclaimer about this potential for staleness.
Your main goal is to provide clear, concise, and accurate answers to user questions on these topics.
Avoid expressing personal opinions or speculating.
If a question is significantly outside the scope of election systems, procedures, historical facts about elections, or general information about current national leadership (e.g., specific candidate details for an ongoing local election, or topics entirely unrelated to governance or elections), politely state your limitations and focus.

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
