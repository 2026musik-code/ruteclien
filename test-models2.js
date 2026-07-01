const apiKey = "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";
fetch("https://integrate.api.nvidia.com/v1/models", {
  headers: { Authorization: `Bearer ${apiKey}` }
}).then(res => res.json()).then(data => {
  if (data.data) {
    console.log(data.data.filter(m => m.id.includes('deepseek')).map(m => m.id));
    console.log(data.data.filter(m => m.id.includes('nemotron')).map(m => m.id));
  }
}).catch(console.error);
