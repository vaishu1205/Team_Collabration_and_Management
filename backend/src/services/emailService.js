const nodemailer = require("nodemailer");
require("dotenv").config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendTaskAssignmentEmail(
    userEmail,
    userName,
    taskTitle,
    projectName,
    assignedBy,
    dueDate
  ) {
    const subject = `New Task Assigned: ${taskTitle}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Task Assignment</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600;">New Task Assignment</h1>
            <p style="margin: 10px 0 0 0; color: #e8e8ff; font-size: 16px;">Team Collaboration Platform</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px 20px;">
            <p style="font-size: 18px; color: #333; margin: 0 0 20px 0;">Hi ${userName},</p>
            
            <p style="font-size: 16px; color: #555; line-height: 1.6; margin: 0 0 25px 0;">
              You have been assigned a new task in the <strong style="color: #667eea;">${projectName}</strong> project.
            </p>
            
            <!-- Task Details Card -->
            <div style="background: #f8f9ff; border-left: 4px solid #667eea; padding: 20px; margin: 25px 0; border-radius: 0 6px 6px 0;">
              <h3 style="margin: 0 0 15px 0; color: #333; font-size: 20px;">${taskTitle}</h3>
              
              <div style="margin: 10px 0;">
                <strong style="color: #666;">Assigned by:</strong>
                <span style="color: #333; margin-left: 5px;">${assignedBy}</span>
              </div>
              
              ${
                dueDate
                  ? `
              <div style="margin: 10px 0;">
                <strong style="color: #666;">Due date:</strong>
                <span style="color: #e74c3c; margin-left: 5px; font-weight: 600;">${new Date(
                  dueDate
                ).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}</span>
              </div>
              `
                  : ""
              }
              
              <div style="margin: 15px 0 0 0;">
                <strong style="color: #666;">Project:</strong>
                <span style="color: #333; margin-left: 5px;">${projectName}</span>
              </div>
            </div>
            
            <!-- Action Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}" 
                 style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
                View Task Details
              </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #888; font-size: 14px; margin: 0; line-height: 1.5;">
                Best regards,<br>
                <strong>Team Collaboration Platform</strong><br>
                Your Project Management Solution
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
            <p style="margin: 0; color: #666; font-size: 12px;">
              This email was sent from Team Collaboration Platform. Please do not reply to this email.
            </p>
          </div>
          
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(userEmail, subject, html);
  }

  async sendDeadlineReminderEmail(userEmail, userName, tasks) {
    const subject = `Deadline Reminder: ${tasks.length} task${
      tasks.length > 1 ? "s" : ""
    } due soon`;

    const taskList = tasks
      .map(
        (task) => `
      <div style="background: ${
        task.isOverdue ? "#fee" : "#fff"
      }; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid ${
          task.isOverdue ? "#e74c3c" : "#3498db"
        };">
        <h4 style="margin: 0 0 5px 0; color: #333;">${task.title}</h4>
        <p style="margin: 0; color: #666; font-size: 14px;">${
          task.projectName
        }</p>
        <p style="margin: 5px 0 0 0; color: ${
          task.isOverdue ? "#e74c3c" : "#666"
        }; font-size: 14px; font-weight: 600;">
          ${
            task.isOverdue
              ? "⚠️ Overdue"
              : `📅 Due: ${new Date(task.dueDate).toLocaleDateString()}`
          }
        </p>
      </div>
    `
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Deadline Reminder</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 30px 20px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">⏰ Deadline Reminder</h1>
          </div>
          <div style="padding: 30px 20px;">
            <p style="font-size: 18px; color: #333;">Hi ${userName},</p>
            <p style="color: #555; line-height: 1.6;">You have ${
              tasks.length
            } task${tasks.length > 1 ? "s" : ""} with approaching deadlines:</p>
            ${taskList}
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}" 
                 style="background: #ff6b6b; color: white; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: 600;">
                View All Tasks
              </a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(userEmail, subject, html);
  }

  async sendEmail(to, subject, html) {
    try {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.log("📧 EMAIL SIMULATION (No SMTP configured)");
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(
          "Configure EMAIL_USER and EMAIL_PASSWORD in .env for real sending"
        );
        return { success: true, messageId: "simulation", simulation: true };
      }

      console.log(`📧 Sending real email to: ${to}`);

      const info = await this.transporter.sendMail({
        from: `"Team Collaboration Platform" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
      });

      console.log("✅ Email sent successfully:", info.messageId);
      console.log("📬 Preview URL:", nodemailer.getTestMessageUrl(info));

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("❌ Email sending failed:", error.message);
      return { success: false, error: error.message };
    }
  }

  async testEmailConnection() {
    try {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.log(
          "⚠️ Email not configured - set EMAIL_USER and EMAIL_PASSWORD in .env"
        );
        return false;
      }

      await this.transporter.verify();
      console.log("✅ SMTP connection verified successfully");
      return true;
    } catch (error) {
      console.error("❌ SMTP connection failed:", error.message);
      return false;
    }
  }
}

module.exports = new EmailService();

// const nodemailer = require("nodemailer");

// class EmailService {
//   constructor() {
//     // Use a working test SMTP service - Mailtrap for development
//     this.transporter = nodemailer.createTransport({
//       host: "smtp.mailtrap.io",
//       port: 2525,
//       auth: {
//         user: "test", // These are fake credentials for testing
//         pass: "test",
//       },
//     });

//     // Alternative: Use Ethereal Email (creates test accounts automatically)
//     /*
//     this.transporter = nodemailer.createTransport({
//       host: 'smtp.ethereal.email',
//       port: 587,
//       secure: false,
//       auth: {
//         user: 'ethereal.user@ethereal.email',
//         pass: 'ethereal.pass'
//       }
//     });
//     */
//   }

//   async sendTaskAssignmentEmail(
//     userEmail,
//     userName,
//     taskTitle,
//     projectName,
//     assignedBy,
//     dueDate
//   ) {
//     const subject = `New Task Assigned: ${taskTitle}`;

//     const html = `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd;">
//         <div style="background: #4F46E5; padding: 20px; text-align: center; color: white;">
//           <h1 style="margin: 0;">New Task Assignment</h1>
//         </div>
//         <div style="padding: 20px;">
//           <p>Hi ${userName},</p>
//           <p>You have been assigned a new task: <strong>${taskTitle}</strong></p>
//           <p>Project: <strong>${projectName}</strong></p>
//           <p>Assigned by: <strong>${assignedBy}</strong></p>
//           ${
//             dueDate
//               ? `<p>Due date: <strong>${new Date(
//                   dueDate
//                 ).toLocaleDateString()}</strong></p>`
//               : ""
//           }
//           <p>Please log in to view task details.</p>
//         </div>
//       </div>
//     `;

//     return this.sendEmail(userEmail, subject, html);
//   }

//   async sendEmail(to, subject, html) {
//     try {
//       console.log(`Attempting to send email to: ${to}`);

//       // For development, just simulate sending
//       console.log("=== EMAIL SIMULATION ===");
//       console.log(`To: ${to}`);
//       console.log(`Subject: ${subject}`);
//       console.log("Content: Email would be sent in production");
//       console.log("=========================");

//       // Return success for development
//       return {
//         success: true,
//         messageId: "dev-" + Date.now(),
//         simulation: true,
//       };

//       // Uncomment below for actual email sending in production:
//       /*
//       const info = await this.transporter.sendMail({
//         from: '"Team Collaboration" <noreply@teamcollab.com>',
//         to,
//         subject,
//         html
//       });

//       console.log('Email sent successfully:', info.messageId);
//       return { success: true, messageId: info.messageId };
//       */
//     } catch (error) {
//       console.error("Email sending failed:", error.message);
//       return { success: false, error: error.message };
//     }
//   }

//   async testEmailConnection() {
//     try {
//       // For development, always return true
//       console.log("Email connection test: OK (simulation mode)");
//       return true;
//     } catch (error) {
//       console.error("SMTP connection failed:", error.message);
//       return false;
//     }
//   }
// }

// module.exports = new EmailService();

// // const nodemailer = require("nodemailer");

// // class EmailService {
// //   constructor() {
// //     // WORKING SMTP configuration for development
// //     this.transporter = nodemailer.createTransport({
// //       host: "smtp.ethereal.email",
// //       port: 587,
// //       secure: false,
// //       auth: {
// //         user: "ethereal.user@ethereal.email",
// //         pass: "ethereal.pass",
// //       },
// //     });
// //   }

// //   async sendTaskAssignmentEmail(
// //     userEmail,
// //     userName,
// //     taskTitle,
// //     projectName,
// //     assignedBy,
// //     dueDate
// //   ) {
// //     const subject = `New Task Assigned: ${taskTitle}`;

// //     const html = `
// //       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd;">
// //         <div style="background: #4F46E5; padding: 20px; text-align: center; color: white;">
// //           <h1 style="margin: 0;">New Task Assignment</h1>
// //         </div>
// //         <div style="padding: 20px;">
// //           <p>Hi ${userName},</p>
// //           <p>You have been assigned a new task: <strong>${taskTitle}</strong></p>
// //           <p>Project: <strong>${projectName}</strong></p>
// //           <p>Assigned by: <strong>${assignedBy}</strong></p>
// //           ${
// //             dueDate
// //               ? `<p>Due date: <strong>${new Date(
// //                   dueDate
// //                 ).toLocaleDateString()}</strong></p>`
// //               : ""
// //           }
// //           <p>Please log in to view task details.</p>
// //         </div>
// //       </div>
// //     `;

// //     return this.sendEmail(userEmail, subject, html);
// //   }

// //   async sendEmail(to, subject, html) {
// //     try {
// //       console.log(`Attempting to send email to: ${to}`);

// //       const info = await this.transporter.sendMail({
// //         from: '"Team Collaboration" <noreply@teamcollab.com>',
// //         to,
// //         subject,
// //         html,
// //       });

// //       console.log("✅ Email sent successfully:", info.messageId);
// //       console.log("Preview URL:", nodemailer.getTestMessageUrl(info));

// //       return {
// //         success: true,
// //         messageId: info.messageId,
// //         previewUrl: nodemailer.getTestMessageUrl(info),
// //       };
// //     } catch (error) {
// //       console.error("❌ Email sending failed:", error.message);
// //       return { success: false, error: error.message };
// //     }
// //   }

// //   async testEmailConnection() {
// //     try {
// //       await this.transporter.verify();
// //       console.log("✅ SMTP connection verified");
// //       return true;
// //     } catch (error) {
// //       console.error("❌ SMTP connection failed:", error.message);
// //       return false;
// //     }
// //   }
// // }

// // module.exports = new EmailService();
