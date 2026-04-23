const express = require("express");
const router = express.Router();

const { fetchArxivPapers } = require("../services/arxivService");
const { fetchSemanticPapers } = require("../services/semanticService");
const { fetchCrossrefPapers } = require("../services/crossrefService");
const { fetchPubmedPapers } = require("../services/pubmedService");
const { fetchCorePapers } = require("../services/coreService");
const { rankPapers } = require("../services/rankingService");
const { removeDuplicates } = require("../utils/duplicateChecker");
const { extractSections } = require("../services/sectionService");
const { extractPdfText } = require("../services/pdfService");
const { getConsolidatedAnalysis } = require("../services/llmService");
const { enrichPaperBatch } = require("../services/dataEnricher");
const { getPaidPlatformLinks, fetchPaidPapers } = require("../services/paidSourcesService");

// Simple in-memory cache — stores results for 10 minutes
const searchCache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function getCached(key) {
  const entry = searchCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    searchCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key, data) {
  searchCache.set(key, { data, timestamp: Date.now() });
}

// ── Route 1: Unified Paper Search ─────────────────────────────
router.get("/research-search", async (req, res) => {
  const query = req.query.q;
  const limit = parseInt(req.query.limit) || 30;
const perSource = parseInt(req.query.perSource) || 10;
  const sources = (req.query.sources || "arxiv,semantic,crossref,pubmed,core").split(",");

  if (!query) return res.status(400).json({ error: "Query is required" });

// Return cached result if available
  const cacheKey = `${query}-${sources.join(",")}`;
  const cached = getCached(cacheKey);
  if (cached) {
    console.log(`[Cache] HIT for "${query}"`);
    return res.json(cached);
  }

  try {
    const tasks = [];
    if (sources.includes("arxiv"))    tasks.push(fetchArxivPapers(query, perSource));
    if (sources.includes("semantic")) tasks.push(fetchSemanticPapers(query, perSource, process.env.SEMANTIC_API_KEY));
    if (sources.includes("crossref")) tasks.push(fetchCrossrefPapers(query, perSource));
    if (sources.includes("pubmed"))   tasks.push(fetchPubmedPapers(query, perSource));
    if (sources.includes("core"))     tasks.push(fetchCorePapers(query, perSource));
    const paidPapersPromise = fetchPaidPapers(query, 6);
    const results = await Promise.allSettled(tasks);

    const allPapers = results
      .filter(r => r.status === "fulfilled")
      .flatMap(r => r.value);

    const unique = removeDuplicates(allPapers);
    const enriched = await enrichPaperBatch(unique);
    const ranked = rankPapers(enriched);

   const paidPapers = await paidPapersPromise.catch(() => []);

const responseData = {
  papers: ranked,
  paidPapers: paidPapers,
  paidPlatforms: getPaidPlatformLinks(query),
  meta: { query, totalFound: ranked.length, sourcesQueried: sources },
};
    setCache(cacheKey, responseData);
    res.json(responseData);


  } catch (error) {
    console.error("Search error:", error.message);
    res.status(500).json({ error: "Research search failed" });
  }
});


// ── Route 2: AI Summary from Abstract ────────────────────────
router.post("/summarize-abstract", async (req, res) => {
  const { abstract, title } = req.body;

  if (!abstract) return res.status(400).json({ error: "Abstract text required" });

  try {
    const sections = {
      abstract: abstract.trim(),
      introduction: title ? `Paper title: ${title}` : "",
    };

    const result = await getConsolidatedAnalysis(sections);
    res.json(result);

  } catch (error) {
    console.error("Summary error:", error.message);
    res.status(500).json({ error: "Summary generation failed" });
  }
});


// ── Route 3: PDF Extraction + Analysis ───────────────────────
router.get("/extract-pdf", async (req, res) => {
  const pdfUrl = req.query.url;

  if (!pdfUrl) return res.status(400).json({ error: "PDF URL required" });

  try {
    const text = await extractPdfText(pdfUrl);

    if (!text) {
      return res.status(422).json({
        error: "Full text not available",
        reason: "PDF could not be parsed. Abstract summary is still available.",
      });
    }

    const sections = extractSections(text);
    const { summary, insights } = await getConsolidatedAnalysis(sections);

    res.json({
      summary,
      insights,
      sections: {
        abstract: sections.abstract || null,
        introduction: sections.introduction || null,
        methodology: sections.methodology || null,
        results: sections.results || null,
        conclusion: sections.conclusion || null,
      },
    });

  } catch (error) {
    console.error("PDF extraction error:", error.message);
    res.status(500).json({ error: "PDF extraction failed" });
  }
});


// ── Route 4: Paid platform links for a paper ─────────────────
router.get("/paid-sources", (req, res) => {
  const { title, doi } = req.query;
  if (!title) return res.status(400).json({ error: "title is required" });
  res.json(getPaidPlatformLinks(title, doi || null));
});


// ── Route 5: Sources health check ────────────────────────────
router.get("/sources-status", async (req, res) => {
  const checks = await Promise.allSettled([
    fetchArxivPapers("test", 1).then(() => ({ name: "arXiv", status: "ok", free: true })),
    fetchSemanticPapers("test", 1, process.env.SEMANTIC_API_KEY).then(() => ({ name: "Semantic Scholar", status: "ok", free: true })),
    fetchCrossrefPapers("test", 1).then(() => ({ name: "CrossRef", status: "ok", free: true })),
    fetchPubmedPapers("test", 1).then(() => ({ name: "PubMed", status: "ok", free: true })),
    fetchCorePapers("test", 1).then(() => ({ name: "CORE", status: process.env.CORE_API_KEY ? "ok" : "no-key", free: true })),
  ]);

  res.json(
    checks.map((c, i) => {
      const names = ["arXiv", "Semantic Scholar", "CrossRef", "PubMed", "CORE"];
      return c.status === "fulfilled"
        ? c.value
        : { name: names[i], status: "error", error: c.reason?.message };
    })
  );
});

module.exports = router;