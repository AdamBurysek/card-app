import type { ReactNode } from 'react'

export const decorateHint = (frontWord: string, hint: string): ReactNode => {
  if (!hint || !frontWord) return hint
  const baseOriginal = frontWord.trim().toLowerCase()
  const baseStripped = baseOriginal.replace(/^(the|to)\s+/i, '')
  const bases = Array.from(new Set([baseOriginal, baseStripped].filter(Boolean)))
  const phraseWordsList = bases
    .map((b) => b.split(/\s+/).filter(Boolean))
    .filter((arr) => arr.length > 0)
  const tokens: { text: string; isWord: boolean }[] = []
  const re = /([A-Za-z]+)|([^A-Za-z]+)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(hint)) !== null) {
    const word = m[1]
    const non = m[2]
    if (word) tokens.push({ text: word, isWord: true })
    else tokens.push({ text: non, isWord: false })
  }

  const result: ReactNode[] = []
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    const prev = tokens[i - 1]
    const prev2 = tokens[i - 2]

    // 1) Try to match multi-word phrase exactly (e.g., "she savored")
    let consumedByPhrase = false
    for (const phraseWords of phraseWordsList) {
      if (phraseWords.length <= 1) continue
      let pos = i
      let ok = true
      for (let w = 0; w < phraseWords.length; w++) {
        const expected = phraseWords[w]
        const currentTok = tokens[pos]
        if (!currentTok || !currentTok.isWord || currentTok.text.toLowerCase() !== expected) {
          ok = false
          break
        }
        pos++
        if (w < phraseWords.length - 1) {
          // Require whitespace between phrase words
          const sep = tokens[pos]
          if (!sep || sep.isWord || !/^\s+$/.test(sep.text)) {
            ok = false
            break
          }
          pos++
        }
      }
      if (ok) {
        // Join original text from i..pos-1 (includes spaces inside)
        let joined = ''
        for (let j = i; j < pos; j++) joined += tokens[j].text
        result.push(<b key={`ph-${i}`}>{joined}</b>)
        i = pos - 1
        consumedByPhrase = true
        break
      }
    }
    if (consumedByPhrase) continue

    if (token.isWord && bases.some((b) => token.text.toLowerCase().includes(b))) {
      const hasToBefore = !!(prev2 && prev && prev2.isWord && prev2.text.toLowerCase() === 'to' && !prev.isWord)
      if (hasToBefore) {
        if (result.length >= 2) {
          result.splice(result.length - 2, 2, <b key={`to-${i}`}>{prev2.text}{prev.text}</b>)
        }
      }

      result.push(<b key={`w-${i}`}>{token.text}</b>)

      const next = tokens[i + 1]
      const next2 = tokens[i + 2]
      const hasParen = !!(
        next && !next.isWord && next.text.match(/^\s*$/) &&
        next2 && !next2.isWord && next2.text.startsWith('(')
      )
      if (hasParen) {
        let j = i + 2
        let parenText = ''
        while (j < tokens.length) {
          parenText += tokens[j].text
          const endsHere = tokens[j].text.includes(')')
          j++
          if (endsHere) {
            if (j < tokens.length && !tokens[j].isWord && tokens[j].text.startsWith(',')) {
              parenText += tokens[j].text
              j++
            }
            break
          }
        }
        result.push(<b key={`p-${i}`}>{next.text}{parenText}</b>)
        i = j - 1
      }
    } else {
      result.push(<span key={`t-${i}`}>{token.text}</span>)
    }
  }

  return <>{result}</>
}


