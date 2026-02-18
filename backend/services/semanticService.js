const axios = require("axios");

async function fetchSemanticPapers(query, limit = 5, apiKey) {
  try {
    const response = await axios.get(
      "https://api.semanticscholar.org/graph/v1/paper/search",
      {
        params: {
          query: query,
          limit: limit,
          fields: "title,authors,year,abstract,citationCount,influentialCitationCount,url,openAccessPdf"
        },
        headers: {
          "x-api-key": apiKey
        }
      }
    );

    const papers = response.data.data.map(paper => ({
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

    return papers;

  } catch (error) {
    console.error("Error fetching Semantic Scholar:", error.response?.data || error.message);
    return [];
  }
}

module.exports = { fetchSemanticPapers };
