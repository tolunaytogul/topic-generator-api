const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

app.post("/generate", async (req, res) => {
  const keyword = req.body.keyword;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://seninsiten.com", // Domainini buraya yaz
      "X-Title": "Topic Generator"
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "You are a helpful assistant that suggests SEO-friendly blog topics." },
        { role: "user", content: "Blog konusu öner: " + keyword }
      ]
    })
  });

  const data = await response.json();
  res.json(data.choices?.[0]?.message?.content || "Yanıt alınamadı.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
