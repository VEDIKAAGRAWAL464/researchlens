const axios = require("axios");

async function fetchSemanticPapers(query, limit = 5, apiKey) {
  try {
    const headers = {
      "User-Agent": "ResearchLens/1.0 (research tool)",
    };
    if (apiKey) headers["x-api-key"] = apiKey;

    const response = await axios.get(
      "https://api.semanticscholar.org/graph/v1/paper/search",
      {
        params: {
          query: query,
          limit: limit,
          fields: "title,authors,year,abstract,citationCount,influentialCitationCount,url,openAccessPdf"
        },
        headers,
        timeout: 10000,
      }
    );

    return response.data.data.map(paper => ({
      source: "Semantic Scholar",
      title: paper.title,
      authors: paper.authors.map(a => a.name),
      year: paper.year,
      citationCount: paper.citationCount || 0,
      influentialCitationCount: paper.influentialCitationCount || 0,
      abstract: paper.abstract || "Abstract not available.",
      link: paper.url,
      pdfUrl: paper.openAccessPdf?.url || null
    }));

  } catch (error) {
    if (error.response?.status === 429) {
      console.warn("[Semantic Scholar] Rate limited — skipping.");
      return [];
    }
    if (error.response?.status === 403) {
      console.warn("[Semantic Scholar] Forbidden — skipping.");
      return [];
    }
    console.error("[Semantic Scholar] Error:", error.response?.data || error.message);
    return [];
  }
}

module.exports = { fetchSemanticPapers };