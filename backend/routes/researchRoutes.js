const express = require("express");
const router = express.Router();

const { fetchArxivPapers } = require("../services/arxivService");
const { fetchSemanticPapers } = require("../services/semanticService");
const { rankPapers } = require("../services/rankingService");
const { removeDuplicates } = require("../utils/duplicateChecker");
const { extractSections } = require("../services/sectionService");
const { extractPdfText } = require("../services/pdfService");


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



  } catch (error) {
    console.error("PDF extraction error:", error.message);
    res.status(500).json({ error: "PDF extraction failed" });
  }
});


// ── Always last ────────────────────────────────────────────────
module.exports = router;