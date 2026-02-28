import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import fetch from "node-fetch";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.post("/api/create-room", async (req, res) => {
    try {
      const DAILY_API_KEY = process.env.DAILY_API_KEY;
      if (!DAILY_API_KEY) {
        return res.status(500).json({ error: "DAILY_API_KEY is not set" });
      }

      const response = await fetch("https://api.daily.co/v1/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DAILY_API_KEY}`,
        },
        body: JSON.stringify({
          privacy: "public",
          properties: {
            exp: Math.floor(Date.now() / 1000) + 86400 // Expires in 24 hours
          }
        }),
      });

      const responseText = await response.text();
      let room;
      try {
        room = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse Daily API response:", responseText);
        return res.status(500).json({ error: "Invalid response from Daily API", info: responseText });
      }
      
      if (!response.ok || room.error) {
        console.error("Daily API Error Details:", {
          status: response.status,
          statusText: response.statusText,
          body: room
        });
        return res.status(500).json({ 
          error: room.error || "invalid-request-error",
          info: room.info || "Check your Daily.co API key and room properties."
        });
      }

      res.json(room);
    } catch (error) {
      console.error("Error creating room:", error);
      res.status(500).json({ error: "Failed to create room" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
