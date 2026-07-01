const apiKey = "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";
const models = [
  "image-generation",
  "video-generation",
  "meta/llama-3.1-70b-instruct",
  "meta/llama-3.1-8b-instruct",
  "meta/llama-3.2-90b-vision-instruct",
  "meta/llama-3.2-11b-vision-instruct",
  "meta/llama-3.2-3b-instruct",
  "meta/llama-3.2-1b-instruct",
  "meta/llama-3.3-70b-instruct",
  "mistralai/mistral-large-3-675b-instruct-2512",
  "mistralai/mixtral-8x22b-v0.1",
  "mistralai/mixtral-8x7b-instruct-v0.1",
  "mistralai/mistral-nemotron",
  "google/gemma-2-2b-it",
  "google/gemma-3-12b-it",
  "google/gemma-3-4b-it",
  "microsoft/phi-3-vision-128k-instruct",
  "microsoft/phi-3.5-moe-instruct",
  "microsoft/phi-4-mini-instruct",
  "microsoft/phi-4-multimodal-instruct",
  "upstage/solar-10.7b-instruct"
];

async function test() {
  for(const m of models) {
    if (m === "image-generation" || m === "video-generation") continue;
    try {
      const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: m, messages: [{role: "user", content: "hello"}], max_tokens: 10 })
      });
      console.log(m, res.status);
    } catch(e) { console.error(m, e) }
  }
}
test();
