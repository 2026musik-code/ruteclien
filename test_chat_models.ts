async function testModels() {
  const apiKey = "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";
  const res = await fetch("https://integrate.api.nvidia.com/v1/models", {
    headers: { "Authorization": `Bearer ${apiKey}`, "Accept": "application/json" }
  });
  const data = await res.json();
  const models = data.data.map((m: any) => m.id).filter((id: string) => !id.includes('embed') && !id.includes('rerank') && !id.includes('qa') && !id.includes('retriever') && !id.includes('parse') && !id.includes('bge') && !id.includes('reward') && !id.includes('calibration') && !id.includes('detector') && !id.includes('clip') && !id.includes('translate'));
  
  console.log(`Testing ${models.length} models...`);
  const working: string[] = [];
  
  const batchSize = 10;
  for (let i = 0; i < models.length; i += batchSize) {
    const batch = models.slice(i, i + batchSize);
    await Promise.all(batch.map(async (model: string) => {
      try {
        const testRes = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: "user", content: "hi" }],
            max_tokens: 5
          })
        });
        if (testRes.ok) {
          working.push(model);
          console.log(`✅ ${model}`);
        } else {
          console.log(`❌ ${model} (${testRes.status})`);
        }
      } catch (e) {
        console.log(`❌ ${model} (Error)`);
      }
    }));
  }
  
  const fs = require('fs');
  fs.writeFileSync('working_models.json', JSON.stringify(working));
  console.log("Done. Saved to working_models.json");
}
testModels();
