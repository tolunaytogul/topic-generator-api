const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
  model: "deepseek-ai/deepseek-llm", // ✅ doğru model adı
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
    "HTTP-Referer": "https://www.tolunaytogul.com", // ✅ doğru domain
    "X-Title": "Topic Generator"
  }
});
