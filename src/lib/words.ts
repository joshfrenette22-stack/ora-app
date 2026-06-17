// Word-level helpers shared by the narration engine and <SpokenText>, so the
// spoken word index always lines up with the rendered words. A "word" is any
// maximal run of non-whitespace characters — the same rule on both sides.

/** Character offset of the start of each word in `text`. */
export function wordStarts(text: string): number[] {
  const starts: number[] = [];
  const re = /\S+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) starts.push(m.index);
  return starts;
}

/** Number of words in `text`. */
export function countWords(text: string): number {
  const m = text.match(/\S+/g);
  return m ? m.length : 0;
}

/** Index of the word containing/just before `charIndex` (−1 before the first). */
export function wordIndexAtChar(starts: number[], charIndex: number): number {
  let lo = 0;
  let hi = starts.length - 1;
  let ans = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (starts[mid] <= charIndex) { ans = mid; lo = mid + 1; }
    else hi = mid - 1;
  }
  return ans;
}
