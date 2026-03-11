<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Location } from '@/types/items'

type MaterialType = 'wood' | 'hide' | 'ore' | 'stone' | 'fiber'

const MATERIALS = {
  wood: { rawName: 'Tronco', refinedName: 'Tábua', label: 'Madeira' },
  hide: { rawName: 'Pelego Bruto', refinedName: 'Couro', label: 'Pelego' },
  ore: { rawName: 'Minério', refinedName: 'Barra de Metal', label: 'Minério' },
  stone: { rawName: 'Pedra Bruta', refinedName: 'Bloco de Pedra', label: 'Pedra' },
  fiber: { rawName: 'Fibra Bruta', refinedName: 'Tecido', label: 'Fibra' },
} satisfies Record<MaterialType, { rawName: string; refinedName: string; label: string }>

// Base return rate: 15.2% in any city; 36.7% in the bonus city for that material
const CITY_BONUS: Record<MaterialType, Location> = {
  wood: Location.FortSterling,
  hide: Location.Martlock,
  ore: Location.Thetford,
  stone: Location.Bridgewatch,
  fiber: Location.Lymhurst,
}

// Number of raw resources required per refine action, by tier
const RAW_QTY: Record<number, number> = {
  2: 1,
  3: 2,
  4: 2,
  5: 3,
  6: 4,
  7: 5,
  8: 5,
}

// Approximate base focus cost (at specialization 0) per refine action, by tier
const BASE_FOCUS: Record<number, number> = {
  2: 75,
  3: 140,
  4: 260,
  5: 500,
  6: 960,
  7: 1860,
  8: 3600,
}

// Item Value (IV) per tier and enchantment — nutrition = IV × 0.1125
// T2 has no nutrition cost. T3 has no enchantment. T4–T8 have .0–.4.
const ITEM_VALUE: Record<number, Record<number, number>> = {
  2: { 0: 0 },
  3: { 0: 8 },
  4: { 0: 16, 1: 32, 2: 64, 3: 128, 4: 256 },
  5: { 0: 32, 1: 64, 2: 128, 3: 256, 4: 512 },
  6: { 0: 64, 1: 128, 2: 256, 3: 512, 4: 1024 },
  7: { 0: 128, 1: 256, 2: 512, 3: 1024, 4: 2048 },
  8: { 0: 256, 1: 512, 2: 1024, 3: 2048, 4: 4096 },
}

const MATERIAL_OPTIONS: { value: MaterialType; label: string }[] = [
  { value: 'wood', label: 'Madeira' },
  { value: 'hide', label: 'Pelego' },
  { value: 'ore', label: 'Minério' },
  { value: 'stone', label: 'Pedra' },
  { value: 'fiber', label: 'Fibra' },
]

const TIER_OPTIONS = [2, 3, 4, 5, 6, 7, 8]

const ALL_CITIES = Object.values(Location)

// ── State ──────────────────────────────────────────────────────────────────
const material = ref<MaterialType>('wood')
const tier = ref(5)
const enchantment = ref(0)
const stoneEnchantment = ref(0)
const city = ref<Location>(Location.FortSterling)
const eventBonus = ref(0)
const useFocus = ref(false)
const specLevel = ref(0)
const focusBudget = ref(30000)
const rawPrice = ref(0)
const subPrice = ref(0)
const quantity = ref(1)
const sellPrice = ref(0)
const stationFee = ref(0) // prata por 100 de nutrição

// ── Derived values ─────────────────────────────────────────────────────────
// Reset subtiers on material/tier change
watch(material, (m) => {
  if (m === 'stone') enchantment.value = 0
  else stoneEnchantment.value = 0
  city.value = CITY_BONUS[m]
})
watch(tier, (t) => {
  if (t < 4) {
    enchantment.value = 0
    stoneEnchantment.value = 0
  }
})

// Non-stone subtiers only from T4 upward
const hasSubtiers = computed(() => material.value !== 'stone' && tier.value >= 4)
// Stone recipe variants: raw stone has enchantment .0–.3 for T4+; output block never has enchantment
const hasStoneSubtier = computed(() => material.value === 'stone' && tier.value >= 4)

// Sub-ingredient quantity: 2^stoneEnchantment for stone T4+, otherwise 1 (or 0 for T2)
const subQty = computed(() => {
  if (!hasSubIngredient.value) return 0
  if (material.value === 'stone' && tier.value >= 4) return Math.pow(2, stoneEnchantment.value)
  return 1
})
// Output yield per refine action: 2^stoneEnchantment for stone T4+, otherwise always 1
const outputYield = computed(() => {
  if (material.value === 'stone' && tier.value >= 4) return Math.pow(2, stoneEnchantment.value)
  return 1
})
// Tier label for the raw material (stone raw has stoneEnchantment, other materials share enchantment)
const rawTierLabel = computed(() =>
  material.value === 'stone'
    ? tierLabel(tier.value, stoneEnchantment.value)
    : tierLabel(tier.value, enchantment.value),
)

const SUBTIER_COLORS: Record<number, string> = {
  0: 'bg-gray-600 text-gray-100',
  1: 'bg-green-700 text-green-100',
  2: 'bg-blue-700 text-blue-100',
  3: 'bg-purple-700 text-purple-100',
  4: 'bg-yellow-600 text-yellow-100',
}

function tierLabel(t: number, s: number = 0): string {
  return s > 0 ? `T${t}.${s}` : `T${t}`
}

const bonusCity = computed(() => CITY_BONUS[material.value])
const hasBonusCity = computed(() => city.value === bonusCity.value)
const rawQty = computed(() => RAW_QTY[tier.value])
const hasSubIngredient = computed(() => tier.value > 2)
const mat = computed(() => MATERIALS[material.value])

/**
 * Exact return rates as shown in the Albion Online UI.
 * Values do NOT depend on spec, tier, or quantity.
 * Spec only reduces focus cost (0.5% per level).
 */
const RRR_TABLE: Record<
  'noBonusCity' | 'bonusCity',
  Record<number, { noFocus: number; focus: number }>
> = {
  noBonusCity: {
    0: { noFocus: 0.152, focus: 0.439 },
    10: { noFocus: 0.237, focus: 0.489 },
    20: { noFocus: 0.293, focus: 0.528 },
  },
  bonusCity: {
    0: { noFocus: 0.367, focus: 0.559 },
    10: { noFocus: 0.435, focus: 0.584 },
    20: { noFocus: 0.47, focus: 0.596 },
  },
}

// Return rate without focus (used for the no-focus portion of a budget-limited run)
const returnRateNoFocus = computed(() => {
  const key = hasBonusCity.value ? 'bonusCity' : 'noBonusCity'
  return RRR_TABLE[key][eventBonus.value]?.noFocus ?? 0.152
})

// Return rate for the active configuration
const returnRate = computed(() => {
  const key = hasBonusCity.value ? 'bonusCity' : 'noBonusCity'
  const row = RRR_TABLE[key][eventBonus.value]
  return useFocus.value ? (row?.focus ?? 0.152) : (row?.noFocus ?? 0.152)
})

const returnRatePct = computed(() => (returnRate.value * 100).toFixed(1))

/** Focus spent per single refine action, reduced by 0.5% per spec level (max 50% at spec 100). */
const focusCostPerRefine = computed(() => {
  if (!useFocus.value) return 0
  const base = BASE_FOCUS[tier.value] ?? 0
  const reduction = specLevel.value * 0.005 // 0.5% per level, 50% max at spec 100
  return Math.round(base * (1 - reduction))
})

// Cost breakdown for 1 refined item produced (based on full-focus rate, for the detail table)
const rawGross = computed(() => (rawQty.value ?? 0) * rawPrice.value)
const subGross = computed(() => subQty.value * subPrice.value)
const totalGross = computed(() => rawGross.value + subGross.value)
const rawReturn = computed(() => rawGross.value * returnRate.value)
const subReturn = computed(() => subGross.value * returnRate.value)
const totalReturn = computed(() => totalGross.value * returnRate.value)

// Scaled values for the full quantity requested
const rawQtyTotal = computed(() => (rawQty.value ?? 0) * refineActions.value)
const subQtyTotal = computed(() => subQty.value * refineActions.value)
const rawGrossTotal = computed(() => rawGross.value * refineActions.value)
const subGrossTotal = computed(() => subGross.value * refineActions.value)
const totalGrossTotal = computed(() => totalGross.value * refineActions.value)
const rawReturnTotal = computed(() => rawReturn.value * refineActions.value)
const subReturnTotal = computed(() => subReturn.value * refineActions.value)
const totalReturnTotal = computed(() => totalReturn.value * refineActions.value)

// Scaled by quantity
// Refine actions needed (one action can yield multiple items for stone with enchantment)
const refineActions = computed(() => Math.ceil(quantity.value / outputYield.value))

// Focus budget split
const actionsWithFocus = computed(() => {
  if (!useFocus.value || focusCostPerRefine.value === 0) return 0
  return Math.min(refineActions.value, Math.floor(focusBudget.value / focusCostPerRefine.value))
})
const actionsWithoutFocus = computed(() => refineActions.value - actionsWithFocus.value)
const focusUsed = computed(() => actionsWithFocus.value * focusCostPerRefine.value)
const isBudgetLimited = computed(
  () => useFocus.value && focusCostPerRefine.value > 0 && actionsWithoutFocus.value > 0,
)

// Cost per item for each segment
const costPerItemWithFocus = computed(
  () => (totalGross.value * (1 - returnRate.value)) / outputYield.value,
)
const costPerItemNoFocus = computed(
  () => (totalGross.value * (1 - returnRateNoFocus.value)) / outputYield.value,
)

// Blended cost per item (weighted average over all output items)
const itemsWithFocus = computed(() => actionsWithFocus.value * outputYield.value)
const itemsWithoutFocus = computed(() => actionsWithoutFocus.value * outputYield.value)
const costPerItem = computed(() => {
  if (!useFocus.value) return costPerItemNoFocus.value
  if (quantity.value === 0) return 0
  return (
    (costPerItemWithFocus.value * itemsWithFocus.value +
      costPerItemNoFocus.value * itemsWithoutFocus.value) /
    quantity.value
  )
})

const totalCost = computed(() => costPerItem.value * quantity.value)
const totalFocus = computed(() => focusUsed.value)

// Nutrition cost
// nutrition = ItemValue × 0.1125  →  cost = nutrition × stationFee / 100
const itemValue = computed(() => {
  const effectiveSubtier = material.value === 'stone' ? stoneEnchantment.value : enchantment.value
  return ITEM_VALUE[tier.value]?.[effectiveSubtier] ?? ITEM_VALUE[tier.value]?.[0] ?? 0
})
const nutritionPerAction = computed(() => itemValue.value * 0.1125)
const nutritionCostPerAction = computed(() => (nutritionPerAction.value * stationFee.value) / 100)
const totalNutritionCost = computed(() => nutritionCostPerAction.value * refineActions.value)
const nutritionCostPerItem = computed(() =>
  quantity.value > 0 ? totalNutritionCost.value / quantity.value : 0,
)

// Optional profit estimate (only when a sell price is provided)
// Profit uses the blended costPerItem (already accounts for partial focus)
const profitPerItem = computed(() =>
  sellPrice.value > 0 ? sellPrice.value - costPerItem.value - nutritionCostPerItem.value : null,
)
const totalProfit = computed(() =>
  profitPerItem.value !== null ? profitPerItem.value * quantity.value : null,
)

// Profit margin % = profitPerItem / totalNetCostPerItem
// Total net cost = what you actually spend after material returns + nutrition
const profitMarginPct = computed(() => {
  if (profitPerItem.value === null) return null
  const netCost = costPerItem.value + nutritionCostPerItem.value
  if (netCost === 0) return null
  return (profitPerItem.value / netCost) * 100
})

function fmt(n: number) {
  return n.toLocaleString('pt-BR', { maximumFractionDigits: 0 })
}

function profitColorClass(n: number | null) {
  if (n === null) return 'text-gray-400'
  return n >= 0 ? 'text-green-400' : 'text-red-400'
}

function marginColorClass(pct: number | null): string {
  if (pct === null) return 'text-gray-400'
  if (pct < 0) return 'text-red-400'
  if (pct < 10) return 'text-yellow-400'
  if (pct < 20) return 'text-green-400'
  return 'text-blue-400'
}

function marginBgClass(pct: number | null): string {
  if (pct === null) return 'bg-gray-800'
  if (pct < 0) return 'bg-red-900/30 border border-red-700/40'
  if (pct < 10) return 'bg-yellow-900/30 border border-yellow-700/40'
  if (pct < 20) return 'bg-green-900/30 border border-green-700/40'
  return 'bg-blue-900/30 border border-blue-700/40'
}
</script>

<template>
  <div class="min-h-screen bg-gray-950/90 text-gray-100 rounded-lg p-6">
    <h1 class="text-2xl font-bold mb-1 text-yellow-400">AO Calculadora de Refino</h1>
    <p class="text-sm text-gray-500 mb-6">
      Calcule o custo de refinar materiais considerando bônus de cidade, evento diário e foco.
    </p>

    <!-- ── Row 1: Material + Tier ─────────────────────────────────────────── -->
    <div class="flex flex-col md:flex-row items-stretch gap-2 mb-6">
      <!-- Material selector -->
      <div class="bg-gray-900 rounded-xl p-4 flex-1">
        <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Material</h2>
        <div class="flex flex-col gap-1.5">
          <button
            v-for="opt in MATERIAL_OPTIONS"
            :key="opt.value"
            @click="material = opt.value"
            :class="[
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer text-left',
              material === opt.value
                ? 'bg-yellow-400 text-gray-950'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700',
            ]"
          >
            {{ opt.label }}
            <span
              v-if="material === opt.value"
              class="ml-auto text-xs bg-gray-950/30 px-1.5 py-0.5 rounded"
            >
              {{ mat.rawName }} → {{ mat.refinedName }}
            </span>
          </button>
        </div>
      </div>

      <!-- ▸ step arrow -->
      <div
        class="flex items-center justify-center flex-shrink-0 text-gray-600 py-1 md:py-0 md:px-1"
      >
        <svg class="hidden md:block w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <svg class="block md:hidden w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      <!-- Tier selector -->
      <div class="bg-gray-900 rounded-xl p-4 flex-1">
        <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Tier</h2>
        <div class="grid grid-cols-4 gap-2 mb-3">
          <button
            v-for="t in TIER_OPTIONS"
            :key="t"
            @click="tier = t"
            :class="[
              'py-2 rounded-lg text-sm font-bold transition-colors cursor-pointer',
              tier === t
                ? 'bg-yellow-400 text-gray-950'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700',
            ]"
          >
            T{{ t }}
          </button>
        </div>

        <!-- Enchantment selector (non-stone) -->
        <div v-if="hasSubtiers" class="mb-3">
          <p class="text-xs text-gray-500 mb-1.5">Encantamento</p>
          <div class="flex gap-1.5 flex-wrap">
            <button
              v-for="s in [0, 1, 2, 3, 4]"
              :key="s"
              @click="enchantment = s"
              :class="[
                'px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer',
                enchantment === s
                  ? (SUBTIER_COLORS[s] ?? 'bg-gray-600 text-gray-100')
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700',
              ]"
            >
              {{ s === 0 ? 'Base' : `.${s}` }}
            </button>
          </div>
        </div>

        <!-- Stone recipe variant selector: selects which raw stone enchantment to use -->
        <div v-if="hasStoneSubtier" class="mb-3">
          <p class="text-xs text-gray-500 mb-1.5">Receita (enchantment da pedra)</p>
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="s in [0, 1, 2, 3]"
              :key="s"
              @click="stoneEnchantment = s"
              :class="[
                'px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer text-center min-w-[3rem]',
                stoneEnchantment === s
                  ? (SUBTIER_COLORS[s] ?? 'bg-gray-600 text-gray-100')
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700',
              ]"
            >
              <div>{{ s === 0 ? 'Base' : `.${s}` }}</div>
              <div class="font-normal opacity-75" style="font-size: 10px">
                ×{{ Math.pow(2, s) }}
              </div>
            </button>
          </div>
        </div>

        <!-- Recipe display -->
        <div class="bg-gray-800 rounded-lg p-3">
          <p class="text-xs text-gray-400 mb-2 uppercase tracking-wider">Receita</p>
          <div class="flex flex-wrap items-center gap-2 text-sm">
            <span class="bg-gray-700 text-yellow-300 px-2 py-1 rounded">
              <strong>{{ rawQty }}×</strong> {{ mat.rawName }} {{ rawTierLabel }}
            </span>
            <span v-if="hasSubIngredient" class="text-gray-500 text-xs">+</span>
            <span v-if="hasSubIngredient" class="bg-gray-700 text-yellow-300 px-2 py-1 rounded">
              <strong>{{ subQty }}×</strong> {{ mat.refinedName }}
              {{ tierLabel(tier - 1, tier > 4 ? enchantment : 0) }}
            </span>
            <span class="text-gray-500 text-xs">→</span>
            <span
              class="bg-yellow-400/15 border border-yellow-400/30 text-yellow-300 px-2 py-1 rounded"
            >
              <strong>{{ outputYield }}×</strong> {{ mat.refinedName }}
              {{ tierLabel(tier, enchantment) }}
            </span>
          </div>
        </div>
      </div>

      <!-- ▸ step arrow -->
      <div
        class="flex items-center justify-center flex-shrink-0 text-gray-600 py-1 md:py-0 md:px-1"
      >
        <svg class="hidden md:block w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <svg class="block md:hidden w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      <!-- City selector -->
      <div class="bg-gray-900 rounded-xl p-4 flex-1">
        <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Cidade de Refino
        </h2>
        <label
          v-for="loc in ALL_CITIES"
          :key="loc"
          :class="[
            'flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer transition-colors mb-0.5',
            city === loc ? 'bg-gray-700/80' : 'hover:bg-gray-800/60',
          ]"
        >
          <input type="radio" :value="loc" v-model="city" class="accent-yellow-400" />
          <span class="text-sm">{{ loc }}</span>
          <span
            v-if="loc === bonusCity"
            class="ml-auto text-xs bg-yellow-400/20 text-yellow-300 px-1.5 py-0.5 rounded font-semibold border border-yellow-400/30"
          >
            +Bônus {{ mat.label }}
          </span>
        </label>
      </div>
    </div>

    <!-- ▸ arrow between rows — mobile only -->
    <div class="flex md:hidden items-center justify-center text-gray-600 mb-2">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>

    <!-- ── Row 2: Event bonus + Focus + Prices ────────────────────────────── -->
    <div class="flex flex-col md:flex-row items-stretch gap-2 mb-6">
      <!-- Event bonus -->
      <div class="bg-gray-900 rounded-xl p-4 flex-1">
        <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Bônus de Evento Diário
        </h2>
        <label
          v-for="opt in [
            { label: 'Sem bônus de evento', value: 0 },
            { label: '+10% (Evento)', value: 10 },
            { label: '+20% (Evento)', value: 20 },
          ]"
          :key="opt.value"
          class="flex items-center gap-2 py-1.5 cursor-pointer hover:text-yellow-300 transition-colors"
        >
          <input type="radio" :value="opt.value" v-model="eventBonus" class="accent-yellow-400" />
          <span class="text-sm">{{ opt.label }}</span>
        </label>

        <div class="border-t border-gray-700 mt-4 pt-4">
          <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Foco</h2>
          <label
            class="flex items-center gap-2 cursor-pointer hover:text-yellow-300 transition-colors mb-3"
          >
            <input type="checkbox" v-model="useFocus" class="accent-yellow-400" />
            <span class="text-sm">Usar foco no refino</span>
          </label>
          <div v-if="useFocus" class="space-y-2">
            <label class="text-xs text-gray-400 block">Especialização (0 – 100)</label>
            <input
              type="number"
              v-model.number="specLevel"
              min="0"
              max="100"
              class="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-yellow-400"
            />
            <p class="text-xs text-gray-500">
              Redução no custo de foco: {{ (specLevel * 0.5).toFixed(1) }}% · custo =
              {{ (1 - specLevel * 0.005).toFixed(3) }} × base — não afeta o retorno
            </p>
            <label class="text-xs text-gray-400 block mt-2">Foco disponível (máx. 30.000)</label>
            <input
              type="number"
              v-model.number="focusBudget"
              min="0"
              max="30000"
              class="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-yellow-400"
            />
            <p v-if="isBudgetLimited" class="text-xs text-yellow-400">
              Foco suficiente para {{ actionsWithFocus }} ação{{
                actionsWithFocus !== 1 ? 'es' : ''
              }}. {{ actionsWithoutFocus }} ação{{ actionsWithoutFocus !== 1 ? 'es' : '' }} sem
              foco.
            </p>
            <p v-else-if="useFocus" class="text-xs text-green-400">
              Foco suficiente para toda a produção.
            </p>
          </div>
        </div>
      </div>

      <!-- ▸ step arrow -->
      <div
        class="flex items-center justify-center flex-shrink-0 text-gray-600 py-1 md:py-0 md:px-1"
      >
        <svg class="hidden md:block w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <svg class="block md:hidden w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      <!-- Prices -->
      <div class="bg-gray-900 rounded-xl p-4 flex-1">
        <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Preços (prata)
        </h2>
        <div class="space-y-3">
          <div>
            <label class="text-xs text-gray-400 mb-1 block">
              Preço de {{ mat.rawName }} {{ rawTierLabel }}
            </label>
            <input
              type="number"
              v-model.number="rawPrice"
              min="0"
              placeholder="0"
              class="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-yellow-400 placeholder-gray-600"
            />
          </div>
          <div v-if="hasSubIngredient">
            <label class="text-xs text-gray-400 mb-1 block">
              Preço de {{ mat.refinedName }} {{ tierLabel(tier - 1, tier > 4 ? enchantment : 0) }}
            </label>
            <input
              type="number"
              v-model.number="subPrice"
              min="0"
              placeholder="0"
              class="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-yellow-400 placeholder-gray-600"
            />
          </div>
          <div>
            <label class="text-xs text-gray-400 mb-1 block">
              Taxa da estação (prata / 100 nutrição)
            </label>
            <input
              type="number"
              v-model.number="stationFee"
              min="0"
              placeholder="0"
              class="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-yellow-400 placeholder-gray-600"
            />
            <p class="text-xs text-gray-600 mt-1">Nutrição por refino: {{ nutritionPerAction }}</p>
          </div>
          <div>
            <label class="text-xs text-gray-400 mb-1 block">
              Preço de venda de {{ mat.refinedName }} {{ tierLabel(tier, enchantment) }}
              <span class="text-gray-600">(opcional)</span>
            </label>
            <input
              type="number"
              v-model.number="sellPrice"
              min="0"
              placeholder="0"
              class="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-yellow-400 placeholder-gray-600"
            />
          </div>
        </div>
      </div>

      <!-- ▸ step arrow -->
      <div
        class="flex items-center justify-center flex-shrink-0 text-gray-600 py-1 md:py-0 md:px-1"
      >
        <svg class="hidden md:block w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <svg class="block md:hidden w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      <!-- Quantity + active config summary -->
      <div class="bg-gray-900 rounded-xl p-4 flex flex-col gap-4 flex-1">
        <div>
          <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Quantidade a Produzir
          </h2>
          <input
            type="number"
            v-model.number="quantity"
            min="1"
            class="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-yellow-400"
          />
        </div>

        <!-- Active config badges -->
        <div>
          <p class="text-xs text-gray-500 uppercase tracking-wider mb-2">Configuração ativa</p>
          <div class="flex flex-wrap gap-1.5 text-xs">
            <span class="bg-gray-800 px-2 py-1 rounded-full text-gray-300">
              {{ mat.label }} {{ rawTierLabel }}
            </span>
            <span class="bg-gray-800 px-2 py-1 rounded-full text-gray-300">
              {{ city }}
            </span>
            <span
              v-if="hasBonusCity"
              class="bg-yellow-400/20 text-yellow-300 px-2 py-1 rounded-full border border-yellow-400/30"
            >
              Bônus cidade (+0,40 eff.)
            </span>
            <span
              v-if="eventBonus > 0"
              class="bg-green-400/20 text-green-300 px-2 py-1 rounded-full border border-green-400/30"
            >
              Evento (+{{ eventBonus === 10 ? '10' : '20' }} %)
            </span>
            <span
              v-if="useFocus"
              class="bg-blue-400/20 text-blue-300 px-2 py-1 rounded-full border border-blue-400/30"
            >
              Foco · Spec {{ specLevel }}
            </span>
            <span class="bg-gray-700 text-yellow-300 px-2 py-1 rounded-full font-semibold">
              Retorno: {{ returnRatePct }} %
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Results ─────────────────────────────────────────────────────────── -->
    <div class="bg-gray-900 rounded-xl p-6">
      <h2 class="text-lg font-semibold text-yellow-400 mb-5">Resultados do Cálculo</h2>

      <!-- KPI cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-gray-800 rounded-xl p-4 text-center">
          <p class="text-xs text-gray-400 mb-1">Taxa de retorno</p>
          <p
            class="text-2xl font-bold"
            :class="returnRate > 0 ? 'text-green-400' : 'text-gray-500'"
          >
            {{ returnRatePct }} %
          </p>
        </div>
        <div class="bg-gray-800 rounded-xl p-4 text-center">
          <p class="text-xs text-gray-400 mb-1">Custo médio / item</p>
          <p class="text-2xl font-bold text-yellow-300">{{ fmt(costPerItem) }}</p>
          <p v-if="isBudgetLimited" class="text-xs text-yellow-400 mt-1">média ponderada</p>
        </div>
        <div class="bg-gray-800 rounded-xl p-4 text-center">
          <p class="text-xs text-gray-400 mb-1">Custo total (×{{ quantity }})</p>
          <p class="text-2xl font-bold text-yellow-300">
            {{ fmt(totalCost + totalNutritionCost) }}
          </p>
          <p v-if="stationFee > 0" class="text-xs text-orange-400 mt-1">
            {{ fmt(totalCost) }} materiais + {{ fmt(totalNutritionCost) }} nutrição
          </p>
        </div>
        <div class="bg-gray-800 rounded-xl p-4 text-center">
          <p class="text-xs text-gray-400 mb-1">
            {{ useFocus ? `Foco utilizado` : 'Foco por refino' }}
          </p>
          <p class="text-2xl font-bold" :class="useFocus ? 'text-blue-400' : 'text-gray-600'">
            {{ useFocus ? fmt(totalFocus) : '—' }}
          </p>
          <p v-if="useFocus && !isBudgetLimited" class="text-xs text-gray-500 mt-1">
            {{ fmt(focusCostPerRefine) }} / refino
          </p>
          <p v-if="isBudgetLimited" class="text-xs text-yellow-400 mt-1">
            {{ actionsWithFocus }} com / {{ actionsWithoutFocus }} sem
          </p>
        </div>
      </div>

      <!-- Detailed breakdown table -->
      <div class="overflow-x-auto mb-6">
        <table class="w-full text-sm border-collapse">
          <thead>
            <tr class="bg-gray-800 text-gray-400 text-left text-xs">
              <th class="px-3 py-2 rounded-tl-lg">Item</th>
              <th class="px-3 py-2">Qtd. (1×)</th>
              <th class="px-3 py-2">Preço unit.</th>
              <th class="px-3 py-2 text-red-400">Custo bruto (1×)</th>
              <th class="px-3 py-2 text-green-400">Retorno (1×)</th>
              <th class="px-3 py-2 text-yellow-400">Líquido (1×)</th>
              <th class="px-3 py-2 border-l border-gray-700">Qtd. ({{ quantity }}×)</th>
              <th class="px-3 py-2 text-red-400">Custo bruto ({{ quantity }}×)</th>
              <th class="px-3 py-2 text-green-400">Retorno ({{ quantity }}×)</th>
              <th class="px-3 py-2 rounded-tr-lg text-yellow-400">Líquido ({{ quantity }}×)</th>
            </tr>
          </thead>
          <tbody>
            <!-- Raw material row -->
            <tr class="border-t border-gray-800 hover:bg-gray-800/40 transition-colors">
              <td class="px-3 py-2 text-yellow-300">{{ mat.rawName }} {{ rawTierLabel }}</td>
              <td class="px-3 py-2 text-gray-400">{{ rawQty }}×</td>
              <td class="px-3 py-2">{{ fmt(rawPrice) }}</td>
              <td class="px-3 py-2 text-red-400">{{ fmt(rawGross) }}</td>
              <td class="px-3 py-2 text-green-400">{{ fmt(rawReturn) }}</td>
              <td class="px-3 py-2 font-semibold">{{ fmt(rawGross - rawReturn) }}</td>
              <td class="px-3 py-2 text-gray-400 border-l border-gray-700">{{ rawQtyTotal }}×</td>
              <td class="px-3 py-2 text-red-400">{{ fmt(rawGrossTotal) }}</td>
              <td class="px-3 py-2 text-green-400">{{ fmt(rawReturnTotal) }}</td>
              <td class="px-3 py-2 font-semibold">{{ fmt(rawGrossTotal - rawReturnTotal) }}</td>
            </tr>

            <!-- Sub-ingredient row -->
            <tr
              v-if="hasSubIngredient"
              class="border-t border-gray-800 hover:bg-gray-800/40 transition-colors"
            >
              <td class="px-3 py-2 text-yellow-300">
                {{ mat.refinedName }} {{ tierLabel(tier - 1, tier > 4 ? enchantment : 0) }}
              </td>
              <td class="px-3 py-2 text-gray-400">{{ subQty }}×</td>
              <td class="px-3 py-2">{{ fmt(subPrice) }}</td>
              <td class="px-3 py-2 text-red-400">{{ fmt(subGross) }}</td>
              <td class="px-3 py-2 text-green-400">{{ fmt(subReturn) }}</td>
              <td class="px-3 py-2 font-semibold">{{ fmt(subGross - subReturn) }}</td>
              <td class="px-3 py-2 text-gray-400 border-l border-gray-700">{{ subQtyTotal }}×</td>
              <td class="px-3 py-2 text-red-400">{{ fmt(subGrossTotal) }}</td>
              <td class="px-3 py-2 text-green-400">{{ fmt(subReturnTotal) }}</td>
              <td class="px-3 py-2 font-semibold">{{ fmt(subGrossTotal - subReturnTotal) }}</td>
            </tr>

            <!-- Total row -->
            <tr class="border-t-2 border-gray-700 bg-gray-800/60 font-semibold">
              <td class="px-3 py-2 text-yellow-400 rounded-bl-lg">TOTAL</td>
              <td class="px-3 py-2 text-gray-500">—</td>
              <td class="px-3 py-2 text-gray-500">—</td>
              <td class="px-3 py-2 text-red-400">{{ fmt(totalGross) }}</td>
              <td class="px-3 py-2 text-green-400">{{ fmt(totalReturn) }}</td>
              <td class="px-3 py-2 text-yellow-300">{{ fmt(costPerItem) }}</td>
              <td class="px-3 py-2 text-gray-500 border-l border-gray-700">—</td>
              <td class="px-3 py-2 text-red-400">{{ fmt(totalGrossTotal) }}</td>
              <td class="px-3 py-2 text-green-400">{{ fmt(totalReturnTotal) }}</td>
              <td class="px-3 py-2 text-yellow-300 text-base rounded-br-lg">
                {{ fmt(totalCost) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Focus breakdown (when focus is active) -->
      <div v-if="useFocus" class="bg-blue-900/20 border border-blue-700/40 rounded-xl p-4 mb-4">
        <h3 class="text-sm font-semibold text-blue-300 uppercase tracking-wider mb-2">
          Detalhamento do Foco
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p class="text-xs text-gray-500 mb-0.5">Custo base (Spec 0)</p>
            <p class="text-blue-300 font-semibold">
              {{ (BASE_FOCUS[tier] ?? 0).toLocaleString() }}
            </p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-0.5">Redução pela spec</p>
            <p class="text-blue-300 font-semibold">
              {{ Math.round(Math.min(specLevel * 0.6, 60)) }} %
            </p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-0.5">Foco por refino</p>
            <p class="text-blue-400 font-bold">{{ fmt(focusCostPerRefine) }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-0.5">Foco total utilizado</p>
            <p class="text-blue-400 font-bold">{{ fmt(focusUsed) }}</p>
          </div>
        </div>
        <!-- Budget-limited split -->
        <div
          v-if="isBudgetLimited"
          class="mt-4 border-t border-blue-700/40 pt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm"
        >
          <div>
            <p class="text-xs text-gray-500 mb-0.5">Foco disponível</p>
            <p class="text-yellow-300 font-semibold">{{ fmt(focusBudget) }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-0.5">Ações com foco</p>
            <p class="text-green-400 font-semibold">{{ actionsWithFocus }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-0.5">Ações sem foco</p>
            <p class="text-yellow-400 font-semibold">{{ actionsWithoutFocus }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-0.5">Custo médio / item</p>
            <p class="text-blue-300 font-semibold">{{ fmt(costPerItem) }}</p>
          </div>
        </div>
        <!-- Detail per segment when budget is limited -->
        <div v-if="isBudgetLimited" class="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div class="bg-green-900/20 border border-green-700/30 rounded-lg p-3">
            <p class="text-xs text-green-400 font-semibold mb-1">
              Com foco ({{ actionsWithFocus }}×)
            </p>
            <p class="text-xs text-gray-400">
              Taxa de retorno: <span class="text-green-300">{{ returnRatePct }} %</span>
            </p>
            <p class="text-xs text-gray-400">
              Custo / item: <span class="text-green-300">{{ fmt(costPerItemWithFocus) }}</span>
            </p>
          </div>
          <div class="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-3">
            <p class="text-xs text-yellow-400 font-semibold mb-1">
              Sem foco ({{ actionsWithoutFocus }}×)
            </p>
            <p class="text-xs text-gray-400">
              Taxa de retorno:
              <span class="text-yellow-300">{{ (returnRateNoFocus * 100).toFixed(1) }} %</span>
            </p>
            <p class="text-xs text-gray-400">
              Custo / item: <span class="text-yellow-300">{{ fmt(costPerItemNoFocus) }}</span>
            </p>
          </div>
        </div>
      </div>

      <!-- Nutrition breakdown -->
      <div class="bg-orange-900/20 border border-orange-700/40 rounded-xl p-4">
        <h3 class="text-sm font-semibold text-orange-300 uppercase tracking-wider mb-2">
          Nutrição da Estação
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p class="text-xs text-gray-500 mb-0.5">Nutrição por refino</p>
            <p class="text-orange-300 font-semibold">{{ nutritionPerAction }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-0.5">Taxa da estação</p>
            <p class="text-orange-300 font-semibold">{{ fmt(stationFee) }} prata / 100 nutrição</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-0.5">Custo de nutrição / item</p>
            <p class="text-orange-400 font-bold">{{ fmt(nutritionCostPerItem) }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-0.5">Custo total (×{{ quantity }})</p>
            <p class="text-orange-400 font-bold">{{ fmt(totalNutritionCost) }}</p>
          </div>
        </div>
      </div>

      <!-- Profit section -->
      <div v-if="sellPrice > 0" class="border-t border-gray-700 pt-5">
        <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Lucratividade
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div class="bg-gray-800 rounded-xl p-3 text-center">
            <p class="text-xs text-gray-400 mb-1">Preço de venda</p>
            <p class="text-xl font-bold text-gray-200">{{ fmt(sellPrice) }}</p>
          </div>
          <div class="bg-gray-800 rounded-xl p-3 text-center">
            <p class="text-xs text-gray-400 mb-1">Custo de refino</p>
            <p class="text-xl font-bold text-yellow-300">{{ fmt(costPerItem) }}</p>
            <p v-if="stationFee > 0" class="text-xs text-orange-400 mt-1">
              + {{ fmt(nutritionCostPerItem) }} nutrição
            </p>
          </div>
          <div class="bg-gray-800 rounded-xl p-3 text-center">
            <p class="text-xs text-gray-400 mb-1">Lucro por item</p>
            <p class="text-xl font-bold" :class="profitColorClass(profitPerItem)">
              {{ profitPerItem !== null ? fmt(profitPerItem) : '—' }}
            </p>
          </div>
          <div class="bg-gray-800 rounded-xl p-3 text-center">
            <p class="text-xs text-gray-400 mb-1">Lucro total (×{{ quantity }})</p>
            <p class="text-xl font-bold" :class="profitColorClass(totalProfit)">
              {{ totalProfit !== null ? fmt(totalProfit) : '—' }}
            </p>
          </div>
          <div class="rounded-xl p-3 text-center" :class="marginBgClass(profitMarginPct)">
            <p class="text-xs text-gray-400 mb-1">Margem de lucro</p>
            <p class="text-2xl font-bold" :class="marginColorClass(profitMarginPct)">
              {{ profitMarginPct !== null ? profitMarginPct.toFixed(1) + '%' : '—' }}
            </p>
            <p class="text-xs mt-1" :class="marginColorClass(profitMarginPct)">
              <template v-if="profitMarginPct !== null && profitMarginPct < 0">Prejuízo</template>
              <template v-else-if="profitMarginPct !== null && profitMarginPct < 10"
                >Margem baixa</template
              >
              <template v-else-if="profitMarginPct !== null && profitMarginPct < 20"
                >Margem boa</template
              >
              <template v-else-if="profitMarginPct !== null">Margem ótima</template>
            </p>
          </div>
        </div>
      </div>

      <!-- Formula note -->
      <!-- <div class="mt-5 bg-gray-800/50 rounded-lg p-3 text-xs text-gray-500">
        <p class="font-semibold text-gray-400 mb-1">Como o cálculo funciona</p>
        <p>
          <strong class="text-gray-300">Taxa de retorno</strong>: valores fixos conforme a interface
          do jogo (não dependem de tier, spec ou quantidade). Sem cidade: 15,2% / 23,7% / 29,3%
          (evento 0/10/20%); com cidade: 36,7% / 43,5% / 47,0%; com foco: +28,7pp / +25,2pp /
          +23,5pp / +19,2pp / +14,9pp / +12,6pp respectivamente. A spec só reduz o custo de foco em
          0,5% por nível (50% máx.). <strong class="text-gray-300">Custo líquido</strong> = custo
          bruto × (1 − RRR). <strong class="text-gray-300">Custo de nutrição por item</strong> =
          (nutrição do tier × taxa da estação ÷ 100) ÷ yield por refino. O lucro desconta tanto o
          custo de materiais quanto o custo de nutrição.
        </p>
      </div> -->
    </div>
  </div>
</template>
