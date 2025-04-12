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
  const style = req.body.style || "paragraph"; // 'ordered', 'unordered', 'paragraph'

  let styleInstruction = "";

  if (style === "ordered") {
    styleInstruction = `
Then continue with an ordered list (1., 2., 3., ...), each item explained clearly and thoroughly.`;
  } else if (style === "unordered") {
    styleInstruction = `
Then continue with an unordered list (• or -), where each item is described clearly.`;
  } else {
    styleInstruction = `
Then continue with informative paragraphs under additional H2 headings (at least 3).`;
  }

  const systemPrompt = `
You are a professional blog content writer. Your goal is to create an informative, helpful, and SEO-friendly article.

Always follow this structure:
1. Start with a clear and descriptive H1 title
2. Add an engaging introduction (3–5 sentences)
3. Use a first H2 that directly and clearly answers the topic in one paragraph
${styleInstruction}

Total article length must be **at least 1000 words**.

${isYMYL ? `
⚠️ This is a YMYL (Your Money or Your Life) topic. Follow Google’s E-E-A-T guidelines:
- Be factual, neutral, and professional
- Avoid making promises or exaggerated claims
- Prioritize clarity, credibility, and trust
` : `
This is not a YMYL topic. You may use a friendlier tone while remaining informative and structured.
`}

Write in markdown format:
- # for H1
- ## for each H2 section

Do NOT include SEO titles or meta descriptions.
Match the user’s language automatically (English, Turkish, etc).
Be clear, structured, and do not include any vague filler text.
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
