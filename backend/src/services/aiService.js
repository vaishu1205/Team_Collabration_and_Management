const { GoogleGenerativeAI } = require("@google/generative-ai");
const OpenAI = require("openai");

class AIService {
  constructor() {
    this.gemini = process.env.GEMINI_API_KEY
      ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
      : null;
    this.openai = process.env.OPENAI_API_KEY
      ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      : null;
  }

  async generateProjectSummary(projectData) {
    const prompt = `
    Analyze this project data and provide a brief summary with insights:
    
    Project: ${projectData.name}
    Description: ${projectData.description}
    Status: ${projectData.status}
    Total Tasks: ${projectData.tasks.length}
    Completed Tasks: ${
      projectData.tasks.filter((t) => t.status === "completed").length
    }
    In Progress: ${
      projectData.tasks.filter((t) => t.status === "in_progress").length
    }
    Blocked Tasks: ${
      projectData.tasks.filter((t) => t.status === "blocked").length
    }
    Team Members: ${projectData.members.length}
    
    Tasks Details:
    ${projectData.tasks
      .map((t) => `- ${t.title} (${t.status}, Priority: ${t.priority})`)
      .join("\n")}
    
    Provide a concise summary with:
    1. Overall progress status
    2. Key risks or blockers
    3. Recommendations for improvement
    4. Estimated completion timeline
    
    Keep response under 200 words.
    `;

    try {
      if (this.gemini) {
        const model = this.gemini.getGenerativeModel({
          model: "gemini-1.5-flash",
        });
        const result = await model.generateContent(prompt);
        return result.response.text();
      }

      if (this.openai) {
        const response = await this.openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 300,
        });
        return response.choices[0].message.content;
      }

      // Fallback response if no API keys
      return this.getFallbackSummary(projectData);
    } catch (error) {
      console.error("AI API Error:", error);
      return this.getFallbackSummary(projectData);
    }
  }

  getFallbackSummary(projectData) {
    const completedTasks = projectData.tasks.filter(
      (t) => t.status === "completed"
    ).length;
    const totalTasks = projectData.tasks.length;
    const progressPercent =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const blockedTasks = projectData.tasks.filter(
      (t) => t.status === "blocked"
    ).length;

    return `Project "${
      projectData.name
    }" is ${progressPercent}% complete with ${completedTasks} of ${totalTasks} tasks finished. ${
      blockedTasks > 0
        ? `${blockedTasks} tasks are currently blocked and need attention.`
        : "No blocked tasks at the moment."
    } The team has ${projectData.members.length} active members. ${
      progressPercent >= 80
        ? "Project is nearing completion."
        : progressPercent >= 50
        ? "Project is making good progress."
        : "Project is in early stages and may need more focus."
    }`;
  }
}

module.exports = new AIService();
