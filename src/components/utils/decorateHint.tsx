import React from "react";
import type { ReactNode } from "react";

/**
 * Simple matcher that checks whether token contains the base word.
 * Avoids matching very short bases (<3 letters) to reduce false positives.
 */
const matchesWordVariant = (tokenWord: string, baseWord: string): boolean => {
  tokenWord = tokenWord.toLowerCase();
  baseWord = baseWord.toLowerCase();

  if (tokenWord === baseWord) return true;
  if (baseWord.length < 3) return false;

  return tokenWord.includes(baseWord);
};

/**
 * Highlight occurrences of a given "frontWord" inside a hint string.
 * - If frontWord has 2 words, treat the first as an optional prefix
 * - Preserves punctuation and spaces
 * - Wraps matches with <b> … </b>
 */
export const decorateHint = (frontWord: string, hint: string): ReactNode => {
  if (!hint || !frontWord) return hint;

  const front = frontWord.trim().toLowerCase();
  const frontParts = front.split(/\s+/);

  let searchFrontWords: string[];
  if (frontParts.length > 1) {
    // allow both full and "without prefix" version
    searchFrontWords = Array.from(
      new Set([front, frontParts.slice(1).join(" ")])
    );
  } else {
    searchFrontWords = [front];
  }

  /** Tokenize hint input into words + separators */
  const tokens = hint.split(/([A-Za-z]+|\s+|[^A-Za-z\s]+)/).filter(Boolean);

  const result: ReactNode[] = [];

  /** Main loop: walk through tokens and decorate matches */
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (
      token &&
      searchFrontWords.some((word) => matchesWordVariant(token, word))
    ) {
      const prevToken = tokens[i - 2]; // [i - 1] is usually a space

      // Merge prefix + word into one bold (e.g., "to commence" or "she savored")
      const hasPrefixBefore =
        prevToken && frontParts.length > 1 && prevToken.toLowerCase() === frontParts[0];

      if (hasPrefixBefore) {
        result.splice(
          result.length - 2,
          2,
          <b key={`two-words-${i}`}>{prevToken + " " + token}</b>
        );
        continue;
      }

      result.push(<b key={`word-${i}`}>{token}</b>);
    } else {
      result.push(<React.Fragment key={`token-${i}`}>{token}</React.Fragment>);
    }
  }

  return <>{result}</>;
};
