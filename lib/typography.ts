export const typography = {
  h1: "text-2xl font-semibold tracking-tight md:text-3xl",
  h2: "text-lg font-semibold tracking-tight",
  h3: "text-base font-semibold",
  body: "text-sm leading-6 text-foreground",
  muted: "text-xs text-muted-foreground",
  label: "text-xs font-medium uppercase tracking-wide text-muted-foreground",
} as const;

export type TypographyToken = keyof typeof typography;
