const axios = require("axios");

// CORE — free open access aggregator, 200M+ papers
// Get your free API key at: https://core.ac.uk/services/api (instant approval)
async function fetchCorePapers(query, limit = 5) {
  const apiKey = process.env.CORE_API_KEY;

  if (!apiKey) {
    console.log("[CORE] No CORE_API_KEY set — skipping");
    return [];
  }

  try {
    const response = await axios.post(
      "https://api.core.ac.uk/v3/search/works",
      {
        q: query,
        limit,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    const results = response.data.results || [];

    return results.map(item => ({
      source: "CORE",
      title: item.title || "Untitled",
      authors: (item.authors || []).map(a => a.name || a).filter(Boolean),
      year: item.yearPublished || null,
      citationCount: item.citationCount || 0,
      influentialCitationCount: 0,
      abstract: item.abstract || "Abstract not available.",
      link: item.links?.[0]?.url || `https://core.ac.uk/works/${item.id}`,
      pdfUrl: item.downloadUrl || null,
    }));

  } catch (error) {
    console.error("[CORE] Error:", error.message);
    return [];
  }
}

module.exports = { fetchCorePapers };