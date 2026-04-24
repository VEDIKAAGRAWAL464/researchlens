# ResearchLens 🔬

**AI-Assisted Research Paper Discovery & Analysis System**

ResearchLens is a web-based platform that lets researchers and students search for academic papers by topic and instantly receive structured, AI-generated insights — covering problem statement, methodology, contributions, results, and limitations — all in one place. No more jumping between Google Scholar, arXiv, and PubMed manually.

🌐 **Live Demo:** [researchlens-git-main-vedika-agrawals-projects.vercel.app](https://researchlens-cyan.vercel.app/)

---

## Features

- **Multi-source paper search** — fetches from arXiv, Semantic Scholar, CrossRef, PubMed, and CORE in parallel
- **Paid paper discovery** — CrossRef-powered cards from IEEE Xplore, SpringerLink, ScienceDirect, ACM Digital Library, Nature, and Wiley, shown with a 🔒 Paid badge
- **AI-generated structured insights** — Groq LLM (llama-3.1-8b-instant) extracts Problem Statement, Methodology, Contributions, Results, and Limitations from each paper's abstract
- **3-tier AI fallback** — Groq → Ollama (Phi-3) → Rule-based extraction. The system never fails even without an LLM running
- **Citation enrichment** — OpenAlex API fills in real citation counts for arXiv and CrossRef papers
- **Citation-based ranking** — papers sorted by a weighted score combining citation count, influential citations, recency, and abstract quality
- **Open Access badges** — all free-source papers correctly marked as Open Access; paid papers show 🔒 Paid
- **AI Summary guard** — AI Summary button hidden on papers with no abstract, preventing hallucinated summaries
- **10-minute result caching** — in-memory cache makes repeat searches instant and prevents API rate limiting
- **Client-side pagination** — 30–40 results fetched once, paginated locally without re-hitting the backend
- **Source badges** — each card shows which source the paper came from (ARXIV, SEMANTIC SCHOLAR, PUBMED, etc.)
- **Personal library** — save papers to a persistent local library across sessions
- **Search history** — last 20 queries tracked and re-searchable
- **Light / Dark theme** — toggle between modes
- **Confidence scoring** — AI summary panel shows Low / Medium / High confidence based on abstract richness

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| AI (Primary) | Groq API — llama-3.1-8b-instant |
| AI (Fallback) | Ollama — Phi-3 (locally deployed) |
| AI (Last resort) | Rule-based keyword extraction |
| Paper Sources | arXiv, Semantic Scholar, CrossRef, PubMed, CORE |
| Paid Sources | CrossRef filtered by publisher (IEEE, Springer, Elsevier, ACM, Nature, Wiley) |
| Citation Enrichment | OpenAlex API |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |

---

## Project Structure

```
researchlens/
├── frontend/
│   ├── index.html
│   ├── script.js          # All UI logic — search, cards, modal, history, library
│   ├── styles.css
│   └── config.js          # Environment-aware backend URL (localhost vs Render)
│
└── backend/
    ├── index.js            # Express app entry point
    ├── .env                # API keys (not committed)
    ├── routes/
    │   └── researchRoutes.js   # All API endpoints
    └── services/
        ├── arxivService.js         # arXiv API (XML → JSON)
        ├── semanticService.js      # Semantic Scholar API
        ├── crossrefService.js      # CrossRef API
        ├── pubmedService.js        # PubMed eUtils API
        ├── coreService.js          # CORE open access API
        ├── paidSourcesService.js   # CrossRef paid paper fetching + platform links
        ├── dataEnricher.js         # OpenAlex citation enrichment
        ├── rankingService.js       # Citation + recency scoring
        ├── llmService.js           # Groq / Ollama / rule-based AI chain
        ├── pdfService.js           # PDF download & text extraction
        └── sectionService.js       # Section identification from raw text
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/research-search?q=...&limit=30&perSource=10` | Main paper search across all sources |
| POST | `/api/summarize-abstract` | Generate AI summary from abstract + title |
| GET | `/api/extract-pdf?url=...` | Download PDF and extract full-text insights |
| GET | `/api/paid-sources?title=...&doi=...` | Get paid platform links for a paper |
| GET | `/api/sources-status` | Health check for all 5 paper sources |

---

## Getting Started (Local Development)

### Prerequisites

- Node.js v18+
- A Groq API key — free at [console.groq.com](https://console.groq.com)
- Optional: CORE API key — free at [core.ac.uk](https://core.ac.uk/services/api)
- Optional: Semantic Scholar API key — free at [semanticscholar.org](https://www.semanticscholar.org/product/api)

### Backend Setup

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/researchlens.git
cd researchlens/backend

# Install dependencies
npm install

# Create .env file inside the backend folder
touch .env
```

Add the following to `backend/.env`:

```
GROQ_API_KEY=your_groq_api_key_here
SEMANTIC_API_KEY=your_semantic_scholar_key_here   # optional
CORE_API_KEY=your_core_api_key_here               # optional
```

```bash
# Start the backend
node index.js
# Backend runs on http://localhost:5000
```

### Frontend Setup

Open `frontend/config.js` and make sure it points to localhost:

```js
const CONFIG = {
  BACKEND_URL: window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : 'https://your-render-app.onrender.com/api'
};
```

Open `frontend/index.html` with VS Code Live Server (or any local server) on port 5500.

---

## Deployment

### Backend → Render

1. Go to [render.com](https://render.com) → New Web Service → connect your GitHub repo
2. Set **Root Directory** to `backend`
3. Set **Build Command** to `npm install`
4. Set **Start Command** to `node index.js`
5. Add environment variables: `GROQ_API_KEY`, `SEMANTIC_API_KEY`, `CORE_API_KEY`, `FRONTEND_URL`
6. Deploy — your backend URL will be `https://your-app-name.onrender.com`

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → import your repo
2. Set **Root Directory** to `frontend`
3. Leave Build Command and Output Directory empty (plain HTML, no framework)
4. Deploy
5. Update `frontend/config.js` with your Render backend URL and push to GitHub

> **Note:** Render free tier sleeps after 15 minutes of inactivity. The first request after idle takes ~30 seconds to wake up.

---

## How It Works

1. User enters a research topic in the search bar
2. Backend fires parallel requests to arXiv, Semantic Scholar, CrossRef, PubMed, and CORE (10 papers each)
3. A separate CrossRef request fetches papers from paid publishers (IEEE, Springer, etc.)
4. Results are deduplicated by title, then enriched with real citation counts via OpenAlex
5. Papers are ranked by a weighted score: citations (60%) + influential citations (30%) + recency bonus + abstract quality bonus
6. Frontend receives `{ papers: [], paidPapers: [], meta: {} }` and renders two grids
7. When user clicks AI Summary, the abstract is sent to Groq → structured insights returned
8. If Groq fails → Ollama is tried → if that fails → rule-based extraction runs as final fallback

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | Yes | Groq cloud LLM API key |
| `SEMANTIC_API_KEY` | No | Semantic Scholar API key (works without, but rate-limited) |
| `CORE_API_KEY` | No | CORE open access API key (CORE disabled without this) |
| `FRONTEND_URL` | No | Your Vercel frontend URL (used for CORS on Render) |

---

## Paper Sources

| Source | Papers | API Key | Notes |
|---|---|---|---|
| arXiv | CS, Math, Physics preprints | None | 3s delay required between requests |
| Semantic Scholar | 200M+ cross-disciplinary | Optional | Rate-limited without key |
| CrossRef | 130M+ DOI-registered papers | None | Also used for paid paper discovery |
| PubMed | 36M+ biomedical papers | None | Abstract not always available |
| CORE | 200M+ open access | Required (free) | Skipped if no key set |
| CrossRef (Paid) | IEEE, Springer, Elsevier, ACM, Nature, Wiley | None | Filtered by publisher name |

---

## Known Limitations

- **Paid paper abstracts** — most IEEE, Springer, and Elsevier papers do not expose abstracts via CrossRef. The AI Summary button is hidden for these papers.
- **PubMed abstracts** — PubMed's summary API doesn't return full abstracts. A link to the full PubMed entry is provided instead.
- **Render cold starts** — the free Render tier sleeps after inactivity. First search after idle takes ~30 seconds.
- **arXiv rate limits** — arXiv requires a 3-second delay between requests. Searches may take slightly longer when arXiv is one of the sources.

---

## Academic Context

**Institute:** JK Lakshmipat University — Institute of Engineering and Technology (IET)
**Course:** Minor Project (PR1103)
**Students:** Asi Jain (2023Btech019), Vedika Agrawal (2023Btech096)
**Faculty Guide:** Dr. Pranab Roy

---

## References

- [arXiv API Documentation](https://arxiv.org/help/api)
- [Semantic Scholar API Documentation](https://api.semanticscholar.org/)
- [CrossRef REST API](https://api.crossref.org)
- [PubMed eUtils API](https://www.ncbi.nlm.nih.gov/books/NBK25501/)
- [CORE API Documentation](https://core.ac.uk/services/api)
- [OpenAlex API](https://docs.openalex.org/)
- [Groq API Documentation](https://console.groq.com/docs)
- [Ollama Documentation](https://ollama.com/)