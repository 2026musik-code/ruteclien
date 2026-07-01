const apiKey = "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";
const m = "nvidia/nemotron-4-340b-instruct";
fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
  method: "POST",
  headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
  body: JSON.stringify({ model: m, messages: [{role: "user", content: "hello"}], max_tokens: 100 })
}).then(res => res.json()).then(console.log).catch(console.error);
