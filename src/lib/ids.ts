export function generateId(prefix: string): string {
  const uuid = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  return `${prefix}_${uuid}`;
}
