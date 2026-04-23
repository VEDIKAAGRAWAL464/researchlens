const axios = require("axios");
const xml2js = require("xml2js");

// Simple delay helper to avoid hammering arXiv
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchArxivPapers(query, limit = 5) {
  try {
    // arXiv asks for a 3 second delay between requests
    await sleep(3000);

    const url = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=${limit}&sortBy=relevance&sortOrder=descending`;

    const response = await axios.get(url, {
      headers: {
        "User-Agent": "ResearchLens/1.0 (research tool)"
      },
      timeout: 15000,
    });

    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(response.data);
    const entries = result.feed.entry || [];

    return entries.map(entry => ({
      source: "arXiv",
      title: entry.title?.[0]?.trim(),
      authors: entry.author?.map(a => a.name[0]),
      year: entry.published?.[0]?.split("-")[0] || null,
      citationCount: 0,
      influentialCitationCount: 0,
      abstract: entry.summary?.[0]?.replace(/\s+/g, " ").trim(),
      link: entry.id?.[0],
      pdfUrl: entry.id?.[0]?.replace("abs", "pdf") + ".pdf"
    }));

  } catch (error) {
    if (error.response?.status === 429) {
      console.warn("[arXiv] Rate limited — skipping.");
      return [];
    }
    console.error("[arXiv] Error:", error.message);
    return [];
  }
}

module.exports = { fetchArxivPapers };