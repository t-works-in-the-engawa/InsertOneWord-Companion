export function getNextWord(words, status) {
  const unknown = words.filter(w => status[w.id] !== "known");
  const pool = unknown.length > 0 ? unknown : words;
  return pool[Math.floor(Math.random() * pool.length)];
}
