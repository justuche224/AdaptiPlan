'use server';

/**
 * @fileOverview Generates a summary of the user's daily progress.
 *
 * - getDailyProgressSummary - A function that handles generating the summary.
 * - DailyProgressSummaryInput - The input type for the function.
 * - DailyProgressSummaryOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DailyProgressSummaryInputSchema = z.object({
  tasks: z
    .string()
    .describe(
      'A JSON string representing the list of tasks for the day, including their status (completed, missed).'
    ),
});
export type DailyProgressSummaryInput = z.infer<
  typeof DailyProgressSummaryInputSchema
>;

const DailyProgressSummaryOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      "A positive and encouraging summary of the day's accomplishments."
    ),
  completedCount: z.number().describe('The total number of completed tasks.'),
  missedCount: z.number().describe('The total number of missed tasks.'),
});
export type DailyProgressSummaryOutput = z.infer<
  typeof DailyProgressSummaryOutputSchema
>;

export async function getDailyProgressSummary(
  input: DailyProgressSummaryInput
): Promise<DailyProgressSummaryOutput> {
  return dailyProgressSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dailyProgressSummaryPrompt',
  input: {schema: DailyProgressSummaryInputSchema},
  output: {schema: DailyProgressSummaryOutputSchema},
  prompt: `You are a friendly and encouraging productivity coach. The user has finished their tasks for the day.
  
  Based on the following list of tasks, generate a short (2-3 sentences) summary of their progress and provide a count of completed and missed tasks.
  
  - The summary should be positive and focus on what was accomplished, even if some tasks were missed. End with an encouraging sentence about resting or the next day.
  - Count the number of tasks with a status of 'completed'.
  - Count the number of tasks with a status of 'missed'.
  
  Tasks: {{{tasks}}}
  `,
});

const dailyProgressSummaryFlow = ai.defineFlow(
  {
    name: 'dailyProgressSummaryFlow',
    inputSchema: DailyProgressSummaryInputSchema,
    outputSchema: DailyProgressSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
