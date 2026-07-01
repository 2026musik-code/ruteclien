async function fetchModels() {
  const response = await fetch("https://integrate.api.nvidia.com/v1/models", {
    headers: {
      "Authorization": "Bearer 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",
      "Accept": "application/json"
    }
  });
  const data = await response.json();
  console.log("Total models:", data.data?.length);
  const models = data.data?.map((m: any) => m.id);
  console.log(models);
}
fetchModels();
