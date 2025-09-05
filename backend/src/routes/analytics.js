const express = require("express");
const {
  Task,
  User,
  Project,
  ProjectMember,
  TaskProgress,
} = require("../models");
const { authenticateToken } = require("../middleware/auth");
const { Op } = require("sequelize");

const router = express.Router();

// Get comprehensive project analytics
router.get("/project/:projectId", authenticateToken, async (req, res) => {
  try {
    const projectId = req.params.projectId;

    // Get project with members
    const project = await Project.findByPk(projectId, {
      include: [
        {
          model: ProjectMember,
          as: "members",
          include: [{ model: User, as: "user" }],
        },
      ],
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Get all tasks in project
    const tasks = await Task.findAll({
      where: { projectId },
      include: [
        { model: User, as: "assignee", attributes: ["id", "name", "email"] },
        { model: TaskProgress, as: "progressUpdates" },
      ],
    });

    // Calculate team workload
    const teamWorkload = [];
    for (const member of project.members) {
      const memberTasks = tasks.filter(
        (task) => task.assigneeId === member.user.id
      );

      const completedTasks = memberTasks.filter(
        (task) => task.status === "completed"
      );
      const inProgressTasks = memberTasks.filter(
        (task) => task.status === "in_progress"
      );
      const overdueTasks = memberTasks.filter(
        (task) =>
          task.dueDate &&
          new Date(task.dueDate) < new Date() &&
          task.status !== "completed"
      );

      // Calculate total hours worked from progress updates
      let totalHoursWorked = 0;
      memberTasks.forEach((task) => {
        task.progressUpdates.forEach((progress) => {
          if (progress.userId === member.user.id) {
            totalHoursWorked += parseFloat(progress.hoursWorked || 0);
          }
        });
      });

      const completionRate =
        memberTasks.length > 0
          ? Math.round((completedTasks.length / memberTasks.length) * 100)
          : 0;

      teamWorkload.push({
        member: {
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
          role: member.role,
        },
        taskStats: {
          total: memberTasks.length,
          completed: completedTasks.length,
          inProgress: inProgressTasks.length,
          overdue: overdueTasks.length,
          completionRate,
        },
        timeTracking: {
          totalHoursWorked,
          avgHoursPerTask:
            memberTasks.length > 0
              ? Math.round((totalHoursWorked / memberTasks.length) * 10) / 10
              : 0,
        },
        recentActivity: await getRecentActivity(member.user.id, projectId),
      });
    }

    // Project-wide statistics
    const projectStats = {
      totalTasks: tasks.length,
      completedTasks: tasks.filter((t) => t.status === "completed").length,
      inProgressTasks: tasks.filter((t) => t.status === "in_progress").length,
      overdueTasks: tasks.filter(
        (t) =>
          t.dueDate &&
          new Date(t.dueDate) < new Date() &&
          t.status !== "completed"
      ).length,
      unassignedTasks: tasks.filter((t) => !t.assigneeId).length,
    };

    projectStats.completionPercentage =
      projectStats.totalTasks > 0
        ? Math.round(
            (projectStats.completedTasks / projectStats.totalTasks) * 100
          )
        : 0;

    // Productivity trends (last 7 days)
    const productivityTrend = await getProductivityTrend(projectId);

    res.json({
      message: "Project analytics retrieved successfully",
      analytics: {
        project: {
          id: project.id,
          name: project.name,
          stats: projectStats,
        },
        teamWorkload,
        productivityTrend,
        alerts: generateAlerts(tasks, teamWorkload),
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ message: "Server error retrieving analytics" });
  }
});

// Helper function to get recent activity
async function getRecentActivity(userId, projectId) {
  try {
    const recentProgress = await TaskProgress.findAll({
      where: { userId },
      include: [
        {
          model: Task,
          as: "task",
          where: { projectId },
          attributes: ["id", "title"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 3,
    });

    return recentProgress.map((progress) => ({
      date: progress.createdAt,
      activity: `Updated "${progress.task.title}" to ${progress.progressPercent}%,
      hoursWorked: progress.hoursWorked`,
    }));
  } catch (error) {
    console.error("Recent activity error:", error);
    return [];
  }
}

// Helper function to get productivity trend
async function getProductivityTrend(projectId) {
  try {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      const tasksCompleted = await Task.count({
        where: {
          projectId,
          status: "completed",
          updatedAt: {
            [Op.between]: [startOfDay, endOfDay],
          },
        },
      });

      const progressUpdates = await TaskProgress.count({
        include: [
          {
            model: Task,
            as: "task",
            where: { projectId },
          },
        ],
        where: {
          createdAt: {
            [Op.between]: [startOfDay, endOfDay],
          },
        },
      });

      last7Days.push({
        date: startOfDay.toISOString().split("T")[0],
        tasksCompleted,
        progressUpdates,
      });
    }

    return last7Days;
  } catch (error) {
    console.error("Productivity trend error:", error);
    return [];
  }
}

// Helper function to generate alerts
function generateAlerts(tasks, teamWorkload) {
  const alerts = [];

  // Overdue tasks alert
  const overdueTasks = tasks.filter(
    (task) =>
      task.dueDate &&
      new Date(task.dueDate) < new Date() &&
      task.status !== "completed"
  );
  if (overdueTasks.length > 0) {
    alerts.push({
      type: "warning",
      title: `${overdueTasks.length} Overdue Tasks`,
      message: `${overdueTasks.length} tasks are past their due date and need attention.,
      count: overdueTasks.length`,
    });
  }

  // Unassigned tasks alert
  const unassignedTasks = tasks.filter((task) => !task.assigneeId);
  if (unassignedTasks.length > 0) {
    alerts.push({
      type: "info",
      title: `${unassignedTasks.length} Unassigned Tasks`,
      message: `${unassignedTasks.length} tasks need to be assigned to team members.,
      count: unassignedTasks.length`,
    });
  }

  // Heavy workload alert
  const overloadedMembers = teamWorkload.filter(
    (member) =>
      member.taskStats.inProgress > 5 && member.taskStats.completionRate < 50
  );
  if (overloadedMembers.length > 0) {
    alerts.push({
      type: "warning",
      title: "Heavy Workload Detected",
      message: `${overloadedMembers.length} team members may be overloaded with tasks.`,
      members: overloadedMembers.map((m) => m.member.name),
    });
  }

  // Low activity alert
  const inactiveMembers = teamWorkload.filter(
    (member) =>
      member.recentActivity.length === 0 && member.taskStats.inProgress > 0
  );
  if (inactiveMembers.length > 0) {
    alerts.push({
      type: "info",
      title: "Low Activity",
      message: `${inactiveMembers.length} team members haven't updated their tasks recently.`,
      members: inactiveMembers.map((m) => m.member.name),
    });
  }

  return alerts;
}

// Get team performance comparison
router.get(
  "/team/:projectId/performance",
  authenticateToken,
  async (req, res) => {
    try {
      const projectId = req.params.projectId;

      const members = await ProjectMember.findAll({
        where: { projectId },
        include: [{ model: User, as: "user" }],
      });

      const performanceData = [];

      for (const member of members) {
        const memberTasks = await Task.findAll({
          where: { projectId, assigneeId: member.user.id },
        });

        const progressUpdates = await TaskProgress.findAll({
          where: { userId: member.user.id },
          include: [
            {
              model: Task,
              as: "task",
              where: { projectId },
            },
          ],
        });

        const totalHours = progressUpdates.reduce(
          (sum, p) => sum + parseFloat(p.hoursWorked || 0),
          0
        );
        const avgTaskCompletion =
          memberTasks.length > 0
            ? memberTasks.reduce((sum, task) => {
                const latestProgress = progressUpdates
                  .filter((p) => p.taskId === task.id)
                  .sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                  )[0];
                return sum + (latestProgress?.progressPercent || 0);
              }, 0) / memberTasks.length
            : 0;

        performanceData.push({
          member: member.user,
          metrics: {
            tasksAssigned: memberTasks.length,
            tasksCompleted: memberTasks.filter((t) => t.status === "completed")
              .length,
            totalHoursLogged: totalHours,
            avgCompletionRate: Math.round(avgTaskCompletion),
            productivityScore: calculateProductivityScore(
              memberTasks,
              progressUpdates
            ),
          },
        });
      }

      res.json({
        message: "Team performance data retrieved",
        performance: performanceData,
      });
    } catch (error) {
      console.error("Performance analytics error:", error);
      res
        .status(500)
        .json({ message: "Server error retrieving performance data" });
    }
  }
);

function calculateProductivityScore(tasks, progressUpdates) {
  if (tasks.length === 0) return 0;

  const completionRate =
    (tasks.filter((t) => t.status === "completed").length / tasks.length) * 100;
  const activityScore = Math.min(progressUpdates.length * 10, 100);
  const timeScore =
    progressUpdates.length > 0
      ? Math.min(
          progressUpdates.reduce(
            (sum, p) => sum + parseFloat(p.hoursWorked || 0),
            0
          ) * 2,
          100
        )
      : 0;

  return Math.round(
    completionRate * 0.5 + activityScore * 0.3 + timeScore * 0.2
  );
}

module.exports = router;
