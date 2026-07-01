const apiKey = "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";
fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "nvidia/llama-3.1-nemotron-70b-instruct",
    messages: [{role: "user", content: "hello"}],
    stream: false
  })
}).then(res => res.json().then(data => ({status: res.status, data}))).then(console.log).catch(console.error);
