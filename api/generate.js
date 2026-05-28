const API_KEY = process.env.NVIDIA_API_KEY || process.env.GOOGLE_API_KEY;

module.exports = async (req, res) => {
  // Handle CORS preflight & headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: { message: "Method not allowed. Use POST." } });
  }

  if (!API_KEY) {
    return res.status(500).json({
      error: {
        message: "API Key is not configured. Please add the NVIDIA_API_KEY environment variable under your Vercel Project Settings."
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
};
