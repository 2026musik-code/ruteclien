async function test() {
  const res = await fetch("https://ai.api.nvidia.com/v1/genai/stabilityai/stable-diffusion-xl", {
    method: 'POST',
    headers: {
      "Authorization": "Bearer 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",
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      text_prompts: [{"text": "A serene landscape", "weight": 1}],
      cfg_scale: 5,
      steps: 30,
      seed: 0
    })
  });
  const data = await res.json();
  console.log(Object.keys(data));
  if (data.artifacts) console.log("success");
}
test();
