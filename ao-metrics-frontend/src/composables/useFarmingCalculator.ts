import { ref, computed, watch } from 'vue'

// ── Types & constants ──────────────────────────────────────────────────────

export type CropKey =
  | 'carrot'
  | 'bean'
  | 'wheat'
  | 'turnip'
  | 'cabbage'
  | 'potato'
  | 'corn'
  | 'pumpkin'

export interface CropData {
  tier: number
  name: string
  seedName: string
  yieldUnwatered: number // fraction (e.g. 0.60 = 60%)
  yieldWatered: number // fraction (e.g. 1.40 = 140%)
}

export const CROPS: Record<CropKey, CropData> = {
  carrot: {
    tier: 1,
    name: 'Cenoura',
    seedName: 'Sementes de Cenoura',
    yieldUnwatered: 0.0,
    yieldWatered: 2.0,
  },
  bean: {
    tier: 2,
    name: 'Feijão',
    seedName: 'Sementes de Feijão',
    yieldUnwatered: 0.3333,
    yieldWatered: 1.6633,
  },
  wheat: {
    tier: 3,
    name: 'Feixe de Trigo',
    seedName: 'Sementes de Trigo',
    yieldUnwatered: 0.6,
    yieldWatered: 1.4,
  },
  turnip: {
    tier: 4,
    name: 'Nabo',
    seedName: 'Sementes de Nabo',
    yieldUnwatered: 0.7333,
    yieldWatered: 1.2633,
  },
  cabbage: {
    tier: 5,
    name: 'Repolho',
    seedName: 'Sementes de Repolho',
    yieldUnwatered: 0.8,
    yieldWatered: 1.2,
  },
  potato: {
    tier: 6,
    name: 'Batata',
    seedName: 'Sementes de Batata',
    yieldUnwatered: 0.8667,
    yieldWatered: 1.1367,
  },
  corn: {
    tier: 7,
    name: 'Fardo de Milho',
    seedName: 'Sementes de Milho',
    yieldUnwatered: 0.9111,
    yieldWatered: 1.0911,
  },
  pumpkin: {
    tier: 8,
    name: 'Abóbora',
    seedName: 'Sementes de Abóbora',
    yieldUnwatered: 0.9333,
    yieldWatered: 1.0633,
  },
}

/** Cities that grant +10% production bonus for each crop */
export const CROP_CITY_BONUS: Record<CropKey, string[]> = {
  carrot: ['Lymhurst', 'Brecilien'],
  bean: ['Bridgewatch', 'Brecilien'],
  wheat: ['Martlock', 'Brecilien'],
  turnip: ['Fort Sterling', 'Brecilien'],
  cabbage: ['Thetford', 'Brecilien'],
  potato: ['Martlock', 'Brecilien'],
  corn: ['Bridgewatch', 'Brecilien'],
  pumpkin: ['Lymhurst', 'Brecilien'],
}

export const CROP_OPTIONS: Array<{ value: CropKey; label: string; tier: number }> = [
  { value: 'carrot', label: 'Cenoura', tier: 1 },
  { value: 'bean', label: 'Feijão', tier: 2 },
  { value: 'wheat', label: 'Feixe de Trigo', tier: 3 },
  { value: 'turnip', label: 'Nabo', tier: 4 },
  { value: 'cabbage', label: 'Repolho', tier: 5 },
  { value: 'potato', label: 'Batata', tier: 6 },
  { value: 'corn', label: 'Fardo de Milho', tier: 7 },
  { value: 'pumpkin', label: 'Abóbora', tier: 8 },
]

export const TIER_BADGE_CLASSES: Record<number, string> = {
  1: 'bg-[#707070] text-white',
  2: 'bg-[#7A6540] text-white',
  3: 'bg-[#567043] text-white',
  4: 'bg-[#557E98] text-white',
  5: 'bg-[#934038] text-white',
  6: 'bg-[#D8894C] text-white',
  7: 'bg-[#E8C95F] text-gray-900',
  8: 'bg-[#E8E8E8] text-gray-900',
}

export function tierBg(tier: number): string {
  const entry = TIER_BADGE_CLASSES[tier]
  return entry ? entry.split(' ')[0]! : 'bg-[#707070]'
}

export function tierTextColor(tier: number): string {
  return tier === 7 || tier === 8 ? '#111827' : '#ffffff'
}

export function fmt(n: number): string {
  return Math.round(n).toLocaleString('pt-BR')
}

export function profitColorClass(n: number): string {
  if (n > 0) return 'text-green-400'
  if (n < 0) return 'text-red-400'
  return 'text-gray-400'
}

export function marginColorClass(pct: number | null): string {
  if (pct === null) return 'text-gray-500'
  if (pct < 0) return 'text-red-400'
  if (pct < 10) return 'text-yellow-400'
  if (pct < 20) return 'text-green-300'
  return 'text-green-400'
}

export function marginBgClass(pct: number | null): string {
  if (pct === null) return 'bg-gray-800'
  if (pct < 0) return 'bg-red-900/20 border border-red-700/40'
  if (pct < 10) return 'bg-yellow-900/20 border border-yellow-700/40'
  return 'bg-green-900/20 border border-green-700/40'
}

// ── Composable ────────────────────────────────────────────────────────────

export function useFarmingCalculator() {
  // ── State ──────────────────────────────────────────────────────────────

  const seedsPerPlot = 9
  const crop = ref<CropKey>('wheat')
  const specFarming = ref(100) // 0–100
  const specCultura = ref(0) // 0–100
  const seedsWatered = ref(0) // total across all plots
  const premium = ref(false)
  const cityBonus = ref(false)
  const plots = ref(1)

  const priceCrop = ref(0)
  const priceSeed = ref(0)
  const priceEarthworm = ref(0)

  // Clamp seedsWatered when plots changes
  watch(plots, (newPlots) => {
    const max = newPlots * seedsPerPlot
    if (seedsWatered.value > max) seedsWatered.value = max
    if (newPlots < 1) plots.value = 1
  })

  watch(seedsWatered, (v) => {
    const max = plots.value * seedsPerPlot
    if (v > max) seedsWatered.value = max
    if (v < 0) seedsWatered.value = 0
  })

  watch(specFarming, (v) => {
    if (v > 100) specFarming.value = 100
    if (v < 0) specFarming.value = 0
  })

  watch(specCultura, (v) => {
    if (v > 100) specCultura.value = 100
    if (v < 0) specCultura.value = 0
  })

  // ── Focus ──────────────────────────────────────────────────────────────

  /**
   * focusEfficiency = specFarming × 1 + specCultura × 2
   * FocusCost = 1000 × 0.5 ^ (efficiency / 100)
   */
  const focusEfficiency = computed(() => specFarming.value * 1 + specCultura.value * 2)
  const focusPerSeed = computed(() => Math.round(1000 * Math.pow(0.5, focusEfficiency.value / 100)))
  const focusReductionPct = computed(() => (1 - Math.pow(0.5, focusEfficiency.value / 100)) * 100)

  // ── Crop-level calcs (per plot, per cycle) ─────────────────────────────

  const cropData = computed(() => CROPS[crop.value])
  /** Seeds watered per plot (derived from total input) */
  const seedsWateredPerPlot = computed(() =>
    plots.value > 0 ? seedsWatered.value / plots.value : 0,
  )
  /** Total unwatered seeds across all plots */
  const seedsUnwatered = computed(() => seedsPerPlot * plots.value - seedsWatered.value)
  const seedsUnwateredPerPlot = computed(() => seedsPerPlot - seedsWateredPerPlot.value)
  const cropYieldAvg = computed(() => (premium.value ? 9 : 4.5))
  const cityMult = computed(() => (cityBonus.value ? 1.1 : 1.0))
  const earthwormDrops = computed(() => (premium.value ? 2 : 1))
  const famePerHarvest = computed(() => (premium.value ? 150 : 100))

  /** Expected seed return per plot (value, not integer) */
  const seedsBack = computed(
    () =>
      seedsWateredPerPlot.value * cropData.value.yieldWatered +
      seedsUnwateredPerPlot.value * cropData.value.yieldUnwatered,
  )

  const cropsHarvested = computed(() => seedsPerPlot * cropYieldAvg.value * cityMult.value)

  const earthworms = computed(() => seedsPerPlot * 0.1 * earthwormDrops.value)

  const focusThisCycle = computed(() => seedsWateredPerPlot.value * focusPerSeed.value)

  const totalFame = computed(() => seedsPerPlot * famePerHarvest.value)

  // ── Per-plot financials ────────────────────────────────────────────────

  const revenue = computed(
    () =>
      cropsHarvested.value * priceCrop.value +
      seedsBack.value * priceSeed.value +
      earthworms.value * priceEarthworm.value,
  )

  const cost = computed(() => seedsPerPlot * priceSeed.value)
  const netProfit = computed(() => revenue.value - cost.value)

  // ── Scaled by number of plots ──────────────────────────────────────────

  const seedsBackTotal = computed(() => seedsBack.value * plots.value)
  const cropsHarvestedTotal = computed(() => cropsHarvested.value * plots.value)
  const earthwormsTotal = computed(() => earthworms.value * plots.value)
  const focusTotal = computed(() => focusThisCycle.value * plots.value)
  const revenueTotal = computed(() => revenue.value * plots.value)
  const costTotal = computed(() => cost.value * plots.value)
  const netProfitTotal = computed(() => netProfit.value * plots.value)

  // ── Profit margin ──────────────────────────────────────────────────────

  const profitMarginPct = computed<number | null>(() => {
    if (revenue.value === 0) return null
    return (netProfit.value / revenue.value) * 100
  })

  // ── Seed sustainability indicator ──────────────────────────────────────
  /**
   * Returns whether the player gets at least as many seeds back as planted.
   */
  const isSeedSustainable = computed(() => seedsBack.value >= seedsPerPlot)

  /** Cities that grant +10% bonus for the currently selected crop */
  const bonusCities = computed(() => CROP_CITY_BONUS[crop.value])

  // ── Restock cost (when not sustainable) ───────────────────────────────

  /** Seeds missing per plot per cycle (integer — floor of seedsBack) */
  const seedsDeficit = computed(() => Math.max(0, seedsPerPlot - Math.round(seedsBack.value)))

  /** Seeds missing across all plots (integer — floor of seedsBackTotal) */
  const seedsDeficitTotal = computed(() =>
    Math.max(0, seedsPerPlot * plots.value - Math.round(seedsBackTotal.value)),
  )

  /** Cost to buy deficit seeds per plot */
  const restockCost = computed(() => seedsDeficit.value * priceSeed.value)

  /** Total restock cost across all plots */
  const restockCostTotal = computed(() => seedsDeficitTotal.value * priceSeed.value)

  /** Net profit per plot after buying deficit seeds */
  const netProfitAfterRestock = computed(() => netProfit.value - restockCost.value)

  /** Net profit total after buying deficit seeds */
  const netProfitAfterRestockTotal = computed(() => netProfitTotal.value - restockCostTotal.value)

  return {
    // state
    crop,
    seedsPerPlot,
    specFarming,
    specCultura,
    seedsWatered,
    premium,
    cityBonus,
    plots,
    priceCrop,
    priceSeed,
    priceEarthworm,
    // focus
    focusEfficiency,
    focusPerSeed,
    focusReductionPct,
    focusThisCycle,
    focusTotal,
    // per plot
    cropData,
    seedsUnwatered,
    cropYieldAvg,
    seedsBack,
    cropsHarvested,
    earthworms,
    totalFame,
    revenue,
    cost,
    netProfit,
    // totals
    seedsBackTotal,
    cropsHarvestedTotal,
    earthwormsTotal,
    revenueTotal,
    costTotal,
    netProfitTotal,
    // derived
    profitMarginPct,
    isSeedSustainable,
    bonusCities,
    // restock
    seedsDeficitTotal,
    restockCostTotal,
    netProfitAfterRestockTotal,
  }
}
