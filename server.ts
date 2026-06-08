import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import nodemailer from "nodemailer";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";

async function startServer() {
  console.log("PsycheAcademy: Starting server...");
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/apply", async (req, res) => {
    const { name, email, phone, courseId, courseTitle } = req.body;
    console.log(`PsycheAcademy: Received application request for ${email}. Course: ${courseTitle}`);

    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        const smtpHost = process.env.SMTP_HOST;
        const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 465;
        const smtpSecure = process.env.SMTP_SECURE !== "false"; // default to true
        const fromName = process.env.FROM_NAME || "PsycheAcademy";
        const fromEmail = process.env.FROM_EMAIL || process.env.EMAIL_USER;

        let transporter;

        if (smtpHost) {
          console.log(`PsycheAcademy: Configuring SMTP transporter with custom host: ${smtpHost}:${smtpPort} (Secure: ${smtpSecure}), Authenticating as ${process.env.EMAIL_USER}`);
          transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpSecure,
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
            // TLS configuration to ignore unauthorized certs if needed (common in some custom corporate SMTPs)
            tls: {
              rejectUnauthorized: false
            }
          });
        } else {
          console.log(`PsycheAcademy: Configuring standard Gmail SMTP service, Authenticating as ${process.env.EMAIL_USER}`);
          transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
          });
        }

        // Verify transport connection before attempting to send
        console.log("PsycheAcademy: Verifying SMTP connection status...");
        try {
          await transporter.verify();
          console.log("PsycheAcademy: SMTP server connection is ready");
        } catch (verifyError: any) {
          console.error("PsycheAcademy SMTP Verification Error:", verifyError.message);
          return res.status(500).json({ 
            error: "SMTP connection failed", 
            details: verifyError.message,
            tip: "Please check your SMTP host, port, and authentication credentials. If using Gmail, make sure you generated an App Password instead of using your standard password."
          });
        }

        console.log(`PsycheAcademy: Sending confirmation email to user (${email})...`);
        // User confirmation
        await transporter.sendMail({
          from: `"${fromName}" <${fromEmail}>`,
          to: email,
          subject: "Заявка принята — PsycheAcademy",
          text: `Здравствуйте, ${name}!\n\nМы получили вашу заявку на курс "${courseTitle}". Наш менеджер свяжется с вами в течение 24 часов.\n\nС уважением,\nКоманда PsycheAcademy`,
        });

        console.log("PsycheAcademy: Sending notification email to admin (portden@gmail.com)...");
        // Admin notification
        await transporter.sendMail({
          from: `"${fromName}" <${fromEmail}>`,
          to: "portden@gmail.com",
          subject: `Новая заявка: ${courseTitle}`,
          text: `Новая заявка на курс "${courseTitle}"\n\nИмя: ${name}\nEmail: ${email}\nТелефон: ${phone || 'Не указан'}`,
        });

        console.log("PsycheAcademy: Emails sent successfully");
        res.json({ message: "Email sent" });
      } else {
        console.warn("PsycheAcademy: EMAIL_USER or EMAIL_PASS environment variables are not set");
        res.status(500).json({ 
          error: "Email credentials not configured",
          tip: "Please set EMAIL_USER and EMAIL_PASS environment variables in the AI Studio Secrets panel."
        });
      }
    } catch (error: any) {
      console.error("PsycheAcademy Email Error during sending:", error.message);
      res.status(500).json({ 
        error: "Email failed", 
        details: error.message,
        tip: "Email generation failed during mail transfer. Ensure your SMTP account hasn't reached its limits and allows external integrations."
      });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    try {
      console.log("PsycheAcademy: Creating Vite server...");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      console.log("PsycheAcademy: Vite middleware added");
    } catch (viteError) {
      console.error("PsycheAcademy: Failed to create Vite server:", viteError);
    }
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
