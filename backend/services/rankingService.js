function rankPapers(papers) {
  const currentYear = new Date().getFullYear();

  return papers.map(paper => {
    const citationScore = (paper.citationCount || 0) * 0.6;
    const influentialScore = (paper.influentialCitationCount || 0) * 0.3;

    // Recency bonus — newer papers get a boost
    const age = paper.year ? currentYear - paper.year : 10;
    const recencyScore = age <= 2 ? 15 : age <= 5 ? 8 : age <= 10 ? 3 : 0;

    // Abstract quality bonus — prefer papers that have real abstracts
    const abstractScore = (paper.abstract &&
      paper.abstract !== "Abstract not available." &&
      paper.abstract !== "See PubMed for full abstract." &&
      paper.abstract.length > 50) ? 5 : 0;

    const finalScore = citationScore + influentialScore + recencyScore + abstractScore;

    return { ...paper, score: finalScore };
  })
  .sort((a, b) => {
    // Primary sort: score descending
    if (b.score !== a.score) return b.score - a.score;
    // Tiebreaker 1: citation count descending
    if ((b.citationCount || 0) !== (a.citationCount || 0)) return (b.citationCount || 0) - (a.citationCount || 0);
    // Tiebreaker 2: newer year first
    return (b.year || 0) - (a.year || 0);
  });
}

module.exports = { rankPapers };