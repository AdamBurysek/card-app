import type { ReactNode } from "react";

export function decorateHint(frontWord: string, hint: string): ReactNode {
  if (!hint || !frontWord) return hint;

  /** Normalize candidate search bases */
  const normalized = frontWord.trim().toLowerCase();
  const withoutPrefix = normalized.replace(/^(the|to)\s+/i, "");
  const searchBases = Array.from(new Set([normalized, withoutPrefix].filter(Boolean)));

  /** Generate token list: words vs non-words (punctuation, spaces) */
  type Token = { text: string; isWord: boolean };
  const tokens: Token[] = [];
  const tokenRegex = /([A-Za-z]+)|([^A-Za-z]+)/g;
  let match: RegExpExecArray | null;
  while ((match = tokenRegex.exec(hint)) !== null) {
    tokens.push(
      match[1]
        ? { text: match[1], isWord: true }
        : { text: match[2], isWord: false }
    );
  }

  /** Create list of possible multi-word phrases from bases */
  const phraseCandidates = searchBases
    .map((base) => base.split(/\s+/).filter(Boolean))
    .filter((words) => words.length > 0);

  const result: ReactNode[] = [];

  /**
   * Helper: Try to match a full multi-word phrase at given index
   */
  function tryMatchPhrase(startIndex: number): { matched: boolean; endIndex: number } {
    for (const phraseWords of phraseCandidates) {
      if (phraseWords.length <= 1) continue;

      let index = startIndex;
      let valid = true;

      for (let w = 0; w < phraseWords.length; w++) {
        const expected = phraseWords[w];
        const current = tokens[index];

        // Word mismatch → fail
        if (!current || !current.isWord || current.text.toLowerCase() !== expected) {
          valid = false;
          break;
        }
        index++;

        // Require whitespace between phrase words
        if (w < phraseWords.length - 1) {
          const separator = tokens[index];
          if (!separator || separator.isWord || !/^\s+$/.test(separator.text)) {
            valid = false;
            break;
          }
          index++;
        }
      }

      if (valid) {
        // Collect original text (with spaces/punctuations preserved)
        const phraseText = tokens.slice(startIndex, index).map((t) => t.text).join("");
        result.push(<b key={`ph-${startIndex}`}>{phraseText}</b>);
        return { matched: true, endIndex: index };
      }
    }
    return { matched: false, endIndex: startIndex };
  }

  /**
   * Main loop: iterate through tokens, decorate matches
   */
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    // 1) Try multi-word phrase match
    const phraseAttempt = tryMatchPhrase(i);
    if (phraseAttempt.matched) {
      i = phraseAttempt.endIndex - 1;
      continue;
    }

    // 2) Single word match against bases
    if (token.isWord && searchBases.some((b) => token.text.toLowerCase().includes(b))) {
      const prev = tokens[i - 1];
      const prev2 = tokens[i - 2];

      // Handle "to <word>" case (merge into one bold span)
      const hasToBefore =
        prev2?.isWord &&
        prev2.text.toLowerCase() === "to" &&
        prev && !prev.isWord;

      if (hasToBefore && result.length >= 2) {
        result.splice(
          result.length - 2,
          2,
          <b key={`to-${i}`}>{prev2.text + prev.text}</b>
        );
      }

      result.push(<b key={`w-${i}`}>{token.text}</b>);

      // Handle "(...)" after match
      const next = tokens[i + 1];
      const next2 = tokens[i + 2];
      const hasParen =
        next && !next.isWord && /^\s*$/.test(next.text) &&
        next2 && !next2.isWord && next2.text.startsWith("(");

      if (hasParen) {
        let j = i + 2;
        let parenText = "";
        while (j < tokens.length) {
          parenText += tokens[j].text;
          const endsHere = tokens[j].text.includes(")");
          j++;
          if (endsHere) {
            // Optional trailing comma after parenthesis
            if (tokens[j] && !tokens[j].isWord && tokens[j].text.startsWith(",")) {
              parenText += tokens[j].text;
              j++;
            }
            break;
          }
        }
        result.push(<b key={`p-${i}`}>{next.text + parenText}</b>);
        i = j - 1;
      }
    } else {
      // 3) Non-match → keep as plain span
      result.push(<span key={`t-${i}`}>{token.text}</span>);
    }
  }

  return <>{result}</>;
}
