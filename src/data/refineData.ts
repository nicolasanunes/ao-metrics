import { Location } from '@/types/items'

// ── Types ──────────────────────────────────────────────────────────────────

export type MaterialType = 'wood' | 'hide' | 'ore' | 'stone' | 'fiber'

// ── Material metadata ──────────────────────────────────────────────────────

export const MATERIALS = {
  wood: { label: 'Madeira' },
  hide: { label: 'Pelego' },
  ore: { label: 'Minério' },
  stone: { label: 'Pedra' },
  fiber: { label: 'Fibra' },
} satisfies Record<MaterialType, { label: string }>

export const MATERIAL_OPTIONS: { value: MaterialType; label: string; recipe: string }[] = [
  { value: 'wood', label: 'Madeira', recipe: 'Tronco → Tábua' },
  { value: 'hide', label: 'Pelego', recipe: 'Pelego → Couro' },
  { value: 'ore', label: 'Minério', recipe: 'Minério → Barra' },
  { value: 'stone', label: 'Pedra', recipe: 'Pedra → Bloco' },
  { value: 'fiber', label: 'Fibra', recipe: 'Fibra → Tecido' },
]

export const TIER_OPTIONS = [2, 3, 4, 5, 6, 7, 8]

export const ALL_CITIES = Object.values(Location)

// ── Resource names ─────────────────────────────────────────────────────────

export const RAW_NAMES: Record<MaterialType, Record<number, string>> = {
  wood: {
    2: 'Troncos de Bétula',
    3: 'Troncos de Castanheira',
    4: 'Troncos de Pinho',
    5: 'Troncos de Cedro',
    6: 'Troncos de Carvalho-sangue',
    7: 'Troncos de Freixo',
    8: 'Troncos de Pau-branco',
  },
  hide: {
    2: 'Pelego Rústico',
    3: 'Pelego Fino',
    4: 'Pelego Médio',
    5: 'Pelego Pesado',
    6: 'Pelego Robusto',
    7: 'Pelego Grosso',
    8: 'Pelego Resistente',
  },
  ore: {
    2: 'Minério de Cobre',
    3: 'Minério de Estanho',
    4: 'Minério de Ferro',
    5: 'Minério de Titânio',
    6: 'Minério de Runita',
    7: 'Minério de Meteorito',
    8: 'Minério de Adamântio',
  },
  stone: {
    2: 'Calcário',
    3: 'Arenito',
    4: 'Travertino',
    5: 'Granito',
    6: 'Ardósia',
    7: 'Basalto',
    8: 'Mármore',
  },
  fiber: {
    2: 'Algodão',
    3: 'Linho',
    4: 'Cânhamo',
    5: 'Verbena',
    6: 'Algodão-vermelho',
    7: 'Linhossol',
    8: 'Cânhamo-fantasma',
  },
}

export const REFINED_NAMES: Record<MaterialType, Record<number, string>> = {
  wood: {
    2: 'Tábuas de Bétula',
    3: 'Tábuas de Castanheira',
    4: 'Tábuas de Pinho',
    5: 'Tábuas de Cedro',
    6: 'Tábuas de Carvalho-sangue',
    7: 'Tábuas de Freixo',
    8: 'Tábuas de Pau-branco',
  },
  hide: {
    2: 'Couro Esticado',
    3: 'Couro Grosso',
    4: 'Couro Trabalhado',
    5: 'Couro Curtido',
    6: 'Couro Endurecido',
    7: 'Couro Reforçado',
    8: 'Couro Fortificado',
  },
  ore: {
    2: 'Barra de Cobre',
    3: 'Barra de Bronze',
    4: 'Barra de Aço',
    5: 'Barra de Aço Titânio',
    6: 'Barra de Aço Runita',
    7: 'Barra de Aço Meteorito',
    8: 'Barra de Aço Adamântio',
  },
  stone: {
    2: 'Bloco de Calcário',
    3: 'Bloco de Arenito',
    4: 'Bloco de Travertino',
    5: 'Bloco de Granito',
    6: 'Bloco de Ardósia',
    7: 'Bloco de Basalto',
    8: 'Bloco de Mármore',
  },
  fiber: {
    2: 'Tecido Simples',
    3: 'Tecido Limpo',
    4: 'Tecido Fino',
    5: 'Tecido Ornado',
    6: 'Tecido Rico',
    7: 'Tecido Opulento',
    8: 'Tecido Barroco',
  },
}

export const ENCHANTMENT_SUFFIX: Record<number, string> = {
  0: '',
  1: ' Incomum',
  2: ' Raro',
  3: ' Excepcional',
  4: ' Lendário',
}

// ── Game mechanics tables ──────────────────────────────────────────────────

// Bonus refining city per material type
export const CITY_BONUS: Record<MaterialType, Location> = {
  wood: Location.FortSterling,
  hide: Location.Martlock,
  ore: Location.Thetford,
  stone: Location.Bridgewatch,
  fiber: Location.Lymhurst,
}

// Number of raw resources required per refine action, by tier
export const RAW_QTY: Record<number, number> = {
  2: 1,
  3: 2,
  4: 2,
  5: 3,
  6: 4,
  7: 5,
  8: 5,
}

// Item Value (IV) — used for focus cost and nutrition calculation.
// Stone output is always base (.0); enchantment only applies to non-stone output.
export const ITEM_VALUE_TABLE: Record<number, Record<number, number>> = {
  2: { 0: 4 },
  3: { 0: 8 },
  4: { 0: 16, 1: 32, 2: 64, 3: 128, 4: 256 },
  5: { 0: 32, 1: 64, 2: 128, 3: 256, 4: 512 },
  6: { 0: 64, 1: 128, 2: 256, 3: 512, 4: 1024 },
  7: { 0: 128, 1: 256, 2: 512, 3: 1024, 4: 2048 },
  8: { 0: 256, 1: 512, 2: 1024, 3: 2048, 4: 4096 },
}

// Fixed return rates (%) per scenario.
// key: `${bonusCity ? 'bonus' : 'other'}_${eventBonus}_${focus ? 'focus' : 'nofocus'}`
export const RRR_TABLE: Record<string, number> = {
  other_0_nofocus: 0.152,
  other_10_nofocus: 0.218,
  other_20_nofocus: 0.269,
  other_0_focus: 0.435,
  other_10_focus: 0.465,
  other_20_focus: 0.495,
  bonus_0_nofocus: 0.367,
  bonus_10_nofocus: 0.404,
  bonus_20_nofocus: 0.438,
  bonus_0_focus: 0.539,
  bonus_10_focus: 0.559,
  bonus_20_focus: 0.578,
}

// Base focus cost lookup tables (at Spec 0), by tier and enchantment
export const BASE_FOCUS_NORMAL: Record<number, Record<number, number>> = {
  2: { 0: 18 },
  3: { 0: 31 },
  4: { 0: 54, 1: 94, 2: 164, 3: 287, 4: 503 },
  5: { 0: 94, 1: 164, 2: 287, 3: 503, 4: 880 },
  6: { 0: 164, 1: 287, 2: 503, 3: 880, 4: 1539 },
  7: { 0: 287, 1: 503, 2: 880, 3: 1539, 4: 2694 },
  8: { 0: 503, 1: 880, 2: 1539, 3: 2694, 4: 4714 },
}

export const BASE_FOCUS_STONE: Record<number, Record<number, number>> = {
  2: { 0: 18 },
  3: { 0: 31 },
  4: { 0: 54, 1: 108, 2: 216, 3: 432 },
  5: { 0: 94, 1: 188, 2: 376, 3: 752 },
  6: { 0: 164, 1: 328, 2: 656, 3: 1312 },
  7: { 0: 287, 1: 574, 2: 1148, 3: 2296 },
  8: { 0: 503, 1: 1006, 2: 2012, 3: 4024 },
}

// ── UI helpers ─────────────────────────────────────────────────────────────

const TIER_BG_MAP: Record<number, string> = {
  1: 'bg-[#707070]',
  2: 'bg-[#7A6540]',
  3: 'bg-[#567043]',
  4: 'bg-[#557E98]',
  5: 'bg-[#934038]',
  6: 'bg-[#D8894C]',
  7: 'bg-[#E8C95F]',
  8: 'bg-[#E8E8E8]',
}

const SUBTIER_HEX: Record<number, string> = {
  1: '#3CB371',
  2: '#4169E1',
  3: '#9400D3',
  4: '#FFD700',
}

// Used for enchantment selector button active states
export const SUBTIER_COLORS: Record<number, string> = {
  0: 'bg-gray-600 text-gray-100',
  1: 'bg-green-700 text-green-100',
  2: 'bg-blue-700 text-blue-100',
  3: 'bg-purple-700 text-purple-100',
  4: 'bg-yellow-600 text-yellow-100',
}

function tierLabel(t: number, s: number = 0): string {
  return s > 0 ? `T${t}.${s}` : `T${t}`
}

export function tierBadge(
  t: number,
  s: number = 0,
): {
  label: string
  bg: string
  tierColor: string
  tier: number
  subtier: number
  subtierColor: string | null
} {
  const bg = TIER_BG_MAP[t] ?? 'bg-[#707070]'
  const tierColor = t === 7 || t === 8 ? '#111827' : '#ffffff'
  const subtierColor = s > 0 ? (SUBTIER_HEX[s] ?? null) : null
  return { label: tierLabel(t, s), bg, tierColor, tier: t, subtier: s, subtierColor }
}

export function fmt(n: number): string {
  return n.toLocaleString('pt-BR', { maximumFractionDigits: 0 })
}

export function profitColorClass(n: number | null): string {
  if (n === null) return 'text-gray-400'
  return n >= 0 ? 'text-green-400' : 'text-red-400'
}

export function marginColorClass(pct: number | null): string {
  if (pct === null) return 'text-gray-400'
  if (pct < 0) return 'text-red-400'
  if (pct < 10) return 'text-yellow-400'
  if (pct < 20) return 'text-green-400'
  return 'text-blue-400'
}

export function marginBgClass(pct: number | null): string {
  if (pct === null) return 'bg-gray-800'
  if (pct < 0) return 'bg-red-900/30 border border-red-700/40'
  if (pct < 10) return 'bg-yellow-900/30 border border-yellow-700/40'
  if (pct < 20) return 'bg-green-900/30 border border-green-700/40'
  return 'bg-blue-900/30 border border-blue-700/40'
}
