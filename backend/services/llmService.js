const axios = require("axios");

// -----------------------------
// 1️⃣ Structured Insight Extraction
// -----------------------------
async function extractResearchInsights(sections) {
  try {
    const abstract = sections.abstract
      ? sections.abstract.slice(0, 500)
      : "";

    const intro = sections.introduction
      ? sections.introduction.slice(0, 500)
      : "";

    const combinedContent = `
Abstract:
${abstract}

Introduction:
${intro}
`;

    const prompt = `
Extract structured research insights from the following research paper content.

Return ONLY valid JSON in this exact format:

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

If any information is not present, write "Not specified".

Content:
${combinedContent}
`;

    const response = await axios.post(
      "http://localhost:11434/api/generate",
      {
        model: "phi3",
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.1,
          num_predict: 350
        }
      },
      { timeout: 180000 }
    );

    const rawOutput = response.data.response;

    let parsed;

    try {
      parsed = JSON.parse(rawOutput);
    } catch {
      return rawOutput; // fallback if JSON parsing fails
    }

    // -----------------------------
    // Programmatic Confidence Logic
    // -----------------------------
    let missingCount = 0;

    for (const key in parsed) {
      if (
        parsed[key] === "Not specified" ||
        parsed[key] === "" ||
        parsed[key] === null
      ) {
        missingCount++;
      }
    }

    if (missingCount > 3) {
      parsed["Insight Confidence"] = "Low";
    } else if (missingCount >= 1) {
      parsed["Insight Confidence"] = "Medium";
    } else {
      parsed["Insight Confidence"] = "High";
    }

    return parsed;

  } catch (error) {
    console.error("LLM extraction error:", error.message);
    return "LLM processing failed.";
  }
}


// -----------------------------
// 2️⃣ Researcher-Friendly Summary
// -----------------------------
async function generateResearchSummary(sections) {
  try {
    const abstract = sections.abstract
      ? sections.abstract.slice(0, 700)
      : "";

    const intro = sections.introduction
      ? sections.introduction.slice(0, 700)
      : "";

    const combinedContent = `
Abstract:
${abstract}

Introduction:
${intro}
`;

    const prompt = `
You are an academic research assistant.

Write a concise, non-repetitive research summary in 2 structured paragraphs:

Paragraph 1:
- What problem the paper addresses
- Why it matters

Paragraph 2:
- Proposed solution
- Core contribution
- Expected impact

Do NOT repeat sentences.
Do NOT mention "abstract".
Keep it professional and researcher-focused.

Content:
${combinedContent}
`;

    const response = await axios.post(
      "http://localhost:11434/api/generate",
      {
        model: "phi3",
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.2,
          num_predict: 350
        }
      },
      { timeout: 180000 }
    );

    return response.data.response;

  } catch (error) {
    console.error("Summary generation error:", error.message);
    return "Summary generation failed.";
  }
}


// -----------------------------
// Export Both Functions
// -----------------------------
module.exports = {
  extractResearchInsights,
  generateResearchSummary
};