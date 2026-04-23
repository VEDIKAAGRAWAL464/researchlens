const axios = require("axios");

// ── Provider 1: Groq (Free API - get key at console.groq.com) ──
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.1-8b-instant";

// ── Provider 2: Ollama (Local, fully offline) ─────────────────
const OLLAMA_URL = "http://localhost:11434/api/generate";

function buildPrompt(abstract, title = "") {
  const hasAbstract = abstract && abstract !== "Abstract not available." && abstract.length > 30;

  const content = hasAbstract
    ? `Abstract: ${abstract}`
    : `No abstract available. Use the paper title to infer the research context.\nTitle: ${title}`;

  return `You are an expert Research Analyst writing detailed academic summaries.

${content}
${title ? `Paper Title: ${title}` : ""}

Return ONLY a JSON object with NO extra text, NO markdown, NO backticks:
{
  "Summary": "Write 4-5 detailed sentences. Cover: (1) what problem this research addresses, (2) why it matters, (3) what method or approach is used, (4) what the key finding or contribution is, and (5) the broader impact.",
  "Insights": {
    "Problem Statement": "2-3 sentences describing the specific challenge, gap, or limitation in existing work that this paper addresses.",
    "Methodology": "2-3 sentences explaining the specific technique, model, algorithm, dataset, or experimental approach used by the authors.",
    "Contributions": "2-3 sentences describing what is novel or unique about this work compared to prior research.",
    "Results": "2-3 sentences on the outcomes — include any metrics, benchmarks, or qualitative findings mentioned or inferable from the abstract.",
    "Limitations": "1-2 sentences on the constraints, assumptions, or future work mentioned or reasonably inferred from the scope of the paper.",
    "Insight Confidence": "High, Medium, or Low — based on how much detail was available in the abstract. High means the abstract was detailed enough to answer all sections confidently. Medium means some sections were inferred. Low means the abstract was missing or very short."
  }
}`;
}

async function callGroq(abstract, title) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("No GROQ_API_KEY set");

  // Sanitize — strip control characters and truncate to avoid 400 errors
  abstract = abstract.replace(/[\x00-\x1F\x7F]/g, " ").substring(0, 2000);
  title = (title || "").replace(/[\x00-\x1F\x7F]/g, " ").substring(0, 200);

  try {
    const response = await axios.post(
      GROQ_URL,
      {
        model: GROQ_MODEL,
        messages: [{ role: "user", content: buildPrompt(abstract, title) }],
        temperature: 0.1,
        max_tokens: 800,
      },
      {
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        timeout: 30000,
      }
    );

    const raw = response.data.choices[0].message.content.trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Groq: invalid JSON response");
    return JSON.parse(jsonMatch[0]);

  } catch (error) {
    const detail = error.response?.data?.error?.message || error.message;
    throw new Error(`Groq: ${detail}`);
  }
}

async function callOllama(abstract, title) {
  const tagsRes = await axios.get("http://localhost:11434/api/tags", { timeout: 2000 });
  const models = tagsRes.data.models || [];
  if (models.length === 0) throw new Error("No Ollama models installed");
  const model = models[0].name;

  const response = await axios.post(
    OLLAMA_URL,
    { model, prompt: buildPrompt(abstract, title), stream: false, options: { temperature: 0.1, num_predict: 800 } },
    { timeout: 120000 }
  );

  const raw = response.data.response.trim();
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Ollama: invalid JSON response");
  return JSON.parse(jsonMatch[0]);
}

// Smart rule-based fallback — no LLM needed, always works
function smartFallback(abstract, title) {
  const sentences = abstract.match(/[^.!?]+[.!?]+/g) || [abstract];
  const first = sentences[0]?.trim() || "";
  const mid = sentences[Math.floor(sentences.length / 2)]?.trim() || "";
  const last = sentences[sentences.length - 1]?.trim() || "";
  const summary = [first, mid !== first ? mid : "", last !== first ? last : ""].filter(Boolean).join(" ");

  return {
    Summary: summary || abstract.substring(0, 300),
    Insights: {
      "Problem Statement": sentences.find(s => /problem|challenge|difficult|limitation|gap|lack|issue/i.test(s))?.trim() || sentences[0],
      "Methodology": sentences.find(s => /propose|present|introduce|design|develop|approach|method|model|algorithm|framework/i.test(s))?.trim() || "See full paper.",
      "Contributions": sentences.find(s => /novel|new|first|outperform|improve|better|state.of.the.art|achieve/i.test(s))?.trim() || "See full paper.",
      "Results": sentences.find(s => /\d+(\.\d+)?%|accuracy|performance|score|result|beat|achieve/i.test(s))?.trim() || "See full paper for results.",
      "Limitations": sentences.find(s => /limit|constraint|future|however|although|restrict/i.test(s))?.trim() || "Not explicitly stated in abstract.",
    },
  };
}

async function getConsolidatedAnalysis(sections) {
  const abstract = sections.abstract || "No abstract provided.";
  const title = sections.introduction?.startsWith("Paper title:")
    ? sections.introduction.replace("Paper title:", "").trim()
    : "";

  const providers = [
    { name: "Groq", fn: () => callGroq(abstract, title) },
    { name: "Ollama", fn: () => callOllama(abstract, title) },
  ];

  for (const provider of providers) {
    try {
      console.log(`[LLM] Trying ${provider.name}...`);
      const parsed = await provider.fn();
      const summary = parsed.Summary || parsed.summary || "";
      const insights = parsed.Insights || parsed.insights || {};
      if (summary) {
        console.log(`[LLM] SUCCESS via ${provider.name}`);
        return { summary, insights, provider: provider.name };
      }
    } catch (err) {
      console.log(`[LLM] ${provider.name} failed: ${err.message}`);
    }
  }

  console.log("[LLM] Using smart rule-based fallback");
  const fb = smartFallback(abstract, title);
  return { summary: fb.Summary, insights: fb.Insights, provider: "rule-based" };
}

module.exports = {
  getConsolidatedAnalysis,
  extractResearchInsights: async (s) => (await getConsolidatedAnalysis(s)).insights,
  generateSummary: async (s) => (await getConsolidatedAnalysis(s)).summary,
};