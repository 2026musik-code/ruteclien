const apiKey = "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";
const models = [
  'meta/llama-3.1-70b-instruct',
  'meta/llama-3.3-70b-instruct',
  'meta/llama-3.2-90b-vision-instruct',
  '01-ai/yi-large',
  'upstage/solar-10.7b-instruct',
  'databricks/dbrx-instruct'
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
