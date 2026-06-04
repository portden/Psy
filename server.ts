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
    console.log(`PsycheAcademy: Email request for ${email}`);

    try {
      // Send Emails (Server handles secrets)
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        console.log("PsycheAcademy: Sending emails...");
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        // User confirmation
        await transporter.sendMail({
          from: `"PsycheAcademy" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: "Заявка принята",
          text: `Здравствуйте, ${name}! Мы получили вашу заявку на курс "${courseTitle}".`,
        });

        // Admin notification
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: "portden@gmail.com",
          subject: "Новая заявка",
          text: `Имя: ${name}\nEmail: ${email}\nТелефон: ${phone || 'Не указан'}\nКурс: ${courseTitle}`,
        });
        console.log("PsycheAcademy: Emails sent successfully");
        res.json({ message: "Email sent" });
      } else {
        console.warn("PsycheAcademy: EMAIL_USER or EMAIL_PASS not set");
        res.status(500).json({ error: "Email credentials not configured" });
      }
    } catch (error: any) {
      console.error("PsycheAcademy Email Error:", error.message);
      res.status(500).json({ error: "Email failed", details: error.message });
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
