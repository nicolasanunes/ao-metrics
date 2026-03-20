import { ref, computed, watch } from 'vue'

// ── Types & constants ──────────────────────────────────────────────────────

export type HerbKey =
  | 'agarico'
  | 'confrei'
  | 'barnada'
  | 'cardo'
  | 'dedaleira'
  | 'verbasco'
  | 'milefolio'

export interface HerbData {
  tier: number
  name: string
  seedName: string
  yieldUnwatered: number // fraction (e.g. 0.60 = 60%)
  yieldWatered: number // fraction (e.g. 1.40 = 140%)
}

export const HERBS: Record<HerbKey, HerbData> = {
  agarico: {
    tier: 2,
    name: 'Agárico-arcano',
    seedName: 'Sementes Agárico-arcano',
    yieldUnwatered: 0.3333,
    yieldWatered: 1.6633,
  },
  confrei: {
    tier: 3,
    name: 'Confrei-claro',
    seedName: 'Sementes de Confrei-claro',
    yieldUnwatered: 0.6,
    yieldWatered: 1.4,
  },
  barnada: {
    tier: 4,
    name: 'Barnada-crespa',
    seedName: 'Sementes de Barnada-crespa',
    yieldUnwatered: 0.7333,
    yieldWatered: 1.2633,
  },
  cardo: {
    tier: 5,
    name: 'Cardo-dragão',
    seedName: 'Sementes de Cardo-dragão',
    yieldUnwatered: 0.8,
    yieldWatered: 1.2,
  },
  dedaleira: {
    tier: 6,
    name: 'Dedaleira-tímida',
    seedName: 'Sementes de Dedaleira-tímida',
    yieldUnwatered: 0.8667,
    yieldWatered: 1.1367,
  },
  verbasco: {
    tier: 7,
    name: 'Verbasco-arredio',
    seedName: 'Sementes de Verbasco-arredio',
    yieldUnwatered: 0.9111,
    yieldWatered: 1.0911,
  },
  milefolio: {
    tier: 8,
    name: 'Milefólio-carniçal',
    seedName: 'Sementes de Milefólio-carniçal',
    yieldUnwatered: 0.9333,
    yieldWatered: 1.0633,
  },
}

/** Cities that grant +10% production bonus for each herb */
export const HERB_CITY_BONUS: Record<HerbKey, string[]> = {
  agarico: ['Thetford'],
  confrei: ['Caerleon'],
  barnada: ['Lymhurst'],
  cardo: ['Caerleon', 'Bridgewatch'],
  dedaleira: ['Martlock'],
  verbasco: ['Caerleon', 'Thetford'],
  milefolio: ['Fort Sterling'],
}

export const HERB_OPTIONS: Array<{ value: HerbKey; label: string; tier: number }> = [
  { value: 'agarico', label: 'Agárico-arcano', tier: 2 },
  { value: 'confrei', label: 'Confrei-claro', tier: 3 },
  { value: 'barnada', label: 'Barnada-crespa', tier: 4 },
  { value: 'cardo', label: 'Cardo-dragão', tier: 5 },
  { value: 'dedaleira', label: 'Dedaleira-tímida', tier: 6 },
  { value: 'verbasco', label: 'Verbasco-arredio', tier: 7 },
  { value: 'milefolio', label: 'Milefólio-carniçal', tier: 8 },
]

// ── Composable ────────────────────────────────────────────────────────────

export function useHerbCalculator() {
  // ── State ──────────────────────────────────────────────────────────────

  const seedsPerPlot = ref(9)
  const herb = ref<HerbKey>('confrei')
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
    const max = newPlots * seedsPerPlot.value
    if (seedsWatered.value > max) seedsWatered.value = max
    if (newPlots < 1) plots.value = 1
  })

  watch(seedsWatered, (v) => {
    const max = plots.value * seedsPerPlot.value
    if (v > max) seedsWatered.value = max
    if (v < 0) seedsWatered.value = 0
  })

  watch(seedsPerPlot, (v) => {
    if (v > 9) seedsPerPlot.value = 9
    if (v < 1) seedsPerPlot.value = 1
    const max = plots.value * seedsPerPlot.value
    if (seedsWatered.value > max) seedsWatered.value = max
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

  const focusEfficiency = computed(() => specFarming.value * 1 + specCultura.value * 2)
  const focusPerSeed = computed(() => Math.round(1000 * Math.pow(0.5, focusEfficiency.value / 100)))
  const focusReductionPct = computed(() => (1 - Math.pow(0.5, focusEfficiency.value / 100)) * 100)

  // ── Herb-level calcs (per plot, per cycle) ─────────────────────────────

  const herbData = computed(() => HERBS[herb.value])
  const seedsWateredPerPlot = computed(() =>
    plots.value > 0 ? seedsWatered.value / plots.value : 0,
  )
  const seedsUnwatered = computed(() => seedsPerPlot.value * plots.value - seedsWatered.value)
  const seedsUnwateredPerPlot = computed(() => seedsPerPlot.value - seedsWateredPerPlot.value)
  const herbYieldAvg = computed(() => (premium.value ? 9 : 4.5))
  const cityMult = computed(() => (cityBonus.value ? 1.1 : 1.0))
  const earthwormDrops = computed(() => (premium.value ? 2 : 1))
  const famePerHarvest = computed(() => (premium.value ? 150 : 100))

  const seedsBack = computed(
    () =>
      seedsWateredPerPlot.value * herbData.value.yieldWatered +
      seedsUnwateredPerPlot.value * herbData.value.yieldUnwatered,
  )

  const herbsHarvested = computed(() => seedsPerPlot.value * herbYieldAvg.value * cityMult.value)
  const earthworms = computed(() => seedsPerPlot.value * 0.1 * earthwormDrops.value)
  const focusThisCycle = computed(() => seedsWateredPerPlot.value * focusPerSeed.value)
  const totalFame = computed(() => seedsPerPlot.value * famePerHarvest.value)

  // ── Per-plot financials ────────────────────────────────────────────────

  const revenue = computed(
    () =>
      herbsHarvested.value * priceCrop.value +
      seedsBack.value * priceSeed.value +
      earthworms.value * priceEarthworm.value,
  )

  const cost = computed(() => seedsPerPlot.value * priceSeed.value)
  const netProfit = computed(() => revenue.value - cost.value)

  // ── Scaled by number of plots ──────────────────────────────────────────

  const seedsBackTotal = computed(() => seedsBack.value * plots.value)
  const herbsHarvestedTotal = computed(() => herbsHarvested.value * plots.value)
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

  const isSeedSustainable = computed(() => seedsBack.value >= seedsPerPlot.value)

  const bonusCities = computed(() => HERB_CITY_BONUS[herb.value])

  return {
    // state
    herb,
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
    herbData,
    seedsUnwatered,
    herbYieldAvg,
    seedsBack,
    herbsHarvested,
    earthworms,
    totalFame,
    revenue,
    cost,
    netProfit,
    // totals
    seedsBackTotal,
    herbsHarvestedTotal,
    earthwormsTotal,
    revenueTotal,
    costTotal,
    netProfitTotal,
    // derived
    profitMarginPct,
    isSeedSustainable,
    bonusCities,
  }
}
