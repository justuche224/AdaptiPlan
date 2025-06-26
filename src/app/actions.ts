"use server";

import { revalidatePath } from "next/cache";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { tasks as tasksTable } from "@/db/schema/tasks";
import { serverAuth } from "@/lib/server-auth";
import { auth } from "@/lib/auth";

import { smartTaskDecomposition } from "@/ai/flows/smart-task-decomposition";
import { intelligentScheduleAdjustment } from "@/ai/flows/intelligent-schedule-adjustment";
import { getMindfulMomentSuggestion } from "@/ai/flows/mindful-moment-suggestion";
import { getDailyProgressSummary } from "@/ai/flows/daily-progress-summary";

import type { Task } from "@/lib/types";
import type {
  MindfulMomentSuggestionInput,
  MindfulMomentSuggestionOutput,
} from "@/ai/flows/mindful-moment-suggestion";
import type {
    DailyProgressSummaryInput,
    DailyProgressSummaryOutput,
} from "@/ai/flows/daily-progress-summary";


const getUserId = async () => {
  const session = await serverAuth();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
};

// Map DB tasks to client-side Task type
const mapDbTaskToTask = (dbTask: typeof tasksTable.$inferSelect): Task => ({
  id: dbTask.publicId,
  name: dbTask.name,
  durationEstimateMinutes: dbTask.durationEstimateMinutes,
  status: dbTask.status,
  startTime: dbTask.startTime.toISOString(),
  parentTaskTitle: dbTask.parentTaskTitle ?? undefined,
  isFirstOfParent: dbTask.isFirstOfParent ?? false,
});

export async function getTasksForUser(): Promise<Task[]> {
  const userId = await getUserId();
  const dbTasks = await db.select().from(tasksTable).where(eq(tasksTable.userId, userId)).orderBy(asc(tasksTable.sortOrder));
  return dbTasks.map(mapDbTaskToTask);
}

export async function addTaskAndDecompose(
  taskTitle: string,
  userMood: string
): Promise<Task[]> {
  const userId = await getUserId();

  const result = await smartTaskDecomposition({
    task: taskTitle,
    userMood: userMood,
  });

  if (!result || result.subTasks.length === 0) {
    throw new Error("The AI couldn't break down the task.");
  }

  const existingTasks = await db.select().from(tasksTable).where(eq(tasksTable.userId, userId)).orderBy(asc(tasksTable.sortOrder));

  let lastEndTime = new Date();
  let lastSortOrder = -1;

  if (existingTasks.length > 0) {
    const lastTask = existingTasks[existingTasks.length - 1];
    lastEndTime = new Date(
      new Date(lastTask.startTime).getTime() +
        lastTask.durationEstimateMinutes * 60000
    );
    lastEndTime = new Date(lastEndTime.getTime() + 5 * 60000); // 5 min buffer
    lastSortOrder = lastTask.sortOrder;
  }

  const newDbTasks: (typeof tasksTable.$inferInsert)[] = result.subTasks.map(
    (subTask, index) => {
      const startTime = new Date(lastEndTime.getTime());
      lastEndTime = new Date(
        lastEndTime.getTime() + subTask.durationEstimateMinutes * 60000
      );

      return {
        publicId: `task_${Date.now()}_${index}`,
        userId,
        name: subTask.name,
        durationEstimateMinutes: subTask.durationEstimateMinutes,
        status: "pending",
        startTime: startTime,
        parentTaskTitle: taskTitle,
        isFirstOfParent: index === 0,
        sortOrder: lastSortOrder + 1 + index,
      };
    }
  );

  const insertedTasks = await db
    .insert(tasksTable)
    .values(newDbTasks)
    .returning();
  revalidatePath("/app");
  return insertedTasks.map(mapDbTaskToTask);
}

export async function updateTaskStatus(
  taskId: string,
  status: "completed" | "missed"
) {
  const userId = await getUserId();

  await db
    .update(tasksTable)
    .set({ status })
    .where(and(eq(tasksTable.publicId, taskId), eq(tasksTable.userId, userId)));

  if (status === "missed") {
    const allTasks = await getTasksForUser();
    const result = await intelligentScheduleAdjustment({
      currentSchedule: JSON.stringify(allTasks),
      missedTasks: JSON.stringify(allTasks.find((t) => t.id === taskId)),
      userMood: "neutral", // You may want to pass the actual mood here
    });

    const rescheduledTasks: Task[] = JSON.parse(result.rescheduledSchedule);

    // This is a complex operation. In a real app, you'd use a transaction.
    for (const task of rescheduledTasks) {
      await db
        .update(tasksTable)
        .set({ startTime: new Date(task.startTime), status: task.status })
        .where(and(eq(tasksTable.publicId, task.id), eq(tasksTable.userId, userId)));
    }
  }

  revalidatePath("/app");
}

export async function reorderTasks(orderedTaskIds: string[]) {
    const userId = await getUserId();
    const allTasks = await db.select().from(tasksTable).where(eq(tasksTable.userId, userId));

    if (allTasks.length === 0) return;

    const taskMap = new Map(allTasks.map(t => [t.publicId, t]));
    let nextStartTime = new Date(allTasks[0].startTime);

    for (const [index, taskId] of orderedTaskIds.entries()) {
        const task = taskMap.get(taskId);
        if (task) {
            const currentTaskStartTime = new Date(nextStartTime.getTime());
            await db.update(tasksTable)
                .set({
                    sortOrder: index,
                    startTime: currentTaskStartTime,
                })
                .where(and(eq(tasksTable.publicId, taskId), eq(tasksTable.userId, userId)));

            nextStartTime = new Date(currentTaskStartTime.getTime() + task.durationEstimateMinutes * 60000);
        }
    }
    revalidatePath('/app');
}

export async function getMindfulMoment(
  input: MindfulMomentSuggestionInput
): Promise<MindfulMomentSuggestionOutput> {
  return await getMindfulMomentSuggestion(input);
}

export async function getDailySummary(
  input: DailyProgressSummaryInput
): Promise<DailyProgressSummaryOutput> {
  return await getDailyProgressSummary(input);
}

export async function clearAllTasks() {
    const userId = await getUserId();
    await db.delete(tasksTable).where(eq(tasksTable.userId, userId));
    revalidatePath("/app");
}

export async function signOutAction() {
    await auth.api.signOut();
}
