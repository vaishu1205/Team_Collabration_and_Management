const express = require("express");
const { Message, User, Project, DirectMessage } = require("../models");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Get project messages
router.get("/project/:projectId", authenticateToken, async (req, res) => {
  try {
    const messages = await Message.findAll({
      where: { projectId: req.params.projectId },
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["createdAt", "ASC"]],
      limit: 100,
    });

    res.json({
      message: "Messages retrieved successfully",
      messages,
    });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ message: "Server error retrieving messages" });
  }
});

// Get conversations list
router.get("/conversations", authenticateToken, async (req, res) => {
  try {
    const conversations = await DirectMessage.findAll({
      where: {
        [require("sequelize").Op.or]: [
          { senderId: req.user.id },
          { receiverId: req.user.id },
        ],
      },
      include: [
        { model: User, as: "sender", attributes: ["id", "name", "email"] },
        { model: User, as: "receiver", attributes: ["id", "name", "email"] },
      ],
      order: [["createdAt", "DESC"]],
      limit: 50,
    });

    // Group by conversation partner
    const conversationMap = new Map();
    conversations.forEach((msg) => {
      const partnerId =
        msg.senderId === req.user.id ? msg.receiverId : msg.senderId;
      const partner = msg.senderId === req.user.id ? msg.receiver : msg.sender;

      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          partner,
          lastMessage: msg,
          unreadCount: 0,
        });
      }

      if (msg.receiverId === req.user.id && !msg.isRead) {
        conversationMap.get(partnerId).unreadCount++;
      }
    });

    res.json({
      conversations: Array.from(conversationMap.values()),
    });
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({ message: "Server error retrieving conversations" });
  }
});

// Get direct messages with specific user
router.get("/direct/:userId", authenticateToken, async (req, res) => {
  try {
    const { Op } = require("sequelize");
    const messages = await DirectMessage.findAll({
      where: {
        [Op.or]: [
          { senderId: req.user.id, receiverId: req.params.userId },
          { senderId: req.params.userId, receiverId: req.user.id },
        ],
      },
      include: [
        { model: User, as: "sender", attributes: ["id", "name", "email"] },
        { model: User, as: "receiver", attributes: ["id", "name", "email"] },
      ],
      order: [["createdAt", "ASC"]],
      limit: 100,
    });

    // Mark messages as read
    await DirectMessage.update(
      { isRead: true },
      {
        where: {
          senderId: req.params.userId,
          receiverId: req.user.id,
          isRead: false,
        },
      }
    );

    res.json({ messages });
  } catch (error) {
    console.error("Get direct messages error:", error);
    res.status(500).json({ message: "Server error retrieving messages" });
  }
});

// Send direct message
router.post("/direct/:userId", authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;

    const message = await DirectMessage.create({
      senderId: req.user.id,
      receiverId: req.params.userId,
      content,
    });

    const messageWithUsers = await DirectMessage.findByPk(message.id, {
      include: [
        { model: User, as: "sender", attributes: ["id", "name", "email"] },
        { model: User, as: "receiver", attributes: ["id", "name", "email"] },
      ],
    });

    res.status(201).json({
      message: "Direct message sent successfully",
      data: messageWithUsers,
    });
  } catch (error) {
    console.error("Send direct message error:", error);
    res.status(500).json({ message: "Server error sending message" });
  }
});

// Send message
router.post("/project/:projectId", authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    const projectId = req.params.projectId;

    const message = await Message.create({
      projectId,
      senderId: req.user.id,
      content,
      messageType: "text",
    });

    const messageWithSender = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    res.status(201).json({
      message: "Message sent successfully",
      data: messageWithSender,
    });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ message: "Server error sending message" });
  }
});

module.exports = router;
