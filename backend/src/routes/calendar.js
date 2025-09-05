const express = require("express");
const {
  CalendarEvent,
  User,
  Project,
  Task,
  ProjectMember,
} = require("../models");
const { authenticateToken } = require("../middleware/auth");
const { Op } = require("sequelize");

const router = express.Router();

// Get calendar events for date range
router.get("/events", authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, projectId, view } = req.query;

    let whereClause = {
      startDate: {
        [Op.between]: [startDate, endDate],
      },
    };

    // Filter based on user role and view type
    if (req.user.role === "manager") {
      // Managers can see all events in their projects
      if (projectId) {
        whereClause.projectId = projectId;
      }
    } else {
      // Members see only their own events
      whereClause.userId = req.user.id;
      if (projectId) {
        whereClause.projectId = projectId;
      }
    }

    const events = await CalendarEvent.findAll({
      where: whereClause,
      include: [
        { model: User, as: "user", attributes: ["id", "name"] },
        { model: Project, as: "project", attributes: ["id", "name", "color"] },
        { model: Task, as: "task", attributes: ["id", "title", "status"] },
      ],
      order: [["startDate", "ASC"]],
    });

    res.json({
      message: "Calendar events retrieved successfully",
      events,
    });
  } catch (error) {
    console.error("Get calendar events error:", error);
    res
      .status(500)
      .json({ message: "Server error retrieving calendar events" });
  }
});

// Create calendar event
router.post("/events", authenticateToken, async (req, res) => {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      eventType,
      projectId,
      taskId,
      color,
      isAllDay,
      reminder,
    } = req.body;

    const event = await CalendarEvent.create({
      title,
      description,
      startDate,
      endDate,
      eventType: eventType || "task",
      userId: req.user.id,
      projectId: projectId || null,
      taskId: taskId || null,
      color: color || "#3B82F6",
      isAllDay: isAllDay || false,
      reminder,
    });

    const eventWithDetails = await CalendarEvent.findByPk(event.id, {
      include: [
        { model: User, as: "user", attributes: ["id", "name"] },
        { model: Project, as: "project", attributes: ["id", "name", "color"] },
        { model: Task, as: "task", attributes: ["id", "title"] },
      ],
    });

    res.status(201).json({
      message: "Calendar event created successfully",
      event: eventWithDetails,
    });
  } catch (error) {
    console.error("Create calendar event error:", error);
    res.status(500).json({ message: "Server error creating calendar event" });
  }
});

// Auto-generate calendar events from tasks
router.post("/sync-tasks", authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.body;

    // Get tasks with due dates
    let whereClause = { dueDate: { [Op.not]: null } };
    if (projectId) {
      whereClause.projectId = projectId;
    }

    const tasks = await Task.findAll({
      where: whereClause,
      include: [
        { model: Project, as: "project", attributes: ["id", "name", "color"] },
        { model: User, as: "assignee", attributes: ["id", "name"] },
      ],
    });

    const eventsCreated = [];

    for (const task of tasks) {
      // Check if calendar event already exists for this task
      const existingEvent = await CalendarEvent.findOne({
        where: { taskId: task.id },
      });

      if (!existingEvent && task.assignee) {
        const dueDate = new Date(task.dueDate);
        const startDate = new Date(dueDate);
        startDate.setDate(startDate.getDate() - 1); // Start day before due

        const event = await CalendarEvent.create({
          title: task.title,
          description: task.description,
          startDate: startDate,
          endDate: dueDate,
          eventType: "task",
          userId: task.assignee.id,
          projectId: task.projectId,
          taskId: task.id,
          color: task.project.color || "#3B82F6",
          isAllDay: true,
        });

        eventsCreated.push(event);
      }
    }

    res.json({
      message: "Tasks synced to calendar successfully",
      eventsCreated: eventsCreated.length,
    });
  } catch (error) {
    console.error("Sync tasks error:", error);
    res.status(500).json({ message: "Server error syncing tasks" });
  }
});

// Get project timeline (Gantt chart data)
router.get("/timeline/:projectId", authenticateToken, async (req, res) => {
  try {
    const projectId = req.params.projectId;

    // Verify access to project
    let hasAccess = false;
    if (req.user.role === "manager") {
      const project = await Project.findOne({
        where: { id: projectId, managerId: req.user.id },
      });
      hasAccess = !!project;
    } else {
      const membership = await ProjectMember.findOne({
        where: { projectId, userId: req.user.id },
      });
      hasAccess = !!membership;
    }

    if (!hasAccess) {
      return res
        .status(403)
        .json({ message: "Access denied to project timeline" });
    }

    // Get all tasks with dates for this project
    const tasks = await Task.findAll({
      where: { projectId },
      include: [
        { model: User, as: "assignee", attributes: ["id", "name"] },
        { model: CalendarEvent, as: "calendarEvent" },
      ],
      order: [["createdAt", "ASC"]],
    });

    // Transform tasks into timeline format
    const timelineData = tasks.map((task) => {
      const startDate = task.calendarEvent?.startDate || task.createdAt;
      const endDate =
        task.calendarEvent?.endDate ||
        task.dueDate ||
        new Date(new Date(startDate).getTime() + 7 * 24 * 60 * 60 * 1000); // Default 7 days

      return {
        id: task.id,
        title: task.title,
        assignee: task.assignee?.name || "Unassigned",
        startDate,
        endDate,
        status: task.status,
        priority: task.priority,
        progress: getTaskProgress(task.status),
        color: getStatusColor(task.status, task.priority),
      };
    });

    // Get project overview
    const project = await Project.findByPk(projectId, {
      attributes: ["id", "name", "description", "createdAt"],
    });

    res.json({
      message: "Project timeline retrieved successfully",
      project,
      timeline: timelineData,
    });
  } catch (error) {
    console.error("Get timeline error:", error);
    res.status(500).json({ message: "Server error retrieving timeline" });
  }
});

// Get upcoming deadlines
router.get("/deadlines", authenticateToken, async (req, res) => {
  try {
    const { days = 7 } = req.query; // Default to next 7 days
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    let whereClause = {
      endDate: {
        [Op.between]: [now, futureDate],
      },
      eventType: ["task", "deadline"],
      status: { [Op.not]: "completed" },
    };

    // Filter by user role
    if (req.user.role !== "manager") {
      whereClause.userId = req.user.id;
    }

    const deadlines = await CalendarEvent.findAll({
      where: whereClause,
      include: [
        { model: User, as: "user", attributes: ["id", "name"] },
        { model: Project, as: "project", attributes: ["id", "name"] },
        { model: Task, as: "task", attributes: ["id", "title", "status"] },
      ],
      order: [["endDate", "ASC"]],
    });

    res.json({
      message: "Upcoming deadlines retrieved successfully",
      deadlines,
    });
  } catch (error) {
    console.error("Get deadlines error:", error);
    res.status(500).json({ message: "Server error retrieving deadlines" });
  }
});

// Helper functions
function getTaskProgress(status) {
  switch (status) {
    case "completed":
      return 100;
    case "in_progress":
      return 50;
    case "blocked":
      return 25;
    default:
      return 0;
  }
}

function getStatusColor(status, priority) {
  if (status === "completed") return "#10B981";
  if (status === "blocked") return "#EF4444";
  if (priority === "urgent") return "#F59E0B";
  if (priority === "high") return "#F97316";
  return "#3B82F6";
}

// Update calendar event
router.put("/events/:id", authenticateToken, async (req, res) => {
  try {
    const event = await CalendarEvent.findByPk(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Calendar event not found" });
    }

    // Check if user can edit (owner or manager)
    if (event.userId !== req.user.id && req.user.role !== "manager") {
      return res.status(403).json({ message: "Access denied" });
    }

    await CalendarEvent.update(req.body, {
      where: { id: req.params.id },
    });

    const updatedEvent = await CalendarEvent.findByPk(req.params.id, {
      include: [
        { model: User, as: "user", attributes: ["id", "name"] },
        { model: Project, as: "project", attributes: ["id", "name"] },
        { model: Task, as: "task", attributes: ["id", "title"] },
      ],
    });

    res.json({
      message: "Calendar event updated successfully",
      event: updatedEvent,
    });
  } catch (error) {
    console.error("Update calendar event error:", error);
    res.status(500).json({ message: "Server error updating calendar event" });
  }
});

// Delete calendar event
router.delete("/events/:id", authenticateToken, async (req, res) => {
  try {
    const event = await CalendarEvent.findByPk(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Calendar event not found" });
    }

    // Check if user can delete (owner or manager)
    if (event.userId !== req.user.id && req.user.role !== "manager") {
      return res.status(403).json({ message: "Access denied" });
    }

    await CalendarEvent.destroy({ where: { id: req.params.id } });

    res.json({ message: "Calendar event deleted successfully" });
  } catch (error) {
    console.error("Delete calendar event error:", error);
    res.status(500).json({ message: "Server error deleting calendar event" });
  }
});

module.exports = router;
