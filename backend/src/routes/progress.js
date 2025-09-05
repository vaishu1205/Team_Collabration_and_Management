const express = require("express");
const {
  TaskProgress,
  Task,
  User,
  Project,
  ProjectMember,
} = require("../models");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Create progress update
// router.post("/task/:taskId", authenticateToken, async (req, res) => {
//   try {
//     const { progressPercent, hoursWorked, workCompleted, blockers, nextSteps } =
//       req.body;

//     // Verify task exists and user has access
//     const task = await Task.findOne({
//       where: { id: req.params.taskId },
//       include: [
//         {
//           model: Project,
//           as: "project",
//           include: [
//             {
//               model: ProjectMember,
//               as: "members",
//               where: { userId: req.user.id },
//             },
//           ],
//         },
//       ],
//     });

//     if (!task) {
//       return res
//         .status(404)
//         .json({ message: "Task not found or access denied" });
//     }

//     const progressUpdate = await TaskProgress.create({
//       taskId: req.params.taskId,
//       userId: req.user.id,
//       progressPercent,
//       hoursWorked,
//       workCompleted,
//       blockers,
//       nextSteps,
//     });

//     // Update task progress percentage
//     await Task.update(
//       {
//         status:
//           progressPercent >= 100
//             ? "completed"
//             : progressPercent > 0
//             ? "in_progress"
//             : "todo",
//       },
//       { where: { id: req.params.taskId } }
//     );

//     const progressWithUser = await TaskProgress.findByPk(progressUpdate.id, {
//       include: [
//         { model: User, as: "reporter", attributes: ["id", "name", "email"] },
//       ],
//     });

//     res.status(201).json({
//       message: "Progress update created successfully",
//       progress: progressWithUser,
//     });
//   } catch (error) {
//     console.error("Create progress error:", error);
//     res.status(500).json({ message: "Server error creating progress update" });
//   }
// });
// Create progress update
// router.post("/task/:taskId", authenticateToken, async (req, res) => {
//   try {
//     const { progressPercent, hoursWorked, workCompleted, blockers, nextSteps } =
//       req.body;

//     console.log("Progress update request:", {
//       taskId: req.params.taskId,
//       userId: req.user.id,
//       progressPercent,
//       hoursWorked,
//       workCompleted,
//     });

//     // Verify task exists and user has access
//     const task = await Task.findByPk(req.params.taskId, {
//       include: [
//         {
//           model: Project,
//           as: "project",
//           include: [{ model: ProjectMember, as: "members" }],
//         },
//       ],
//     });

//     console.log("Task found:", task ? "Yes" : "No");

//     if (!task) {
//       return res.status(404).json({ message: "Task not found" });
//     }

//     // Check if user is project member or task assignee
//     const isProjectMember = task.project.members.some(
//       (member) => member.userId === req.user.id
//     );
//     const isTaskAssignee = task.assigneeId === req.user.id;

//     console.log("Access check:", { isProjectMember, isTaskAssignee });

//     if (!isProjectMember && !isTaskAssignee) {
//       return res.status(403).json({ message: "Access denied to this task" });
//     }

//     console.log("Creating progress update...");

//     const progressUpdate = await TaskProgress.create({
//       taskId: req.params.taskId,
//       userId: req.user.id,
//       progressPercent: parseInt(progressPercent),
//       hoursWorked: parseFloat(hoursWorked),
//       workCompleted,
//       blockers: blockers || null,
//       nextSteps: nextSteps || null,
//     });

//     console.log("Progress update created:", progressUpdate.id);

//     // Update task progress percentage
//     await Task.update(
//       {
//         status:
//           progressPercent >= 100
//             ? "completed"
//             : progressPercent > 0
//             ? "in_progress"
//             : "todo",
//       },
//       { where: { id: req.params.taskId } }
//     );

//     const progressWithUser = await TaskProgress.findByPk(progressUpdate.id, {
//       include: [
//         { model: User, as: "reporter", attributes: ["id", "name", "email"] },
//       ],
//     });

//     res.status(201).json({
//       message: "Progress update created successfully",
//       progress: progressWithUser,
//     });
//   } catch (error) {
//     console.error("DETAILED Create progress error:", error);
//     console.error("Error stack:", error.stack);
//     res.status(500).json({
//       message: "Server error creating progress update",
//       error: error.message, // Add this for debugging
//     });
//   }
// });
// Create progress update (DEBUG VERSION)
router.post("/task/:taskId", authenticateToken, async (req, res) => {
  try {
    const { progressPercent, hoursWorked, workCompleted, blockers, nextSteps } =
      req.body;

    console.log("\n=== PROGRESS DEBUG ===");
    console.log("User making request:", {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
    });
    console.log("Task ID requested:", req.params.taskId);

    // Get task with all relationships
    const task = await Task.findByPk(req.params.taskId, {
      include: [
        {
          model: Project,
          as: "project",
          include: [{ model: ProjectMember, as: "members" }],
        },
        { model: User, as: "assignee", attributes: ["id", "name", "email"] },
      ],
    });

    if (!task) {
      console.log("❌ Task not found");
      return res.status(404).json({ message: "Task not found" });
    }

    console.log("Task found:", {
      id: task.id,
      title: task.title,
      assigneeId: task.assigneeId,
      assigneeName: task.assignee?.name || "Unassigned",
    });

    console.log("Project info:", {
      id: task.project.id,
      name: task.project.name,
      managerId: task.project.managerId,
    });

    console.log(
      "Project members:",
      task.project.members.map((m) => ({
        userId: m.userId,
        role: m.role,
      }))
    );

    // Check access conditions
    const isProjectOwner = task.project.managerId === req.user.id;
    const isProjectMember = task.project.members.some(
      (member) => member.userId === req.user.id
    );
    const isTaskAssignee = task.assigneeId === req.user.id;

    console.log("Access checks:", {
      isProjectOwner: `${isProjectOwner} (${task.project.managerId} === ${req.user.id})`,
      isProjectMember: `${isProjectMember}`,
      isTaskAssignee: `${isTaskAssignee} (${task.assigneeId} === ${req.user.id})`,
    });

    if (!isProjectOwner && !isProjectMember && !isTaskAssignee) {
      console.log("❌ Access denied - none of the conditions met");
      return res.status(403).json({ message: "Access denied to this task" });
    }

    console.log("✅ Access granted, creating progress update...");
    console.log("=== END DEBUG ===\n");

    // Create progress update (rest of code stays same)
    const progressUpdate = await TaskProgress.create({
      taskId: req.params.taskId,
      userId: req.user.id,
      progressPercent: parseInt(progressPercent),
      hoursWorked: parseFloat(hoursWorked),
      workCompleted,
      blockers: blockers || null,
      nextSteps: nextSteps || null,
    });

    res.status(201).json({
      message: "Progress update created successfully",
      progress: progressUpdate,
    });
  } catch (error) {
    console.error("Create progress error:", error);
    res.status(500).json({ message: "Server error creating progress update" });
  }
});

// Get task progress history
router.get("/task/:taskId", authenticateToken, async (req, res) => {
  try {
    const progressUpdates = await TaskProgress.findAll({
      where: { taskId: req.params.taskId },
      include: [
        { model: User, as: "reporter", attributes: ["id", "name", "email"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({
      message: "Progress updates retrieved successfully",
      updates: progressUpdates,
    });
  } catch (error) {
    console.error("Get progress error:", error);
    res.status(500).json({ message: "Server error retrieving progress" });
  }
});

// Get project progress overview
router.get(
  "/project/:projectId/overview",
  authenticateToken,
  async (req, res) => {
    try {
      const tasks = await Task.findAll({
        where: { projectId: req.params.projectId },
        include: [
          {
            model: TaskProgress,
            as: "progressUpdates",
            include: [{ model: User, as: "reporter", attributes: ["name"] }],
            limit: 1,
            order: [["createdAt", "DESC"]],
          },
          { model: User, as: "assignee", attributes: ["id", "name"] },
        ],
      });

      const progressData = tasks.map((task) => ({
        taskId: task.id,
        title: task.title,
        assignee: task.assignee,
        currentProgress:
          task.progressUpdates.length > 0
            ? task.progressUpdates[0].progressPercent
            : 0,
        lastUpdate:
          task.progressUpdates.length > 0 ? task.progressUpdates[0] : null,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
      }));

      res.json({
        message: "Project progress overview retrieved",
        tasks: progressData,
      });
    } catch (error) {
      console.error("Get project progress error:", error);
      res
        .status(500)
        .json({ message: "Server error retrieving project progress" });
    }
  }
);

module.exports = router;
