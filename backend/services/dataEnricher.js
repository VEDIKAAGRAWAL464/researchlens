const axios = require("axios");

/**
 * Metadata Enrichment Service
 * Purpose: Fill citation counts using OpenAlex
 */
async function enrichPaperMetadata(paper) {
  try {
    // Only enrich if citationCount missing or 0
    if (paper.citationCount && paper.citationCount > 0) return paper;

    let doi = null;

    // Case 1: DOI already exists
    if (paper.doi) {
      doi = paper.doi.replace("https://doi.org/", "").trim();
    }

    // Case 2: arXiv → construct DOI
    else if (paper.source === "arXiv" && paper.link) {
      const match = paper.link.match(/abs\/(\d+\.\d+)/);
      if (!match) return paper;
      doi = `10.48550/arXiv.${match[1]}`;
    }

    // No DOI — try searching OpenAlex by title (works for PubMed papers)
    if (!doi) {
      if (!paper.title) return paper;
      try {
        const titleRes = await axios.get(
          `https://api.openalex.org/works?search=${encodeURIComponent(paper.title)}&per_page=1`,
          { timeout: 5000 }
        );
        const work = titleRes.data?.results?.[0];
        if (work && typeof work.cited_by_count === "number") {
          console.log(`[Enricher] Found ${work.cited_by_count} citations for "${(paper.title || "").slice(0, 30)}..." (by title)`);
          return { ...paper, citationCount: work.cited_by_count, enriched: true };
        }
      } catch (e) {
        // silent fail
      }
      return paper;
    }

    const url = `https://api.openalex.org/works?filter=doi:${encodeURIComponent(doi)}`;

    const response = await axios.get(url, { timeout: 5000 });

    const work = response.data?.results?.[0];

    if (work && typeof work.cited_by_count === "number") {
      console.log(
        `[Enricher] Found ${work.cited_by_count} citations for "${(paper.title || "").slice(0, 30)}..."`
      );

      return {
        ...paper,
        citationCount: work.cited_by_count,
        enriched: true
      };
    }

    return paper;

  } catch (error) {
    console.log("[Enricher] Failed:", error.message);
    return paper;
  }
}


/**
 * Batch enrichment with rate control
 */
async function enrichPaperBatch(papers) {
  const batch = papers.slice(0, 30);
const remaining = papers.slice(30);

  const enriched = [];

  for (const paper of batch) {
    const result = await enrichPaperMetadata(paper);
    enriched.push(result);

    // small delay to avoid rate limiting
    await new Promise(res => setTimeout(res, 200));
  }

  return [...enriched, ...remaining];
}

module.exports = {
  enrichPaperMetadata,
  enrichPaperBatch
};