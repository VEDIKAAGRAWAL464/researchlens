const axios = require("axios");

async function extractResearchInsights(sections) {
  try {
    const abstractOnly = sections.abstract
      ? sections.abstract.slice(0, 600)   // reduce heavily
      : "No abstract provided.";

    const prompt = `
Extract structured research insights from this abstract.

Return ONLY valid JSON:

{
  "Research Objective": "",
  "Problem Gap": "",
  "Proposed Method": "",
  "Dataset Used": "",
  "Evaluation Metrics": "",
  "Key Results": "",
  "Strengths": "",
  "Limitations": "",
  "Future Work": ""
}

Abstract:
${abstractOnly}
`;

    const response = await axios.post(
      "http://localhost:11434/api/generate",
      {
        model: "phi3",
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.1,
          num_predict: 300
        }
      },
      { timeout: 90000 } // increase timeout
    );

    const rawOutput = response.data.response;

try {
  return JSON.parse(rawOutput);
} catch {
  return rawOutput;
}

  } catch (error) {
    console.error("LLM extraction error:", error.message);
    return "LLM processing failed.";
  }
}

module.exports = { extractResearchInsights };