async function test() {
  const res = await fetch("https://integrate.api.nvidia.com/v1/images/generations", {
    method: 'POST',
    headers: {
      "Authorization": "Bearer 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",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      prompt: "A serene landscape",
      model: "stabilityai/stable-diffusion-3-medium",
      response_format: "b64_json"
    })
  });
  const data = await res.json();
  console.log(Object.keys(data));
  if (data.detail) console.log(data.detail);
}
test();
