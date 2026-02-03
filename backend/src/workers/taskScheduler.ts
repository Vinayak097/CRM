import Task, { TaskStatus, TaskType } from "../models/Task.js";
import type { ITask } from "../models/Task.js";

/**
 * Notification Placeholder
 * 
 * In production, this would integrate with your notification system
 * (email, SMS, push notifications, etc.)
 * 
 * For now, it's a placeholder that logs notifications
 * This ensures the scheduler doesn't depend on any specific notification backend
 */
async function notifyAgent(
  agentId: string,
  taskId: string,
  type: "OVERDUE" | "UPCOMING" | "REMINDER",
  taskType: TaskType,
  title: string
): Promise<void> {
  try {
    // TODO: In production, implement actual notification logic
    // Examples:
    // - Send email via SendGrid/Mailgun
    // - Send SMS via Twilio
    // - Push notification to mobile app
    // - Store notification in Notification collection
    // - Webhook to external system
    
    console.log(
      `[NOTIFICATION] Agent ${agentId} - Task ${taskId} (${taskType}): ${title} [${type}]`
    );
    
    // Placeholder: You would implement this as:
    // await NotificationService.create({
    //   recipientId: agentId,
    //   type,
    //   title,
    //   relatedEntity: "Task",
    //   relatedEntityId: taskId,
    // });
  } catch (error) {
    console.error(`[NOTIFICATION_ERROR] Failed to notify agent ${agentId}:`, error);
    // Don't throw - scheduler should continue even if notifications fail
  }
}

/**
 * Task Scheduler
 * 
 * Runs periodically (1-5 minute intervals) to:
 * 1. Find tasks where status=PENDING and dueAt <= now
 * 2. Mark them as OVERDUE
 * 3. Trigger notification
 * 
 * This is database-efficient and doesn't depend on external services
 */
export async function processOverdueTasks(): Promise<void> {
  try {
    const now = new Date();
    
    // Find all PENDING tasks that are past their due date
    const overdueTasks = await Task.find({
      status: TaskStatus.PENDING,
      dueAt: { $lte: now }, // Less than or equal to current time
    })
      .populate("assignedAgentId", "name email")
      .select("+notes")
      .lean();

    if (overdueTasks.length === 0) {
      console.log(`[SCHEDULER] No overdue tasks found at ${now.toISOString()}`);
      return;
    }

    console.log(
      `[SCHEDULER] Found ${overdueTasks.length} overdue tasks at ${now.toISOString()}`
    );

    // Update all overdue tasks in a single batch operation
    const taskIds = overdueTasks.map((task) => task._id);
    
    const updateResult = await Task.updateMany(
      { _id: { $in: taskIds } },
      { 
        status: TaskStatus.OVERDUE,
        updatedAt: now,
      }
    );

    console.log(
      `[SCHEDULER] Marked ${updateResult.modifiedCount} tasks as OVERDUE`
    );

    // Notify agents about their overdue tasks
    // This is done in parallel to avoid blocking the scheduler
    const notificationPromises = overdueTasks.map((task) =>
      notifyAgent(
        task.assignedAgentId._id.toString(),
        task._id.toString(),
        "OVERDUE",
        task.type,
        task.title
      )
    );

    await Promise.allSettled(notificationPromises);
  } catch (error) {
    console.error("[SCHEDULER] Error processing overdue tasks:", error);
    // Don't throw - let the scheduler continue
  }
}

/**
 * Cleanup Old Completed Tasks (Optional)
 * 
 * Periodically removes completed tasks older than retention period
 * Helps keep database size manageable
 * 
 * @param retentionDays Number of days to keep completed tasks (default: 90)
 */
export async function cleanupOldCompletedTasks(retentionDays: number = 90): Promise<void> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const deleteResult = await Task.deleteMany({
      status: TaskStatus.COMPLETED,
      completedAt: { $lt: cutoffDate },
    });

    if (deleteResult.deletedCount > 0) {
      console.log(
        `[SCHEDULER] Cleaned up ${deleteResult.deletedCount} old completed tasks`
      );
    }
  } catch (error) {
    console.error("[SCHEDULER] Error cleaning up old tasks:", error);
    // Don't throw - scheduler should continue
  }
}

/**
 * Initialize Task Scheduler
 * 
 * This should be called once during server startup
 * 
 * @param intervalMinutes How often to run the scheduler (1-5 minutes recommended)
 */
export function initializeTaskScheduler(intervalMinutes: number = 2): NodeJS.Timeout {
  console.log(
    `[SCHEDULER] Initializing task scheduler with ${intervalMinutes} minute interval`
  );

  // Run immediately on startup
  processOverdueTasks().catch((error) =>
    console.error("[SCHEDULER] Initial run failed:", error)
  );

  // Schedule periodic runs
  const intervalMs = intervalMinutes * 60 * 1000;
  const schedulerId = setInterval(() => {
    processOverdueTasks().catch((error) =>
      console.error("[SCHEDULER] Scheduled run failed:", error)
    );
  }, intervalMs);

  // Optional: Run cleanup once daily
  // Schedule at a non-peak hour (e.g., 2 AM)
  const scheduleCleanup = () => {
    const now = new Date();
    const target = new Date();
    target.setHours(2, 0, 0, 0);
    
    // If it's already past 2 AM, schedule for tomorrow
    if (now > target) {
      target.setDate(target.getDate() + 1);
    }
    
    const delay = target.getTime() - now.getTime();
    
    setTimeout(() => {
      cleanupOldCompletedTasks().catch((error) =>
        console.error("[SCHEDULER] Cleanup failed:", error)
      );
      // Reschedule for next day
      scheduleCleanup();
    }, delay);
  };

  scheduleCleanup();

  return schedulerId;
}

/**
 * Stop Task Scheduler
 * 
 * Call this during server shutdown to clean up resources
 */
export function stopTaskScheduler(schedulerId: NodeJS.Timeout): void {
  clearInterval(schedulerId);
  console.log("[SCHEDULER] Task scheduler stopped");
}

/**
 * Manually Trigger Task Processing
 * 
 * Useful for:
 * - Testing
 * - Forcing immediate processing
 * - Admin operations
 * 
 * @returns Object with processing statistics
 */
export async function triggerTaskProcessing(): Promise<{
  overdueTasks: number;
  cleanedTasks: number;
  timestamp: Date;
}> {
  const before = await Task.countDocuments({ status: TaskStatus.OVERDUE });
  
  await processOverdueTasks();
  await cleanupOldCompletedTasks();
  
  const after = await Task.countDocuments({ status: TaskStatus.OVERDUE });
  
  return {
    overdueTasks: after - before,
    cleanedTasks: 0, // Would need separate tracking for cleanup count
    timestamp: new Date(),
  };
}
