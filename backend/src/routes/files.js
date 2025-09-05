const express = require("express");
const { File, User, Project, Task } = require("../models");
const { authenticateToken } = require("../middleware/auth");
const upload = require("../middleware/upload");
const path = require("path");
const fs = require("fs-extra");

const router = express.Router();

// Upload file to project
router.post(
  "/upload/project/:id",
  authenticateToken,
  upload.array("files", 5),
  async (req, res) => {
    try {
      const projectId = req.params.id;
      const { description } = req.body;

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const uploadedFiles = [];

      for (const file of req.files) {
        const fileRecord = await File.create({
          originalName: file.originalname,
          fileName: file.filename,
          filePath: file.path,
          fileSize: file.size,
          mimeType: file.mimetype,
          uploadedById: req.user.id,
          projectId: projectId,
          description: description || null,
        });

        const fileWithUser = await File.findByPk(fileRecord.id, {
          include: [
            {
              model: User,
              as: "uploader",
              attributes: ["id", "name", "email"],
            },
          ],
        });

        uploadedFiles.push(fileWithUser);
      }

      res.status(201).json({
        message: "Files uploaded successfully",
        files: uploadedFiles,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Server error uploading files" });
    }
  }
);

// Upload file to task
router.post(
  "/upload/task/:id",
  authenticateToken,
  upload.array("files", 5),
  async (req, res) => {
    try {
      const taskId = req.params.id;
      const { description } = req.body;

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const uploadedFiles = [];

      for (const file of req.files) {
        const fileRecord = await File.create({
          originalName: file.originalname,
          fileName: file.filename,
          filePath: file.path,
          fileSize: file.size,
          mimeType: file.mimetype,
          uploadedById: req.user.id,
          taskId: taskId,
          description: description || null,
        });

        const fileWithUser = await File.findByPk(fileRecord.id, {
          include: [
            {
              model: User,
              as: "uploader",
              attributes: ["id", "name", "email"],
            },
          ],
        });

        uploadedFiles.push(fileWithUser);
      }

      res.status(201).json({
        message: "Files uploaded successfully",
        files: uploadedFiles,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Server error uploading files" });
    }
  }
);

// Get project files
router.get("/project/:id", authenticateToken, async (req, res) => {
  try {
    const files = await File.findAll({
      where: { projectId: req.params.id, isActive: true },
      include: [
        { model: User, as: "uploader", attributes: ["id", "name", "email"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({
      message: "Project files retrieved successfully",
      files,
    });
  } catch (error) {
    console.error("Get files error:", error);
    res.status(500).json({ message: "Server error retrieving files" });
  }
});

// Get task files
router.get("/task/:id", authenticateToken, async (req, res) => {
  try {
    const files = await File.findAll({
      where: { taskId: req.params.id, isActive: true },
      include: [
        { model: User, as: "uploader", attributes: ["id", "name", "email"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({
      message: "Task files retrieved successfully",
      files,
    });
  } catch (error) {
    console.error("Get files error:", error);
    res.status(500).json({ message: "Server error retrieving files" });
  }
});

// Download file
router.get("/download/:id", authenticateToken, async (req, res) => {
  try {
    const file = await File.findByPk(req.params.id);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    if (!fs.existsSync(file.filePath)) {
      return res
        .status(404)
        .json({ message: "File no longer exists on server" });
    }

    res.download(file.filePath, file.originalName);
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ message: "Server error downloading file" });
  }
});

// Delete file
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const file = await File.findByPk(req.params.id);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Check if user can delete (uploader or manager)
    if (file.uploadedById !== req.user.id && req.user.role !== "manager") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Mark as inactive instead of actually deleting
    await File.update({ isActive: false }, { where: { id: req.params.id } });

    res.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Delete file error:", error);
    res.status(500).json({ message: "Server error deleting file" });
  }
});

module.exports = router;
