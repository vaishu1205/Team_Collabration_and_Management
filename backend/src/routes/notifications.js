const express = require("express");
const { Notification } = require("../models");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Get user notifications
router.get("/", authenticateToken, async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
      limit: 50,
    });

    res.json({
      message: "Notifications retrieved successfully",
      notifications,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ message: "Server error retrieving notifications" });
  }
});

// Mark notification as read
router.put("/:id/read", authenticateToken, async (req, res) => {
  try {
    await Notification.update(
      { isRead: true },
      {
        where: {
          id: req.params.id,
          userId: req.user.id,
        },
      }
    );

    res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Mark read error:", error);
    res
      .status(500)
      .json({ message: "Server error marking notification as read" });
  }
});

module.exports = router;
