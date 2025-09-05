const express = require("express");
const { TimeEntry, User, Project, Task } = require("../models");
const { authenticateToken } = require("../middleware/auth");
const { Op, fn, col, literal } = require("sequelize");

const router = express.Router();

// Start timer for a task
router.post("/start", authenticateToken, async (req, res) => {
  try {
    const { taskId, projectId, description } = req.body;

    console.log("Start timer request:", {
      taskId,
      projectId,
      description,
      userId: req.user.id,
    });

    // Stop any active timers first
    const activeTimers = await TimeEntry.findAll({
      where: {
        userId: req.user.id,
        isActive: true,
      },
    });

    for (const timer of activeTimers) {
      const endTime = new Date();
      const duration = Math.round(
        (endTime - new Date(timer.startTime)) / (1000 * 60)
      ); // Duration in minutes

      await TimeEntry.update(
        {
          endTime,
          duration,
          isActive: false,
        },
        {
          where: { id: timer.id },
        }
      );
    }

    // Start new timer
    const timeEntry = await TimeEntry.create({
      userId: req.user.id,
      projectId,
      taskId: taskId || null,
      startTime: new Date(),
      description: description || "Working on task",
      entryType: "timer",
      isActive: true,
      entryDate: new Date().toISOString().split("T")[0],
    });

    const entryWithDetails = await TimeEntry.findByPk(timeEntry.id, {
      include: [
        { model: Project, as: "project", attributes: ["id", "name"] },
        { model: Task, as: "task", attributes: ["id", "title"] },
      ],
    });

    console.log("Timer started successfully:", entryWithDetails.id);

    res.status(201).json({
      message: "Timer started successfully",
      timeEntry: entryWithDetails,
    });
  } catch (error) {
    console.error("DETAILED Start timer error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: "Server error starting timer",
      error: error.message,
    });
  }
});

// Stop active timer
router.post("/stop", authenticateToken, async (req, res) => {
  try {
    const activeTimer = await TimeEntry.findOne({
      where: { userId: req.user.id, isActive: true },
    });

    if (!activeTimer) {
      return res.status(404).json({ message: "No active timer found" });
    }

    const endTime = new Date();
    const duration = Math.round(
      (endTime - new Date(activeTimer.startTime)) / (1000 * 60)
    ); // Duration in minutes

    await TimeEntry.update(
      {
        endTime,
        duration,
        isActive: false,
      },
      { where: { id: activeTimer.id } }
    );

    const updatedEntry = await TimeEntry.findByPk(activeTimer.id, {
      include: [
        { model: Project, as: "project", attributes: ["id", "name"] },
        { model: Task, as: "task", attributes: ["id", "title"] },
      ],
    });

    res.json({
      message: "Timer stopped successfully",
      timeEntry: updatedEntry,
    });
  } catch (error) {
    console.error("Stop timer error:", error);
    res.status(500).json({
      message: "Server error stopping timer",
      error: error.message,
    });
  }
});

// Get active timer
router.get("/active", authenticateToken, async (req, res) => {
  try {
    const activeTimer = await TimeEntry.findOne({
      where: { userId: req.user.id, isActive: true },
      include: [
        { model: Project, as: "project", attributes: ["id", "name"] },
        { model: Task, as: "task", attributes: ["id", "title"] },
      ],
    });

    res.json({
      message: "Active timer retrieved",
      activeTimer,
    });
  } catch (error) {
    console.error("Get active timer error:", error);
    res.status(500).json({
      message: "Server error retrieving active timer",
      error: error.message,
    });
  }
});

// Create manual time entry
// router.post("/manual", authenticateToken, async (req, res) => {
//   try {
//     const { projectId, taskId, date, hours, description, isBillable } =
//       req.body;

//     console.log("Manual entry request:", {
//       projectId,
//       taskId,
//       date,
//       hours,
//       description,
//       isBillable,
//     });

//     const timeEntry = await TimeEntry.create({
//       userId: req.user.id,
//       projectId,
//       taskId: taskId || null,
//       startTime: new Date(`${date}T09:00:00`), // Default start time
//       endTime: new Date(`${date}T${9 + parseFloat(hours)}:00:00`),
//       duration: Math.round(parseFloat(hours) * 60), // Convert hours to minutes
//       description,
//       entryType: "manual",
//       isBillable: isBillable !== false,
//       entryDate: date,
//       isActive: false,
//     });

//     const entryWithDetails = await TimeEntry.findByPk(timeEntry.id, {
//       include: [
//         { model: Project, as: "project", attributes: ["id", "name"] },
//         { model: Task, as: "task", attributes: ["id", "title"] },
//       ],
//     });

//     console.log("Manual entry created:", entryWithDetails.id);

//     res.status(201).json({
//       message: "Time entry created successfully",
//       timeEntry: entryWithDetails,
//     });
//   } catch (error) {
//     console.error("DETAILED Create manual entry error:", error);
//     console.error("Error stack:", error.stack);
//     res.status(500).json({
//       message: "Server error creating time entry",
//       error: error.message,
//     });
//   }
// });

// Create manual time entry (FIXED VERSION)
router.post("/manual", authenticateToken, async (req, res) => {
  try {
    const { projectId, taskId, date, hours, description, isBillable } =
      req.body;

    console.log("Manual entry request:", {
      projectId,
      taskId,
      date,
      hours,
      description,
      isBillable,
    });

    // FIXED: Create proper start and end times
    const startTime = new Date(`${date}T09:00:00`);
    const durationMinutes = Math.round(parseFloat(hours) * 60);
    const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000); // Add minutes properly

    console.log("Calculated times:", {
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      durationMinutes,
    });

    const timeEntry = await TimeEntry.create({
      userId: req.user.id,
      projectId,
      taskId: taskId || null,
      startTime: startTime,
      endTime: endTime,
      duration: durationMinutes,
      description,
      entryType: "manual",
      isBillable: isBillable !== false,
      entryDate: date,
      isActive: false,
    });

    const entryWithDetails = await TimeEntry.findByPk(timeEntry.id, {
      include: [
        { model: Project, as: "project", attributes: ["id", "name"] },
        { model: Task, as: "task", attributes: ["id", "title"] },
      ],
    });

    console.log("Manual entry created:", entryWithDetails.id);

    res.status(201).json({
      message: "Time entry created successfully",
      timeEntry: entryWithDetails,
    });
  } catch (error) {
    console.error("DETAILED Create manual entry error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: "Server error creating time entry",
      error: error.message,
    });
  }
});

// Get user's time entries for a date range
router.get("/entries", authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, projectId } = req.query;

    const whereClause = {
      userId: req.user.id,
      entryDate: {
        [Op.between]: [
          startDate || new Date().toISOString().split("T")[0],
          endDate || new Date().toISOString().split("T")[0],
        ],
      },
    };

    if (projectId) {
      whereClause.projectId = projectId;
    }

    const entries = await TimeEntry.findAll({
      where: whereClause,
      include: [
        { model: Project, as: "project", attributes: ["id", "name", "color"] },
        { model: Task, as: "task", attributes: ["id", "title"] },
      ],
      order: [
        ["entryDate", "DESC"],
        ["startTime", "DESC"],
      ],
    });

    res.json({
      message: "Time entries retrieved successfully",
      entries,
    });
  } catch (error) {
    console.error("Get entries error:", error);
    res.status(500).json({
      message: "Server error retrieving time entries",
      error: error.message,
    });
  }
});

// Generate timesheet report
router.get("/timesheet", authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;

    // If userId is provided and user is manager, get that user's timesheet
    const targetUserId =
      userId && req.user.role === "manager" ? userId : req.user.id;

    const entries = await TimeEntry.findAll({
      where: {
        userId: targetUserId,
        entryDate: {
          [Op.between]: [startDate, endDate],
        },
      },
      include: [
        { model: User, as: "user", attributes: ["id", "name", "email"] },
        { model: Project, as: "project", attributes: ["id", "name", "color"] },
        { model: Task, as: "task", attributes: ["id", "title"] },
      ],
      order: [
        ["entryDate", "ASC"],
        ["startTime", "ASC"],
      ],
    });

    // Group entries by date
    const entriesByDate = {};
    let totalMinutes = 0;
    let totalBillableMinutes = 0;

    entries.forEach((entry) => {
      const date = entry.entryDate;
      if (!entriesByDate[date]) {
        entriesByDate[date] = [];
      }
      entriesByDate[date].push(entry);
      totalMinutes += entry.duration || 0;
      if (entry.isBillable) {
        totalBillableMinutes += entry.duration || 0;
      }
    });

    res.json({
      message: "Timesheet generated successfully",
      timesheet: {
        user: entries[0]?.user || null,
        dateRange: { startDate, endDate },
        entriesByDate,
        summary: {
          totalHours: Math.round((totalMinutes / 60) * 100) / 100,
          totalBillableHours:
            Math.round((totalBillableMinutes / 60) * 100) / 100,
          totalEntries: entries.length,
          averageHoursPerDay:
            entries.length > 0
              ? Math.round(
                  (totalMinutes / 60 / Object.keys(entriesByDate).length) * 100
                ) / 100
              : 0,
        },
      },
    });
  } catch (error) {
    console.error("Generate timesheet error:", error);
    res.status(500).json({
      message: "Server error generating timesheet",
      error: error.message,
    });
  }
});

// Delete time entry
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const entry = await TimeEntry.findByPk(req.params.id);

    if (!entry) {
      return res.status(404).json({ message: "Time entry not found" });
    }

    // Check if user owns the entry or is a manager
    if (entry.userId !== req.user.id && req.user.role !== "manager") {
      return res.status(403).json({ message: "Access denied" });
    }

    await TimeEntry.destroy({ where: { id: req.params.id } });

    res.json({ message: "Time entry deleted successfully" });
  } catch (error) {
    console.error("Delete entry error:", error);
    res.status(500).json({
      message: "Server error deleting time entry",
      error: error.message,
    });
  }
});

module.exports = router;
