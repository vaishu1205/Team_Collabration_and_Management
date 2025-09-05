const express = require("express");
const { Task, Project, User } = require("../models");
const { authenticateToken } = require("../middleware/auth");
// const { sendInstantEmail } = require("./email");
const { Notification } = require("../models");
const router = express.Router();

// Enhanced task creation with proper assignment
// router.post("/", authenticateToken, async (req, res) => {
//   try {
//     const {
//       title,
//       description,
//       projectId,
//       assigneeId,
//       priority,
//       dueDate,
//       estimatedHours,
//     } = req.body;

//     // Only managers can create tasks
//     if (req.user.role !== "manager") {
//       return res
//         .status(403)
//         .json({ message: "Only managers can create tasks" });
//     }

//     // Verify manager has access to project
//     const project = await Project.findOne({
//       where: { id: projectId, managerId: req.user.id },
//     });
//     if (!project) {
//       return res.status(403).json({ message: "Access denied to this project" });
//     }

//     const task = await Task.create({
//       title,
//       description,
//       projectId,
//       assigneeId,
//       priority: priority || "medium",
//       dueDate,
//       estimatedHours,
//       createdById: req.user.id,
//       status: "todo",
//     });

//     const taskWithDetails = await Task.findByPk(task.id, {
//       include: [
//         { model: User, as: "assignee", attributes: ["id", "name", "email"] },
//         { model: User, as: "creator", attributes: ["id", "name", "email"] },
//         { model: Project, as: "project", attributes: ["id", "name"] },
//       ],
//     });

//     // CREATE NOTIFICATION IF TASK IS ASSIGNED
//     if (assigneeId) {
//       const { Notification } = require("../models");
//       await Notification.create({
//         userId: assigneeId,
//         title: "New Task Assigned",
//         message: `You have been assigned "${title}" in project "${project.name}" by ${req.user.name}`,
//         type: "task_assigned",
//         relatedId: task.id,
//       });
//     }

//     res.status(201).json({
//       message: "Task created and assigned successfully",
//       task: taskWithDetails,
//     });
//   } catch (error) {
//     console.error("Create task error:", error);
//     res.status(500).json({ message: "Server error creating task" });
//   }
// });

// Enhanced task creation with proper assignment
router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      title,
      description,
      projectId,
      assigneeId,
      priority,
      dueDate,
      estimatedHours,
    } = req.body;

    // Only managers can create tasks
    if (req.user.role !== "manager") {
      return res
        .status(403)
        .json({ message: "Only managers can create tasks" });
    }

    // Verify manager has access to project
    const project = await Project.findOne({
      where: { id: projectId, managerId: req.user.id },
    });
    if (!project) {
      return res.status(403).json({ message: "Access denied to this project" });
    }

    // FIXED: Properly parse numeric values
    const task = await Task.create({
      title,
      description,
      projectId: parseInt(projectId),
      assigneeId: assigneeId ? parseInt(assigneeId) : null, // FIXED: Parse to integer
      priority: priority || "medium",
      dueDate: dueDate || null,
      estimatedHours: estimatedHours ? parseFloat(estimatedHours) : null, // FIXED: Parse to float
      createdById: req.user.id,
      status: "todo",
    });

    const taskWithDetails = await Task.findByPk(task.id, {
      include: [
        { model: User, as: "assignee", attributes: ["id", "name", "email"] },
        { model: User, as: "creator", attributes: ["id", "name", "email"] },
        { model: Project, as: "project", attributes: ["id", "name"] },
      ],
    });

    // CREATE NOTIFICATION IF TASK IS ASSIGNED
    if (assigneeId) {
      await Notification.create({
        userId: parseInt(assigneeId), // FIXED: Parse to integer
        title: "New Task Assigned",
        message: `You have been assigned "${title}" in project "${project.name}" by ${req.user.name}`,
        type: "task_assigned",
        relatedId: task.id,
      });

      // await sendInstantEmail("task_assignment", assigneeId, {
      //   taskTitle: title,
      //   projectName: project.name,
      //   assignedBy: req.user.name,
      //   dueDate: dueDate,
      // });
    }

    res.status(201).json({
      message: "Task created and assigned successfully",
      task: taskWithDetails,
    });
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({ message: "Server error creating task" });
  }
});

// Get project tasks
router.get("/project/:projectId", authenticateToken, async (req, res) => {
  try {
    const tasks = await Task.findAll({
      where: { projectId: req.params.projectId },
      include: [
        { model: User, as: "assignee", attributes: ["id", "name", "email"] },
        { model: User, as: "creator", attributes: ["id", "name", "email"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: "Server error retrieving tasks" });
  }
});

// Get tasks assigned to current user
router.get("/my-tasks", authenticateToken, async (req, res) => {
  try {
    const tasks = await Task.findAll({
      where: { assigneeId: req.user.id },
      include: [
        { model: User, as: "assignee", attributes: ["id", "name", "email"] },
        { model: User, as: "creator", attributes: ["id", "name", "email"] },
        { model: Project, as: "project", attributes: ["id", "name", "color"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({
      message: "User tasks retrieved successfully",
      tasks,
    });
  } catch (error) {
    console.error("Get user tasks error:", error);
    res.status(500).json({ message: "Server error retrieving user tasks" });
  }
});

// Update task status
router.put("/:id/status", authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    await Task.update({ status }, { where: { id: req.params.id } });
    res.json({ message: "Task status updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error updating task" });
  }
});

// Task reassignment endpoint (NEW)
router.put("/:id/reassign", authenticateToken, async (req, res) => {
  try {
    const { newAssigneeId } = req.body;

    // Only managers can reassign tasks
    if (req.user.role !== "manager") {
      return res
        .status(403)
        .json({ message: "Only managers can reassign tasks" });
    }

    const task = await Task.findByPk(req.params.id, {
      include: [{ model: Project, as: "project" }],
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Verify manager owns the project
    if (task.project.managerId !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const oldAssigneeId = task.assigneeId;

    await Task.update(
      { assigneeId: newAssigneeId },
      { where: { id: req.params.id } }
    );

    // Create notifications
    const { Notification } = require("../models");

    if (newAssigneeId) {
      await Notification.create({
        userId: newAssigneeId,
        title: "Task Assigned to You",
        message: `Task "${task.title}" has been assigned to you by ${req.user.name}`,
        type: "task_assigned",
        relatedId: task.id,
      });
    }

    if (oldAssigneeId && oldAssigneeId !== newAssigneeId) {
      await Notification.create({
        userId: oldAssigneeId,
        title: "Task Reassigned",
        message: `Task "${task.title}" has been reassigned to another team member`,
        type: "task_assigned",
        relatedId: task.id,
      });
    }

    res.json({ message: "Task reassigned successfully" });
  } catch (error) {
    console.error("Reassign task error:", error);
    res.status(500).json({ message: "Server error reassigning task" });
  }
});

// Delete task endpoint (NEW)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    // Only managers can delete tasks
    if (req.user.role !== "manager") {
      return res
        .status(403)
        .json({ message: "Only managers can delete tasks" });
    }

    const task = await Task.findByPk(req.params.id, {
      include: [{ model: Project, as: "project" }],
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Verify manager owns the project
    if (task.project.managerId !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Notify assigned member if task is deleted
    if (task.assigneeId) {
      const { Notification } = require("../models");
      await Notification.create({
        userId: task.assigneeId,
        title: "Task Deleted",
        message: `Task "${task.title}" has been deleted by ${req.user.name}`,
        type: "general",
        relatedId: null,
      });
    }

    await Task.destroy({ where: { id: req.params.id } });

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({ message: "Server error deleting task" });
  }
});

module.exports = router;

// const express = require("express");
// const { Task, Project, User } = require("../models");
// const { authenticateToken } = require("../middleware/auth");

// const router = express.Router();

// // Create task
// router.post("/", authenticateToken, async (req, res) => {
//   try {
//     const { title, description, projectId, assigneeId, priority, dueDate } =
//       req.body;

//     const task = await Task.create({
//       title,
//       description,
//       projectId,
//       assigneeId,
//       priority: priority || "medium",
//       dueDate,
//       createdById: req.user.id,
//     });

//     const taskWithDetails = await Task.findByPk(task.id, {
//       include: [
//         { model: User, as: "assignee", attributes: ["id", "name", "email"] },
//         { model: User, as: "creator", attributes: ["id", "name", "email"] },
//       ],
//     });

//     res
//       .status(201)
//       .json({ message: "Task created successfully", task: taskWithDetails });
//   } catch (error) {
//     res.status(500).json({ message: "Server error creating task" });
//   }
// });

// // Get project tasks
// router.get("/project/:projectId", authenticateToken, async (req, res) => {
//   try {
//     const tasks = await Task.findAll({
//       where: { projectId: req.params.projectId },
//       include: [
//         { model: User, as: "assignee", attributes: ["id", "name", "email"] },
//         { model: User, as: "creator", attributes: ["id", "name", "email"] },
//       ],
//       order: [["createdAt", "DESC"]],
//     });

//     res.json({ tasks });
//   } catch (error) {
//     res.status(500).json({ message: "Server error retrieving tasks" });
//   }
// });

// // Get tasks assigned to current user
// router.get("/my-tasks", authenticateToken, async (req, res) => {
//   try {
//     const tasks = await Task.findAll({
//       where: { assigneeId: req.user.id },
//       include: [
//         { model: User, as: "assignee", attributes: ["id", "name", "email"] },
//         { model: User, as: "creator", attributes: ["id", "name", "email"] },
//         { model: Project, as: "project", attributes: ["id", "name", "color"] },
//       ],
//       order: [["createdAt", "DESC"]],
//     });

//     res.json({
//       message: "User tasks retrieved successfully",
//       tasks,
//     });
//   } catch (error) {
//     console.error("Get user tasks error:", error);
//     res.status(500).json({ message: "Server error retrieving user tasks" });
//   }
// });

// // Create task
// router.post("/", authenticateToken, async (req, res) => {
//   try {
//     const { title, description, projectId, assigneeId, priority, dueDate } =
//       req.body;

//     const task = await Task.create({
//       title,
//       description,
//       projectId,
//       assigneeId,
//       priority: priority || "medium",
//       dueDate,
//       createdById: req.user.id,
//     });

//     const taskWithDetails = await Task.findByPk(task.id, {
//       include: [
//         { model: User, as: "assignee", attributes: ["id", "name", "email"] },
//         { model: User, as: "creator", attributes: ["id", "name", "email"] },
//         { model: Project, as: "project", attributes: ["id", "name"] },
//       ],
//     });

//     // CREATE NOTIFICATION IF TASK IS ASSIGNED
//     if (assigneeId) {
//       const { Notification } = require("../models");
//       await Notification.create({
//         userId: assigneeId,
//         title: "New Task Assigned",
//         message: `You have been assigned task "${title}" in project "${taskWithDetails.project.name}" by ${req.user.name}`,
//         type: "task_assigned",
//         relatedId: task.id,
//       });
//     }

//     res
//       .status(201)
//       .json({ message: "Task created successfully", task: taskWithDetails });
//   } catch (error) {
//     console.error("Create task error:", error);
//     res.status(500).json({ message: "Server error creating task" });
//   }
// });

// // Update task status
// router.put("/:id/status", authenticateToken, async (req, res) => {
//   try {
//     const { status } = req.body;
//     await Task.update({ status }, { where: { id: req.params.id } });
//     res.json({ message: "Task status updated successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Server error updating task" });
//   }
// });

// module.exports = router;
