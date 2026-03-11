const axios = require("axios");

async function getAvailableModel() {
  try {
    const res = await axios.get("http://localhost:11434/api/tags", { timeout: 5000 });
    const models = res.data.models || [];
    console.log("Available Ollama models:", models.map(m => m.name));
    if (models.length > 0) return models[0].name;
    return "phi3";
  } catch (e) {
    return "phi3";
  }
}

async function extractResearchInsights(sections) {
  try {
    // Keep abstract SHORT so model is fast
    const abstract = sections.abstract
      ? sections.abstract.slice(0, 500)
      : "No abstract provided.";

    const model = await getAvailableModel();
    console.log("Using model:", model);

    const prompt = `Read this research paper abstract and return a JSON object with exactly these 9 keys. Keep each value to 1-2 sentences.

Abstract: ${abstract}

Return only this JSON, no other text:
{
  "Research Objective": "...",
  "Problem Gap": "...",
  "Proposed Method": "...",
  "Dataset Used": "...",
  "Evaluation Metrics": "...",
  "Key Results": "...",
  "Strengths": "...",
  "Limitations": "...",
  "Future Work": "..."
}`;

    console.log("Calling Ollama...");

    const response = await axios.post(
      "http://localhost:11434/api/generate",
      {
        model: model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.2,
          num_predict: 800
        }
      },
      { timeout: 120000 } // 2 minutes max
    );

    const rawOutput = response.data.response.trim();
    console.log("Ollama responded:", rawOutput.slice(0, 300));

    const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { "Research Objective": rawOutput.slice(0, 250) };
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (e) {
      // Try closing truncated JSON
      try { parsed = JSON.parse(jsonMatch[0] + '"}'); }
      catch { return { "Research Objective": rawOutput.slice(0, 250) }; }
    }

    // Confidence score
    const missing = Object.values(parsed).filter(v => !v || v === "Not specified" || v.trim() === "").length;
    parsed["Insight Confidence"] = missing > 4 ? "Low" : missing >= 2 ? "Medium" : "High";

    return parsed;

  } catch (error) {
    console.error("LLM error:", error.message);
    return { "Research Objective": `Error: ${error.message}` };
  }
}

module.exports = { extractResearchInsights };