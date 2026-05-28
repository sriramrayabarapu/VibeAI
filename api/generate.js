const API_KEY = process.env.GOOGLE_API_KEY || "AIzaSyBtny1iH6dWG5ogu9ofM2IeYWZyACXFxn0";

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
        message: "Gemini API Key is not configured. Please add the GOOGLE_API_KEY environment variable under your Vercel Project Settings."
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
};
