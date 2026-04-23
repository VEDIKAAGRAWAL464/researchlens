// Paid Sources Service
// Generates search links for paid platforms — no API calls, no cost.
// Just shows users the paper may exist there with a "Visit" button.
const axios = require("axios");
const PAID_PLATFORMS = [
  {
    id: "ieee",
    name: "IEEE Xplore",
    logo: "IEEE",
    description: "Electronics, CS & EE papers",
    color: "#006699",
    searchUrl: (query) =>
      `https://ieeexplore.ieee.org/search/searchresult.jsp?queryText=${encodeURIComponent(query)}`,
    doiUrl: (doi) => doi ? `https://doi.org/${doi}` : null,
  },
  {
    id: "springer",
    name: "SpringerLink",
    logo: "Springer",
    description: "Science, Technology & Medicine",
    color: "#e6690f",
    searchUrl: (query) =>
      `https://link.springer.com/search?query=${encodeURIComponent(query)}`,
    doiUrl: (doi) => doi ? `https://doi.org/${doi}` : null,
  },
  {
    id: "sciencedirect",
    name: "ScienceDirect",
    logo: "SD",
    description: "Elsevier journals & books",
    color: "#ff6600",
    searchUrl: (query) =>
      `https://www.sciencedirect.com/search?qs=${encodeURIComponent(query)}`,
    doiUrl: (doi) => doi ? `https://doi.org/${doi}` : null,
  },
  {
    id: "acm",
    name: "ACM Digital Library",
    logo: "ACM",
    description: "Computing & information science",
    color: "#0085ca",
    searchUrl: (query) =>
      `https://dl.acm.org/action/doSearch?query=${encodeURIComponent(query)}`,
    doiUrl: (doi) => doi ? `https://doi.org/${doi}` : null,
  },
  {
    id: "nature",
    name: "Nature",
    logo: "N",
    description: "Multidisciplinary science",
    color: "#29a98b",
    searchUrl: (query) =>
      `https://www.nature.com/search?q=${encodeURIComponent(query)}`,
    doiUrl: null,
  },
  {
    id: "wiley",
    name: "Wiley Online",
    logo: "W",
    description: "Cross-disciplinary research",
    color: "#003399",
    searchUrl: (query) =>
      `https://onlinelibrary.wiley.com/action/doSearch?query=${encodeURIComponent(query)}`,
    doiUrl: (doi) => doi ? `https://doi.org/${doi}` : null,
  },
];

function getPaidPlatformLinks(query, doi = null) {
  return PAID_PLATFORMS.map(platform => ({
    id: platform.id,
    name: platform.name,
    logo: platform.logo,
    description: platform.description,
    color: platform.color,
    accessType: "paid",
    searchUrl: platform.searchUrl(query),
    directUrl: doi && platform.doiUrl ? platform.doiUrl(doi) : null,
  }));
}

async function fetchPaidPapers(query, limit = 6) {
  try {
    const response = await axios.get("https://api.crossref.org/works", {
      params: {
        query: query,
        rows: limit * 3, // fetch more so we can filter
        sort: "relevance",
        select: "title,author,published,abstract,URL,is-referenced-by-count,DOI,type,container-title,publisher",
      },
      headers: { "User-Agent": "ResearchLens/1.0 (mailto:researchlens@example.com)" },
      timeout: 10000,
    });

    const items = response.data.message?.items || [];

    const PAID_PUBLISHERS = [
      { keyword: "IEEE", source: "IEEE Xplore" },
      { keyword: "Springer", source: "SpringerLink" },
      { keyword: "Elsevier", source: "ScienceDirect" },
      { keyword: "ACM", source: "ACM Digital Library" },
      { keyword: "Nature", source: "Nature" },
      { keyword: "Wiley", source: "Wiley Online" },
      { keyword: "Taylor", source: "Taylor & Francis" },
      { keyword: "Oxford", source: "Oxford Academic" },
    ];

    return items
      .filter(item => {
        const publisher = (item.publisher || "").toLowerCase();
        const container = ((item["container-title"] || [])[0] || "").toLowerCase();
        return PAID_PUBLISHERS.some(p =>
          publisher.includes(p.keyword.toLowerCase()) ||
          container.includes(p.keyword.toLowerCase())
        );
      })
      .slice(0, limit)
      .map(item => {
        const publisher = item.publisher || "";
        const container = (item["container-title"] || [])[0] || "";
        const matched = PAID_PUBLISHERS.find(p =>
          publisher.toLowerCase().includes(p.keyword.toLowerCase()) ||
          container.toLowerCase().includes(p.keyword.toLowerCase())
        );

        const authors = (item.author || []).map(a =>
          [a.given, a.family].filter(Boolean).join(" ")
        ).map(name => ({ name }));

        const year = item.published?.["date-parts"]?.[0]?.[0] || null;

        return {
          paperId: `paid-${item.DOI || Math.random()}`,
          source: matched?.source || publisher || "Paid Journal",
          title: Array.isArray(item.title) ? item.title[0] : item.title || "Untitled",
          authors,
          year,
          citationCount: item["is-referenced-by-count"] || 0,
          influentialCitationCount: 0,
          abstract: item.abstract
            ? item.abstract.replace(/<[^>]+>/g, "").trim()
            : "Abstract not available. Visit the publisher website to read this paper.",
          url: item.URL || `https://doi.org/${item.DOI}`,
          pdfUrl: null,
          doi: item.DOI || null,
          accessType: "paid",
          isOpenAccess: false,
          score: 0,
        };
      });

  } catch (error) {
    console.error("[PaidPapers] CrossRef fetch error:", error.message);
    return [];
  }
}

module.exports = { getPaidPlatformLinks, PAID_PLATFORMS, fetchPaidPapers };