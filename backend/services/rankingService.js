function rankPapers(papers) {
  const currentYear = new Date().getFullYear();

  return papers.map(paper => {
    const citationScore = paper.citationCount * 0.6;
    const influentialScore = paper.influentialCitationCount * 0.3;

    const recencyScore = paper.year
      ? (currentYear - paper.year < 5 ? 10 : 0)
      : 0;

    const finalScore = citationScore + influentialScore + recencyScore;

    return {
      ...paper,
      score: finalScore
    };
  })
  .sort((a, b) => b.score - a.score);
}

module.exports = { rankPapers };
