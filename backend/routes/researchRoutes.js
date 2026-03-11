const express = require("express");
const router = express.Router();

const { fetchArxivPapers } = require("../services/arxivService");
const { fetchSemanticPapers } = require("../services/semanticService");
const { rankPapers } = require("../services/rankingService");
const { removeDuplicates } = require("../utils/duplicateChecker");
const { extractSections } = require("../services/sectionService");
const { extractPdfText } = require("../services/pdfService");
const { extractResearchInsights } = require("../services/llmService");


// ── Route 1: Unified Paper Search ─────────────────────────────
router.get("/research-search", async (req, res) => {
  const query = req.query.q;
  const limit = parseInt(req.query.limit) || 5;

  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  try {
    const arxivPapers = await fetchArxivPapers(query, limit);
    const semanticPapers = await fetchSemanticPapers(
      query,
      limit,
      process.env.SEMANTIC_API_KEY
    );

    const combined = [...semanticPapers, ...arxivPapers];
    const uniquePapers = removeDuplicates(combined);
    const ranked = rankPapers(uniquePapers);

    res.json(ranked.slice(0, limit));

  } catch (error) {
    console.error("Unified search error:", error.message);
    res.status(500).json({ error: "Research search failed" });
  }
});


// ── Route 2: PDF Extraction ────────────────────────────────────
router.get("/extract-pdf", async (req, res) => {
  const pdfUrl = req.query.url;

  if (!pdfUrl) {
    return res.status(400).json({ error: "PDF URL required" });
  }

  try {
    const text = await extractPdfText(pdfUrl);

    if (!text) {
      return res.status(500).json({ error: "Failed to extract text" });
    }

    const sections = extractSections(text);

    // Generate structured AI insights via local LLM
    const insights = await extractResearchInsights(sections);

    // Build a readable summary string from the insights object
    let summary = "AI analysis could not be generated.";
    if (insights && typeof insights === "object") {
      const obj = insights["Research Objective"] || insights["Proposed Method"] || "";
      if (obj && obj !== "Not specified") {
        summary = obj;
      } else if (sections.abstract) {
        summary = sections.abstract.slice(0, 300);
      }
    } else if (typeof insights === "string") {
      summary = insights;
    }

    res.json({
      summary: summary,
      insights: typeof insights === "object" ? insights : {},
      sections: {
        abstract: sections.abstract || null,
        introduction: sections.introduction || null
      }
    });

  } catch (error) {
    console.error("PDF extraction error:", error.message);
    res.status(500).json({ error: "PDF extraction failed" });
  }
});




// ── Route 3: Summarize from Abstract (no PDF needed) ──────────
router.post("/summarize-abstract", async (req, res) => {
  const { abstract, title } = req.body;

  if (!abstract) {
    return res.status(400).json({ error: "Abstract text required" });
  }

  try {
    const sections = {
      abstract: abstract,
      introduction: title ? `This paper is titled: ${title}` : ""
    };

    const insights = await extractResearchInsights(sections);

    let summary = "AI analysis could not be generated.";
    if (insights && typeof insights === "object") {
      const obj = insights["Research Objective"] || insights["Proposed Method"] || "";
      if (obj && obj !== "Not specified") {
        summary = obj;
      } else {
        summary = abstract.slice(0, 300);
      }
    }

    res.json({
      summary: summary,
      insights: typeof insights === "object" ? insights : {}
    });

  } catch (error) {
    console.error("Abstract summarize error:", error.message);
    res.status(500).json({ error: "Summary generation failed" });
  }
});

// ── Always last ────────────────────────────────────────────────
module.exports = router;