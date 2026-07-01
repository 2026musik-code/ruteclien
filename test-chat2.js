const apiKey = "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";
const models = ['mistralai/mistral-large', 'mistralai/mistral-large-2407', 'mistralai/mistral-large-2411', 'mistralai/mistral-large-3-675b-instruct-2512'];
async function test() {
  for (const m of models) {
    const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: m, messages: [{role: "user", content: "hello"}] })
    });
    console.log(m, res.status);
  }
}
test();
