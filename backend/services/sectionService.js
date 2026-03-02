function cleanText(text) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function extractSections(text) {
  const cleaned = cleanText(text);

  const sections = {
    abstract: "",
    introduction: "",
    methodology: "",
    experiments: "",
    results: "",
    conclusion: "",
    references: ""
  };

  const lowerText = cleaned.toLowerCase();

  const sectionPatterns = {
    abstract: /abstract/i,
    introduction: /introduction/i,
    methodology: /(methodology|methods|approach)/i,
    experiments: /(experiments|experimental setup)/i,
    results: /results/i,
    conclusion: /conclusion/i,
    references: /references/i
  };

  let sectionPositions = {};

  for (const key in sectionPatterns) {
    const match = sectionPatterns[key].exec(cleaned);
    if (match) {
      sectionPositions[key] = match.index;
    }
  }

  const sortedSections = Object.entries(sectionPositions)
    .sort((a, b) => a[1] - b[1]);

  for (let i = 0; i < sortedSections.length; i++) {
    const [sectionName, startIndex] = sortedSections[i];
    const endIndex =
      i + 1 < sortedSections.length
        ? sortedSections[i + 1][1]
        : cleaned.length;

    sections[sectionName] = cleaned.substring(startIndex, endIndex).trim();
  }

  return sections;
}

module.exports = { extractSections };