"use server";

import { smartTaskDecomposition } from "@/ai/flows/smart-task-decomposition";
import type {
  SmartTaskDecompositionInput,
  SmartTaskDecompositionOutput,
} from "@/ai/flows/smart-task-decomposition";
import { intelligentScheduleAdjustment } from "@/ai/flows/intelligent-schedule-adjustment";
import type {
  IntelligentScheduleAdjustmentInput,
  IntelligentScheduleAdjustmentOutput,
} from "@/ai/flows/intelligent-schedule-adjustment";

export async function decomposeTask(
  input: SmartTaskDecompositionInput
): Promise<SmartTaskDecompositionOutput> {
  return await smartTaskDecomposition(input);
}

export async function adjustSchedule(
  input: IntelligentScheduleAdjustmentInput
): Promise<IntelligentScheduleAdjustmentOutput> {
  const result = await intelligentScheduleAdjustment(input);
  // The AI might return an imperfect JSON string. We ensure it's valid before sending to client.
  try {
    JSON.parse(result.rescheduledSchedule);
    return result;
  } catch (e) {
    console.error("Failed to parse rescheduled schedule from AI", e);
    // Return the original schedule in case of parsing failure to prevent crashes
    return {
        rescheduledSchedule: input.currentSchedule,
        message: "I had trouble creating a new schedule, so I've kept your current one. Let's try again later!"
    };
  }
}
