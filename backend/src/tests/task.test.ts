/**
 * Task Scheduling System - Integration Tests
 * 
 * Run with: npm test -- task.test.ts
 * Or: npm run test:watch -- task.test.ts
 */

import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import Task, { TaskStatus, TaskType, EntityType } from "../models/Task";
import TaskService from "../services/task.service";
import { processOverdueTasks, triggerTaskProcessing } from "../workers/taskScheduler";
import { v4 as uuidv4 } from "uuid";

describe("Task Scheduling System", () => {
  let mongoServer: MongoMemoryServer;
  let agentId: string;
  let leadId: string;

  /**
   * Setup: Connect to in-memory MongoDB for testing
   */
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    await mongoose.connect(mongoUri);

    // Create test agent and lead IDs
    agentId = new mongoose.Types.ObjectId().toString();
    leadId = new mongoose.Types.ObjectId().toString();
  });

  /**
   * Cleanup: Disconnect and stop MongoDB server
   */
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  /**
   * Clear tasks between tests
   */
  beforeEach(async () => {
    await Task.deleteMany({});
  });

  describe("Task Service - CRUD Operations", () => {
    test("should create a task", async () => {
      const taskData = {
        type: TaskType.FOLLOW_UP,
        title: "Follow up with lead",
        dueAt: new Date(),
        assignedAgentId: agentId,
        entityType: EntityType.LEAD,
        entityId: leadId,
        priority: "HIGH" as const,
      };

      const task = await TaskService.createTask(taskData);

      expect(task).toBeDefined();
      expect(task._id).toBeDefined();
      expect(task.taskId).toBeDefined(); // Should have UUID
      expect(task.type).toBe(TaskType.FOLLOW_UP);
      expect(task.status).toBe(TaskStatus.PENDING);
      expect(task.title).toBe("Follow up with lead");
    });

    test("should get task by ID", async () => {
      const taskData = {
        type: TaskType.CALL,
        title: "Call lead",
        dueAt: new Date(),
        assignedAgentId: agentId,
        entityType: EntityType.LEAD,
        entityId: leadId,
      };

      const created = await TaskService.createTask(taskData);
      const retrieved = await TaskService.getTaskById(created._id.toString());

      expect(retrieved).toBeDefined();
      expect(retrieved?.title).toBe("Call lead");
    });

    test("should get task by taskId (UUID)", async () => {
      const taskData = {
        type: TaskType.MEETING,
        title: "Schedule meeting",
        dueAt: new Date(),
        assignedAgentId: agentId,
        entityType: EntityType.CUSTOMER,
        entityId: leadId,
      };

      const created = await TaskService.createTask(taskData);
      const retrieved = await TaskService.getTaskByTaskId(created.taskId);

      expect(retrieved).toBeDefined();
      expect(retrieved?.title).toBe("Schedule meeting");
    });

    test("should query tasks with filters", async () => {
      // Create multiple tasks
      await TaskService.createTask({
        type: TaskType.FOLLOW_UP,
        title: "Task 1",
        dueAt: new Date(),
        assignedAgentId: agentId,
        entityType: EntityType.LEAD,
        entityId: leadId,
      });

      await TaskService.createTask({
        type: TaskType.CALL,
        title: "Task 2",
        dueAt: new Date(),
        assignedAgentId: agentId,
        entityType: EntityType.CUSTOMER,
        entityId: leadId,
      });

      // Query all
      const allTasks = await TaskService.getTasks({ skip: 0, limit: 20 });
      expect(allTasks.total).toBe(2);
      expect(allTasks.tasks.length).toBe(2);

      // Filter by type
      const followUps = await TaskService.getTasks({
        type: TaskType.FOLLOW_UP,
        skip: 0,
        limit: 20,
      });
      expect(followUps.total).toBe(1);
      expect(followUps.tasks[0].title).toBe("Task 1");

      // Filter by entity type
      const customers = await TaskService.getTasks({
        entityType: EntityType.CUSTOMER,
        skip: 0,
        limit: 20,
      });
      expect(customers.total).toBe(1);
      expect(customers.tasks[0].title).toBe("Task 2");
    });

    test("should update task", async () => {
      const taskData = {
        type: TaskType.FOLLOW_UP,
        title: "Original title",
        dueAt: new Date(),
        assignedAgentId: agentId,
        entityType: EntityType.LEAD,
        entityId: leadId,
      };

      const created = await TaskService.createTask(taskData);
      const updated = await TaskService.updateTask(created._id.toString(), {
        title: "Updated title",
        priority: "LOW",
      });

      expect(updated?.title).toBe("Updated title");
      expect(updated?.priority).toBe("LOW");
    });

    test("should update task status", async () => {
      const taskData = {
        type: TaskType.FOLLOW_UP,
        title: "Task to complete",
        dueAt: new Date(),
        assignedAgentId: agentId,
        entityType: EntityType.LEAD,
        entityId: leadId,
      };

      const created = await TaskService.createTask(taskData);
      const completed = await TaskService.updateTaskStatus(
        created._id.toString(),
        TaskStatus.COMPLETED,
        "Task completed successfully"
      );

      expect(completed?.status).toBe(TaskStatus.COMPLETED);
      expect(completed?.completedAt).toBeDefined();
      expect(completed?.completionNotes).toBe("Task completed successfully");
    });

    test("should delete task", async () => {
      const taskData = {
        type: TaskType.FOLLOW_UP,
        title: "Task to delete",
        dueAt: new Date(),
        assignedAgentId: agentId,
        entityType: EntityType.LEAD,
        entityId: leadId,
      };

      const created = await TaskService.createTask(taskData);
      const deleted = await TaskService.deleteTask(created._id.toString());

      expect(deleted).toBe(true);

      const retrieved = await TaskService.getTaskById(created._id.toString());
      expect(retrieved).toBeNull();
    });
  });

  describe("Task Scheduler - Overdue Processing", () => {
    test("should mark pending tasks as overdue", async () => {
      // Create a task with past due date
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 1); // 1 hour ago

      const taskData = {
        type: TaskType.FOLLOW_UP,
        title: "Overdue task",
        dueAt: pastDate,
        assignedAgentId: agentId,
        entityType: EntityType.LEAD,
        entityId: leadId,
      };

      const created = await TaskService.createTask(taskData);
      expect(created.status).toBe(TaskStatus.PENDING);

      // Run scheduler
      await processOverdueTasks();

      // Check if marked as overdue
      const updated = await TaskService.getTaskById(created._id.toString());
      expect(updated?.status).toBe(TaskStatus.OVERDUE);
    });

    test("should not mark future tasks as overdue", async () => {
      // Create a task with future due date
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1); // 1 hour from now

      const taskData = {
        type: TaskType.FOLLOW_UP,
        title: "Future task",
        dueAt: futureDate,
        assignedAgentId: agentId,
        entityType: EntityType.LEAD,
        entityId: leadId,
      };

      const created = await TaskService.createTask(taskData);

      // Run scheduler
      await processOverdueTasks();

      // Should still be PENDING
      const updated = await TaskService.getTaskById(created._id.toString());
      expect(updated?.status).toBe(TaskStatus.PENDING);
    });

    test("should not mark completed tasks as overdue", async () => {
      // Create and complete a task with past due date
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 1);

      const taskData = {
        type: TaskType.FOLLOW_UP,
        title: "Completed task",
        dueAt: pastDate,
        assignedAgentId: agentId,
        entityType: EntityType.LEAD,
        entityId: leadId,
      };

      const created = await TaskService.createTask(taskData);
      await TaskService.updateTaskStatus(created._id.toString(), TaskStatus.COMPLETED);

      // Run scheduler
      await processOverdueTasks();

      // Should still be COMPLETED
      const updated = await TaskService.getTaskById(created._id.toString());
      expect(updated?.status).toBe(TaskStatus.COMPLETED);
    });

    test("should handle batch overdue processing", async () => {
      // Create multiple overdue tasks
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 2);

      const tasks = await Promise.all([
        TaskService.createTask({
          type: TaskType.FOLLOW_UP,
          title: "Overdue 1",
          dueAt: pastDate,
          assignedAgentId: agentId,
          entityType: EntityType.LEAD,
          entityId: leadId,
        }),
        TaskService.createTask({
          type: TaskType.CALL,
          title: "Overdue 2",
          dueAt: pastDate,
          assignedAgentId: agentId,
          entityType: EntityType.CUSTOMER,
          entityId: leadId,
        }),
      ]);

      // Run scheduler
      await processOverdueTasks();

      // Check all marked as overdue
      const task1 = await TaskService.getTaskById(tasks[0]._id.toString());
      const task2 = await TaskService.getTaskById(tasks[1]._id.toString());

      expect(task1?.status).toBe(TaskStatus.OVERDUE);
      expect(task2?.status).toBe(TaskStatus.OVERDUE);
    });
  });

  describe("Task Service - Special Queries", () => {
    test("should get agent tasks", async () => {
      const anotherAgentId = new mongoose.Types.ObjectId().toString();

      // Create tasks for both agents
      await TaskService.createTask({
        type: TaskType.FOLLOW_UP,
        title: "Agent 1 task",
        dueAt: new Date(),
        assignedAgentId: agentId,
        entityType: EntityType.LEAD,
        entityId: leadId,
      });

      await TaskService.createTask({
        type: TaskType.CALL,
        title: "Agent 2 task",
        dueAt: new Date(),
        assignedAgentId: anotherAgentId,
        entityType: EntityType.LEAD,
        entityId: leadId,
      });

      // Get agent 1's tasks
      const agentTasks = await TaskService.getAgentTasks(agentId);
      expect(agentTasks.length).toBe(1);
      expect(agentTasks[0].title).toBe("Agent 1 task");
    });

    test("should get overdue tasks by entity", async () => {
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 1);

      // Create overdue and pending tasks
      const overdue = await TaskService.createTask({
        type: TaskType.FOLLOW_UP,
        title: "Overdue task",
        dueAt: pastDate,
        assignedAgentId: agentId,
        entityType: EntityType.LEAD,
        entityId: leadId,
      });

      await TaskService.createTask({
        type: TaskType.CALL,
        title: "Pending task",
        dueAt: new Date(Date.now() + 3600000),
        assignedAgentId: agentId,
        entityType: EntityType.LEAD,
        entityId: leadId,
      });

      // Mark first as overdue
      await processOverdueTasks();

      // Get overdue tasks
      const overdueTasks = await TaskService.getOverdueTasksByEntity(
        EntityType.LEAD,
        leadId
      );

      expect(overdueTasks.length).toBe(1);
      expect(overdueTasks[0].title).toBe("Overdue task");
    });

    test("should get task statistics", async () => {
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 1);

      // Create various tasks
      const pending = await TaskService.createTask({
        type: TaskType.FOLLOW_UP,
        title: "Pending",
        dueAt: new Date(Date.now() + 3600000),
        assignedAgentId: agentId,
        entityType: EntityType.LEAD,
        entityId: leadId,
      });

      const overdue = await TaskService.createTask({
        type: TaskType.CALL,
        title: "Overdue",
        dueAt: pastDate,
        assignedAgentId: agentId,
        entityType: EntityType.LEAD,
        entityId: leadId,
      });

      const completed = await TaskService.createTask({
        type: TaskType.MEETING,
        title: "Completed",
        dueAt: new Date(),
        assignedAgentId: agentId,
        entityType: EntityType.CUSTOMER,
        entityId: leadId,
      });

      await TaskService.updateTaskStatus(completed._id.toString(), TaskStatus.COMPLETED);
      await processOverdueTasks();

      // Get stats
      const stats = await TaskService.getTaskStats(agentId);

      expect(stats.total).toBe(3);
      expect(stats.pending).toBe(1);
      expect(stats.overdue).toBe(1);
      expect(stats.completed).toBe(1);
    });
  });

  describe("Task Service - Bulk Operations", () => {
    test("should bulk update task status", async () => {
      // Create multiple tasks
      const tasks = await Promise.all([
        TaskService.createTask({
          type: TaskType.FOLLOW_UP,
          title: "Task 1",
          dueAt: new Date(),
          assignedAgentId: agentId,
          entityType: EntityType.LEAD,
          entityId: leadId,
        }),
        TaskService.createTask({
          type: TaskType.CALL,
          title: "Task 2",
          dueAt: new Date(),
          assignedAgentId: agentId,
          entityType: EntityType.LEAD,
          entityId: leadId,
        }),
      ]);

      const taskIds = tasks.map((t) => t._id.toString());

      // Bulk update
      const updated = await TaskService.bulkUpdateStatus(
        taskIds,
        TaskStatus.COMPLETED
      );

      expect(updated).toBe(2);

      // Verify
      const task1 = await TaskService.getTaskById(taskIds[0]);
      const task2 = await TaskService.getTaskById(taskIds[1]);

      expect(task1?.status).toBe(TaskStatus.COMPLETED);
      expect(task2?.status).toBe(TaskStatus.COMPLETED);
    });
  });

  describe("Pagination", () => {
    test("should paginate task results", async () => {
      // Create 25 tasks
      for (let i = 0; i < 25; i++) {
        await TaskService.createTask({
          type: TaskType.FOLLOW_UP,
          title: `Task ${i}`,
          dueAt: new Date(),
          assignedAgentId: agentId,
          entityType: EntityType.LEAD,
          entityId: leadId,
        });
      }

      // Get first page
      const page1 = await TaskService.getTasks({ skip: 0, limit: 10 });
      expect(page1.tasks.length).toBe(10);
      expect(page1.total).toBe(25);

      // Get second page
      const page2 = await TaskService.getTasks({ skip: 10, limit: 10 });
      expect(page2.tasks.length).toBe(10);

      // Get last page (partial)
      const page3 = await TaskService.getTasks({ skip: 20, limit: 10 });
      expect(page3.tasks.length).toBe(5);
    });
  });
});
