/**
 * Takes array of domains with their sentences as argument
 * Returns array of objects with domain and formatted text. Formatted for docxtemplater
 */

const groupAndFormatSentences = (domainEntries) => {

  // Joins behaviors together with delimiters (normally ,) and conjugation (normally and).
  const joinClauses = (clauses, conjunction = "and") => {
    if (clauses.length === 0) return "";
    if (clauses.length === 1) return clauses[0];
    if (clauses.length === 2) return `${clauses[0]} ${conjunction} ${clauses[1]}`;

    const delimiter = clauses.some(clause => clause.includes(",")) ? "; " : ", ";
    const allButLast = clauses.slice(0, -1).join(delimiter);
    const last = clauses[clauses.length - 1];

    return `${allButLast}${delimiter}${conjunction} ${last}`;
  };

  // Adds simple narrative text and returns object with domain and full sentences.
  return domainEntries.map(({ domain, sentences }) => {
    const positives = sentences.filter(s => s.did).map(s => s.text);
    const negatives = sentences.filter(s => !s.did).map(s => s.text);

    const pos = positives.length
      ? `Child is able to ${joinClauses(positives)}.`
      : "";
    const neg = negatives.length
      ? `Child is unable to ${joinClauses(negatives, "or")}.`
      : "";

    return {
      domain,
      text: [pos, neg].filter(Boolean).join(" "),
    };
  });
};

export default groupAndFormatSentences;
