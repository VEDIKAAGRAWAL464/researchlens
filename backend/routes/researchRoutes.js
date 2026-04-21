const express = require("express");
const router = express.Router();

const { fetchArxivPapers } = require("../services/arxivService");
const { fetchSemanticPapers } = require("../services/semanticService");
const { rankPapers } = require("../services/rankingService");
const { removeDuplicates } = require("../utils/duplicateChecker");
const { extractSections } = require("../services/sectionService");
const { extractPdfText } = require("../services/pdfService");
const { extractResearchInsights } = require("../services/llmService");
const { generateSummary } = require("../services/llmService");

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

    // ✅ LLM Insight Extraction
    const insights = await extractResearchInsights(sections);

    // ✅ LLM Summary Generation (MAIN FIX)
    let summary = await generateSummary(sections);

    // ✅ Fallback (if summary fails)
    if (!summary || summary.length < 20) {
      console.log("Using fallback summary");
      summary = sections.abstract
        ? sections.abstract.slice(0, 300)
        : "Summary not available.";
    }

    res.json({
      summary,
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
      introduction: title ? `Paper title: ${title}` : ""
    };

    // ✅ Insights
    const insights = await extractResearchInsights(sections);

    // ✅ Summary (MAIN FIX)
    let summary = await generateSummary(sections);

    // ✅ Fallback
    if (!summary || summary.length < 20) {
      summary = abstract.slice(0, 300);
    }

    res.json({
      summary,
      insights: typeof insights === "object" ? insights : {}
    });

  } catch (error) {
    console.error("Abstract summarize error:", error.message);
    res.status(500).json({ error: "Summary generation failed" });
  }
});

// ── Always last ────────────────────────────────────────────────
module.exports = router;