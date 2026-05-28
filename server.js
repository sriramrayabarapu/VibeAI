require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.NVIDIA_API_KEY || process.env.GOOGLE_API_KEY;

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
        message: "API Key is not configured."
      }
    });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: { message: "Message is required." } });
  }

  try {
    const response = await fetch(
      "https://integrate.api.nvidia.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "meta/llama-3.1-8b-instruct",
          messages: [
            {
              role: "user",
              content: message
            }
          ],
          max_tokens: 1024
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: { message: data.detail || "API Error" } });
    }

    // Map OpenAI format to Gemini format so the frontend works without changes
    const replyText = data.choices[0]?.message?.content || "";
    
    return res.json({
      candidates: [
        {
          content: {
            parts: [{ text: replyText }]
          }
        }
      ]
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return res.status(500).json({ error: { message: "Server proxy error." } });
  }
});

app.listen(PORT, () => {
  console.log(`AI proxy server running at http://localhost:${PORT}`);
});

module.exports = app;
