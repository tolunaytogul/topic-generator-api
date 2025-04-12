const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

app.post("/generate", async (req, res) => {
  const keyword = req.body.keyword;

  try {
    const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that suggests SEO-friendly blog topics."
        },
        {
          role: "user",
          content: "Blog konusu öner: " + keyword
        }
      ]
    }, {
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://seninsiten.com", // buraya kendi domainini yaz
        "X-Title": "Topic Generator"
      }
    });

    res.json(response.data.choices?.[0]?.message?.content || "Yanıt alınamadı.");
  } catch (error) {
    console.error("API Hatası:", error.response?.data || error.message);
    res.status(500).json({ error: "Sunucu hatası veya API isteği başarısız." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
