const apiKey = "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";
const m = "nvidia/llama-3.1-nemotron-51b-instruct";
fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
  method: "POST",
  headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
  body: JSON.stringify({ model: m, messages: [{role: "user", content: "hello"}] })
}).then(res => res.json()).then(console.log).catch(console.error);
