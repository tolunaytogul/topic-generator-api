const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors({ origin: "*", methods: ["POST"] }));
app.use(express.json());

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

app.post("/generate", async (req, res) => {
  const keyword = req.body.keyword || "";
  const isYMYL = req.body.ymyl === true;
  const style = req.body.style || "paragraph"; // varsayılan paragraf

  // 👇 Prompt içerik yapısı tanımı
  let styleInstruction = "";

  if (style === "ordered") {
    styleInstruction = `
Format the output as an ordered list (1., 2., 3., ...). Each item should include a short explanation.
Example:
1. Cleanser - Used to remove dirt...
2. Toner - Helps to balance skin pH...
`;
  } else if (style === "unordered") {
    styleInstruction = `
Format the output as an unordered list (• or -). Each item should include a short explanation.
Example:
• Toyota - Reliable and fuel-efficient...
• BMW - Luxury-focused brand...
`;
  } else {
    styleInstruction = `
Format the response as a clear, informative article with paragraphs under relevant subheadings (use ## for H2).
Avoid list formatting unless absolutely necessary.
`;
  }

  const systemPrompt = `
You are a professional content writer focused on SEO, clarity, and factual accuracy.
Do NOT include SEO titles or meta descriptions. Be concise and helpful.

${isYMYL ? `
⚠️ The topic is considered YMYL (Your Money or Your Life).
Strictly follow Google's E-E-A-T and YMYL guidelines:
- Be medically/factually neutral
- Avoid promises
- Use formal tone and structure
` : `
This is not a YMYL topic, so a friendly, casual tone is acceptable as long as it's still informative.
`}

${styleInstruction}

Always write in fluent, clear English. Avoid filler or vague wording. Stick to the point.
`;

  try {
    const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
      model: "deepseek/deepseek-r1-zero:free",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Write about: " + keyword }
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
