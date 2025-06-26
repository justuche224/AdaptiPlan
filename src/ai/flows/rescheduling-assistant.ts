'use server';

/**
 * @fileOverview Generates several rescheduling options when a task is missed.
 *
 * - getReschedulingOptions - A function that returns smart rescheduling suggestions.
 * - ReschedulingOptionsInput - The input type for the function.
 * - ReschedulingOptionsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReschedulingOptionsInputSchema = z.object({
  currentSchedule: z
    .string()
    .describe('The current schedule as a JSON string of Task objects.'),
  missedTask: z.string().describe('The missed task as a JSON string.'),
});
export type ReschedulingOptionsInput = z.infer<
  typeof ReschedulingOptionsInputSchema
>;

const RescheduleOptionSchema = z.object({
  title: z.string().describe('A short, catchy title for the option.'),
  description: z
    .string()
    .describe('A brief explanation of what this option does.'),
  newSchedule: z
    .string()
    .describe('The entire new schedule as a JSON string.'),
});

const ReschedulingOptionsOutputSchema = z.object({
  options: z
    .array(RescheduleOptionSchema)
    .describe('An array of 2-3 rescheduling suggestions.'),
});
export type ReschedulingOptionsOutput = z.infer<
  typeof ReschedulingOptionsOutputSchema
>;

export async function getReschedulingOptions(
  input: ReschedulingOptionsInput
): Promise<ReschedulingOptionsOutput> {
  return reschedulingAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'reschedulingAssistantPrompt',
  input: {schema: ReschedulingOptionsInputSchema},
  output: {schema: ReschedulingOptionsOutputSchema},
  prompt: `You are an empathetic and clever scheduling assistant. A user has just missed a task and needs help reorganizing their day.

Current Schedule: {{{currentSchedule}}}
Missed Task: {{{missedTask}}}

Generate 3 distinct, smart, and helpful rescheduling options. Each option must include a short title, a one-sentence description, and the complete, updated schedule as a valid JSON string.

Here are the kinds of strategies you should generate:

1.  **Shift Strategy:** Push all subsequent tasks back to accommodate the missed task later. Title it something like "Shift and Fit" or "Keep Everything".
2.  **Intelligent Deferral Strategy:** Move the missed task to the very end of the day. Title it something like "Move to End" or "Finish Strong".
3.  **Drop Strategy:** Suggest removing the missed task entirely for today to keep the rest of the schedule intact. To do this, simply return a schedule array that does not include the missed task. Title it "Drop and Focus" or "Let It Go".

For each option, you MUST return the *entire* list of tasks for the day, with updated start times and statuses, as a JSON string in the 'newSchedule' field. Make sure the JSON is valid. The user's original schedule started at the time of the first task, so maintain a logical flow of time. Tasks should not overlap.
`,
});

const reschedulingAssistantFlow = ai.defineFlow(
  {
    name: 'reschedulingAssistantFlow',
    inputSchema: ReschedulingOptionsInputSchema,
    outputSchema: ReschedulingOptionsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
