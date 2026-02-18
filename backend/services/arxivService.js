const axios = require("axios");
const xml2js = require("xml2js");

async function fetchArxivPapers(query, limit = 5) {
  const url = `http://export.arxiv.org/api/query?search_query=all:${query}&start=0&max_results=${limit}`;

  try {
    const response = await axios.get(url);
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(response.data);

    const entries = result.feed.entry || [];

    const papers = entries.map(entry => ({
      source: "arXiv",
      title: entry.title?.[0]?.trim(),
      authors: entry.author?.map(a => a.name[0]),
      year: entry.published?.[0]?.split("-")[0] || null,
      citationCount: 0, // arXiv doesn't provide citation
      influentialCitationCount: 0,
      abstract: entry.summary?.[0]?.replace(/\s+/g, " ").trim(),
      link: entry.id?.[0]
    }));

    return papers;

  } catch (error) {
    console.error("Error fetching arXiv:", error.message);
    return [];
  }
}

module.exports = { fetchArxivPapers };
