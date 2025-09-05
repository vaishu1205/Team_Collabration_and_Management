const express = require("express");
const { Project, Task, User, ProjectMember } = require("../models");
const { authenticateToken } = require("../middleware/auth");
const aiService = require("../services/aiService");

const router = express.Router();

// Generate project summary
router.post(
  "/project-summary/:projectId",
  authenticateToken,
  async (req, res) => {
    try {
      const projectId = req.params.projectId;

      // Get project with tasks and members
      const project = await Project.findByPk(projectId, {
        include: [
          {
            model: Task,
            as: "tasks",
            include: [{ model: User, as: "assignee", attributes: ["name"] }],
          },
          {
            model: ProjectMember,
            as: "members",
            include: [{ model: User, as: "user", attributes: ["name"] }],
          },
        ],
      });

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const summary = await aiService.generateProjectSummary({
        name: project.name,
        description: project.description,
        status: project.status,
        tasks: project.tasks,
        members: project.members,
      });

      res.json({
        message: "Project summary generated successfully",
        summary,
        generatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Generate summary error:", error);
      res.status(500).json({ message: "Server error generating summary" });
    }
  }
);

module.exports = router;
