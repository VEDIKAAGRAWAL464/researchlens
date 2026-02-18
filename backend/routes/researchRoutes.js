const { extractPdfText } = require("../services/pdfService");


const express = require("express");
const router = express.Router();

const { fetchArxivPapers } = require("../services/arxivService");
const { fetchSemanticPapers } = require("../services/semanticService");
const { rankPapers } = require("../services/rankingService");
const { removeDuplicates } = require("../utils/duplicateChecker");

router.get("/research-search", async (req, res) => {
  const query = req.query.q;
  const limit = parseInt(req.query.limit) || 5;

  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  try {
    // Fetch from both sources
    const arxivPapers = await fetchArxivPapers(query, limit);
    const semanticPapers = await fetchSemanticPapers(
      query,
      limit,
      process.env.SEMANTIC_API_KEY
    );

    // Merge
    const combined = [...semanticPapers, ...arxivPapers];

    // Remove duplicates
    const uniquePapers = removeDuplicates(combined);

    // Rank papers
    const ranked = rankPapers(uniquePapers);

    // Return top results
    res.json(ranked.slice(0, limit));

  } catch (error) {
    console.error("Unified search error:", error.message);
    res.status(500).json({ error: "Research search failed" });
  }
});

module.exports = router;

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

    res.json({
      message: "PDF text extracted successfully",
      preview: text.substring(0, 2000)
    });

  } catch (error) {
    res.status(500).json({ error: "PDF extraction failed" });
  }
});
