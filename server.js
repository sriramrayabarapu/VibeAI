const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.GOOGLE_API_KEY || "AIzaSyBtny1iH6dWG5ogu9ofM2IeYWZyACXFxn0";

app.use(cors());
app.use(express.json());

// Direct the root route and index.html to public/index.html (primary entry point)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/index.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "public")));

app.post("/generate", async (req, res) => {
  if (!API_KEY) {
    return res.status(500).json({
      error: {
        message: "Gemini API Key is not configured."
      }
    });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: { message: "Message is required." } });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: message
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    return res.status(500).json({ error: { message: "Server proxy error." } });
  }
});

app.listen(PORT, () => {
  console.log(`AI proxy server running at http://localhost:${PORT}`);
});

module.exports = app;
