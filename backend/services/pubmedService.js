const axios = require("axios");

// PubMed — free, no API key needed, 36M+ biomedical papers
async function fetchPubmedPapers(query, limit = 5) {
  try {
    // Step 1: Search for paper IDs
    const searchRes = await axios.get("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi", {
      params: {
        db: "pubmed",
        term: query,
        retmax: limit,
        retmode: "json",
        sort: "relevance",
      },
      timeout: 8000,
    });

    const ids = searchRes.data.esearchresult?.idlist || [];
    if (ids.length === 0) return [];

    // Step 2: Fetch details for those IDs
    const summaryRes = await axios.get("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi", {
      params: {
        db: "pubmed",
        id: ids.join(","),
        retmode: "json",
      },
      timeout: 8000,
    });

    const result = summaryRes.data.result || {};

    return ids.map(id => {
      const item = result[id];
      if (!item) return null;

      const authors = (item.authors || []).map(a => a.name).filter(Boolean);
      const year = item.pubdate ? parseInt(item.pubdate.split(" ")[0]) : null;

      return {
        source: "PubMed",
        title: item.title || "Untitled",
        authors,
        year,
        citationCount: 0,
        influentialCitationCount: 0,
        abstract: "See PubMed for full abstract.",
        link: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
        pdfUrl: null,
        pmid: id,
      };
    }).filter(Boolean);

  } catch (error) {
    console.error("[PubMed] Error:", error.message);
    return [];
  }
}

module.exports = { fetchPubmedPapers };