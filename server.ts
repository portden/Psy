import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
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
      const serviceId = process.env.EMAILJS_SERVICE_ID || "portservice";
      const templateId = process.env.EMAILJS_TEMPLATE_ID || "template_wl7km5e";
      const publicKey = process.env.EMAILJS_PUBLIC_KEY || "nDTYKeAEEZY5bxkRB";
      const privateKey = process.env.EMAILJS_PRIVATE_KEY;

      console.log(`PsycheAcademy: Preparing EmailJS request using Service ID '${serviceId}' and Template ID '${templateId}' (Private key configured: ${!!privateKey})`);

      const emailJsPayload: any = {
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: {
          name: name,
          course_title: courseTitle,
          course: courseTitle, // supports both {{course}} and {{course_title}}
          email: email,
          phone: phone || "Не указан"
        }
      };

      if (privateKey) {
        emailJsPayload.accessToken = privateKey;
      }

      const emailResponse = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(emailJsPayload)
      });

      if (emailResponse.ok) {
        console.log("PsycheAcademy: Email sent successfully via EmailJS!");
        res.json({ message: "Email sent" });
      } else {
        const errorText = await emailResponse.text();
        console.error("PsycheAcademy: EmailJS API error response:", errorText);

        if (errorText.includes("non-browser environments") || emailResponse.status === 403) {
          res.status(403).json({
            error: "EmailJS API access blocked",
            details: errorText,
            tip: "Для отправки писем с сервера вам нужно сделать ОДНО из двух:\n\n1. Перейти в панель EmailJS (Account > Security) по ссылке https://dashboard.emailjs.com/admin/account/security и ВКЛЮЧИТЬ опцию 'Allow API access from non-browser environments'.\n\n2. Либо скопировать там же 'Private Key' и добавить его в Секреты (Environment variables) вашего проекта как EMAILJS_PRIVATE_KEY."
          });
        } else {
          res.status(emailResponse.status).json({ 
            error: "EmailJS API request failed", 
            details: errorText,
            tip: "Убедитесь, что Service ID, Template ID и Public Key указаны верно и соответствуют вашему аккаунту EmailJS."
          });
        }
      }
    } catch (error: any) {
      console.error("PsycheAcademy Error calling EmailJS:", error.message);
      res.status(500).json({ 
        error: "EmailJS delivery failed", 
        details: error.message,
        tip: "Network request to EmailJS API failed. Please ensure the server container has internet access and EmailJS is online."
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
