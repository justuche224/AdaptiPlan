
"use server";

import { revalidatePath } from "next/cache";
import { and, asc, eq, notInArray, gt } from "drizzle-orm";
import { db } from "@/db";
import { tasks as tasksTable } from "@/db/schema/tasks";
import { serverAuth } from "@/lib/server-auth";
import { auth } from "@/lib/auth";

import { smartTaskDecomposition } from "@/ai/flows/smart-task-decomposition";
import { getReschedulingOptions } from "@/ai/flows/rescheduling-assistant";
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
import type { ReschedulingOptionsInput, ReschedulingOptionsOutput } from "@/ai/flows/rescheduling-assistant";


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

export async function addQuickTask(
    name: string,
    duration: number
): Promise<Task> {
    const userId = await getUserId();
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

    const startTime = new Date(lastEndTime.getTime());

    const [insertedTask] = await db
        .insert(tasksTable)
        .values({
            publicId: `task_${Date.now()}_0`,
            userId,
            name,
            durationEstimateMinutes: duration,
            status: "pending",
            startTime: startTime,
            sortOrder: lastSortOrder + 1,
        })
        .returning();

    revalidatePath("/app");
    return mapDbTaskToTask(insertedTask);
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

  revalidatePath("/app");
}

export async function deleteTask(taskId: string) {
    const userId = await getUserId();
    await db
        .delete(tasksTable)
        .where(and(eq(tasksTable.publicId, taskId), eq(tasksTable.userId, userId)));
    revalidatePath("/app");
}

export async function updateTask(taskId: string, name: string, duration: number): Promise<Task[]> {
    const userId = await getUserId();

    const allTasks = await db.select().from(tasksTable).where(eq(tasksTable.userId, userId)).orderBy(asc(tasksTable.sortOrder));
    const taskIndex = allTasks.findIndex(t => t.publicId === taskId);

    if (taskIndex === -1) {
        throw new Error("Task not found");
    }

    const updatedTasks: Task[] = await db.transaction(async tx => {
        // Update the target task
        const [updatedDbTask] = await tx
            .update(tasksTable)
            .set({ name, durationEstimateMinutes: duration })
            .where(and(eq(tasksTable.publicId, taskId), eq(tasksTable.userId, userId)))
            .returning();

        // Now, recalculate start times for subsequent tasks
        let nextStartTime = new Date(new Date(updatedDbTask.startTime).getTime() + updatedDbTask.durationEstimateMinutes * 60000);
        
        for (let i = taskIndex + 1; i < allTasks.length; i++) {
            const taskToShift = allTasks[i];
            const newStartTime = new Date(nextStartTime.getTime());
            
            await tx
                .update(tasksTable)
                .set({ startTime: newStartTime })
                .where(eq(tasksTable.id, taskToShift.id));

            nextStartTime = new Date(newStartTime.getTime() + taskToShift.durationEstimateMinutes * 60000);
        }
        
        // Refetch all tasks to return the updated list
        const finalTasks = await tx.select().from(tasksTable).where(eq(tasksTable.userId, userId)).orderBy(asc(tasksTable.sortOrder));
        return finalTasks.map(mapDbTaskToTask);
    });
    
    revalidatePath('/app');
    return updatedTasks;
}

export async function breakDownTask(taskId: string) {
  const userId = await getUserId();

  await db.transaction(async (tx) => {
    // 1. Find the task to break down
    const originalTask = await tx.query.tasks.findFirst({
      where: and(eq(tasksTable.publicId, taskId), eq(tasksTable.userId, userId)),
    });
    if (!originalTask) throw new Error("Task to break down not found.");
    
    // 2. Call AI
    const aiResult = await smartTaskDecomposition({ task: originalTask.name, userMood: 'neutral' });
    if (!aiResult || aiResult.subTasks.length === 0) throw new Error("AI could not break down the task.");
    
    const newSubTasks = aiResult.subTasks;
    
    // 3. Find all tasks that come after the original task's sort position
    const subsequentTasks = await tx.query.tasks.findMany({
        where: and(
            eq(tasksTable.userId, userId),
            gt(tasksTable.sortOrder, originalTask.sortOrder)
        ),
        orderBy: asc(tasksTable.sortOrder)
    });
    
    // 4. Calculate shifts
    const newTasksTotalDuration = newSubTasks.reduce((sum, t) => sum + t.durationEstimateMinutes, 0);
    const durationDifference = newTasksTotalDuration - originalTask.durationEstimateMinutes;
    const timeShiftMs = durationDifference * 60000;
    const sortOrderShift = newSubTasks.length - 1;

    // 5. Update subsequent tasks by shifting them down
    // We iterate backwards to avoid sort order conflicts
    for (const task of subsequentTasks.reverse()) {
        await tx.update(tasksTable)
            .set({
                startTime: new Date(new Date(task.startTime).getTime() + timeShiftMs),
                sortOrder: task.sortOrder + sortOrderShift,
            })
            .where(eq(tasksTable.id, task.id));
    }
    
    // 6. Delete the original task
    await tx.delete(tasksTable).where(eq(tasksTable.id, originalTask.id));

    // 7. Insert the new sub-tasks
    let lastEndTime = new Date(originalTask.startTime);
    const newDbTasksToInsert = newSubTasks.map((subTask, index) => {
        const startTime = new Date(lastEndTime.getTime());
        lastEndTime = new Date(startTime.getTime() + subTask.durationEstimateMinutes * 60000);
        return {
            publicId: `task_${Date.now()}_${index}`,
            userId,
            name: subTask.name,
            durationEstimateMinutes: subTask.durationEstimateMinutes,
            status: "pending" as const,
            startTime,
            // If the original task had a parent, the new tasks inherit it.
            // Otherwise, the original task's name becomes the parent title.
            parentTaskTitle: originalTask.parentTaskTitle ?? originalTask.name,
            // The first new sub-task becomes the "first of parent" ONLY IF the original task was.
            isFirstOfParent: index === 0 && (originalTask.isFirstOfParent || !originalTask.parentTaskTitle),
            sortOrder: originalTask.sortOrder + index,
        };
    });

    if (newDbTasksToInsert.length > 0) {
        await tx.insert(tasksTable).values(newDbTasksToInsert);
    }
  });

  revalidatePath('/app');
}


export async function getReschedulingOptionsAction(
  input: ReschedulingOptionsInput
): Promise<ReschedulingOptionsOutput> {
  await getUserId(); // Ensures user is authenticated
  return await getReschedulingOptions(input);
}

export async function applyReschedule(newSchedule: Task[]) {
  const userId = await getUserId();
  const newScheduleIds = newSchedule.map((t) => t.id);

  await db.transaction(async (tx) => {
    // Delete tasks that are no longer in the schedule
    if (newScheduleIds.length > 0) {
      await tx
        .delete(tasksTable)
        .where(
          and(
            eq(tasksTable.userId, userId),
            notInArray(tasksTable.publicId, newScheduleIds)
          )
        );
    } else {
       await tx
        .delete(tasksTable)
        .where(eq(tasksTable.userId, userId));
    }

    // Update the remaining tasks
    for (const [index, task] of newSchedule.entries()) {
      await tx
        .update(tasksTable)
        .set({
          startTime: new Date(task.startTime),
          status: task.status,
          sortOrder: index,
        })
        .where(
          and(eq(tasksTable.publicId, task.id), eq(tasksTable.userId, userId))
        );
    }
  });

  revalidatePath("/app");
}


export async function reorderTasks(orderedTaskIds: string[]) {
    const userId = await getUserId();
    const allTasks = await db.select().from(tasksTable).where(eq(tasksTable.userId, userId));

    if (allTasks.length === 0) return;

    const taskMap = new Map(allTasks.map(t => [t.publicId, t]));
    
    // Find the start time of the first task in the reordered list to anchor the schedule
    const firstTaskInOrder = allTasks.find(t => t.publicId === orderedTaskIds[0]);
    let nextStartTime = new Date(firstTaskInOrder?.startTime ?? new Date());

    await db.transaction(async (tx) => {
      for (const [index, taskId] of orderedTaskIds.entries()) {
          const task = taskMap.get(taskId);
          if (task) {
              const currentTaskStartTime = new Date(nextStartTime.getTime());
              await tx.update(tasksTable)
                  .set({
                      sortOrder: index,
                      startTime: currentTaskStartTime,
                  })
                  .where(and(eq(tasksTable.publicId, taskId), eq(tasksTable.userId, userId)));

              nextStartTime = new Date(currentTaskStartTime.getTime() + task.durationEstimateMinutes * 60000);
          }
      }
    });

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
