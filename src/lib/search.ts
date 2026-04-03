/**
 * Simple fuzzy search utility for Martabak Catalog
 */

export function getSearchScore(text: string, query: string): number {
  const t = text.toLowerCase();
  const q = query.toLowerCase().trim();

  if (!q) return 1;
  if (t === q) return 100;
  if (t.startsWith(q)) return 80;
  if (t.includes(q)) return 50;

  // Simple fuzzy matching (character overlap)
  let matches = 0;
  const qChars = q.split('');
  let lastIdx = -1;

  for (const char of qChars) {
    const idx = t.indexOf(char, lastIdx + 1);
    if (idx !== -1) {
      matches++;
      lastIdx = idx;
    }
  }

  const score = (matches / q.length) * 30;
  
  // Bonus for consecutive matches
  if (score > 0) {
    let consecutive = 0;
    for (let i = 0; i < q.length - 1; i++) {
        if (t.includes(q.substring(i, i + 2))) consecutive++;
    }
    return score + (consecutive * 5);
  }

  return score;
}

export function fuzzyFilter<T>(
  items: T[], 
  query: string, 
  accessor: (item: T) => string,
  minScore = 15
): T[] {
  if (!query) return items;
  
  return items
    .map(item => ({ item, score: getSearchScore(accessor(item), query) }))
    .filter(res => res.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .map(res => res.item);
}
