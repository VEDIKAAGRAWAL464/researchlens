const axios = require("axios");

// CrossRef — free, no API key needed, 130M+ papers
async function fetchCrossrefPapers(query, limit = 5) {
  try {
    const response = await axios.get("https://api.crossref.org/works", {
      params: {
        query: query,
        rows: limit,
        sort: "relevance",
        select: "title,author,published,abstract,URL,is-referenced-by-count,DOI,type",
      },
      headers: {
        "User-Agent": "ResearchLens/1.0 (mailto:researchlens@example.com)",
      },
      timeout: 10000,
    });

    const items = response.data.message?.items || [];

    return items.map(item => {
      const authors = (item.author || []).map(a =>
        [a.given, a.family].filter(Boolean).join(" ")
      );
      const year =
        item.published?.["date-parts"]?.[0]?.[0] ||
        item["published-print"]?.["date-parts"]?.[0]?.[0] ||
        null;

      return {
        source: "CrossRef",
        title: Array.isArray(item.title) ? item.title[0] : item.title || "Untitled",
        authors,
        year,
        citationCount: item["is-referenced-by-count"] || 0,
        influentialCitationCount: 0,
        abstract: item.abstract
          ? item.abstract.replace(/<[^>]+>/g, "").trim()
          : "Abstract not available.",
        link: item.URL || `https://doi.org/${item.DOI}`,
        pdfUrl: null,
        doi: item.DOI || null,
      };
    });
  } catch (error) {
    console.error("[CrossRef] Error:", error.message);
    return [];
  }
}

module.exports = { fetchCrossrefPapers };