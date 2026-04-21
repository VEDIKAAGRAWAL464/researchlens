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

// ===================== INSIGHT EXTRACTION =====================

async function extractResearchInsights(sections) {
  try {
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
      { timeout: 120000 }
    );

    const rawOutput = response.data.response.trim();
    console.log("Ollama responded (insights):", rawOutput.slice(0, 200));

    const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { "Research Objective": rawOutput.slice(0, 250) };
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (e) {
      try { parsed = JSON.parse(jsonMatch[0] + '"}'); }
      catch { return { "Research Objective": rawOutput.slice(0, 250) }; }
    }

    const missing = Object.values(parsed).filter(v => !v || v === "Not specified" || v.trim() === "").length;
    parsed["Insight Confidence"] = missing > 4 ? "Low" : missing >= 2 ? "Medium" : "High";

    return parsed;

  } catch (error) {
    console.error("LLM error:", error.message);
    return { "Research Objective": `Error: ${error.message}` };
  }
}

// ===================== SUMMARY GENERATION =====================

async function generateSummary(sections) {
  try {
    const text =
      (sections.abstract || "") +
      "\n" +
      (sections.introduction ? sections.introduction.slice(0, 1000) : "");

    if (!text || text.trim().length < 50) {
      return "Summary not available.";
    }

    const model = await getAvailableModel();
    console.log("Using model for summary:", model);

    const prompt = `Summarize the following research paper in 3 concise sentences.
Focus on:
- main objective
- method used
- key contribution

Do not copy text directly.

Text:
${text}`;

    const response = await axios.post(
      "http://localhost:11434/api/generate",
      {
        model: model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.3,
          num_predict: 200
        }
      },
      { timeout: 60000 }
    );

    const summary = response.data.response.trim();
    console.log("Summary generated:", summary);

    return summary;

  } catch (error) {
    console.error("Summary error:", error.message);
    return "Summary generation failed.";
  }
}

module.exports = {
  extractResearchInsights,
  generateSummary
};