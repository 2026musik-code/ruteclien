const apiKey = "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";
const models = [
  'mistralai/mistral-nemotron',
  'nvidia/llama-3.1-nemotron-51b-instruct',
  'nvidia/llama-3.1-nemotron-70b-instruct',
  'nvidia/llama-nemotron-embed-1b-v2'
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
