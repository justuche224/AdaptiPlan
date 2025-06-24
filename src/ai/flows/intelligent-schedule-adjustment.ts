'use server';

/**
 * @fileOverview Offers non-judgmental rescheduling options when tasks are missed or delayed.
 *
 * - intelligentScheduleAdjustment - A function that handles the rescheduling process.
 * - IntelligentScheduleAdjustmentInput - The input type for the intelligentScheduleAdjustment function.
 * - IntelligentScheduleAdjustmentOutput - The return type for the intelligentScheduleAdjustment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IntelligentScheduleAdjustmentInputSchema = z.object({
  currentSchedule: z
    .string()
    .describe('The current schedule as a JSON string.'),
  missedTasks: z
    .string()
    .describe('The list of missed or delayed tasks as a JSON string.'),
  userMood: z
    .string()
    .describe('The current mood of the user (e.g., stressed, calm).'),
});
export type IntelligentScheduleAdjustmentInput = z.infer<
  typeof IntelligentScheduleAdjustmentInputSchema
>;

const IntelligentScheduleAdjustmentOutputSchema = z.object({
  rescheduledSchedule: z
    .string()
    .describe('The rescheduled schedule as a JSON string.'),
  message: z
    .string()
    .describe('A non-judgmental message to encourage the user.'),
});
export type IntelligentScheduleAdjustmentOutput = z.infer<
  typeof IntelligentScheduleAdjustmentOutputSchema
>;

export async function intelligentScheduleAdjustment(
  input: IntelligentScheduleAdjustmentInput
): Promise<IntelligentScheduleAdjustmentOutput> {
  return intelligentScheduleAdjustmentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'intelligentScheduleAdjustmentPrompt',
  input: {schema: IntelligentScheduleAdjustmentInputSchema},
  output: {schema: IntelligentScheduleAdjustmentOutputSchema},
  prompt: `You are a helpful assistant that helps users reschedule their tasks in a non-judgmental way.

  Current Schedule: {{{currentSchedule}}}
  Missed Tasks: {{{missedTasks}}}
  User Mood: {{{userMood}}}

  Based on the current schedule, the missed tasks, and the user's mood, suggest a new schedule that takes into account the missed tasks and the user's mood.

  Return the rescheduled schedule as a JSON string, and a non-judgmental message to encourage the user.

  Make sure the rescheduledSchedule is a valid JSON string.
  `,
});

const intelligentScheduleAdjustmentFlow = ai.defineFlow(
  {
    name: 'intelligentScheduleAdjustmentFlow',
    inputSchema: IntelligentScheduleAdjustmentInputSchema,
    outputSchema: IntelligentScheduleAdjustmentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
