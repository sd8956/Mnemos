import type { Category, Note } from "../types";

export function normalizeQuery(q: string): string {
  return q.trim().toLowerCase();
}

export function matchesQuery(text: string, query: string): boolean {
  if (!query) return true;
  return text.toLowerCase().includes(query);
}

export function noteMatches(note: Note, query: string): boolean {
  if (!query) return true;
  const haystacks = [
    note.title,
    note.content,
    note.tags.join(" "),
  ];
  return haystacks.some((h) => matchesQuery(h, query));
}

export function categoryMatches(category: Category, query: string): boolean {
  if (!query) return true;
  if (matchesQuery(category.name, query)) return true;
  return category.notes.some((n) => noteMatches(n, query));
}
