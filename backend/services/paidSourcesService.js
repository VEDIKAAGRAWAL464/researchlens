// Paid Sources Service
// Generates search links for paid platforms — no API calls, no cost.
// Just shows users the paper may exist there with a "Visit" button.

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

module.exports = { getPaidPlatformLinks, PAID_PLATFORMS };