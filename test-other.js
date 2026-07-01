const apiKey = "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";
const models = [
  'deepseek-ai/deepseek-v4-flash',
  'deepseek-ai/deepseek-v4-pro',
  'stepfun-ai/step-3.7-flash',
  'nvidia/llama-3.1-nemotron-70b-instruct'
];

async function test() {
  for(const m of models) {
    try {
      const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: m, messages: [{role: "user", content: "hello"}], max_tokens: 10 })
      });
      console.log(m, res.status);
    } catch(e) { console.error(e) }
  }
}
test();
