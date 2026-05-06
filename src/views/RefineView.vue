<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRefineCalculator } from '@/composables/useRefineCalculator'
import {
  MATERIAL_OPTIONS,
  TIER_OPTIONS,
  ALL_CITIES,
  SUBTIER_COLORS,
  TIER_WEIGHT,
  fmt,
  fmtWeight,
  profitColorClass,
  marginColorClass,
  marginBgClass,
} from '@/data/refineData'
import { useAnnotationsStore } from '@/stores/annotations'

const {
  // State
  material,
  tier,
  enchantment,
  stoneEnchantment,
  city,
  eventBonus,
  useFocus,
  specT4,
  specT5,
  specT6,
  specT7,
  specT8,
  focusBudget,
  rawPrice,
  subPrice,
  quantity,
  sellPrice,
  sellPriceDirect,
  sellPriceOrder,
  stationFee,
  hasPremium,
  saleType,
  // Recipe
  hasSubtiers,
  hasStoneSubtier,
  hasSubIngredient,
  subQty,
  outputYield,
  rawQty,
  bonusCity,
  hasBonusCity,
  mat,
  // Display
  rawDisplayName,
  refinedDisplayName,
  subRefinedDisplayName,
  rawBadge,
  subBadge,
  refinedBadge,
  // Focus
  focusCostBase,
  focusCostPerRefine,
  focusSpecReductionPct,
  // Rates
  returnRate,
  returnRateNoFocus,
  returnRatePct,
  // Cost per action
  rawGross,
  subGross,
  totalGross,
  rawReturn,
  subReturn,
  totalReturn,
  // Scaled totals
  rawQtyTotal,
  subQtyTotal,
  rawGrossTotal,
  subGrossTotal,
  totalGrossTotal,
  rawReturnTotal,
  subReturnTotal,
  totalReturnTotal,
  // Focus split
  actionsWithFocus,
  actionsWithoutFocus,
  focusUsed,
  isBudgetLimited,
  costPerItemWithFocus,
  costPerItemNoFocus,
  costPerItem,
  totalCost,
  totalFocus,
  // Nutrition
  nutritionPerAction,
  nutritionCostPerItem,
  totalNutritionCost,
  // Profit
  profitPerItem,
  totalProfit,
  profitMarginPct,
  // Market tax & after-tax profit
  marketTaxRate,
  sellPriceAfterTax,
  profitPerItemAfterTax,
  totalProfitAfterTax,
  profitMarginPctAfterTax,
} = useRefineCalculator()

const annotationsStore = useAnnotationsStore()

// ── Item ID helpers (matches IDs stored by MarketView addAnnotation) ─────────
const RAW_TYPE_KEY: Record<string, string> = {
  wood: 'WOOD',
  hide: 'HIDE',
  ore: 'ORE',
  stone: 'ROCK',
  fiber: 'FIBER',
}
const SUB_TYPE_KEY: Record<string, string> = {
  wood: 'PLANKS',
  hide: 'LEATHER',
  ore: 'METALBAR',
  stone: 'STONEBLOCK',
  fiber: 'CLOTH',
}

// Reconstructed raw item ID — e.g. "T5_HIDE" or "T5_HIDE@1"
const rawItemId = computed(() => {
  const typeKey = RAW_TYPE_KEY[material.value]
  const enc = rawBadge.value.subtier
  return enc > 0
    ? `T${rawBadge.value.tier}_${typeKey}@${enc}`
    : `T${rawBadge.value.tier}_${typeKey}`
})
// Sub-ingredient item ID — e.g. "T4_LEATHER"
const subItemId = computed(() => {
  const typeKey = SUB_TYPE_KEY[material.value]
  const enc = subBadge.value.subtier
  return enc > 0
    ? `T${subBadge.value.tier}_${typeKey}@${enc}`
    : `T${subBadge.value.tier}_${typeKey}`
})

const rawEntries = computed(() => annotationsStore.entriesForItem(rawItemId.value))
const subEntries = computed(() => annotationsStore.entriesForItem(subItemId.value))

// Refined item ID — e.g. "T5_LEATHER" or "T5_LEATHER@1"
const refinedItemId = computed(() => {
  const typeKey = SUB_TYPE_KEY[material.value]
  const enc = refinedBadge.value.subtier
  return enc > 0
    ? `T${refinedBadge.value.tier}_${typeKey}@${enc}`
    : `T${refinedBadge.value.tier}_${typeKey}`
})
const sellEntries = computed(() => annotationsStore.entriesForItem(refinedItemId.value))

const showRawChest = ref(false)
const showSubChest = ref(false)
const showSellDirectChest = ref(false)
const showSellOrderChest = ref(false)

const PRICE_FIELD_LABEL: Record<string, string> = {
  sell_price_min: 'Venda Mín.',
  sell_price_max: 'Venda Máx.',
  buy_price_max: 'Compra',
}
</script>

<template>
  <div class="bg-gray-950/90 text-gray-100 rounded-lg p-6">
    <h1 class="text-2xl font-bold mb-1 text-yellow-400">Calculadora de Refino</h1>
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
              {{ opt.recipe }}
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
          <p class="text-xs text-gray-500 mb-1.5">Receita (encantamento da pedra)</p>
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
            <span class="bg-gray-700 text-yellow-300 px-2 py-1 rounded flex items-center gap-1.5">
              <strong>{{ rawQty }}×</strong>
              <span :class="['text-xs font-bold px-1 rounded', rawBadge.bg]"
                ><span :style="{ color: rawBadge.tierColor }">T{{ rawBadge.tier }}</span
                ><span v-if="rawBadge.subtier > 0" :style="{ color: rawBadge.subtierColor! }"
                  >.{{ rawBadge.subtier }}</span
                ></span
              >
              {{ rawDisplayName }}
            </span>
            <span v-if="hasSubIngredient" class="text-gray-500 text-xs">+</span>
            <span
              v-if="hasSubIngredient"
              class="bg-gray-700 text-yellow-300 px-2 py-1 rounded flex items-center gap-1.5"
            >
              <strong>{{ subQty }}×</strong>
              <span :class="['text-xs font-bold px-1 rounded', subBadge.bg]"
                ><span :style="{ color: subBadge.tierColor }">T{{ subBadge.tier }}</span
                ><span v-if="subBadge.subtier > 0" :style="{ color: subBadge.subtierColor! }"
                  >.{{ subBadge.subtier }}</span
                ></span
              >
              {{ subRefinedDisplayName }}
            </span>
            <span class="text-gray-500 text-xs">→</span>
            <span
              class="bg-yellow-400/15 border border-yellow-400/30 text-yellow-300 px-2 py-1 rounded flex items-center gap-1.5"
            >
              <strong>{{ outputYield }}×</strong>
              <span :class="['text-xs font-bold px-1 rounded', refinedBadge.bg]"
                ><span :style="{ color: refinedBadge.tierColor }">T{{ refinedBadge.tier }}</span
                ><span
                  v-if="refinedBadge.subtier > 0"
                  :style="{ color: refinedBadge.subtierColor! }"
                  >.{{ refinedBadge.subtier }}</span
                ></span
              >
              {{ refinedDisplayName }}
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
          <div v-if="useFocus" class="space-y-3">
            <p class="text-xs text-gray-400">Especialização por Tier (0 – 100)</p>
            <div class="grid grid-cols-5 gap-2">
              <div class="flex flex-col gap-1">
                <label class="text-xs text-gray-500 text-center">T4</label>
                <input
                  type="number"
                  v-model.number="specT4"
                  min="0"
                  max="100"
                  class="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-1 py-2 outline-none focus:ring-1 focus:ring-yellow-400 text-center"
                />
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-xs text-gray-500 text-center">T5</label>
                <input
                  type="number"
                  v-model.number="specT5"
                  min="0"
                  max="100"
                  class="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-1 py-2 outline-none focus:ring-1 focus:ring-yellow-400 text-center"
                />
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-xs text-gray-500 text-center">T6</label>
                <input
                  type="number"
                  v-model.number="specT6"
                  min="0"
                  max="100"
                  class="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-1 py-2 outline-none focus:ring-1 focus:ring-yellow-400 text-center"
                />
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-xs text-gray-500 text-center">T7</label>
                <input
                  type="number"
                  v-model.number="specT7"
                  min="0"
                  max="100"
                  class="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-1 py-2 outline-none focus:ring-1 focus:ring-yellow-400 text-center"
                />
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-xs text-gray-500 text-center">T8</label>
                <input
                  type="number"
                  v-model.number="specT8"
                  min="0"
                  max="100"
                  class="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-1 py-2 outline-none focus:ring-1 focus:ring-yellow-400 text-center"
                />
              </div>
            </div>
            <p v-if="tier >= 4" class="text-xs text-gray-500">
              Redução no custo de foco: {{ focusSpecReductionPct.toFixed(1) }}% — não afeta o
              retorno
            </p>
            <p v-else class="text-xs text-gray-500">T2/T3: custo de foco fixo, spec não reduz.</p>
            <label class="text-xs text-gray-400 block mt-2">Foco disponível (máx. 30.000)</label>
            <input
              type="number"
              v-model.number="focusBudget"
              min="0"
              max="30000"
              class="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-yellow-400"
            />
            <p v-if="isBudgetLimited" class="text-xs text-yellow-400">
              Foco suficiente para {{ actionsWithFocus }}
              {{ actionsWithFocus !== 1 ? 'ações' : 'ação' }}. {{ actionsWithoutFocus }}
              {{ actionsWithoutFocus !== 1 ? 'ações' : 'ação' }} sem foco.
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
            <div class="flex items-center gap-1">
              <label class="text-xs text-gray-400 mb-1 block">Preço de</label>
              <div
                class="bg-gray-700 text-yellow-300 px-1 py-0.5 rounded flex items-center gap-1.5 text-xs mb-1.5 w-fit"
              >
                <span :class="['text-xs font-bold px-1 rounded', rawBadge.bg]"
                  ><span :style="{ color: rawBadge.tierColor }">T{{ rawBadge.tier }}</span
                  ><span v-if="rawBadge.subtier > 0" :style="{ color: rawBadge.subtierColor! }"
                    >.{{ rawBadge.subtier }}</span
                  ></span
                >
                {{ rawDisplayName }}
              </div>
              <!-- Chest picker trigger -->
              <div class="relative mb-1.5 ml-auto">
                <button
                  v-if="rawEntries.length"
                  @click="showRawChest = !showRawChest"
                  class="flex items-center gap-1 text-xs bg-yellow-400/15 hover:bg-yellow-400/30 border border-yellow-400/40 text-yellow-300 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                  title="Usar valor do baú de anotações"
                >
                  🪙 Baú <span class="font-bold">{{ rawEntries.length }}</span>
                </button>
                <div
                  v-if="showRawChest && rawEntries.length"
                  class="absolute right-0 top-full mt-1 z-50 bg-gray-800 border border-gray-600 rounded-xl shadow-xl min-w-[220px] p-2"
                >
                  <p class="text-xs text-gray-500 px-2 pb-1 mb-1 border-b border-gray-700">
                    Selecionar valor anotado
                  </p>
                  <button
                    v-for="(entry, i) in rawEntries"
                    :key="i"
                    @click="((rawPrice = entry.price), (showRawChest = false))"
                    class="w-full text-left flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer group"
                  >
                    <span class="text-xs text-gray-400"
                      >{{ PRICE_FIELD_LABEL[entry.priceField] }} · {{ entry.city }}</span
                    >
                    <span
                      class="text-sm font-semibold text-yellow-300 group-hover:text-yellow-200"
                      >{{ entry.price.toLocaleString('pt-BR') }}</span
                    >
                  </button>
                </div>
              </div>
            </div>
            <input
              type="number"
              v-model.number="rawPrice"
              min="0"
              placeholder="0"
              class="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-yellow-400 placeholder-gray-600"
            />
          </div>
          <div v-if="hasSubIngredient">
            <div class="flex items-center gap-1">
              <label class="text-xs text-gray-400 mb-1 block">Preço de</label>
              <div
                class="bg-gray-700 text-yellow-300 px-1 py-0.5 rounded flex items-center gap-1.5 text-xs mb-1.5 w-fit"
              >
                <span :class="['text-xs font-bold px-1 rounded', subBadge.bg]"
                  ><span :style="{ color: subBadge.tierColor }">T{{ subBadge.tier }}</span
                  ><span v-if="subBadge.subtier > 0" :style="{ color: subBadge.subtierColor! }"
                    >.{{ subBadge.subtier }}</span
                  ></span
                >
                {{ subRefinedDisplayName }}
              </div>
              <!-- Chest picker trigger (sub) -->
              <div class="relative mb-1.5 ml-auto">
                <button
                  v-if="subEntries.length"
                  @click="showSubChest = !showSubChest"
                  class="flex items-center gap-1 text-xs bg-yellow-400/15 hover:bg-yellow-400/30 border border-yellow-400/40 text-yellow-300 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                  title="Usar valor do baú de anotações"
                >
                  🪙 Baú <span class="font-bold">{{ subEntries.length }}</span>
                </button>
                <div
                  v-if="showSubChest && subEntries.length"
                  class="absolute right-0 top-full mt-1 z-50 bg-gray-800 border border-gray-600 rounded-xl shadow-xl min-w-[220px] p-2"
                >
                  <p class="text-xs text-gray-500 px-2 pb-1 mb-1 border-b border-gray-700">
                    Selecionar valor anotado
                  </p>
                  <button
                    v-for="(entry, i) in subEntries"
                    :key="i"
                    @click="((subPrice = entry.price), (showSubChest = false))"
                    class="w-full text-left flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer group"
                  >
                    <span class="text-xs text-gray-400"
                      >{{ PRICE_FIELD_LABEL[entry.priceField] }} · {{ entry.city }}</span
                    >
                    <span
                      class="text-sm font-semibold text-yellow-300 group-hover:text-yellow-200"
                      >{{ entry.price.toLocaleString('pt-BR') }}</span
                    >
                  </button>
                </div>
              </div>
            </div>
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
            <!-- Refined item badge + label -->
            <div class="flex items-center gap-1.5 mb-2">
              <label class="text-xs text-gray-400">Preço de venda</label>
              <div
                class="bg-yellow-400/15 border border-yellow-400/30 text-yellow-300 px-1 py-0.5 rounded flex items-center gap-1.5 text-xs w-fit"
              >
                <span :class="['text-xs font-bold px-1 rounded', refinedBadge.bg]"
                  ><span :style="{ color: refinedBadge.tierColor }">T{{ refinedBadge.tier }}</span
                  ><span
                    v-if="refinedBadge.subtier > 0"
                    :style="{ color: refinedBadge.subtierColor! }"
                    >.{{ refinedBadge.subtier }}</span
                  ></span
                >
                {{ refinedDisplayName }}
              </div>
            </div>

            <!-- Direct sale price -->
            <div class="mb-2">
              <div class="flex items-center mb-1">
                <label class="text-xs text-gray-400 mr-1">Venda direta</label>
                <span class="text-gray-600 text-xs">(opcional)</span>
                <div class="relative">
                  <button
                    v-if="sellEntries.length"
                    @click="showSellDirectChest = !showSellDirectChest"
                    class="flex items-center gap-1 text-xs bg-yellow-400/15 hover:bg-yellow-400/30 border border-yellow-400/40 text-yellow-300 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                    title="Usar valor do baú de anotações"
                  >
                    🪙 Baú <span class="font-bold">{{ sellEntries.length }}</span>
                  </button>
                  <div
                    v-if="showSellDirectChest && sellEntries.length"
                    class="absolute right-0 top-full mt-1 z-50 bg-gray-800 border border-gray-600 rounded-xl shadow-xl min-w-[220px] p-2"
                  >
                    <p class="text-xs text-gray-500 px-2 pb-1 mb-1 border-b border-gray-700">
                      Selecionar valor anotado
                    </p>
                    <button
                      v-for="(entry, i) in sellEntries"
                      :key="i"
                      @click="((sellPriceDirect = entry.price), (showSellDirectChest = false))"
                      class="w-full text-left flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer group"
                    >
                      <span class="text-xs text-gray-400"
                        >{{ PRICE_FIELD_LABEL[entry.priceField] }} · {{ entry.city }}</span
                      >
                      <span
                        class="text-sm font-semibold text-yellow-300 group-hover:text-yellow-200"
                        >{{ entry.price.toLocaleString('pt-BR') }}</span
                      >
                    </button>
                  </div>
                </div>
              </div>
              <input
                type="number"
                v-model.number="sellPriceDirect"
                min="0"
                placeholder="0"
                class="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-yellow-400 placeholder-gray-600"
              />
            </div>

            <!-- Sell order price -->
            <div>
              <div class="flex items-center mb-1">
                <label class="text-xs text-gray-400 mr-1">Pedido de venda</label>
                <span class="text-gray-600 text-xs">(opcional)</span>
                <div class="relative">
                  <button
                    v-if="sellEntries.length"
                    @click="showSellOrderChest = !showSellOrderChest"
                    class="flex items-center gap-1 text-xs bg-yellow-400/15 hover:bg-yellow-400/30 border border-yellow-400/40 text-yellow-300 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                    title="Usar valor do baú de anotações"
                  >
                    🪙 Baú <span class="font-bold">{{ sellEntries.length }}</span>
                  </button>
                  <div
                    v-if="showSellOrderChest && sellEntries.length"
                    class="absolute right-0 top-full mt-1 z-50 bg-gray-800 border border-gray-600 rounded-xl shadow-xl min-w-[220px] p-2"
                  >
                    <p class="text-xs text-gray-500 px-2 pb-1 mb-1 border-b border-gray-700">
                      Selecionar valor anotado
                    </p>
                    <button
                      v-for="(entry, i) in sellEntries"
                      :key="i"
                      @click="((sellPriceOrder = entry.price), (showSellOrderChest = false))"
                      class="w-full text-left flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer group"
                    >
                      <span class="text-xs text-gray-400"
                        >{{ PRICE_FIELD_LABEL[entry.priceField] }} · {{ entry.city }}</span
                      >
                      <span
                        class="text-sm font-semibold text-yellow-300 group-hover:text-yellow-200"
                        >{{ entry.price.toLocaleString('pt-BR') }}</span
                      >
                    </button>
                  </div>
                </div>
              </div>
              <input
                type="number"
                v-model.number="sellPriceOrder"
                min="0"
                placeholder="0"
                class="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-yellow-400 placeholder-gray-600"
              />
            </div>
          </div>

          <!-- Market tax settings -->
          <div class="border-t border-gray-700 pt-3">
            <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Taxa de Mercado
            </h3>
            <label
              class="flex items-center gap-2 cursor-pointer hover:text-yellow-300 transition-colors mb-3"
            >
              <input type="checkbox" v-model="hasPremium" class="accent-yellow-400" />
              <span class="text-sm">Premium ativo</span>
            </label>
            <div class="flex flex-col gap-1.5">
              <label
                v-for="opt in [
                  { label: 'Pedido de venda', value: 'order' },
                  { label: 'Venda direta', value: 'direct' },
                ]"
                :key="opt.value"
                class="flex items-center gap-2 cursor-pointer hover:text-yellow-300 transition-colors"
              >
                <input
                  type="radio"
                  :value="opt.value"
                  v-model="saleType"
                  class="accent-yellow-400"
                />
                <span class="text-sm">{{ opt.label }}</span>
                <span class="ml-auto text-xs text-gray-500">
                  {{
                    opt.value === 'direct'
                      ? hasPremium
                        ? '4%'
                        : '8%'
                      : hasPremium
                        ? '6,5%'
                        : '10,5%'
                  }}
                </span>
              </label>
            </div>
            <p class="text-xs text-yellow-400 mt-2">
              Taxa aplicada: {{ (marketTaxRate * 100).toFixed(1) }}%
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
            <span class="bg-gray-800 px-2 py-1 rounded-full text-gray-300 flex items-center gap-1">
              <span :class="['text-xs font-bold px-1 rounded', rawBadge.bg]"
                ><span :style="{ color: rawBadge.tierColor }">T{{ rawBadge.tier }}</span
                ><span v-if="rawBadge.subtier > 0" :style="{ color: rawBadge.subtierColor! }"
                  >.{{ rawBadge.subtier }}</span
                ></span
              >
              {{ rawDisplayName }}
            </span>
            <span class="bg-gray-800 px-2 py-1 rounded-full text-gray-300">
              {{ city }}
            </span>
            <span
              v-if="hasBonusCity"
              class="bg-yellow-400/20 text-yellow-300 px-2 py-1 rounded-full border border-yellow-400/30"
            >
              Bônus cidade
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
              Foco · −{{ focusSpecReductionPct.toFixed(1) }}%
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
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
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
          <p class="text-xs text-gray-400 mb-1">Custo total bruto ({{ quantity }}×)</p>
          <p class="text-2xl font-bold text-yellow-300">
            {{ fmt(totalGrossTotal + totalNutritionCost) }}
          </p>
          <p v-if="stationFee > 0" class="text-xs text-orange-400 mt-1">
            {{ fmt(totalGrossTotal) }} materiais + {{ fmt(totalNutritionCost) }} nutrição
          </p>
        </div>
        <div class="bg-gray-800 rounded-xl p-4 text-center">
          <p class="text-xs text-gray-400 mb-1">Custo total líquido ({{ quantity }}×)</p>
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
              <th class="px-3 py-2 border-l border-gray-700 text-sky-400 rounded-tr-lg">Peso</th>
              <th class="px-3 py-2 text-red-400">Custo bruto ({{ quantity }}×)</th>
              <th class="px-3 py-2 text-green-400">Retorno ({{ quantity }}×)</th>
              <th class="px-3 py-2 text-yellow-400">Líquido ({{ quantity }}×)</th>
            </tr>
          </thead>
          <tbody>
            <!-- Raw material row -->
            <tr class="border-t border-gray-800 hover:bg-gray-800/40 transition-colors">
              <td class="px-3 py-2 text-yellow-300">
                <span :class="['text-xs font-bold px-1 rounded mr-1', rawBadge.bg]"
                  ><span :style="{ color: rawBadge.tierColor }">T{{ rawBadge.tier }}</span
                  ><span v-if="rawBadge.subtier > 0" :style="{ color: rawBadge.subtierColor! }"
                    >.{{ rawBadge.subtier }}</span
                  ></span
                >{{ rawDisplayName }}
              </td>
              <td class="px-3 py-2 text-gray-400">{{ rawQty }}×</td>
              <td class="px-3 py-2">{{ fmt(rawPrice) }}</td>
              <td class="px-3 py-2 text-red-400">{{ fmt(rawGross) }}</td>
              <td class="px-3 py-2 text-green-400">{{ fmt(rawReturn) }}</td>
              <td class="px-3 py-2 font-semibold">{{ fmt(rawGross - rawReturn) }}</td>
              <td class="px-3 py-2 text-gray-400 border-l border-gray-700">{{ rawQtyTotal }}×</td>
              <td class="px-3 py-2 text-sky-300 border-l border-gray-700 whitespace-nowrap">
                {{ fmtWeight(rawQtyTotal * (TIER_WEIGHT[rawBadge.tier] ?? 0)) }}
              </td>
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
                <span :class="['text-xs font-bold px-1 rounded mr-1', subBadge.bg]"
                  ><span :style="{ color: subBadge.tierColor }">T{{ subBadge.tier }}</span
                  ><span v-if="subBadge.subtier > 0" :style="{ color: subBadge.subtierColor! }"
                    >.{{ subBadge.subtier }}</span
                  ></span
                >{{ subRefinedDisplayName }}
              </td>
              <td class="px-3 py-2 text-gray-400">{{ subQty }}×</td>
              <td class="px-3 py-2">{{ fmt(subPrice) }}</td>
              <td class="px-3 py-2 text-red-400">{{ fmt(subGross) }}</td>
              <td class="px-3 py-2 text-green-400">{{ fmt(subReturn) }}</td>
              <td class="px-3 py-2 font-semibold">{{ fmt(subGross - subReturn) }}</td>
              <td class="px-3 py-2 text-gray-400 border-l border-gray-700">{{ subQtyTotal }}×</td>
              <td class="px-3 py-2 text-sky-300 border-l border-gray-700 whitespace-nowrap">
                {{ fmtWeight(subQtyTotal * (TIER_WEIGHT[subBadge.tier] ?? 0)) }}
              </td>
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
              <td
                class="px-3 py-2 text-sky-300 border-l border-gray-700 whitespace-nowrap rounded-br-lg"
              >
                {{
                  fmtWeight(
                    rawQtyTotal * (TIER_WEIGHT[rawBadge.tier] ?? 0) +
                      (hasSubIngredient ? subQtyTotal * (TIER_WEIGHT[subBadge.tier] ?? 0) : 0),
                  )
                }}
              </td>
              <td class="px-3 py-2 text-red-400">{{ fmt(totalGrossTotal) }}</td>
              <td class="px-3 py-2 text-green-400">{{ fmt(totalReturnTotal) }}</td>
              <td class="px-3 py-2 text-yellow-300 text-base">
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
              {{ focusCostBase.toLocaleString() }}
            </p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-0.5">Redução pela spec</p>
            <p class="text-blue-300 font-semibold">{{ focusSpecReductionPct.toFixed(1) }} %</p>
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
            <p class="text-xs text-gray-500 mb-0.5">Custo total ({{ quantity }}×)</p>
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
            <p class="text-xs text-gray-400 mb-1">Custo líquido de refino (1×)</p>
            <p class="text-xl font-bold text-yellow-300">
              {{ fmt(costPerItem + nutritionCostPerItem) }}
            </p>
            <p v-if="stationFee > 0" class="text-xs text-orange-400 mt-1">
              {{ fmt(costPerItem) }} materiais + {{ fmt(nutritionCostPerItem) }} nutrição
            </p>
          </div>
          <div class="bg-gray-800 rounded-xl p-3 text-center">
            <p class="text-xs text-gray-400 mb-1">Lucro por item (1×)</p>
            <p class="text-xl font-bold" :class="profitColorClass(profitPerItem)">
              {{ profitPerItem !== null ? fmt(profitPerItem) : '—' }}
            </p>
          </div>
          <div class="bg-gray-800 rounded-xl p-3 text-center">
            <p class="text-xs text-gray-400 mb-1">Lucro total ({{ quantity }}×)</p>
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

        <!-- After-tax profit -->
        <div class="mt-4 bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <div class="flex items-center gap-2 mb-3">
            <h4 class="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Após taxa de mercado
            </h4>
            <span
              class="text-xs bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 px-2 py-0.5 rounded-full font-semibold"
            >
              {{ (marketTaxRate * 100).toFixed(1) }}% ({{
                hasPremium ? 'Premium' : 'Sem premium'
              }}
              · {{ saleType === 'direct' ? 'Venda direta' : 'Pedido de venda' }})
            </span>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-gray-800 rounded-xl p-3 text-center">
              <p class="text-xs text-gray-400 mb-1">Preço líquido recebido</p>
              <p class="text-xl font-bold text-gray-200">{{ fmt(sellPriceAfterTax) }}</p>
              <p class="text-xs text-gray-500 mt-1">
                −{{ fmt(sellPrice - sellPriceAfterTax) }} de taxa
              </p>
            </div>
            <div class="bg-gray-800 rounded-xl p-3 text-center">
              <p class="text-xs text-gray-400 mb-1">Lucro / item após taxa</p>
              <p class="text-xl font-bold" :class="profitColorClass(profitPerItemAfterTax)">
                {{ profitPerItemAfterTax !== null ? fmt(profitPerItemAfterTax) : '—' }}
              </p>
            </div>
            <div class="bg-gray-800 rounded-xl p-3 text-center">
              <p class="text-xs text-gray-400 mb-1">Lucro total após taxa ({{ quantity }}×)</p>
              <p class="text-xl font-bold" :class="profitColorClass(totalProfitAfterTax)">
                {{ totalProfitAfterTax !== null ? fmt(totalProfitAfterTax) : '—' }}
              </p>
            </div>
            <div class="rounded-xl p-3 text-center" :class="marginBgClass(profitMarginPctAfterTax)">
              <p class="text-xs text-gray-400 mb-1">Margem após taxa</p>
              <p class="text-2xl font-bold" :class="marginColorClass(profitMarginPctAfterTax)">
                {{
                  profitMarginPctAfterTax !== null ? profitMarginPctAfterTax.toFixed(1) + '%' : '—'
                }}
              </p>
              <p class="text-xs mt-1" :class="marginColorClass(profitMarginPctAfterTax)">
                <template v-if="profitMarginPctAfterTax !== null && profitMarginPctAfterTax < 0"
                  >Prejuízo</template
                >
                <template
                  v-else-if="profitMarginPctAfterTax !== null && profitMarginPctAfterTax < 10"
                  >Margem baixa</template
                >
                <template
                  v-else-if="profitMarginPctAfterTax !== null && profitMarginPctAfterTax < 20"
                  >Margem boa</template
                >
                <template v-else-if="profitMarginPctAfterTax !== null">Margem ótima</template>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
