const express = require("express");
const {
  Project,
  User,
  ProjectMember,
  Task,
  Notification,
} = require("../models");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Get all projects for the logged-in user (both managed and member of)
router.get("/", authenticateToken, async (req, res) => {
  try {
    let projects = [];

    if (req.user.role === "manager") {
      // Managers see projects they manage
      projects = await Project.findAll({
        where: { managerId: req.user.id },
        include: [
          {
            model: User,
            as: "manager",
            attributes: ["id", "name", "email"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });
    } else {
      // Members see projects they're part of
      const memberProjects = await ProjectMember.findAll({
        where: { userId: req.user.id },
        include: [
          {
            model: Project,
            as: "project",
            include: [
              {
                model: User,
                as: "manager",
                attributes: ["id", "name", "email"],
              },
            ],
          },
        ],
      });

      projects = memberProjects.map((pm) => pm.project);
    }

    res.json({
      message: "Projects retrieved successfully",
      projects,
    });
  } catch (error) {
    console.error("Get projects error:", error);
    res.status(500).json({ message: "Server error retrieving projects" });
  }
});

// Create new project
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { name, description, color } = req.body;

    // Only managers can create projects
    if (req.user.role !== "manager") {
      return res
        .status(403)
        .json({ message: "Only managers can create projects" });
    }

    const project = await Project.create({
      name,
      description,
      color: color || "#3B82F6",
      managerId: req.user.id,
    });

    // Get project with manager info
    const projectWithManager = await Project.findByPk(project.id, {
      include: [
        {
          model: User,
          as: "manager",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    res.status(201).json({
      message: "Project created successfully",
      project: projectWithManager,
    });
  } catch (error) {
    console.error("Create project error:", error);
    res.status(500).json({ message: "Server error creating project" });
  }
});

// Get single project by ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const project = await Project.findOne({
      where: {
        id: req.params.id,
        managerId: req.user.id,
      },
      include: [
        {
          model: User,
          as: "manager",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({
      message: "Project retrieved successfully",
      project,
    });
  } catch (error) {
    console.error("Get project error:", error);
    res.status(500).json({ message: "Server error retrieving project" });
  }
});

// Add team member to project
router.post("/:id/members", authenticateToken, async (req, res) => {
  try {
    const { email, role } = req.body;
    const projectId = req.params.id;

    // Only manager can add members
    if (req.user.role !== "manager") {
      return res.status(403).json({ message: "Only managers can add members" });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found with this email" });
    }

    // Check if user is already a member
    const existingMember = await ProjectMember.findOne({
      where: { projectId, userId: user.id },
    });
    if (existingMember) {
      return res
        .status(400)
        .json({ message: "User is already a member of this project" });
    }

    // Get project details
    const project = await Project.findByPk(projectId);

    // Add member to project
    const member = await ProjectMember.create({
      projectId,
      userId: user.id,
      role: role || "member",
    });

    // CREATE NOTIFICATION FOR THE NEW MEMBER
    await Notification.create({
      userId: user.id,
      title: "Added to Project",
      message: `You have been added to project "${project.name}" by ${req.user.name}`,
      type: "project_invite",
      relatedId: projectId,
    });

    const memberWithUser = await ProjectMember.findByPk(member.id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "role"],
        },
      ],
    });

    res.status(201).json({
      message: "Team member added successfully",
      member: memberWithUser,
    });
  } catch (error) {
    console.error("Add member error:", error);
    res.status(500).json({ message: "Server error adding member" });
  }
});

// Get project members
router.get("/:id/members", authenticateToken, async (req, res) => {
  try {
    const members = await ProjectMember.findAll({
      where: { projectId: req.params.id },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "role"],
        },
      ],
    });

    res.json({
      message: "Project members retrieved successfully",
      members,
    });
  } catch (error) {
    console.error("Get members error:", error);
    res.status(500).json({ message: "Server error retrieving members" });
  }
});

// Remove member and reassign their tasks (ENHANCED)
router.delete("/:id/members/:userId", authenticateToken, async (req, res) => {
  try {
    const projectId = req.params.id;
    const userIdToRemove = req.params.userId;

    // Only manager can remove members
    if (req.user.role !== "manager") {
      return res
        .status(403)
        .json({ message: "Only managers can remove members" });
    }

    // Get all tasks assigned to this member
    const memberTasks = await Task.findAll({
      where: {
        projectId: projectId,
        assigneeId: userIdToRemove,
      },
    });

    // Unassign all tasks (set assigneeId to null)
    await Task.update(
      { assigneeId: null, status: "todo" },
      { where: { projectId: projectId, assigneeId: userIdToRemove } }
    );

    // Remove from project
    await ProjectMember.destroy({
      where: {
        projectId: projectId,
        userId: userIdToRemove,
      },
    });

    // Create notification for removed member
    await Notification.create({
      userId: userIdToRemove,
      title: "Removed from Project",
      message: `You have been removed from the project by ${req.user.name}. Your ${memberTasks.length} tasks have been unassigned.`,
      type: "general",
      relatedId: projectId,
    });

    res.json({
      message: "Member removed successfully",
      unassignedTasks: memberTasks.length,
    });
  } catch (error) {
    console.error("Remove member error:", error);
    res.status(500).json({ message: "Server error removing member" });
  }
});

// Get member workload summary (NEW)
router.get("/:id/workload", authenticateToken, async (req, res) => {
  try {
    const members = await ProjectMember.findAll({
      where: { projectId: req.params.id },
      include: [
        { model: User, as: "user", attributes: ["id", "name", "email"] },
      ],
    });

    const workloadData = [];

    for (const member of members) {
      const tasks = await Task.findAll({
        where: {
          projectId: req.params.id,
          assigneeId: member.user.id,
        },
      });

      const completedTasks = tasks.filter(
        (t) => t.status === "completed"
      ).length;
      const inProgressTasks = tasks.filter(
        (t) => t.status === "in_progress"
      ).length;
      const totalHours = tasks.reduce(
        (sum, task) => sum + (task.estimatedHours || 0),
        0
      );

      workloadData.push({
        member: member.user,
        totalTasks: tasks.length,
        completedTasks,
        inProgressTasks,
        totalEstimatedHours: totalHours,
        completionRate:
          tasks.length > 0
            ? Math.round((completedTasks / tasks.length) * 100)
            : 0,
      });
    }

    res.json({
      message: "Workload data retrieved successfully",
      workload: workloadData,
    });
  } catch (error) {
    console.error("Get workload error:", error);
    res.status(500).json({ message: "Server error retrieving workload" });
  }
});

module.exports = router;

// const express = require("express");
// // const { Project, User } = require("../models");
// const { authenticateToken } = require("../middleware/auth");
// // const { ProjectMember } = require("../models");
// const { Project, User, ProjectMember } = require("../models");

// const router = express.Router();

// // Get all projects for the logged-in user
// // Get all projects for the logged-in user (both managed and member of)
// router.get("/", authenticateToken, async (req, res) => {
//   try {
//     let projects = [];

//     if (req.user.role === "manager") {
//       // Managers see projects they manage
//       projects = await Project.findAll({
//         where: { managerId: req.user.id },
//         include: [
//           {
//             model: User,
//             as: "manager",
//             attributes: ["id", "name", "email"],
//           },
//         ],
//         order: [["createdAt", "DESC"]],
//       });
//     } else {
//       // Members see projects they're part of
//       const memberProjects = await ProjectMember.findAll({
//         where: { userId: req.user.id },
//         include: [
//           {
//             model: Project,
//             as: "project",
//             include: [
//               {
//                 model: User,
//                 as: "manager",
//                 attributes: ["id", "name", "email"],
//               },
//             ],
//           },
//         ],
//       });

//       projects = memberProjects.map((pm) => pm.project);
//     }

//     res.json({
//       message: "Projects retrieved successfully",
//       projects,
//     });
//   } catch (error) {
//     console.error("Get projects error:", error);
//     res.status(500).json({ message: "Server error retrieving projects" });
//   }
// });

// // Create new project
// router.post("/", authenticateToken, async (req, res) => {
//   try {
//     const { name, description, color } = req.body;

//     // Only managers can create projects
//     if (req.user.role !== "manager") {
//       return res
//         .status(403)
//         .json({ message: "Only managers can create projects" });
//     }

//     const project = await Project.create({
//       name,
//       description,
//       color: color || "#3B82F6",
//       managerId: req.user.id,
//     });

//     // Get project with manager info
//     const projectWithManager = await Project.findByPk(project.id, {
//       include: [
//         {
//           model: User,
//           as: "manager",
//           attributes: ["id", "name", "email"],
//         },
//       ],
//     });

//     res.status(201).json({
//       message: "Project created successfully",
//       project: projectWithManager,
//     });
//   } catch (error) {
//     console.error("Create project error:", error);
//     res.status(500).json({ message: "Server error creating project" });
//   }
// });

// // Get single project by ID
// router.get("/:id", authenticateToken, async (req, res) => {
//   try {
//     const project = await Project.findOne({
//       where: {
//         id: req.params.id,
//         managerId: req.user.id,
//       },
//       include: [
//         {
//           model: User,
//           as: "manager",
//           attributes: ["id", "name", "email"],
//         },
//       ],
//     });

//     if (!project) {
//       return res.status(404).json({ message: "Project not found" });
//     }

//     res.json({
//       message: "Project retrieved successfully",
//       project,
//     });
//   } catch (error) {
//     console.error("Get project error:", error);
//     res.status(500).json({ message: "Server error retrieving project" });
//   }
// });

// // Add team member to project
// router.post("/:id/members", authenticateToken, async (req, res) => {
//   try {
//     const { email, role } = req.body;
//     const projectId = req.params.id;

//     // Only manager can add members
//     if (req.user.role !== "manager") {
//       return res.status(403).json({ message: "Only managers can add members" });
//     }

//     // Find user by email
//     const user = await User.findOne({ where: { email } });
//     if (!user) {
//       return res
//         .status(404)
//         .json({ message: "User not found with this email" });
//     }

//     // Check if user is already a member
//     const existingMember = await ProjectMember.findOne({
//       where: { projectId, userId: user.id },
//     });
//     if (existingMember) {
//       return res
//         .status(400)
//         .json({ message: "User is already a member of this project" });
//     }

//     // Get project details
//     const project = await Project.findByPk(projectId);

//     // Add member to project
//     const member = await ProjectMember.create({
//       projectId,
//       userId: user.id,
//       role: role || "member",
//     });

//     // CREATE NOTIFICATION FOR THE NEW MEMBER
//     const { Notification } = require("../models");
//     await Notification.create({
//       userId: user.id,
//       title: "Added to Project",
//       message: `You have been added to project "${project.name}" by ${req.user.name}`,
//       type: "project_invite",
//       relatedId: projectId,
//     });

//     const memberWithUser = await ProjectMember.findByPk(member.id, {
//       include: [
//         {
//           model: User,
//           as: "user",
//           attributes: ["id", "name", "email", "role"],
//         },
//       ],
//     });

//     res.status(201).json({
//       message: "Team member added successfully",
//       member: memberWithUser,
//     });
//   } catch (error) {
//     console.error("Add member error:", error);
//     res.status(500).json({ message: "Server error adding member" });
//   }
// });

// router.post("/:id/members", authenticateToken, async (req, res) => {
//   try {
//     const { email, role } = req.body;
//     const projectId = req.params.id;

//     // Only manager can add members
//     if (req.user.role !== "manager") {
//       return res.status(403).json({ message: "Only managers can add members" });
//     }

//     // Find user by email
//     const user = await User.findOne({ where: { email } });
//     if (!user) {
//       return res
//         .status(404)
//         .json({ message: "User not found with this email" });
//     }

//     // Check if user is already a member
//     const existingMember = await ProjectMember.findOne({
//       where: { projectId, userId: user.id },
//     });
//     if (existingMember) {
//       return res
//         .status(400)
//         .json({ message: "User is already a member of this project" });
//     }

//     // Add member to project
//     const member = await ProjectMember.create({
//       projectId,
//       userId: user.id,
//       role: role || "member",
//     });

//     const memberWithUser = await ProjectMember.findByPk(member.id, {
//       include: [
//         {
//           model: User,
//           as: "user",
//           attributes: ["id", "name", "email", "role"],
//         },
//       ],
//     });

//     res.status(201).json({
//       message: "Team member added successfully",
//       member: memberWithUser,
//     });
//   } catch (error) {
//     console.error("Add member error:", error);
//     res.status(500).json({ message: "Server error adding member" });
//   }
// });

// // Get project members
// router.get("/:id/members", authenticateToken, async (req, res) => {
//   try {
//     const members = await ProjectMember.findAll({
//       where: { projectId: req.params.id },
//       include: [
//         {
//           model: User,
//           as: "user",
//           attributes: ["id", "name", "email", "role"],
//         },
//       ],
//     });

//     res.json({
//       message: "Project members retrieved successfully",
//       members,
//     });
//   } catch (error) {
//     console.error("Get members error:", error);
//     res.status(500).json({ message: "Server error retrieving members" });
//   }
// });

// // Remove team member from project
// router.delete("/:id/members/:userId", authenticateToken, async (req, res) => {
//   try {
//     // Only manager can remove members
//     if (req.user.role !== "manager") {
//       return res
//         .status(403)
//         .json({ message: "Only managers can remove members" });
//     }

//     await ProjectMember.destroy({
//       where: {
//         projectId: req.params.id,
//         userId: req.params.userId,
//       },
//     });

//     res.json({ message: "Team member removed successfully" });
//   } catch (error) {
//     console.error("Remove member error:", error);
//     res.status(500).json({ message: "Server error removing member" });
//   }
// });

// module.exports = router;
