function removeDuplicates(papers) {
  const seenTitles = new Set();

  return papers.filter(paper => {
    const normalizedTitle = paper.title
      ?.toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    if (seenTitles.has(normalizedTitle)) {
      return false;
    }

    seenTitles.add(normalizedTitle);
    return true;
  });
}

module.exports = { removeDuplicates };
