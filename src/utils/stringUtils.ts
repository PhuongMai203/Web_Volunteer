
export function removeDiacritics(str: string): string {
  const normalized = str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
  return normalized;
}

export function calculateSimilarity(str1: string, str2: string): number {
  const set1 = new Set(removeDiacritics(str1.toLowerCase()).split(" ").filter(word => word.length > 0));
  const set2 = new Set(removeDiacritics(str2.toLowerCase()).split(" ").filter(word => word.length > 0));

  const intersection = new Set([...set1].filter((x) => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  if (union.size === 0) return 0;
  return intersection.size / union.size;
}