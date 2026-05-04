const FALLBACK_PREFIX = "workflow";
const COMBINING_DIACRITICS = /[̀-ͯ]/g;

export function slugify(input: string): string {
  const normalized = input
    .normalize("NFD")
    .replace(COMBINING_DIACRITICS, "")
    .toLowerCase()
    .trim();

  const slug = normalized
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");

  if (slug.length >= 3) return slug;
  return `${FALLBACK_PREFIX}-${Date.now().toString(36)}`;
}
