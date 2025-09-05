const express = require("express");
const { EmailPreference, User } = require("../models");
const { authenticateToken } = require("../middleware/auth");
const emailService = require("../services/emailService");

const router = express.Router();

// Get user's email preferences
router.get("/preferences", authenticateToken, async (req, res) => {
  try {
    let preferences = await EmailPreference.findOne({
      where: { userId: req.user.id },
    });

    if (!preferences) {
      preferences = await EmailPreference.create({
        userId: req.user.id,
      });
    }

    res.json({
      message: "Email preferences retrieved successfully",
      preferences,
    });
  } catch (error) {
    console.error("Get email preferences error:", error);
    res.status(500).json({
      message: "Server error retrieving email preferences",
      error: error.message,
    });
  }
});

// Update email preferences
router.put("/preferences", authenticateToken, async (req, res) => {
  try {
    const {
      taskAssignments,
      deadlineReminders,
      progressUpdates,
      weeklyDigest,
      projectUpdates,
      emailEnabled,
    } = req.body;

    // Try to find existing preferences
    let preferences = await EmailPreference.findOne({
      where: { userId: req.user.id },
    });

    if (preferences) {
      // Update existing
      await EmailPreference.update(
        {
          taskAssignments: taskAssignments || "instant",
          deadlineReminders: deadlineReminders || "daily",
          progressUpdates: progressUpdates || "daily",
          weeklyDigest: weeklyDigest !== undefined ? weeklyDigest : true,
          projectUpdates: projectUpdates || "daily",
          emailEnabled: emailEnabled !== undefined ? emailEnabled : true,
        },
        {
          where: { userId: req.user.id },
        }
      );
    } else {
      // Create new
      preferences = await EmailPreference.create({
        userId: req.user.id,
        taskAssignments: taskAssignments || "instant",
        deadlineReminders: deadlineReminders || "daily",
        progressUpdates: progressUpdates || "daily",
        weeklyDigest: weeklyDigest !== undefined ? weeklyDigest : true,
        projectUpdates: projectUpdates || "daily",
        emailEnabled: emailEnabled !== undefined ? emailEnabled : true,
      });
    }

    // Get updated preferences
    const updatedPreferences = await EmailPreference.findOne({
      where: { userId: req.user.id },
    });

    res.json({
      message: "Email preferences updated successfully",
      preferences: updatedPreferences,
    });
  } catch (error) {
    console.error("Update email preferences error:", error);
    res.status(500).json({
      message: "Server error updating email preferences",
      error: error.message,
    });
  }
});

// Send test email
router.post("/test", authenticateToken, async (req, res) => {
  try {
    console.log(`Sending test email to: ${req.user.email}`);

    const result = await emailService.sendEmail(
      req.user.email,
      "Test Email from Team Collaboration App",
      `
      <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center; border: 1px solid #ddd;">
        <h2 style="color: #4F46E5;">Email System Working!</h2>
        <p>Hi ${req.user.name},</p>
        <p>This test email confirms your notification system is configured correctly.</p>
        <p style="color: #666; font-size: 12px;">Sent from Team Collaboration Platform</p>
      </div>
      `
    );

    if (result.success) {
      res.json({
        message: result.simulation
          ? "Test email simulated successfully! (Check console for details)"
          : "Test email sent successfully!",
        messageId: result.messageId,
      });
    } else {
      res.status(500).json({
        message: "Failed to send test email",
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Send test email error:", error);
    res.status(500).json({
      message: "Server error sending test email",
      error: error.message,
    });
  }
});

module.exports = { router };

// const express = require("express");
// const { EmailPreference, User } = require("../models");
// const { authenticateToken } = require("../middleware/auth");
// const emailService = require("../services/emailService");

// const router = express.Router();

// // Get user's email preferences
// router.get("/preferences", authenticateToken, async (req, res) => {
//   try {
//     let preferences = await EmailPreference.findOne({
//       where: { userId: req.user.id },
//     });

//     if (!preferences) {
//       preferences = await EmailPreference.create({
//         userId: req.user.id,
//       });
//     }

//     res.json({
//       message: "Email preferences retrieved successfully",
//       preferences,
//     });
//   } catch (error) {
//     console.error("Get email preferences error:", error);
//     res.status(500).json({
//       message: "Server error retrieving email preferences",
//       error: error.message,
//     });
//   }
// });

// // Update email preferences
// router.put("/preferences", authenticateToken, async (req, res) => {
//   try {
//     const {
//       taskAssignments,
//       deadlineReminders,
//       progressUpdates,
//       weeklyDigest,
//       projectUpdates,
//       emailEnabled,
//     } = req.body;

//     const [preferences] = await EmailPreference.upsert({
//       userId: req.user.id,
//       taskAssignments: taskAssignments || "instant",
//       deadlineReminders: deadlineReminders || "daily",
//       progressUpdates: progressUpdates || "daily",
//       weeklyDigest: weeklyDigest !== undefined ? weeklyDigest : true,
//       projectUpdates: projectUpdates || "daily",
//       emailEnabled: emailEnabled !== undefined ? emailEnabled : true,
//     });

//     res.json({
//       message: "Email preferences updated successfully",
//       preferences,
//     });
//   } catch (error) {
//     console.error("Update email preferences error:", error);
//     res.status(500).json({
//       message: "Server error updating email preferences",
//       error: error.message,
//     });
//   }
// });

// // Send test email
// router.post("/test", authenticateToken, async (req, res) => {
//   try {
//     console.log(`Sending test email to: ${req.user.email}`);

//     const result = await emailService.sendEmail(
//       req.user.email,
//       "Test Email from Team Collaboration App",
//       `
//       <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center; border: 1px solid #ddd;">
//         <h2 style="color: #4F46E5;">Email System Working!</h2>
//         <p>Hi ${req.user.name},</p>
//         <p>This test email confirms your notification system is working correctly.</p>
//         <p style="color: #666; font-size: 12px;">Sent from Team Collaboration Platform</p>
//       </div>
//       `
//     );

//     if (result.success) {
//       res.json({
//         message:
//           "Test email sent successfully! Check the console for preview URL.",
//         messageId: result.messageId,
//         previewUrl: result.previewUrl,
//       });
//     } else {
//       res.status(500).json({
//         message: "Failed to send test email",
//         error: result.error,
//       });
//     }
//   } catch (error) {
//     console.error("Send test email error:", error);
//     res.status(500).json({
//       message: "Server error sending test email",
//       error: error.message,
//     });
//   }
// });

// // Send instant notification email
// async function sendInstantEmail(type, recipientId, data) {
//   try {
//     const user = await User.findByPk(recipientId, {
//       include: [{ model: EmailPreference, as: "emailPreference" }],
//     });

//     if (!user) {
//       console.log("User not found for email notification");
//       return { success: false, error: "User not found" };
//     }

//     // Create default preferences if none exist
//     let preferences = user.emailPreference;
//     if (!preferences) {
//       preferences = await EmailPreference.create({ userId: recipientId });
//     }

//     if (!preferences.emailEnabled) {
//       console.log("Email notifications disabled for user");
//       return { success: false, error: "Email disabled" };
//     }

//     // Check if user wants instant notifications for this type
//     let shouldSend = false;
//     switch (type) {
//       case "task_assignment":
//         shouldSend = preferences.taskAssignments === "instant";
//         break;
//       case "progress_update":
//         shouldSend = preferences.progressUpdates === "instant";
//         break;
//       case "project_update":
//         shouldSend = preferences.projectUpdates === "instant";
//         break;
//     }

//     if (!shouldSend) {
//       console.log(
//         `User prefers ${preferences.taskAssignments} notifications for ${type}`
//       );
//       return { success: false, error: "User prefers batch notifications" };
//     }

//     // Send appropriate email
//     switch (type) {
//       case "task_assignment":
//         return await emailService.sendTaskAssignmentEmail(
//           user.email,
//           user.name,
//           data.taskTitle,
//           data.projectName,
//           data.assignedBy,
//           data.dueDate
//         );
//     }

//     return { success: false, error: "Unknown email type" };
//   } catch (error) {
//     console.error("Send instant email error:", error);
//     return { success: false, error: error.message };
//   }
// }

// module.exports = { router, sendInstantEmail };
