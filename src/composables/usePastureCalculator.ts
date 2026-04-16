import { ref, computed, watch } from 'vue'

// ── Types & constants ──────────────────────────────────────────────────────

export type PastureMode = 'production' | 'riding' | 'secondary'

// ── Production animals ─────────────────────────────────────────────────────

export type ProductionKey =
  | 'pinto'
  | 'cabrito'
  | 'gansinho'
  | 'cordeiro'
  | 'leitao'
  | 'novilhoCorte'

export interface ProductionData {
  tier: number
  youngName: string
  adultName: string
  specName: string
  yieldUnfocused: number
  yieldFocused: number
  favFood: string
  hasSecondary: boolean
  secondaryName?: string
  secondaryYieldAvg: number // average of 7–11 = 9
}

export const PRODUCTION_ANIMALS: Record<ProductionKey, ProductionData> = {
  pinto: {
    tier: 3,
    youngName: 'Pintos',
    adultName: 'Galinhas',
    specName: 'Criador de Galinhas',
    yieldUnfocused: 0.6,
    yieldFocused: 1.4,
    favFood: 'Feixe de Trigo',
    hasSecondary: true,
    secondaryName: 'Ovos de Galinha',
    secondaryYieldAvg: 9,
  },
  cabrito: {
    tier: 4,
    youngName: 'Cabrito',
    adultName: 'Cabras',
    specName: 'Criador de Cabras',
    yieldUnfocused: 0.7333,
    yieldFocused: 1.2633,
    favFood: 'Nabos',
    hasSecondary: true,
    secondaryName: 'Leite de Cabra',
    secondaryYieldAvg: 9,
  },
  gansinho: {
    tier: 5,
    youngName: 'Gansinho',
    adultName: 'Gansos',
    specName: 'Criador de Gansos',
    yieldUnfocused: 0.8,
    yieldFocused: 1.2,
    favFood: 'Repolho',
    hasSecondary: true,
    secondaryName: 'Ovos de Ganso',
    secondaryYieldAvg: 9,
  },
  cordeiro: {
    tier: 6,
    youngName: 'Cordeiro',
    adultName: 'Ovelhas',
    specName: 'Criador de Ovelhas',
    yieldUnfocused: 0.8667,
    yieldFocused: 1.1367,
    favFood: 'Batatas',
    hasSecondary: true,
    secondaryName: 'Leite de Ovelha',
    secondaryYieldAvg: 9,
  },
  leitao: {
    tier: 7,
    youngName: 'Leitão',
    adultName: 'Porcos',
    specName: 'Criador de Porcos',
    yieldUnfocused: 0.9111,
    yieldFocused: 1.0911,
    favFood: 'Fardo de Milho',
    hasSecondary: false,
    secondaryYieldAvg: 0,
  },
  novilhoCorte: {
    tier: 8,
    youngName: 'Novilho',
    adultName: 'Vacas',
    specName: 'Criador de Vacas',
    yieldUnfocused: 0.9333,
    yieldFocused: 1.0633,
    favFood: 'Abóbora',
    hasSecondary: true,
    secondaryName: 'Leite de Vaca',
    secondaryYieldAvg: 9,
  },
}

export const PRODUCTION_OPTIONS: Array<{ value: ProductionKey; label: string; tier: number }> = [
  { value: 'pinto', label: 'Pintos → Galinhas', tier: 3 },
  { value: 'cabrito', label: 'Cabrito → Cabras', tier: 4 },
  { value: 'gansinho', label: 'Gansinho → Gansos', tier: 5 },
  { value: 'cordeiro', label: 'Cordeiro → Ovelhas', tier: 6 },
  { value: 'leitao', label: 'Leitão → Porcos', tier: 7 },
  { value: 'novilhoCorte', label: 'Novilho → Vacas', tier: 8 },
]

export const SECONDARY_OPTIONS: Array<{ value: ProductionKey; label: string; tier: number }> = [
  { value: 'pinto', label: 'Galinhas → Ovos de Galinha', tier: 3 },
  { value: 'cabrito', label: 'Cabras → Leite de Cabra', tier: 4 },
  { value: 'gansinho', label: 'Gansos → Ovos de Ganso', tier: 5 },
  { value: 'cordeiro', label: 'Ovelhas → Leite de Ovelha', tier: 6 },
  { value: 'novilhoCorte', label: 'Vacas → Leite de Vaca', tier: 8 },
]

// ── Riding animals ──────────────────────────────────────────────────────────

export type RidingKey =
  | 'novilhoIniciante'
  | 'novilhoAdepto'
  | 'novilhoPerito'
  | 'novilhoMestre'
  | 'novilhoGraoMestre'
  | 'novilhoAnciao'
  | 'potroIniciante'
  | 'potroAdepto'
  | 'potroPerito'
  | 'potroMestre'
  | 'potroGraoMestre'
  | 'potroAnciao'
  | 'gamoAdepto'
  | 'alceFilhote'

export interface RidingData {
  tier: number
  youngName: string
  adultName: string
  specName: string
  yieldUnfocused: number // chance per nurturing, without focus
  yieldFocused: number // chance per nurturing, with focus
  growthHoursBase: number // without premium
  foodPer24h: number
  maxNurtures: number // based on premium growth time (ceil of premium days)
}

// maxNurtures derived from premium growth time in days (ceil):
// T3: 22h → 1 | T4: 46h → 2 | T5: 70h → 3 | T6: 94h → 4 | T7: 118h → 5 | T8: 142h → 6
export const RIDING_ANIMALS: Record<RidingKey, RidingData> = {
  novilhoIniciante: {
    tier: 3,
    youngName: 'Novilho do Iniciante',
    adultName: 'Potro do Iniciante',
    specName: 'Criador de Bois',
    yieldUnfocused: 0.84,
    yieldFocused: 1.04,
    growthHoursBase: 44,
    foodPer24h: 10,
    maxNurtures: 1,
  },
  novilhoAdepto: {
    tier: 4,
    youngName: 'Novilho do Adepto',
    adultName: 'Potro do Adepto',
    specName: 'Criador de Bois',
    yieldUnfocused: 0.7867,
    yieldFocused: 0.9167,
    growthHoursBase: 92,
    foodPer24h: 16,
    maxNurtures: 2,
  },
  novilhoPerito: {
    tier: 5,
    youngName: 'Novilho do Perito',
    adultName: 'Potro do Perito',
    specName: 'Criador de Bois',
    yieldUnfocused: 0.7867,
    yieldFocused: 0.8757,
    growthHoursBase: 140,
    foodPer24h: 31,
    maxNurtures: 3,
  },
  novilhoMestre: {
    tier: 6,
    youngName: 'Novilho do Mestre',
    adultName: 'Potro do Mestre',
    specName: 'Criador de Bois',
    yieldUnfocused: 0.8104,
    yieldFocused: 0.8694,
    growthHoursBase: 188,
    foodPer24h: 69,
    maxNurtures: 4,
  },
  novilhoGraoMestre: {
    tier: 7,
    youngName: 'Novilho do Grão Mestre',
    adultName: 'Potro do Grão Mestre',
    specName: 'Criador de Bois',
    yieldUnfocused: 0.842,
    yieldFocused: 0.882,
    growthHoursBase: 236,
    foodPer24h: 165,
    maxNurtures: 5,
  },
  novilhoAnciao: {
    tier: 8,
    youngName: 'Novilho do Ancião',
    adultName: 'Potro do Ancião',
    specName: 'Criador de Bois',
    yieldUnfocused: 0.8736,
    yieldFocused: 0.8996,
    growthHoursBase: 284,
    foodPer24h: 411,
    maxNurtures: 6,
  },
  potroIniciante: {
    tier: 3,
    youngName: 'Potro do Iniciante',
    adultName: 'Cavalo do Iniciante',
    specName: 'Criador de Cavalos',
    yieldUnfocused: 0.84,
    yieldFocused: 1.04,
    growthHoursBase: 44,
    foodPer24h: 10,
    maxNurtures: 1,
  },
  potroAdepto: {
    tier: 4,
    youngName: 'Potro do Adepto',
    adultName: 'Cavalo do Adepto',
    specName: 'Criador de Cavalos',
    yieldUnfocused: 0.7867,
    yieldFocused: 0.9167,
    growthHoursBase: 92,
    foodPer24h: 16,
    maxNurtures: 2,
  },
  potroPerito: {
    tier: 5,
    youngName: 'Potro do Perito',
    adultName: 'Cavalo do Perito',
    specName: 'Criador de Cavalos',
    yieldUnfocused: 0.7867,
    yieldFocused: 0.8757,
    growthHoursBase: 140,
    foodPer24h: 31,
    maxNurtures: 3,
  },
  potroMestre: {
    tier: 6,
    youngName: 'Potro do Mestre',
    adultName: 'Cavalo do Mestre',
    specName: 'Criador de Cavalos',
    yieldUnfocused: 0.8104,
    yieldFocused: 0.8694,
    growthHoursBase: 188,
    foodPer24h: 69,
    maxNurtures: 4,
  },
  potroGraoMestre: {
    tier: 7,
    youngName: 'Potro do Grão Mestre',
    adultName: 'Cavalo do Grão Mestre',
    specName: 'Criador de Cavalos',
    yieldUnfocused: 0.842,
    yieldFocused: 0.882,
    growthHoursBase: 236,
    foodPer24h: 165,
    maxNurtures: 5,
  },
  potroAnciao: {
    tier: 8,
    youngName: 'Potro do Ancião',
    adultName: 'Cavalo do Ancião',
    specName: 'Criador de Cavalos',
    yieldUnfocused: 0.8736,
    yieldFocused: 0.8996,
    growthHoursBase: 284,
    foodPer24h: 411,
    maxNurtures: 6,
  },
  gamoAdepto: {
    tier: 4,
    youngName: 'Gamo do Adepto',
    adultName: 'Veado Gigante Manso do Adepto',
    specName: 'Criador de Animais Raros',
    yieldUnfocused: 0.0,
    yieldFocused: 0.18,
    growthHoursBase: 92,
    foodPer24h: 16,
    maxNurtures: 2,
  },
  alceFilhote: {
    tier: 6,
    youngName: 'Alce filhote',
    adultName: 'Alce Manso',
    specName: 'Criador de Animais Raros',
    yieldUnfocused: 0.0,
    yieldFocused: 0.06,
    growthHoursBase: 188,
    foodPer24h: 69,
    maxNurtures: 4,
  },
}

export const RIDING_OPTIONS: Array<{ value: RidingKey; label: string; tier: number }> = [
  { value: 'novilhoIniciante', label: 'Novilho do Iniciante', tier: 3 },
  { value: 'novilhoAdepto', label: 'Novilho do Adepto', tier: 4 },
  { value: 'novilhoPerito', label: 'Novilho do Perito', tier: 5 },
  { value: 'novilhoMestre', label: 'Novilho do Mestre', tier: 6 },
  { value: 'novilhoGraoMestre', label: 'Novilho do Grão Mestre', tier: 7 },
  { value: 'novilhoAnciao', label: 'Novilho do Ancião', tier: 8 },
  { value: 'potroIniciante', label: 'Potro do Iniciante', tier: 3 },
  { value: 'potroAdepto', label: 'Potro do Adepto', tier: 4 },
  { value: 'potroPerito', label: 'Potro do Perito', tier: 5 },
  { value: 'potroMestre', label: 'Potro do Mestre', tier: 6 },
  { value: 'potroGraoMestre', label: 'Potro do Grão Mestre', tier: 7 },
  { value: 'potroAnciao', label: 'Potro do Ancião', tier: 8 },
  { value: 'gamoAdepto', label: 'Gamo do Adepto', tier: 4 },
  { value: 'alceFilhote', label: 'Alce filhote', tier: 6 },
]

// ── Shared helpers ─────────────────────────────────────────────────────────

export function formatGrowthTime(hours: number): string {
  const d = Math.floor(hours / 24)
  const h = hours % 24
  if (d === 0) return `${h}h`
  if (h === 0) return `${d}d`
  return `${d}d ${h}h`
}

const ANIMALS_PER_PASTURE = 9

// ── Composable ─────────────────────────────────────────────────────────────

export function usePastureCalculator() {
  // ── Mode ───────────────────────────────────────────────────────────────

  const mode = ref<PastureMode>('production')

  // ── Shared state ───────────────────────────────────────────────────────

  const specBreeder = ref(100) // 0–100
  const specAnimal = ref(0) // 0–100 (specific animal)
  const premium = ref(false)
  const pastures = ref(1)
  const animalsPerPasture = ANIMALS_PER_PASTURE

  // ── Focus (shared) ─────────────────────────────────────────────────────

  const focusEfficiency = computed(() => specBreeder.value * 1 + specAnimal.value * 2)
  const focusPerAnimal = computed(() =>
    Math.round(1000 * Math.pow(0.5, focusEfficiency.value / 100)),
  )
  const focusReductionPct = computed(() => (1 - Math.pow(0.5, focusEfficiency.value / 100)) * 100)

  watch(specBreeder, (v) => {
    if (v > 100) specBreeder.value = 100
    if (v < 0) specBreeder.value = 0
  })
  watch(specAnimal, (v) => {
    if (v > 100) specAnimal.value = 100
    if (v < 0) specAnimal.value = 0
  })
  watch(pastures, (v) => {
    if (v < 1) pastures.value = 1
  })

  // ── PRODUCTION mode ────────────────────────────────────────────────────

  const productionAnimal = ref<ProductionKey>('pinto')
  const animalsWithFocus = ref(0) // total across all pastures
  const favFoodActive = ref(false) // feeding favorite food

  // Prices
  const priceYoung = ref(0) // young animal price
  const priceAdult = ref(0) // adult/grown animal price
  const priceFood = ref(0) // food item price
  const foodPerAnimal = ref(0) // food items needed per animal per cycle (user-defined)

  watch(pastures, (newP) => {
    const max = newP * ANIMALS_PER_PASTURE
    if (animalsWithFocus.value > max) animalsWithFocus.value = max
  })
  watch(animalsWithFocus, (v) => {
    const max = pastures.value * ANIMALS_PER_PASTURE
    if (v > max) animalsWithFocus.value = max
    if (v < 0) animalsWithFocus.value = 0
  })

  const productionData = computed(() => PRODUCTION_ANIMALS[productionAnimal.value])
  const totalAnimals = computed(() => animalsPerPasture * pastures.value)
  const animalsUnfocused = computed(() => totalAnimals.value - animalsWithFocus.value)

  const animalsWithFocusPerPasture = computed(() =>
    pastures.value > 0 ? animalsWithFocus.value / pastures.value : 0,
  )
  const animalsUnfocusedPerPasture = computed(
    () => animalsPerPasture - animalsWithFocusPerPasture.value,
  )

  // Expected adult animals per pasture
  const adultsPerPasture = computed(
    () =>
      animalsWithFocusPerPasture.value * productionData.value.yieldFocused +
      animalsUnfocusedPerPasture.value * productionData.value.yieldUnfocused,
  )
  const adultsTotal = computed(() => adultsPerPasture.value * pastures.value)

  // Food cost per pasture (with favorite food discount)
  const effectiveFoodMultiplier = computed(() => (favFoodActive.value ? 0.5 : 1.0))
  const totalFoodPerAnimalCycle = computed(
    () => foodPerAnimal.value * effectiveFoodMultiplier.value,
  )
  const foodCostPerPasture = computed(
    () => animalsPerPasture * totalFoodPerAnimalCycle.value * priceFood.value,
  )
  const foodCostTotal = computed(() => foodCostPerPasture.value * pastures.value)

  // Focus cost for production
  const focusProdPerPasture = computed(
    () => animalsWithFocusPerPasture.value * focusPerAnimal.value,
  )
  const focusProdTotal = computed(() => focusProdPerPasture.value * pastures.value)

  // Revenue per pasture
  const revenueProdPerPasture = computed(
    () => animalsPerPasture * priceAdult.value + adultsPerPasture.value * priceYoung.value,
  )

  // Cost per pasture (young animals + food)
  const costProdPerPasture = computed(
    () => animalsPerPasture * priceYoung.value + foodCostPerPasture.value,
  )
  const netProfitProdPerPasture = computed(
    () => revenueProdPerPasture.value - costProdPerPasture.value,
  )

  const revenueProdTotal = computed(() => revenueProdPerPasture.value * pastures.value)
  const costProdTotal = computed(() => costProdPerPasture.value * pastures.value)
  const netProfitProdTotal = computed(() => netProfitProdPerPasture.value * pastures.value)

  const profitMarginProd = computed<number | null>(() => {
    if (revenueProdPerPasture.value === 0) return null
    return (netProfitProdPerPasture.value / revenueProdPerPasture.value) * 100
  })

  const isProductionSustainable = computed(() => adultsPerPasture.value >= animalsPerPasture)

  // Growth time display for production
  const growthHoursProd = computed(() => (premium.value ? 22 : 44))

  // ── RIDING mode ────────────────────────────────────────────────────────

  const ridingAnimal = ref<RidingKey>('potroIniciante')
  const ridingAnimalsWithFocus = ref(0) // total across all pastures

  // Prices
  const priceRidingYoung = ref(0)
  const priceRidingAdult = ref(0)
  const priceRidingFood = ref(0) // price per food item

  watch(pastures, (newP) => {
    const max = newP * ANIMALS_PER_PASTURE
    if (ridingAnimalsWithFocus.value > max) ridingAnimalsWithFocus.value = max
  })
  watch(ridingAnimalsWithFocus, (v) => {
    const max = pastures.value * ANIMALS_PER_PASTURE
    if (v > max) ridingAnimalsWithFocus.value = max
    if (v < 0) ridingAnimalsWithFocus.value = 0
  })

  const ridingData = computed(() => RIDING_ANIMALS[ridingAnimal.value])

  const ridingWithFocusPerPasture = computed(() =>
    pastures.value > 0 ? ridingAnimalsWithFocus.value / pastures.value : 0,
  )
  const ridingWithoutFocusPerPasture = computed(
    () => animalsPerPasture - ridingWithFocusPerPasture.value,
  )

  // Expected foals per pasture (each animal × maxNurtures × yieldPerNurture)
  const expectedFoalsFocusedPasture = computed(
    () =>
      ridingWithFocusPerPasture.value *
      ridingData.value.maxNurtures *
      ridingData.value.yieldFocused,
  )
  const expectedFoalsUnfocusedPasture = computed(
    () =>
      ridingWithoutFocusPerPasture.value *
      ridingData.value.maxNurtures *
      ridingData.value.yieldUnfocused,
  )
  const expectedFoalsPerPasture = computed(
    () => expectedFoalsFocusedPasture.value + expectedFoalsUnfocusedPasture.value,
  )
  const expectedFoalsTotal = computed(() => expectedFoalsPerPasture.value * pastures.value)

  // Food cost: fixed per animal based on maxNurtures × foodPer24h
  // This is constant regardless of premium (premium only changes cycle time, not feeding count)
  const foodPerAnimalRiding = computed(
    () => ridingData.value.maxNurtures * ridingData.value.foodPer24h,
  )
  const foodCostRidingPerPasture = computed(
    () => animalsPerPasture * foodPerAnimalRiding.value * priceRidingFood.value,
  )
  const foodCostRidingTotal = computed(() => foodCostRidingPerPasture.value * pastures.value)

  // Focus cost for riding: per nurturing action
  const focusRidingPerPasture = computed(
    () => ridingWithFocusPerPasture.value * ridingData.value.maxNurtures * focusPerAnimal.value,
  )
  const focusRidingTotal = computed(() => focusRidingPerPasture.value * pastures.value)

  // Revenue per pasture
  const revenueRidingPerPasture = computed(
    () => expectedFoalsPerPasture.value * priceRidingAdult.value,
  )

  // Cost per pasture (input animals + food)
  const costRidingPerPasture = computed(
    () => animalsPerPasture * priceRidingYoung.value + foodCostRidingPerPasture.value,
  )
  const netProfitRidingPerPasture = computed(
    () => revenueRidingPerPasture.value - costRidingPerPasture.value,
  )

  const revenueRidingTotal = computed(() => revenueRidingPerPasture.value * pastures.value)
  const costRidingTotal = computed(() => costRidingPerPasture.value * pastures.value)
  const netProfitRidingTotal = computed(() => netProfitRidingPerPasture.value * pastures.value)

  const profitMarginRiding = computed<number | null>(() => {
    if (revenueRidingPerPasture.value === 0) return null
    return (netProfitRidingPerPasture.value / revenueRidingPerPasture.value) * 100
  })

  // Growth time display for riding
  const ridingGrowthHours = computed(() =>
    premium.value ? ridingData.value.growthHoursBase / 2 : ridingData.value.growthHoursBase,
  )

  // ── SECONDARY mode ────────────────────────────────────────────────────────

  // Adult animal that produces secondary items (milk, eggs, etc.)
  const secondaryAnimal = ref<ProductionKey>('pinto')
  const priceSecondaryAdult = ref(0) // cost of adult animal (initial investment)
  const priceSecondaryProduct = ref(0) // revenue per secondary item
  const priceSecondaryFood = ref(0) // food cost per item
  const favFoodActiveSecondary = ref(false)

  const secondaryProductionData = computed(() => PRODUCTION_ANIMALS[secondaryAnimal.value])

  // 18 food items per animal per cycle (9 with favourite food)
  const secondaryFoodPerAnimal = computed(() => (favFoodActiveSecondary.value ? 9 : 18))

  // 9 adults/pasture × secondaryYieldAvg items/adult; premium doubles yield
  const secondaryItemsPerPasture = computed(
    () =>
      animalsPerPasture * secondaryProductionData.value.secondaryYieldAvg * (premium.value ? 2 : 1),
  )
  const secondaryItemsTotal = computed(() => secondaryItemsPerPasture.value * pastures.value)

  // Per-cycle food cost (adults are returned — food is the only recurring cost)
  const secondaryFoodCostPerPasture = computed(
    () => animalsPerPasture * secondaryFoodPerAnimal.value * priceSecondaryFood.value,
  )
  const secondaryFoodCostTotal = computed(() => secondaryFoodCostPerPasture.value * pastures.value)

  const revenueSecondaryPerPasture = computed(
    () => secondaryItemsPerPasture.value * priceSecondaryProduct.value,
  )
  const revenueSecondaryTotal = computed(() => revenueSecondaryPerPasture.value * pastures.value)

  // Cost per cycle = adult animals + food (animals are consumed, not returned)
  const costSecondaryPerPasture = computed(
    () => animalsPerPasture * priceSecondaryAdult.value + secondaryFoodCostPerPasture.value,
  )
  const costSecondaryTotal = computed(() => costSecondaryPerPasture.value * pastures.value)

  const netProfitSecondaryPerPasture = computed(
    () => revenueSecondaryPerPasture.value - costSecondaryPerPasture.value,
  )
  const netProfitSecondaryTotal = computed(
    () => netProfitSecondaryPerPasture.value * pastures.value,
  )

  const profitMarginSecondary = computed<number | null>(() => {
    if (revenueSecondaryPerPasture.value === 0) return null
    return (netProfitSecondaryPerPasture.value / revenueSecondaryPerPasture.value) * 100
  })

  return {
    // Mode
    mode,

    // Shared state
    specBreeder,
    specAnimal,
    premium,
    pastures,

    // Focus (shared)
    focusEfficiency,
    focusPerAnimal,
    focusReductionPct,

    // Production state
    productionAnimal,
    animalsWithFocus,
    animalsUnfocused,
    favFoodActive,
    priceYoung,
    priceAdult,
    priceFood,
    foodPerAnimal,

    // Production computed
    productionData,
    totalAnimals,
    animalsWithFocusPerPasture,
    animalsUnfocusedPerPasture,
    adultsPerPasture,
    adultsTotal,
    effectiveFoodMultiplier,
    foodCostPerPasture,
    foodCostTotal,
    focusProdPerPasture,
    focusProdTotal,
    revenueProdPerPasture,
    costProdPerPasture,
    netProfitProdPerPasture,
    revenueProdTotal,
    costProdTotal,
    netProfitProdTotal,
    profitMarginProd,
    isProductionSustainable,
    growthHoursProd,

    // Riding state
    ridingAnimal,
    ridingAnimalsWithFocus,
    priceRidingYoung,
    priceRidingAdult,
    priceRidingFood,

    // Riding computed
    ridingData,
    ridingWithFocusPerPasture,
    ridingWithoutFocusPerPasture,
    expectedFoalsPerPasture,
    expectedFoalsTotal,
    foodPerAnimalRiding,
    foodCostRidingPerPasture,
    foodCostRidingTotal,
    focusRidingPerPasture,
    focusRidingTotal,
    revenueRidingPerPasture,
    costRidingPerPasture,
    netProfitRidingPerPasture,
    revenueRidingTotal,
    costRidingTotal,
    netProfitRidingTotal,
    profitMarginRiding,
    ridingGrowthHours,

    // Secondary state
    secondaryAnimal,
    priceSecondaryAdult,
    priceSecondaryProduct,
    priceSecondaryFood,
    favFoodActiveSecondary,

    // Secondary computed
    secondaryProductionData,
    secondaryFoodPerAnimal,
    secondaryItemsPerPasture,
    secondaryItemsTotal,
    secondaryFoodCostPerPasture,
    secondaryFoodCostTotal,
    revenueSecondaryPerPasture,
    revenueSecondaryTotal,
    costSecondaryPerPasture,
    costSecondaryTotal,
    netProfitSecondaryPerPasture,
    netProfitSecondaryTotal,
    profitMarginSecondary,
  }
}
