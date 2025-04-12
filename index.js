const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors({ origin: "*", methods: ["POST"] }));
app.use(express.json());

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

app.post("/generate", async (req, res) => {
  const keyword = req.body.keyword || "";

  // 🔎 Sağlık, finans, hukuk gibi YMYL konularını kontrol et
  const isYMYL = /health|medical|finance|legal|clinic|dental|surgery|treatment|insurance/i.test(keyword);

  const systemPrompt = `
You are a professional blog content writer and SEO strategist. 
Always write content with high-quality language, structured headings, and factual accuracy.

${isYMYL ? `
⚠️ The topic is considered YMYL (Your Money or Your Life). 
You must strictly follow Google’s YMYL & E-E-A-T guidelines:
- Be accurate and factual
- Avoid health promises
- Use medical-neutral tone
- Prioritize reader trust and clarity
- Be formal but readable
` : `
This is not a YMYL topic, so you can be more creative and casual while still optimizing for SEO.
`}

Structure your response like this:
- H1 title
- Meta description (max 160 chars)
- Introduction (3–4 sentences)
- 3 H2 sections (each with 1 paragraph)
- Conclusion

Use markdown-like formatting (e.g. H1, H2) and write in fluent, neutral English.
`;

  try {
    const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
      model: "deepseek/deepseek-r1-zero:free",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Write a blog post about: " + keyword }
      ]
    }, {
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://www.tolunaytogul.com",
        "X-Title": "Content Writer"
      }
    });

    res.json(response.data.choices?.[0]?.message?.content || "Yanıt alınamadı.");
  } catch (error) {
    console.error("API Hatası:", error.response?.data || error.message);
    res.status(500).json({
      error: "Sunucu hatası veya API isteği başarısız.",
      details: error.response?.data || error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
