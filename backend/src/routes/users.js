const express = require("express");
const {
  User,
  Project,
  Task,
  TimeEntry,
  File,
  ProjectMember,
} = require("../models");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Get user profile (self)
router.get("/profile/me", authenticateToken, async (req, res) => {
  try {
    const profile = await User.findByPk(req.user.id, {
      attributes: ["id", "name", "email", "role", "createdAt"],
    });

    if (!profile) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile retrieved successfully",
      profile,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error retrieving profile" });
  }
});

// Get user statistics
router.get("/stats/me", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = {
      totalProjects: 0,
      completedTasks: 0,
      totalHours: 0,
      filesUploaded: 0,
      recentActivity: [],
    };

    try {
      if (req.user.role === "manager") {
        stats.totalProjects = await Project.count({
          where: { managerId: userId },
        });
      } else {
        stats.totalProjects = await ProjectMember.count({ where: { userId } });
      }

      stats.completedTasks = await Task.count({
        where: { assigneeId: userId, status: "completed" },
      });

      const timeEntries = await TimeEntry.findAll({
        where: { userId },
        attributes: ["duration"],
      });

      stats.totalHours =
        Math.round(
          (timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0) /
            60) *
            10
        ) / 10;

      stats.filesUploaded = await File.count({
        where: { uploadedById: userId },
      });
    } catch (e) {
      console.log("Error in stats calculation:", e.message);
    }

    res.json({
      message: "User statistics retrieved successfully",
      stats,
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({ message: "Server error retrieving statistics" });
  }
});

module.exports = router;

// const express = require("express");
// const {
//   User,
//   Project,
//   Task,
//   TimeEntry,
//   File,
//   TaskProgress,
//   ProjectMember,
//   EmailPreference,
// } = require("../models");
// const { authenticateToken } = require("../middleware/auth");
// const { Op } = require("sequelize");

// const router = express.Router();

// // Get user profile (self or other user)
// router.get("/profile/:userId?", authenticateToken, async (req, res) => {
//   try {
//     const userId =
//       req.params.userId === "me"
//         ? req.user.id
//         : req.params.userId || req.user.id;

//     const profile = await User.findByPk(userId, {
//       attributes: [
//         "id",
//         "name",
//         "email",
//         "role",
//         "bio",
//         "jobTitle",
//         "department",
//         "location",
//         "phone",
//         "createdAt",
//       ],
//     });

//     if (!profile) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.json({
//       message: "Profile retrieved successfully",
//       profile,
//     });
//   } catch (error) {
//     console.error("Get profile error:", error);
//     res.status(500).json({ message: "Server error retrieving profile" });
//   }
// });

// // Update user profile (only own profile)
// router.put("/profile", authenticateToken, async (req, res) => {
//   try {
//     const { name, bio, jobTitle, department, location, phone } = req.body;

//     await User.update(
//       {
//         name,
//         bio,
//         jobTitle,
//         department,
//         location,
//         phone,
//       },
//       {
//         where: { id: req.user.id },
//       }
//     );

//     const updatedProfile = await User.findByPk(req.user.id, {
//       attributes: [
//         "id",
//         "name",
//         "email",
//         "role",
//         "bio",
//         "jobTitle",
//         "department",
//         "location",
//         "phone",
//         "createdAt",
//       ],
//     });

//     res.json({
//       message: "Profile updated successfully",
//       profile: updatedProfile,
//     });
//   } catch (error) {
//     console.error("Update profile error:", error);
//     res.status(500).json({ message: "Server error updating profile" });
//   }
// });

// // Get user statistics
// router.get("/stats/:userId?", authenticateToken, async (req, res) => {
//   try {
//     const userId =
//       req.params.userId === "me"
//         ? req.user.id
//         : req.params.userId || req.user.id;

//     // Basic stats that will work even if some tables are missing
//     const stats = {
//       totalProjects: 0,
//       completedTasks: 0,
//       totalHours: 0,
//       filesUploaded: 0,
//       recentActivity: [],
//     };

//     try {
//       // Try to get projects count
//       if (req.user.role === "manager") {
//         stats.totalProjects = await Project.count({
//           where: { managerId: userId },
//         });
//       } else {
//         stats.totalProjects = await ProjectMember.count({ where: { userId } });
//       }
//     } catch (e) {
//       console.log("Error getting projects count:", e.message);
//     }

//     try {
//       // Try to get completed tasks
//       stats.completedTasks = await Task.count({
//         where: { assigneeId: userId, status: "completed" },
//       });
//     } catch (e) {
//       console.log("Error getting tasks count:", e.message);
//     }

//     try {
//       // Try to get time entries
//       const timeEntries = await TimeEntry.findAll({
//         where: { userId },
//         attributes: ["duration"],
//       });
//       stats.totalHours =
//         Math.round(
//           (timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0) /
//             60) *
//             10
//         ) / 10;
//     } catch (e) {
//       console.log("Error getting time entries:", e.message);
//     }

//     try {
//       // Try to get files count
//       stats.filesUploaded = await File.count({
//         where: { uploadedById: userId },
//       });
//     } catch (e) {
//       console.log("Error getting files count:", e.message);
//     }

//     res.json({
//       message: "User statistics retrieved successfully",
//       stats,
//     });
//   } catch (error) {
//     console.error("Get user stats error:", error);
//     res.status(500).json({ message: "Server error retrieving statistics" });
//   }
// });

// module.exports = router;
