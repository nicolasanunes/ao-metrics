/** Background hex color for each item tier (T1–T8). */
export const TIER_BG: Record<number, string> = {
  1: '#707070',
  2: '#7A6540',
  3: '#567043',
  4: '#557E98',
  5: '#934038',
  6: '#D8894C',
  7: '#E8C95F',
  8: '#E8E8E8',
}

/** Foreground (text) hex color for each tier badge — dark for light backgrounds, white otherwise. */
export const TIER_TEXT: Record<number, string> = {
  1: '#ffffff',
  2: '#ffffff',
  3: '#ffffff',
  4: '#ffffff',
  5: '#ffffff',
  6: '#ffffff',
  7: '#111827',
  8: '#111827',
}

/**
 * Returns the Tailwind bg utility class and text color for a given tier,
 * suitable for use in a badge/chip component.
 */
export function tierBadgeClasses(tier: number): { bg: string; tierColor: string } {
  const bg = `bg-[${TIER_BG[tier] ?? TIER_BG[1]}]`
  const tierColor = TIER_TEXT[tier] ?? '#ffffff'
  return { bg, tierColor }
}
