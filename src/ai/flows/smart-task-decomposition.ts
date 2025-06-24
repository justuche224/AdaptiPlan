'use server';

/**
 * @fileOverview Breaks down a vague task into actionable sub-tasks with estimated durations.
 *
 * - smartTaskDecomposition - A function that handles the task decomposition process.
 * - SmartTaskDecompositionInput - The input type for the smartTaskDecomposition function.
 * - SmartTaskDecompositionOutput - The return type for the smartTaskDecomposition function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartTaskDecompositionInputSchema = z.object({
  task: z.string().describe('The vague task to be broken down.'),
  userMood: z.string().optional().describe('The current mood of the user.'),
});
export type SmartTaskDecompositionInput = z.infer<
  typeof SmartTaskDecompositionInputSchema
>;

const SmartTaskDecompositionOutputSchema = z.object({
  subTasks: z.array(
    z.object({
      name: z.string().describe('The name of the sub-task.'),
      durationEstimateMinutes: z
        .number()
        .describe('The estimated duration of the sub-task in minutes.'),
    })
  ),
});
export type SmartTaskDecompositionOutput = z.infer<
  typeof SmartTaskDecompositionOutputSchema
>;

export async function smartTaskDecomposition(
  input: SmartTaskDecompositionInput
): Promise<SmartTaskDecompositionOutput> {
  return smartTaskDecompositionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartTaskDecompositionPrompt',
  input: {schema: SmartTaskDecompositionInputSchema},
  output: {schema: SmartTaskDecompositionOutputSchema},
  prompt: `You are a task management expert. Your job is to break down vague tasks into actionable sub-tasks with estimated durations.

Consider the user's mood when breaking down the task. If the user is feeling down, break the task into smaller, more manageable sub-tasks.

Task: {{{task}}}
User Mood: {{{userMood}}}

Break down the task into sub-tasks and estimate the duration of each sub-task in minutes.`,
});

const smartTaskDecompositionFlow = ai.defineFlow(
  {
    name: 'smartTaskDecompositionFlow',
    inputSchema: SmartTaskDecompositionInputSchema,
    outputSchema: SmartTaskDecompositionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
