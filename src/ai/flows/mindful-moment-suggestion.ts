'use server';

/**
 * @fileOverview Generates a short, mindful suggestion for users feeling stressed.
 *
 * - getMindfulMomentSuggestion - A function that handles generating the suggestion.
 * - MindfulMomentSuggestionInput - The input type for the function.
 * - MindfulMomentSuggestionOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MindfulMomentSuggestionInputSchema = z.object({
  userMood: z
    .string()
    .describe('The current mood of the user, e.g., "stressed".'),
});
export type MindfulMomentSuggestionInput = z.infer<
  typeof MindfulMomentSuggestionInputSchema
>;

const MindfulMomentSuggestionOutputSchema = z.object({
  suggestion: z
    .string()
    .describe(
      'A short, actionable suggestion (1-2 sentences) for a mindful moment.'
    ),
});
export type MindfulMomentSuggestionOutput = z.infer<
  typeof MindfulMomentSuggestionOutputSchema
>;

export async function getMindfulMomentSuggestion(
  input: MindfulMomentSuggestionInput
): Promise<MindfulMomentSuggestionOutput> {
  return mindfulMomentSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'mindfulMomentSuggestionPrompt',
  input: {schema: MindfulMomentSuggestionInputSchema},
  output: {schema: MindfulMomentSuggestionOutputSchema},
  prompt: `You are an empathetic mindfulness coach. The user is feeling {{userMood}}. 
  
  Provide a single, short, and actionable suggestion for a "Mindful Moment" to help them.
  
  Keep it to 1-2 sentences. Examples:
  - "Take a moment to close your eyes and focus on three deep breaths. Inhale calm, exhale stress."
  - "Gently stretch your neck from side to side to release some tension."
  - "It's okay to feel this way. Remind yourself: you are capable and you will get through this."
  
  Be gentle, encouraging, and non-judgmental.`,
});

const mindfulMomentSuggestionFlow = ai.defineFlow(
  {
    name: 'mindfulMomentSuggestionFlow',
    inputSchema: MindfulMomentSuggestionInputSchema,
    outputSchema: MindfulMomentSuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
