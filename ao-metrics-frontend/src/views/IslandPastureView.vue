<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAnnotationsStore } from '@/stores/annotations'
import {
  usePastureCalculator,
  PRODUCTION_OPTIONS,
  SECONDARY_OPTIONS,
  RIDING_OPTIONS,
  formatGrowthTime,
} from '@/composables/usePastureCalculator'
import {
  tierBg,
  tierTextColor,
  fmt,
  profitColorClass,
  marginColorClass,
  marginBgClass,
} from '@/composables/useFarmingCalculator'

const {
  mode,
  specBreeder,
  specAnimal,
  premium,
  pastures,
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
  adultsPerPasture,
  adultsTotal,
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
  isRidingSustainable,
  youngDeficitRidingTotal,
  restockCostRidingTotal,
  netProfitAfterRestockRidingTotal,
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
} = usePastureCalculator()

// ── Annotation chest picker (production tab) ────────────────────────────────
const annotationsStore = useAnnotationsStore()

const PRICE_FIELD_LABEL: Record<string, string> = {
  sell_price_min: 'Venda Mín.',
  sell_price_max: 'Venda Máx.',
  buy_price_max: 'Compra',
}

const PRODUCTION_ANIMAL_IDS: Record<string, { young: string; adult: string; food: string }> = {
  pinto: { young: 'T3_FARM_CHICKEN_BABY', adult: 'T3_FARM_CHICKEN_GROWN', food: 'T3_WHEAT' },
  cabrito: { young: 'T4_FARM_GOAT_BABY', adult: 'T4_FARM_GOAT_GROWN', food: 'T4_TURNIP' },
  gansinho: { young: 'T5_FARM_GOOSE_BABY', adult: 'T5_FARM_GOOSE_GROWN', food: 'T5_CABBAGE' },
  cordeiro: { young: 'T6_FARM_SHEEP_BABY', adult: 'T6_FARM_SHEEP_GROWN', food: 'T6_POTATO' },
  leitao: { young: 'T7_FARM_PIG_BABY', adult: 'T7_FARM_PIG_GROWN', food: 'T7_CORN' },
  novilhoCorte: { young: 'T8_FARM_COW_BABY', adult: 'T8_FARM_COW_GROWN', food: 'T8_PUMPKIN' },
}

const youngItemId = computed(() => PRODUCTION_ANIMAL_IDS[productionAnimal.value]?.young ?? '')
const adultItemId = computed(() => PRODUCTION_ANIMAL_IDS[productionAnimal.value]?.adult ?? '')
const foodItemId = computed(() => PRODUCTION_ANIMAL_IDS[productionAnimal.value]?.food ?? '')

const youngEntries = computed(() => annotationsStore.entriesForItem(youngItemId.value))
const adultEntries = computed(() => annotationsStore.entriesForItem(adultItemId.value))
const foodEntries = computed(() => annotationsStore.entriesForItem(foodItemId.value))

const showYoungChest = ref(false)
const showAdultChest = ref(false)
const showFoodChest = ref(false)

// ── Annotation chest picker (riding tab) ────────────────────────────────────
const RIDING_ANIMAL_IDS: Record<string, { young: string; adult: string }> = {
  potroIniciante: { young: 'T3_FARM_HORSE_BABY', adult: 'T3_FARM_HORSE_GROWN' },
  potroAdepto: { young: 'T4_FARM_HORSE_BABY', adult: 'T4_FARM_HORSE_GROWN' },
  potroPerito: { young: 'T5_FARM_HORSE_BABY', adult: 'T5_FARM_HORSE_GROWN' },
  potroMestre: { young: 'T6_FARM_HORSE_BABY', adult: 'T6_FARM_HORSE_GROWN' },
  potroGraoMestre: { young: 'T7_FARM_HORSE_BABY', adult: 'T7_FARM_HORSE_GROWN' },
  potroAnciao: { young: 'T8_FARM_HORSE_BABY', adult: 'T8_FARM_HORSE_GROWN' },
  novilhoIniciante: { young: 'T3_FARM_OX_BABY', adult: 'T3_FARM_OX_GROWN' },
  novilhoAdepto: { young: 'T4_FARM_OX_BABY', adult: 'T4_FARM_OX_GROWN' },
  novilhoPerito: { young: 'T5_FARM_OX_BABY', adult: 'T5_FARM_OX_GROWN' },
  novilhoMestre: { young: 'T6_FARM_OX_BABY', adult: 'T6_FARM_OX_GROWN' },
  novilhoGraoMestre: { young: 'T7_FARM_OX_BABY', adult: 'T7_FARM_OX_GROWN' },
  novilhoAnciao: { young: 'T8_FARM_OX_BABY', adult: 'T8_FARM_OX_GROWN' },
  gamoAdepto: { young: 'T4_FARM_GIANTSTAG_BABY', adult: 'T4_FARM_GIANTSTAG_GROWN' },
  alceFilhote: { young: 'T6_FARM_GIANTSTAG_MOOSE_BABY', adult: 'T6_FARM_GIANTSTAG_MOOSE_GROWN' },
}

const ridingYoungItemId = computed(() => RIDING_ANIMAL_IDS[ridingAnimal.value]?.young ?? '')
const ridingAdultItemId = computed(() => RIDING_ANIMAL_IDS[ridingAnimal.value]?.adult ?? '')

const ridingYoungEntries = computed(() => annotationsStore.entriesForItem(ridingYoungItemId.value))
const ridingAdultEntries = computed(() => annotationsStore.entriesForItem(ridingAdultItemId.value))

const showRidingYoungChest = ref(false)
const showRidingAdultChest = ref(false)

// Offspring restock cost (when production is not self-sustaining)
const youngDeficitTotal = computed(() =>
  Math.max(0, 9 * pastures.value - Math.round(adultsTotal.value)),
)
const restockCostYoungTotal = computed(() => youngDeficitTotal.value * priceYoung.value)
const netProfitAfterRestockYoungTotal = computed(
  () => netProfitProdTotal.value - restockCostYoungTotal.value,
)

// Keep base food quantity at 18; the effectiveFoodMultiplier (×0.5) handles the fav-food discount
watch(
  favFoodActive,
  () => {
    foodPerAnimal.value = 18
  },
  { immediate: true },
)
</script>

<template>
  <div class="bg-gray-950/90 text-gray-100 rounded-lg p-6">
    <h1 class="text-2xl font-bold mb-1 text-yellow-400">AO Calculadora de Pastos</h1>
    <p class="text-sm text-gray-500 mb-4">
      Calcule o lucro da criação de animais em pastos de ilha, considerando foco, premium e produção
      secundária.
    </p>

    <!-- ── Mode tabs ─────────────────────────────────────────────────── -->
    <div class="flex gap-2 mb-6">
      <button
        @click="mode = 'production'"
        :class="[
          'px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer',
          mode === 'production'
            ? 'bg-yellow-400 text-gray-950'
            : 'bg-gray-800 text-gray-300 hover:bg-gray-700',
        ]"
      >
        Animais de Produção
      </button>
      <button
        @click="mode = 'riding'"
        :class="[
          'px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer',
          mode === 'riding'
            ? 'bg-yellow-400 text-gray-950'
            : 'bg-gray-800 text-gray-300 hover:bg-gray-700',
        ]"
      >
        Animais de Montaria
      </button>
      <button
        @click="mode = 'secondary'"
        :class="[
          'px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer',
          mode === 'secondary'
            ? 'bg-yellow-400 text-gray-950'
            : 'bg-gray-800 text-gray-300 hover:bg-gray-700',
        ]"
      >
        Produções Secundárias
      </button>
    </div>

    <!-- ════════════════════════════════════════════════════════════════ -->
    <!-- PRODUCTION MODE                                                  -->
    <!-- ════════════════════════════════════════════════════════════════ -->
    <template v-if="mode === 'production'">
      <!-- Row 1 -->
      <div class="flex flex-col md:flex-row items-stretch gap-2 mb-6">
        <!-- Animal selector -->
        <div class="bg-gray-900 rounded-xl p-4 flex-1">
          <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Animal</h2>
          <div class="flex flex-col gap-1.5">
            <button
              v-for="opt in PRODUCTION_OPTIONS"
              :key="opt.value"
              @click="productionAnimal = opt.value"
              :class="[
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer text-left',
                productionAnimal === opt.value
                  ? 'bg-yellow-400 text-gray-950'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700',
              ]"
            >
              <span
                :class="['text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0', tierBg(opt.tier)]"
                :style="{ color: tierTextColor(opt.tier) }"
              >
                T{{ opt.tier }}
              </span>
              {{ opt.label }}
            </button>
          </div>

          <!-- Yield info card -->
          <div class="mt-4 bg-gray-800 rounded-lg p-3">
            <p class="text-xs text-gray-400 uppercase tracking-wider mb-2">% retorno de prole</p>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p class="text-xs text-gray-500 mb-0.5">Sem foco</p>
                <p class="font-semibold text-gray-300">
                  {{ (productionData.yieldUnfocused * 100).toFixed(2) }}%
                </p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-0.5">Com foco</p>
                <p class="font-semibold text-green-400">
                  {{ (productionData.yieldFocused * 100).toFixed(2) }}%
                </p>
              </div>
            </div>
            <div class="mt-2 pt-2 border-t border-gray-700">
              <p class="text-xs text-gray-500 mb-0.5">Comida favorita</p>
              <p class="text-xs font-semibold text-yellow-300">{{ productionData.favFood }}</p>
            </div>
          </div>
        </div>

        <!-- Arrow -->
        <div
          class="flex items-center justify-center flex-shrink-0 text-gray-600 py-1 md:py-0 md:px-1"
        >
          <svg
            class="hidden md:block w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
          <svg
            class="block md:hidden w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>

        <!-- Focus & Config -->
        <div class="bg-gray-900 rounded-xl p-4 flex-1">
          <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Foco &amp; Especialização
          </h2>

          <div class="grid grid-cols-2 gap-3 mb-4">
            <div class="flex flex-col gap-1">
              <label class="text-xs text-gray-500"
                >Especialização em Criador de Animais (0–100)</label
              >
              <input
                type="number"
                v-model.number="specBreeder"
                min="0"
                max="100"
                class="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-yellow-400 text-center"
              />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs text-gray-500"
                >Especialização em {{ productionData.specName }} (0–100)</label
              >
              <input
                type="number"
                v-model.number="specAnimal"
                min="0"
                max="100"
                class="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-yellow-400 text-center"
              />
            </div>
          </div>

          <div class="bg-gray-800 rounded-lg p-3 mb-4 text-sm">
            <div class="grid grid-cols-3 gap-2">
              <div>
                <p class="text-xs text-gray-500 mb-0.5">Eficiência</p>
                <p class="font-semibold text-blue-300">{{ focusEfficiency }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-0.5">Redução</p>
                <p class="font-semibold text-blue-300">{{ focusReductionPct.toFixed(1) }}%</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-0.5">Foco / animal</p>
                <p class="font-bold text-blue-400">{{ fmt(focusPerAnimal) }}</p>
              </div>
            </div>
          </div>

          <div class="border-t border-gray-700 pt-4">
            <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Configurações
            </h3>
            <div class="space-y-2">
              <label
                class="flex items-center gap-2 cursor-pointer hover:text-yellow-300 transition-colors"
              >
                <input type="checkbox" v-model="premium" class="accent-yellow-400" />
                <span class="text-sm">Premium ativo</span>
                <span class="ml-auto text-xs text-gray-500">Ciclo ×2 mais rápido</span>
              </label>
              <label
                class="flex items-center gap-2 cursor-pointer hover:text-orange-300 transition-colors"
              >
                <input type="checkbox" v-model="favFoodActive" class="accent-orange-400" />
                <span class="text-sm">Comida favorita ({{ productionData.favFood }})</span>
                <span class="ml-auto text-xs text-gray-500">Comida ÷2</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Arrow -->
        <div
          class="flex items-center justify-center flex-shrink-0 text-gray-600 py-1 md:py-0 md:px-1"
        >
          <svg
            class="hidden md:block w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
          <svg
            class="block md:hidden w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>

        <!-- Pasture & Animals -->
        <div class="bg-gray-900 rounded-xl p-4 flex-1">
          <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Pasto &amp; Animais
          </h2>

          <div class="mb-4">
            <label class="text-xs text-gray-500 mb-2 block">Número de pastos</label>
            <input
              type="number"
              v-model.number="pastures"
              min="1"
              class="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-yellow-400"
            />
          </div>

          <div class="border-t border-gray-700 pt-4 mb-4">
            <label class="text-xs text-gray-500 mb-2 block">
              Animais com foco (máx. {{ 9 * pastures }})
            </label>
            <input
              type="number"
              v-model.number="animalsWithFocus"
              min="0"
              :max="9 * pastures"
              class="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-yellow-400"
            />
            <div class="flex items-center justify-between text-xs text-gray-500 mt-1.5">
              <span>{{ animalsWithFocus }} com foco · {{ animalsUnfocused }} sem foco</span>
              <span class="text-blue-400 font-semibold">{{ fmt(focusProdTotal) }} foco total</span>
            </div>
          </div>

          <!-- Cycle summary -->
          <div class="bg-gray-800 rounded-lg p-3 text-sm">
            <p class="text-xs text-gray-400 uppercase tracking-wider mb-2">Resumo do ciclo</p>
            <div class="space-y-1 text-xs">
              <div class="flex justify-between">
                <span class="text-gray-500">Animais colocados</span>
                <span class="text-gray-300 font-semibold">
                  9 × {{ pastures }} = {{ totalAnimals }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Tempo de crescimento</span>
                <span class="text-gray-300 font-semibold">{{
                  formatGrowthTime(growthHoursProd)
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Filhotes esperados / pasto</span>
                <span
                  :class="[
                    'font-semibold',
                    isProductionSustainable ? 'text-green-400' : 'text-yellow-300',
                  ]"
                >
                  ~{{ adultsPerPasture.toFixed(2) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Row 2: mobile arrow ─────────────────────────────────────── -->
      <div class="flex md:hidden items-center justify-center text-gray-600 mb-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      <!-- Row 2: Prices + Summary -->
      <div class="flex flex-col md:flex-row items-stretch gap-2 mb-6">
        <!-- Prices -->
        <div class="bg-gray-900 rounded-xl p-4 flex-1">
          <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Preços (prata)
          </h2>
          <div class="space-y-3">
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="text-xs text-gray-400">
                  Preço de
                  <span class="text-yellow-300 font-semibold">{{ productionData.youngName }}</span>
                  (filhote)
                </label>
                <div class="relative">
                  <button
                    v-if="youngEntries.length"
                    @click="showYoungChest = !showYoungChest"
                    class="flex items-center gap-1 text-xs bg-yellow-400/15 hover:bg-yellow-400/30 border border-yellow-400/40 text-yellow-300 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                    title="Usar valor do baú de anotações"
                  >
                    🪙 Baú <span class="font-bold">{{ youngEntries.length }}</span>
                  </button>
                  <div
                    v-if="showYoungChest && youngEntries.length"
                    class="absolute right-0 top-full mt-1 z-50 bg-gray-800 border border-gray-600 rounded-xl shadow-xl min-w-[220px] p-2"
                  >
                    <p class="text-xs text-gray-500 px-2 pb-1 mb-1 border-b border-gray-700">
                      Selecionar valor anotado
                    </p>
                    <button
                      v-for="(entry, i) in youngEntries"
                      :key="i"
                      @click="((priceYoung = entry.price), (showYoungChest = false))"
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
                v-model.number="priceYoung"
                min="0"
                placeholder="0"
                class="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-yellow-400 placeholder-gray-600"
              />
            </div>
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="text-xs text-gray-400">
                  Preço de
                  <span class="text-yellow-300 font-semibold">{{ productionData.adultName }}</span>
                  (adulto)
                </label>
                <div class="relative">
                  <button
                    v-if="adultEntries.length"
                    @click="showAdultChest = !showAdultChest"
                    class="flex items-center gap-1 text-xs bg-yellow-400/15 hover:bg-yellow-400/30 border border-yellow-400/40 text-yellow-300 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                    title="Usar valor do baú de anotações"
                  >
                    🪙 Baú <span class="font-bold">{{ adultEntries.length }}</span>
                  </button>
                  <div
                    v-if="showAdultChest && adultEntries.length"
                    class="absolute right-0 top-full mt-1 z-50 bg-gray-800 border border-gray-600 rounded-xl shadow-xl min-w-[220px] p-2"
                  >
                    <p class="text-xs text-gray-500 px-2 pb-1 mb-1 border-b border-gray-700">
                      Selecionar valor anotado
                    </p>
                    <button
                      v-for="(entry, i) in adultEntries"
                      :key="i"
                      @click="((priceAdult = entry.price), (showAdultChest = false))"
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
                v-model.number="priceAdult"
                min="0"
                placeholder="0"
                class="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-yellow-400 placeholder-gray-600"
              />
            </div>
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="text-xs text-gray-400">
                  Preço da comida / por item <span class="text-gray-600 text-xs">(opcional)</span>
                </label>
                <div class="relative">
                  <button
                    v-if="foodEntries.length"
                    @click="showFoodChest = !showFoodChest"
                    class="flex items-center gap-1 text-xs bg-yellow-400/15 hover:bg-yellow-400/30 border border-yellow-400/40 text-yellow-300 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                    title="Usar valor do baú de anotações"
                  >
                    🪙 Baú <span class="font-bold">{{ foodEntries.length }}</span>
                  </button>
                  <div
                    v-if="showFoodChest && foodEntries.length"
                    class="absolute right-0 top-full mt-1 z-50 bg-gray-800 border border-gray-600 rounded-xl shadow-xl min-w-[220px] p-2"
                  >
                    <p class="text-xs text-gray-500 px-2 pb-1 mb-1 border-b border-gray-700">
                      Selecionar valor anotado
                    </p>
                    <button
                      v-for="(entry, i) in foodEntries"
                      :key="i"
                      @click="((priceFood = entry.price), (showFoodChest = false))"
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
                v-model.number="priceFood"
                min="0"
                placeholder="0"
                class="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-yellow-400 placeholder-gray-600"
              />
            </div>
            <div>
              <label class="text-xs text-gray-400 mb-1 block"> Qtd. comida / animal / ciclo </label>
              <input
                type="number"
                :value="favFoodActive ? 9 : 18"
                readonly
                class="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 outline-none cursor-not-allowed opacity-60"
              />
              <p class="text-xs text-gray-600 mt-1">
                {{
                  favFoodActive ? 'Comida favorita: ÷2 do consumo base' : 'Consumo base de comida'
                }}
              </p>
            </div>
          </div>
        </div>

        <!-- Arrow -->
        <div
          class="flex items-center justify-center flex-shrink-0 text-gray-600 py-1 md:py-0 md:px-1"
        >
          <svg
            class="hidden md:block w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
          <svg
            class="block md:hidden w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>

        <!-- Summary -->
        <div class="bg-gray-900 rounded-xl p-4 flex-1 flex flex-col gap-4">
          <div>
            <p class="text-xs text-gray-500 uppercase tracking-wider mb-2">Configuração ativa</p>
            <div class="flex flex-wrap gap-1.5 text-xs">
              <span class="bg-gray-800 px-2 py-1 rounded-full text-gray-300">{{
                productionData.youngName
              }}</span>
              <span
                v-if="premium"
                class="bg-yellow-400/20 text-yellow-300 px-2 py-1 rounded-full border border-yellow-400/30"
                >Premium</span
              >
              <span
                v-if="favFoodActive"
                class="bg-orange-400/20 text-orange-300 px-2 py-1 rounded-full border border-orange-400/30"
                >Comida favorita</span
              >
              <span
                v-if="animalsWithFocus > 0"
                class="bg-blue-900/40 text-blue-300 px-2 py-1 rounded-full border border-blue-700/40"
                >Foco</span
              >
              <span class="bg-gray-700 text-yellow-300 px-2 py-1 rounded-full font-semibold"
                >{{ pastures }} pasto{{ pastures !== 1 ? 's' : '' }}</span
              >
            </div>
          </div>

          <div class="bg-gray-800 rounded-lg p-3">
            <p class="text-xs text-gray-400 uppercase tracking-wider mb-2">
              Produção por pasto (1 ciclo)
            </p>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p class="text-xs text-gray-500 mb-0.5">Filhotes esperados</p>
                <p
                  :class="[
                    'font-semibold',
                    isProductionSustainable ? 'text-green-400' : 'text-yellow-300',
                  ]"
                >
                  ~{{ adultsPerPasture.toFixed(2) }}
                </p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-0.5">Animais adultos retornados</p>
                <p class="font-semibold text-green-300">9 / pasto</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-0.5">Foco gasto</p>
                <p class="text-blue-400 font-semibold">{{ fmt(focusProdPerPasture) }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-0.5">Custo comida</p>
                <p class="text-red-400 font-semibold">{{ fmt(foodCostPerPasture) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Results -->
      <div class="bg-gray-900 rounded-xl p-6">
        <h2 class="text-lg font-semibold text-yellow-400 mb-5">Resultados - Produção</h2>

        <!-- KPI per pasture -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-gray-800 rounded-xl p-4 text-center">
            <p class="text-xs text-gray-400 mb-1">Receita / pasto</p>
            <p class="text-2xl font-bold text-yellow-300">{{ fmt(revenueProdPerPasture) }}</p>
            <p class="text-xs text-gray-600 mt-1">prata</p>
          </div>
          <div class="bg-gray-800 rounded-xl p-4 text-center">
            <p class="text-xs text-gray-400 mb-1">Custo / pasto</p>
            <p class="text-2xl font-bold text-red-400">{{ fmt(costProdPerPasture) }}</p>
            <p class="text-xs text-gray-600 mt-1">animais + comida</p>
          </div>
          <div class="bg-gray-800 rounded-xl p-4 text-center col-span-2 md:col-span-1">
            <p class="text-xs text-gray-400 mb-1">Lucro líquido / pasto</p>
            <p class="text-2xl font-bold" :class="profitColorClass(netProfitProdPerPasture)">
              {{ fmt(netProfitProdPerPasture) }}
            </p>
            <p class="text-xs text-gray-600 mt-1">prata</p>
          </div>
          <div class="bg-gray-800 rounded-xl p-4 text-center">
            <p class="text-xs text-gray-400 mb-1">Foco / pasto</p>
            <p
              class="text-2xl font-bold"
              :class="animalsWithFocus > 0 ? 'text-blue-400' : 'text-gray-600'"
            >
              {{ animalsWithFocus > 0 ? fmt(focusProdPerPasture) : '—' }}
            </p>
          </div>
        </div>

        <!-- Multi-pasture totals -->
        <div v-if="pastures > 1" class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-blue-900/20 border border-blue-700/40 rounded-xl p-4 text-center">
            <p class="text-xs text-gray-400 mb-1">Receita total / {{ pastures }} pastos</p>
            <p class="text-xl font-bold text-yellow-300">{{ fmt(revenueProdTotal) }}</p>
          </div>
          <div class="bg-red-900/20 border border-red-700/40 rounded-xl p-4 text-center">
            <p class="text-xs text-gray-400 mb-1">Custo total / {{ pastures }} pastos</p>
            <p class="text-xl font-bold text-red-400">{{ fmt(costProdTotal) }}</p>
          </div>
          <div
            :class="[
              'rounded-xl p-4 text-center col-span-2 md:col-span-1 border',
              netProfitProdTotal >= 0
                ? 'bg-green-900/20 border-green-700/40'
                : 'bg-red-900/20 border-red-700/40',
            ]"
          >
            <p class="text-xs text-gray-400 mb-1">Lucro total / {{ pastures }} pastos</p>
            <p class="text-xl font-bold" :class="profitColorClass(netProfitProdTotal)">
              {{ fmt(netProfitProdTotal) }}
            </p>
          </div>
          <div class="bg-blue-900/20 border border-blue-700/40 rounded-xl p-4 text-center">
            <p class="text-xs text-gray-400 mb-1">Foco total / {{ pastures }} pastos</p>
            <p class="text-xl font-bold text-blue-400">
              {{ animalsWithFocus > 0 ? fmt(focusProdTotal) : '—' }}
            </p>
          </div>
        </div>

        <!-- Breakdown table -->
        <div class="overflow-x-auto mb-6">
          <table class="w-full text-sm border-collapse">
            <thead>
              <tr class="bg-gray-800 text-gray-400 text-left text-xs">
                <th class="px-3 py-2 rounded-tl-lg">Item</th>
                <th class="px-3 py-2">Qtd. (1 pasto)</th>
                <th class="px-3 py-2">Preço unit.</th>
                <th class="px-3 py-2 text-yellow-400">Valor (1 pasto)</th>
                <th v-if="pastures > 1" class="px-3 py-2 border-l border-gray-700">
                  Qtd. ({{ pastures }} pastos)
                </th>
                <th v-if="pastures > 1" class="px-3 py-2 text-yellow-400 rounded-tr-lg">
                  Valor ({{ pastures }} pastos)
                </th>
                <th v-else class="px-3 py-2 rounded-tr-lg"></th>
              </tr>
            </thead>
            <tbody>
              <!-- Normal mode: adults row -->
              <tr class="border-t border-gray-800 hover:bg-gray-800/40 transition-colors">
                <td class="px-3 py-2 text-yellow-300">
                  <span
                    :class="['text-xs font-bold px-1 rounded mr-1', tierBg(productionData.tier)]"
                    :style="{ color: tierTextColor(productionData.tier) }"
                    >T{{ productionData.tier }}</span
                  >
                  {{ productionData.adultName }}
                </td>
                <td class="px-3 py-2 text-gray-400">9</td>
                <td class="px-3 py-2">{{ fmt(priceAdult) }}</td>
                <td class="px-3 py-2 text-green-400 font-semibold">
                  {{ fmt(9 * priceAdult) }}
                </td>
                <td v-if="pastures > 1" class="px-3 py-2 text-gray-400 border-l border-gray-700">
                  {{ 9 * pastures }}
                </td>
                <td v-if="pastures > 1" class="px-3 py-2 text-green-400 font-semibold">
                  {{ fmt(9 * pastures * priceAdult) }}
                </td>
              </tr>
              <!-- Normal mode: offspring (filhotes) row -->
              <tr class="border-t border-gray-800 hover:bg-gray-800/40 transition-colors">
                <td class="px-3 py-2 text-yellow-300">
                  <span
                    :class="['text-xs font-bold px-1 rounded mr-1', tierBg(productionData.tier)]"
                    :style="{ color: tierTextColor(productionData.tier) }"
                    >T{{ productionData.tier }}</span
                  >
                  {{ productionData.youngName }} (retorno)
                </td>
                <td class="px-3 py-2 text-gray-400">~{{ adultsPerPasture.toFixed(1) }}</td>
                <td class="px-3 py-2">{{ fmt(priceYoung) }}</td>
                <td class="px-3 py-2 text-green-400 font-semibold">
                  {{ fmt(adultsPerPasture * priceYoung) }}
                </td>
                <td v-if="pastures > 1" class="px-3 py-2 text-gray-400 border-l border-gray-700">
                  ~{{ adultsTotal.toFixed(1) }}
                </td>
                <td v-if="pastures > 1" class="px-3 py-2 text-green-400 font-semibold">
                  {{ fmt(adultsTotal * priceYoung) }}
                </td>
              </tr>
              <tr class="border-t border-gray-800 hover:bg-gray-800/40 transition-colors">
                <td class="px-3 py-2 text-red-400">
                  <span
                    :class="['text-xs font-bold px-1 rounded mr-1', tierBg(productionData.tier)]"
                    :style="{ color: tierTextColor(productionData.tier) }"
                    >T{{ productionData.tier }}</span
                  >
                  {{ productionData.youngName }} (custo)
                </td>
                <td class="px-3 py-2 text-gray-400">9</td>
                <td class="px-3 py-2">{{ fmt(priceYoung) }}</td>
                <td class="px-3 py-2 text-red-400 font-semibold">−{{ fmt(9 * priceYoung) }}</td>
                <td v-if="pastures > 1" class="px-3 py-2 text-gray-400 border-l border-gray-700">
                  {{ 9 * pastures }}
                </td>
                <td v-if="pastures > 1" class="px-3 py-2 text-red-400 font-semibold">
                  −{{ fmt(9 * pastures * priceYoung) }}
                </td>
              </tr>
              <tr
                v-if="foodPerAnimal > 0"
                class="border-t border-gray-800 hover:bg-gray-800/40 transition-colors"
              >
                <td class="px-3 py-2 text-red-400">
                  <span
                    :class="['text-xs font-bold px-1 rounded mr-1', tierBg(productionData.tier)]"
                    :style="{ color: tierTextColor(productionData.tier) }"
                    >T{{ productionData.tier }}</span
                  >
                  {{ productionData.favFood }} (custo)
                </td>
                <td class="px-3 py-2 text-gray-400">{{ (favFoodActive ? 9 : 18) * 9 }}</td>
                <td class="px-3 py-2">{{ fmt(priceFood) }}</td>
                <td class="px-3 py-2 text-red-400 font-semibold">−{{ fmt(foodCostPerPasture) }}</td>
                <td v-if="pastures > 1" class="px-3 py-2 text-gray-400 border-l border-gray-700">
                  {{ (favFoodActive ? 9 : 18) * 9 * pastures }}
                </td>
                <td v-if="pastures > 1" class="px-3 py-2 text-red-400 font-semibold">
                  −{{ fmt(foodCostTotal) }}
                </td>
              </tr>
              <tr class="border-t-2 border-gray-700 bg-gray-800/60 font-semibold">
                <td class="px-3 py-2 text-yellow-400 rounded-bl-lg">LUCRO LÍQUIDO</td>
                <td class="px-3 py-2 text-gray-500">—</td>
                <td class="px-3 py-2 text-gray-500">—</td>
                <td class="px-3 py-2 text-base" :class="profitColorClass(netProfitProdPerPasture)">
                  {{ fmt(netProfitProdPerPasture) }}
                </td>
                <td v-if="pastures > 1" class="px-3 py-2 text-gray-500 border-l border-gray-700">
                  —
                </td>
                <td
                  v-if="pastures > 1"
                  class="px-3 py-2 text-base rounded-br-lg"
                  :class="profitColorClass(netProfitProdTotal)"
                >
                  {{ fmt(netProfitProdTotal) }}
                </td>
                <td v-else class="px-3 py-2 rounded-br-lg"></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Focus breakdown -->
        <div
          v-if="animalsWithFocus > 0"
          class="bg-blue-900/20 border border-blue-700/40 rounded-xl p-4 mb-4"
        >
          <h3 class="text-sm font-semibold text-blue-300 uppercase tracking-wider mb-2">
            Detalhamento do Foco
          </h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p class="text-xs text-gray-500 mb-0.5">Eficiência total</p>
              <p class="text-blue-300 font-semibold">{{ focusEfficiency }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-0.5">Redução de custo</p>
              <p class="text-blue-300 font-semibold">{{ focusReductionPct.toFixed(1) }}%</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-0.5">Foco por animal</p>
              <p class="text-blue-400 font-bold">{{ fmt(focusPerAnimal) }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-0.5">Foco por pasto</p>
              <p class="text-blue-400 font-bold">{{ fmt(focusProdPerPasture) }}</p>
            </div>
          </div>
          <div v-if="pastures > 1" class="mt-3 border-t border-blue-700/40 pt-3">
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p class="text-xs text-gray-500 mb-0.5">Foco total ({{ pastures }} pastos)</p>
                <p class="text-blue-400 font-bold">{{ fmt(focusProdTotal) }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-0.5">Animais com foco total</p>
                <p class="text-gray-300 font-semibold">{{ animalsWithFocus }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-0.5">Foco base (sem spec.)</p>
                <p class="text-gray-400 font-semibold">1.000 / animal</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Offspring sustainability banner -->
        <div
          :class="[
            'rounded-xl p-4 mb-4 border',
            isProductionSustainable
              ? 'bg-green-900/20 border-green-700/40'
              : 'bg-yellow-900/20 border-yellow-700/40',
          ]"
        >
          <h3
            :class="[
              'text-sm font-semibold uppercase tracking-wider mb-2',
              isProductionSustainable ? 'text-green-300' : 'text-yellow-300',
            ]"
          >
            Sustentabilidade de Filhotes
          </h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p class="text-xs text-gray-500 mb-0.5">Animais colocados / pasto</p>
              <p class="text-gray-300 font-semibold">9</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-0.5">Filhotes esperados / pasto</p>
              <p
                :class="[
                  'font-semibold',
                  isProductionSustainable ? 'text-green-400' : 'text-yellow-300',
                ]"
              >
                ~{{ adultsPerPasture.toFixed(2) }}
              </p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-0.5">% retorno com foco</p>
              <p class="text-gray-300 font-semibold">
                {{ (productionData.yieldFocused * 100).toFixed(2) }}%
              </p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-0.5">% retorno sem foco</p>
              <p class="text-gray-300 font-semibold">
                {{ (productionData.yieldUnfocused * 100).toFixed(2) }}%
              </p>
            </div>
          </div>
          <p v-if="!isProductionSustainable" class="text-xs text-yellow-300 mt-2">
            ⚠️ Com {{ animalsWithFocus }} animal(is) com foco e a combinação atual de % retorno,
            você produz menos filhotes do que animais colocados. Considere usar mais foco ou
            aumentar a especialização.
          </p>
          <p v-else class="text-xs text-green-300 mt-2">
            ✓ Você recupera filhotes suficientes para manter ou expandir o ciclo de produção.
          </p>

          <!-- Restock cost block (only when unsustainable and priceYoung is set) -->
          <div
            v-if="!isProductionSustainable && priceYoung > 0"
            class="mt-4 pt-4 border-t border-yellow-700/40"
          >
            <p class="text-xs font-semibold text-yellow-300 uppercase tracking-wider mb-3">
              Custo de Reposição de Filhotes
            </p>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p class="text-xs text-gray-500 mb-0.5">
                  Déficit total ({{ pastures }} pasto{{ pastures !== 1 ? 's' : '' }})
                </p>
                <p class="font-semibold text-red-400">~{{ youngDeficitTotal }} filhote(s)</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-0.5">Gasto p/ reposição (total)</p>
                <p class="font-semibold text-orange-400">{{ fmt(restockCostYoungTotal) }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-0.5">Lucro após reposição (total)</p>
                <p class="font-semibold" :class="profitColorClass(netProfitAfterRestockYoungTotal)">
                  {{ fmt(netProfitAfterRestockYoungTotal) }}
                </p>
              </div>
            </div>
          </div>
          <p
            v-else-if="!isProductionSustainable && priceYoung === 0"
            class="text-xs text-gray-500 mt-3"
          >
            Informe o preço do filhote para calcular o custo de reposição.
          </p>
        </div>

        <!-- Profitability -->
        <div class="border-t border-gray-700 pt-5">
          <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Lucratividade ({{ pastures > 1 ? pastures + ' pastos' : '1 pasto' }})
          </h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-gray-800 rounded-xl p-3 text-center">
              <p class="text-xs text-gray-400 mb-1">Receita total</p>
              <p class="text-xl font-bold text-gray-200">{{ fmt(revenueProdTotal) }}</p>
            </div>
            <div class="bg-gray-800 rounded-xl p-3 text-center">
              <p class="text-xs text-gray-400 mb-1">Custo total</p>
              <p class="text-xl font-bold text-red-400">{{ fmt(costProdTotal) }}</p>
            </div>
            <div class="bg-gray-800 rounded-xl p-3 text-center">
              <p class="text-xs text-gray-400 mb-1">Lucro líquido total</p>
              <p class="text-xl font-bold" :class="profitColorClass(netProfitProdTotal)">
                {{ fmt(netProfitProdTotal) }}
              </p>
            </div>
            <div class="rounded-xl p-3 text-center" :class="marginBgClass(profitMarginProd)">
              <p class="text-xs text-gray-400 mb-1">Margem de lucro</p>
              <p class="text-2xl font-bold" :class="marginColorClass(profitMarginProd)">
                {{ profitMarginProd !== null ? profitMarginProd.toFixed(1) + '%' : '—' }}
              </p>
              <p class="text-xs mt-1" :class="marginColorClass(profitMarginProd)">
                <template v-if="profitMarginProd !== null && profitMarginProd < 0"
                  >Prejuízo</template
                >
                <template v-else-if="profitMarginProd !== null && profitMarginProd < 10"
                  >Margem baixa</template
                >
                <template v-else-if="profitMarginProd !== null && profitMarginProd < 20"
                  >Margem boa</template
                >
                <template v-else-if="profitMarginProd !== null">Margem ótima</template>
              </p>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ════════════════════════════════════════════════════════════════ -->
    <!-- RIDING MODE                                                       -->
    <!-- ════════════════════════════════════════════════════════════════ -->
    <template v-if="mode === 'riding'">
      <!-- Row 1 -->
      <div class="flex flex-col md:flex-row items-stretch gap-2 mb-6">
        <!-- Animal selector -->
        <div class="bg-gray-900 rounded-xl p-4 flex-1">
          <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Animal de Montaria
          </h2>
          <div class="flex flex-col gap-1.5 max-h-80 overflow-y-auto pr-1">
            <button
              v-for="opt in RIDING_OPTIONS"
              :key="opt.value"
              @click="ridingAnimal = opt.value"
              :class="[
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer text-left',
                ridingAnimal === opt.value
                  ? 'bg-yellow-400 text-gray-950'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700',
              ]"
            >
              <span
                :class="['text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0', tierBg(opt.tier)]"
                :style="{ color: tierTextColor(opt.tier) }"
              >
                T{{ opt.tier }}
              </span>
              {{ opt.label }}
            </button>
          </div>

          <!-- Animal info -->
          <div class="mt-4 bg-gray-800 rounded-lg p-3">
            <p class="text-xs text-gray-400 uppercase tracking-wider mb-2">Dados do animal</p>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p class="text-gray-500 mb-0.5">Retorno base (sem foco)</p>
                <p class="font-semibold text-gray-300">
                  {{ (ridingData.yieldUnfocused * ridingData.maxNurtures * 100).toFixed(2) }}%
                </p>
              </div>
              <div>
                <p class="text-gray-500 mb-0.5">Aumento com foco / dia</p>
                <p class="font-semibold text-blue-400">
                  +{{ ((ridingData.yieldFocused - ridingData.yieldUnfocused) * 100).toFixed(2) }}%
                </p>
              </div>
              <div>
                <p class="text-gray-500 mb-0.5">Dias com foco possíveis</p>
                <p class="font-semibold text-yellow-300">{{ ridingData.maxNurtures }}×</p>
              </div>
              <div>
                <p class="text-gray-500 mb-0.5">Retorno total (todo foco)</p>
                <p class="font-semibold text-green-400">
                  {{ (ridingData.yieldFocused * ridingData.maxNurtures * 100).toFixed(2) }}%
                </p>
              </div>
              <div>
                <p class="text-gray-500 mb-0.5">Crescimento (sem premium)</p>
                <p class="font-semibold text-gray-300">
                  {{ formatGrowthTime(ridingData.growthHoursBase) }}
                </p>
              </div>
              <div>
                <p class="text-gray-500 mb-0.5">Comida / nutrição (44h)</p>
                <p class="font-semibold text-orange-300">
                  {{ ridingData.foodPer24h.toFixed(2).replace(/\.00$/, '') }}
                </p>
              </div>
              <div>
                <p class="text-gray-500 mb-0.5">Comida total / animal (ciclo)</p>
                <p class="font-semibold text-orange-400">
                  {{ foodPerAnimalRiding.toFixed(2).replace(/\.00$/, '') }}
                </p>
              </div>
            </div>
            <div class="mt-2 pt-2 border-t border-gray-700 text-xs">
              <p class="text-gray-500 mb-0.5">Resultado após crescimento</p>
              <p class="text-yellow-300 font-semibold">{{ ridingData.adultName }}</p>
            </div>
          </div>
        </div>

        <!-- Arrow -->
        <div
          class="flex items-center justify-center flex-shrink-0 text-gray-600 py-1 md:py-0 md:px-1"
        >
          <svg
            class="hidden md:block w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
          <svg
            class="block md:hidden w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>

        <!-- Focus & Config -->
        <div class="bg-gray-900 rounded-xl p-4 flex-1">
          <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Foco &amp; Especialização
          </h2>

          <div class="grid grid-cols-2 gap-3 mb-4">
            <div class="flex flex-col gap-1">
              <label class="text-xs text-gray-500"
                >Especialização em Criador de Animais (0–100)</label
              >
              <input
                type="number"
                v-model.number="specBreeder"
                min="0"
                max="100"
                class="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-yellow-400 text-center"
              />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs text-gray-500"
                >Especialização em {{ ridingData.specName }} (0–100)</label
              >
              <input
                type="number"
                v-model.number="specAnimal"
                min="0"
                max="100"
                class="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-yellow-400 text-center"
              />
            </div>
          </div>

          <div class="bg-gray-800 rounded-lg p-3 mb-4 text-sm">
            <div class="grid grid-cols-3 gap-2">
              <div>
                <p class="text-xs text-gray-500 mb-0.5">Eficiência</p>
                <p class="font-semibold text-blue-300">{{ focusEfficiency }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-0.5">Redução</p>
                <p class="font-semibold text-blue-300">{{ focusReductionPct.toFixed(1) }}%</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-0.5">Foco / nutrição</p>
                <p class="font-bold text-blue-400">{{ fmt(focusPerAnimal) }}</p>
              </div>
            </div>
          </div>

          <div class="border-t border-gray-700 pt-4">
            <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Configurações
            </h3>
            <div class="space-y-2">
              <label
                class="flex items-center gap-2 cursor-pointer hover:text-yellow-300 transition-colors"
              >
                <input type="checkbox" v-model="premium" class="accent-yellow-400" />
                <span class="text-sm">Premium ativo</span>
                <span class="ml-auto text-xs text-gray-500"
                  >Ciclo: {{ formatGrowthTime(ridingGrowthHours) }}</span
                >
              </label>
            </div>
          </div>

          <!-- Cycle info -->
          <div class="mt-4 bg-gray-800 rounded-lg p-3 text-xs">
            <p class="text-gray-400 uppercase tracking-wider mb-2">Ciclo atual</p>
            <div class="space-y-1">
              <div class="flex justify-between">
                <span class="text-gray-500">Tempo de crescimento</span>
                <span class="text-gray-300 font-semibold">{{
                  formatGrowthTime(ridingGrowthHours)
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Nutrições / animal</span>
                <span class="text-yellow-300 font-semibold">{{ ridingData.maxNurtures }}×</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Prole acumulada (com foco)</span>
                <span class="text-green-400 font-semibold"
                  >{{ (ridingData.yieldFocused * ridingData.maxNurtures * 100).toFixed(1) }}%</span
                >
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Prole acumulada (sem foco)</span>
                <span class="text-gray-300 font-semibold"
                  >{{
                    (ridingData.yieldUnfocused * ridingData.maxNurtures * 100).toFixed(1)
                  }}%</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Arrow -->
        <div
          class="flex items-center justify-center flex-shrink-0 text-gray-600 py-1 md:py-0 md:px-1"
        >
          <svg
            class="hidden md:block w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
          <svg
            class="block md:hidden w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>

        <!-- Pasture & Nutrition -->
        <div class="bg-gray-900 rounded-xl p-4 flex-1">
          <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Pasto &amp; Nutrição
          </h2>

          <div class="mb-4">
            <label class="text-xs text-gray-500 mb-2 block">Número de pastos</label>
            <input
              type="number"
              v-model.number="pastures"
              min="1"
              class="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-yellow-400"
            />
          </div>

          <div class="border-t border-gray-700 pt-4 mb-4">
            <label class="text-xs text-gray-500 mb-2 block">
              Com foco (máx. {{ 9 * pastures }})
            </label>
            <input
              type="number"
              v-model.number="ridingAnimalsWithFocus"
              min="0"
              :max="9 * pastures"
              class="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-yellow-400"
            />
            <div class="flex items-center justify-between text-xs text-gray-500 mt-1.5">
              <span
                >{{ ridingAnimalsWithFocus }} com foco ·
                {{ 9 * pastures - ridingAnimalsWithFocus }} sem foco</span
              >
              <span class="text-blue-400 font-semibold">{{ fmt(focusRidingTotal) }} foco</span>
            </div>
          </div>

          <!-- Cycle summary -->
          <div class="bg-gray-800 rounded-lg p-3 text-sm">
            <p class="text-xs text-gray-400 uppercase tracking-wider mb-2">Resumo do ciclo</p>
            <div class="space-y-1 text-xs">
              <div class="flex justify-between">
                <span class="text-gray-500">Animais totais</span>
                <span class="text-gray-300 font-semibold"
                  >9 × {{ pastures }} = {{ 9 * pastures }}</span
                >
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Filhotes esperados / pasto</span>
                <span class="text-green-400 font-semibold"
                  >~{{ expectedFoalsPerPasture.toFixed(2) }}</span
                >
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Comida / animal (total)</span>
                <span class="text-orange-300 font-semibold">{{ foodPerAnimalRiding }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Row 2: mobile arrow ─────────────────────────────────────── -->
      <div class="flex md:hidden items-center justify-center text-gray-600 mb-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      <!-- Row 2: Prices + Summary -->
      <div class="flex flex-col md:flex-row items-stretch gap-2 mb-6">
        <!-- Prices -->
        <div class="bg-gray-900 rounded-xl p-4 flex-1">
          <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Preços (prata)
          </h2>
          <div class="space-y-3">
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="text-xs text-gray-400">
                  Preço de
                  <span class="text-yellow-300 font-semibold">{{ ridingData.youngName }}</span>
                </label>
                <div class="relative">
                  <button
                    v-if="ridingYoungEntries.length"
                    @click="showRidingYoungChest = !showRidingYoungChest"
                    class="flex items-center gap-1 text-xs bg-yellow-400/15 hover:bg-yellow-400/30 border border-yellow-400/40 text-yellow-300 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                    title="Usar valor do baú de anotações"
                  >
                    🪙 Baú <span class="font-bold">{{ ridingYoungEntries.length }}</span>
                  </button>
                  <div
                    v-if="showRidingYoungChest && ridingYoungEntries.length"
                    class="absolute right-0 top-full mt-1 z-50 bg-gray-800 border border-gray-600 rounded-xl shadow-xl min-w-[220px] p-2"
                  >
                    <p class="text-xs text-gray-500 px-2 pb-1 mb-1 border-b border-gray-700">
                      Selecionar valor anotado
                    </p>
                    <button
                      v-for="(entry, i) in ridingYoungEntries"
                      :key="i"
                      @click="((priceRidingYoung = entry.price), (showRidingYoungChest = false))"
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
                v-model.number="priceRidingYoung"
                min="0"
                placeholder="0"
                class="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-yellow-400 placeholder-gray-600"
              />
            </div>
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="text-xs text-gray-400">
                  Preço de
                  <span class="text-yellow-300 font-semibold">{{ ridingData.adultName }}</span>
                </label>
                <div class="relative">
                  <button
                    v-if="ridingAdultEntries.length"
                    @click="showRidingAdultChest = !showRidingAdultChest"
                    class="flex items-center gap-1 text-xs bg-yellow-400/15 hover:bg-yellow-400/30 border border-yellow-400/40 text-yellow-300 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                    title="Usar valor do baú de anotações"
                  >
                    🪙 Baú <span class="font-bold">{{ ridingAdultEntries.length }}</span>
                  </button>
                  <div
                    v-if="showRidingAdultChest && ridingAdultEntries.length"
                    class="absolute right-0 top-full mt-1 z-50 bg-gray-800 border border-gray-600 rounded-xl shadow-xl min-w-[220px] p-2"
                  >
                    <p class="text-xs text-gray-500 px-2 pb-1 mb-1 border-b border-gray-700">
                      Selecionar valor anotado
                    </p>
                    <button
                      v-for="(entry, i) in ridingAdultEntries"
                      :key="i"
                      @click="((priceRidingAdult = entry.price), (showRidingAdultChest = false))"
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
                v-model.number="priceRidingAdult"
                min="0"
                placeholder="0"
                class="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-yellow-400 placeholder-gray-600"
              />
            </div>
            <div>
              <label class="text-xs text-gray-400 mb-1 block">
                Preço da comida (por item) <span class="text-gray-600 text-xs">(opcional)</span>
              </label>
              <input
                type="number"
                v-model.number="priceRidingFood"
                min="0"
                placeholder="0"
                class="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-yellow-400 placeholder-gray-600"
              />
              <p class="text-xs text-gray-600 mt-1">
                {{ foodPerAnimalRiding }} itens/animal × {{ fmt(priceRidingFood) }} =
                {{ fmt(foodPerAnimalRiding * priceRidingFood) }} por animal
              </p>
            </div>
          </div>
        </div>

        <!-- Arrow -->
        <div
          class="flex items-center justify-center flex-shrink-0 text-gray-600 py-1 md:py-0 md:px-1"
        >
          <svg
            class="hidden md:block w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
          <svg
            class="block md:hidden w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>

        <!-- Summary -->
        <div class="bg-gray-900 rounded-xl p-4 flex-1 flex flex-col gap-4">
          <div>
            <p class="text-xs text-gray-500 uppercase tracking-wider mb-2">Configuração ativa</p>
            <div class="flex flex-wrap gap-1.5 text-xs">
              <span class="bg-gray-800 px-2 py-1 rounded-full text-gray-300">{{
                ridingData.youngName
              }}</span>
              <span
                v-if="premium"
                class="bg-yellow-400/20 text-yellow-300 px-2 py-1 rounded-full border border-yellow-400/30"
                >Premium</span
              >
              <span
                v-if="ridingAnimalsWithFocus > 0"
                class="bg-blue-900/40 text-blue-300 px-2 py-1 rounded-full border border-blue-700/40"
                >Foco</span
              >
              <span class="bg-gray-700 text-yellow-300 px-2 py-1 rounded-full font-semibold"
                >{{ pastures }} pasto{{ pastures !== 1 ? 's' : '' }}</span
              >
              <span
                class="bg-orange-900/40 text-orange-300 px-2 py-1 rounded-full border border-orange-700/40"
                >{{ ridingData.maxNurtures }}× nutrições</span
              >
            </div>
          </div>

          <div class="bg-gray-800 rounded-lg p-3">
            <p class="text-xs text-gray-400 uppercase tracking-wider mb-2">
              Produção por pasto (1 ciclo)
            </p>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p class="text-xs text-gray-500 mb-0.5">{{ ridingData.youngName }} retornados</p>
                <p class="font-semibold text-green-400">
                  ~{{ expectedFoalsPerPasture.toFixed(2) }}
                </p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-0.5">{{ ridingData.adultName }} / pasto</p>
                <p class="font-semibold text-green-300">9</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-0.5">Com foco / pasto</p>
                <p class="font-semibold text-blue-300">
                  ~{{ ridingWithFocusPerPasture.toFixed(1) }}
                </p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-0.5">Foco gasto</p>
                <p class="text-blue-400 font-semibold">{{ fmt(focusRidingPerPasture) }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-0.5">Custo comida</p>
                <p class="text-red-400 font-semibold">{{ fmt(foodCostRidingPerPasture) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Results -->
      <div class="bg-gray-900 rounded-xl p-6">
        <h2 class="text-lg font-semibold text-yellow-400 mb-5">Resultados - Montaria</h2>

        <!-- KPI per pasture -->
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div class="bg-gray-800 rounded-xl p-4 text-center">
            <p class="text-xs text-gray-400 mb-1">Receita / pasto</p>
            <p class="text-2xl font-bold text-yellow-300">{{ fmt(revenueRidingPerPasture) }}</p>
            <p class="text-xs text-gray-600 mt-1">prata</p>
          </div>
          <div class="bg-gray-800 rounded-xl p-4 text-center">
            <p class="text-xs text-gray-400 mb-1">Custo / pasto</p>
            <p class="text-2xl font-bold text-red-400">{{ fmt(costRidingPerPasture) }}</p>
            <p class="text-xs text-gray-600 mt-1">animais + comida</p>
          </div>
          <div class="bg-gray-800 rounded-xl p-4 text-center col-span-2 md:col-span-1">
            <p class="text-xs text-gray-400 mb-1">Lucro líquido / pasto</p>
            <p class="text-2xl font-bold" :class="profitColorClass(netProfitRidingPerPasture)">
              {{ fmt(netProfitRidingPerPasture) }}
            </p>
            <p class="text-xs text-gray-600 mt-1">prata</p>
          </div>
          <div class="bg-gray-800 rounded-xl p-4 text-center">
            <p class="text-xs text-gray-400 mb-1">Adultos / pasto</p>
            <p class="text-2xl font-bold text-yellow-300">9</p>
            <p class="text-xs text-gray-600 mt-1">{{ ridingData.adultName }}</p>
          </div>
          <div class="bg-gray-800 rounded-xl p-4 text-center">
            <p class="text-xs text-gray-400 mb-1">Filhotes retornados / pasto</p>
            <p class="text-2xl font-bold text-green-400">
              ~{{ expectedFoalsPerPasture.toFixed(2) }}
            </p>
            <p class="text-xs text-gray-600 mt-1">{{ ridingData.youngName }}</p>
          </div>
        </div>

        <!-- Multi-pasture totals -->
        <div v-if="pastures > 1" class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div class="bg-blue-900/20 border border-blue-700/40 rounded-xl p-4 text-center">
            <p class="text-xs text-gray-400 mb-1">Receita total / {{ pastures }} pastos</p>
            <p class="text-xl font-bold text-yellow-300">{{ fmt(revenueRidingTotal) }}</p>
          </div>
          <div class="bg-red-900/20 border border-red-700/40 rounded-xl p-4 text-center">
            <p class="text-xs text-gray-400 mb-1">Custo total / {{ pastures }} pastos</p>
            <p class="text-xl font-bold text-red-400">{{ fmt(costRidingTotal) }}</p>
          </div>
          <div
            :class="[
              'rounded-xl p-4 text-center col-span-2 md:col-span-1 border',
              netProfitRidingTotal >= 0
                ? 'bg-green-900/20 border-green-700/40'
                : 'bg-red-900/20 border-red-700/40',
            ]"
          >
            <p class="text-xs text-gray-400 mb-1">Lucro total / {{ pastures }} pastos</p>
            <p class="text-xl font-bold" :class="profitColorClass(netProfitRidingTotal)">
              {{ fmt(netProfitRidingTotal) }}
            </p>
          </div>
          <div class="bg-green-900/20 border border-green-700/40 rounded-xl p-4 text-center">
            <p class="text-xs text-gray-400 mb-1">Adultos totais / {{ pastures }} pastos</p>
            <p class="text-xl font-bold text-yellow-300">{{ 9 * pastures }}</p>
          </div>
          <div class="bg-green-900/20 border border-green-700/40 rounded-xl p-4 text-center">
            <p class="text-xs text-gray-400 mb-1">Filhotes retornados / {{ pastures }} pastos</p>
            <p class="text-xl font-bold text-green-400">~{{ expectedFoalsTotal.toFixed(2) }}</p>
          </div>
        </div>

        <!-- Breakdown table -->
        <div class="overflow-x-auto mb-6">
          <table class="w-full text-sm border-collapse">
            <thead>
              <tr class="bg-gray-800 text-gray-400 text-left text-xs">
                <th class="px-3 py-2 rounded-tl-lg">Item</th>
                <th class="px-3 py-2">Qtd. (1 pasto)</th>
                <th class="px-3 py-2">Preço unit.</th>
                <th class="px-3 py-2 text-yellow-400">Valor (1 pasto)</th>
                <th v-if="pastures > 1" class="px-3 py-2 border-l border-gray-700">
                  Qtd. ({{ pastures }} pastos)
                </th>
                <th v-if="pastures > 1" class="px-3 py-2 text-yellow-400 rounded-tr-lg">
                  Valor ({{ pastures }} pastos)
                </th>
                <th v-else class="px-3 py-2 rounded-tr-lg"></th>
              </tr>
            </thead>
            <tbody>
              <!-- Adults row (all placed foals become adults, 1:1) -->
              <tr class="border-t border-gray-800 hover:bg-gray-800/40 transition-colors">
                <td class="px-3 py-2 text-yellow-300">
                  <span
                    :class="['text-xs font-bold px-1 rounded mr-1', tierBg(ridingData.tier)]"
                    :style="{ color: tierTextColor(ridingData.tier) }"
                    >T{{ ridingData.tier }}</span
                  >
                  {{ ridingData.adultName }} (adultos)
                </td>
                <td class="px-3 py-2 text-gray-400">9</td>
                <td class="px-3 py-2">{{ fmt(priceRidingAdult) }}</td>
                <td class="px-3 py-2 text-green-400 font-semibold">
                  {{ fmt(9 * priceRidingAdult) }}
                </td>
                <td v-if="pastures > 1" class="px-3 py-2 text-gray-400 border-l border-gray-700">
                  {{ 9 * pastures }}
                </td>
                <td v-if="pastures > 1" class="px-3 py-2 text-green-400 font-semibold">
                  {{ fmt(9 * pastures * priceRidingAdult) }}
                </td>
              </tr>
              <!-- Foals returned row (yield chance) -->
              <tr class="border-t border-gray-800 hover:bg-gray-800/40 transition-colors">
                <td class="px-3 py-2 text-yellow-300">
                  <span
                    :class="['text-xs font-bold px-1 rounded mr-1', tierBg(ridingData.tier)]"
                    :style="{ color: tierTextColor(ridingData.tier) }"
                    >T{{ ridingData.tier }}</span
                  >
                  {{ ridingData.youngName }} (retorno)
                </td>
                <td class="px-3 py-2 text-gray-400">~{{ expectedFoalsPerPasture.toFixed(2) }}</td>
                <td class="px-3 py-2">{{ fmt(priceRidingYoung) }}</td>
                <td class="px-3 py-2 text-green-400 font-semibold">
                  {{ fmt(expectedFoalsPerPasture * priceRidingYoung) }}
                </td>
                <td v-if="pastures > 1" class="px-3 py-2 text-gray-400 border-l border-gray-700">
                  ~{{ expectedFoalsTotal.toFixed(2) }}
                </td>
                <td v-if="pastures > 1" class="px-3 py-2 text-green-400 font-semibold">
                  {{ fmt(expectedFoalsTotal * priceRidingYoung) }}
                </td>
              </tr>
              <!-- Foals placed (cost) -->
              <tr class="border-t border-gray-800 hover:bg-gray-800/40 transition-colors">
                <td class="px-3 py-2 text-red-400">
                  <span
                    :class="['text-xs font-bold px-1 rounded mr-1', tierBg(ridingData.tier)]"
                    :style="{ color: tierTextColor(ridingData.tier) }"
                    >T{{ ridingData.tier }}</span
                  >
                  {{ ridingData.youngName }} (custo)
                </td>
                <td class="px-3 py-2 text-gray-400">9</td>
                <td class="px-3 py-2">{{ fmt(priceRidingYoung) }}</td>
                <td class="px-3 py-2 text-red-400 font-semibold">
                  −{{ fmt(9 * priceRidingYoung) }}
                </td>
                <td v-if="pastures > 1" class="px-3 py-2 text-gray-400 border-l border-gray-700">
                  {{ 9 * pastures }}
                </td>
                <td v-if="pastures > 1" class="px-3 py-2 text-red-400 font-semibold">
                  −{{ fmt(9 * pastures * priceRidingYoung) }}
                </td>
              </tr>
              <tr
                v-if="priceRidingFood > 0"
                class="border-t border-gray-800 hover:bg-gray-800/40 transition-colors"
              >
                <td class="px-3 py-2 text-red-400">
                  Comida ({{ foodPerAnimalRiding }} × 9 animais)
                </td>
                <td class="px-3 py-2 text-gray-400">
                  {{ foodPerAnimalRiding * 9 }}
                </td>
                <td class="px-3 py-2">{{ fmt(priceRidingFood) }}</td>
                <td class="px-3 py-2 text-red-400 font-semibold">
                  −{{ fmt(foodCostRidingPerPasture) }}
                </td>
                <td v-if="pastures > 1" class="px-3 py-2 text-gray-400 border-l border-gray-700">
                  {{ foodPerAnimalRiding * 9 * pastures }}
                </td>
                <td v-if="pastures > 1" class="px-3 py-2 text-red-400 font-semibold">
                  −{{ fmt(foodCostRidingTotal) }}
                </td>
              </tr>
              <tr class="border-t-2 border-gray-700 bg-gray-800/60 font-semibold">
                <td class="px-3 py-2 text-yellow-400 rounded-bl-lg">LUCRO LÍQUIDO</td>
                <td class="px-3 py-2 text-gray-500">—</td>
                <td class="px-3 py-2 text-gray-500">—</td>
                <td
                  class="px-3 py-2 text-base"
                  :class="profitColorClass(netProfitRidingPerPasture)"
                >
                  {{ fmt(netProfitRidingPerPasture) }}
                </td>
                <td v-if="pastures > 1" class="px-3 py-2 text-gray-500 border-l border-gray-700">
                  —
                </td>
                <td
                  v-if="pastures > 1"
                  class="px-3 py-2 text-base rounded-br-lg"
                  :class="profitColorClass(netProfitRidingTotal)"
                >
                  {{ fmt(netProfitRidingTotal) }}
                </td>
                <td v-else class="px-3 py-2 rounded-br-lg"></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Focus breakdown -->
        <div
          v-if="ridingAnimalsWithFocus > 0"
          class="bg-blue-900/20 border border-blue-700/40 rounded-xl p-4 mb-4"
        >
          <h3 class="text-sm font-semibold text-blue-300 uppercase tracking-wider mb-2">
            Detalhamento do Foco
          </h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p class="text-xs text-gray-500 mb-0.5">Eficiência total</p>
              <p class="text-blue-300 font-semibold">{{ focusEfficiency }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-0.5">Redução de custo</p>
              <p class="text-blue-300 font-semibold">{{ focusReductionPct.toFixed(1) }}%</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-0.5">Foco por nutrição</p>
              <p class="text-blue-400 font-bold">{{ fmt(focusPerAnimal) }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-0.5">Foco por pasto</p>
              <p class="text-blue-400 font-bold">{{ fmt(focusRidingPerPasture) }}</p>
            </div>
          </div>
          <div v-if="pastures > 1" class="mt-3 border-t border-blue-700/40 pt-3">
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p class="text-xs text-gray-500 mb-0.5">Foco total ({{ pastures }} pastos)</p>
                <p class="text-blue-400 font-bold">{{ fmt(focusRidingTotal) }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-0.5">Animais com foco total</p>
                <p class="text-gray-300 font-semibold">{{ ridingAnimalsWithFocus }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-0.5">Foco base (sem spec.)</p>
                <p class="text-gray-400 font-semibold">1.000 / nutrição</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Foal sustainability banner -->
        <div
          :class="[
            'rounded-xl p-4 mb-4 border',
            isRidingSustainable
              ? 'bg-green-900/20 border-green-700/40'
              : 'bg-yellow-900/20 border-yellow-700/40',
          ]"
        >
          <h3
            :class="[
              'text-sm font-semibold uppercase tracking-wider mb-2',
              isRidingSustainable ? 'text-green-300' : 'text-yellow-300',
            ]"
          >
            Sustentabilidade de Foco
          </h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p class="text-xs text-gray-500 mb-0.5">Filhotes colocados / pasto</p>
              <p class="text-gray-300 font-semibold">9</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-0.5">Filhotes retornados / pasto</p>
              <p
                :class="[
                  'font-semibold',
                  isRidingSustainable ? 'text-green-400' : 'text-yellow-300',
                ]"
              >
                ~{{ expectedFoalsPerPasture.toFixed(2) }}
              </p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-0.5">% retorno / nutrição com foco</p>
              <p class="text-gray-300 font-semibold">
                {{ (ridingData.yieldFocused * 100).toFixed(2) }}%
              </p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-0.5">% retorno / nutrição sem foco</p>
              <p class="text-gray-300 font-semibold">
                {{ (ridingData.yieldUnfocused * 100).toFixed(2) }}%
              </p>
            </div>
          </div>
          <p v-if="!isRidingSustainable" class="text-xs text-yellow-300 mt-2">
            ⚠️ Com {{ ridingAnimalsWithFocus }} animal(is) com foco e a combinação atual de %
            retorno, você produz menos filhotes do que os colocados. Considere usar mais foco ou
            aumentar a especialização.
          </p>
          <p v-else class="text-xs text-green-300 mt-2">
            ✓ Você recupera filhotes suficientes para manter ou expandir o ciclo de montaria.
          </p>

          <!-- Restock cost block (only when unsustainable and priceRidingYoung is set) -->
          <div
            v-if="!isRidingSustainable && priceRidingYoung > 0"
            class="mt-4 pt-4 border-t border-yellow-700/40"
          >
            <p class="text-xs font-semibold text-yellow-300 uppercase tracking-wider mb-3">
              Custo de Reposição de Filhotes
            </p>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p class="text-xs text-gray-500 mb-0.5">
                  Déficit total ({{ pastures }} pasto{{ pastures !== 1 ? 's' : '' }})
                </p>
                <p class="font-semibold text-red-400">~{{ youngDeficitRidingTotal }} filhote(s)</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-0.5">Gasto p/ reposição (total)</p>
                <p class="font-semibold text-orange-400">{{ fmt(restockCostRidingTotal) }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-0.5">Lucro após reposição (total)</p>
                <p
                  class="font-semibold"
                  :class="profitColorClass(netProfitAfterRestockRidingTotal)"
                >
                  {{ fmt(netProfitAfterRestockRidingTotal) }}
                </p>
              </div>
            </div>
          </div>
          <p
            v-else-if="!isRidingSustainable && priceRidingYoung === 0"
            class="text-xs text-gray-500 mt-3"
          >
            Informe o preço do filhote para calcular o custo de reposição.
          </p>
        </div>

        <!-- Profitability -->
        <div class="border-t border-gray-700 pt-5">
          <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Lucratividade ({{ pastures > 1 ? pastures + ' pastos' : '1 pasto' }})
          </h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-gray-800 rounded-xl p-3 text-center">
              <p class="text-xs text-gray-400 mb-1">Receita total</p>
              <p class="text-xl font-bold text-gray-200">{{ fmt(revenueRidingTotal) }}</p>
            </div>
            <div class="bg-gray-800 rounded-xl p-3 text-center">
              <p class="text-xs text-gray-400 mb-1">Custo total</p>
              <p class="text-xl font-bold text-red-400">{{ fmt(costRidingTotal) }}</p>
            </div>
            <div class="bg-gray-800 rounded-xl p-3 text-center">
              <p class="text-xs text-gray-400 mb-1">Lucro líquido total</p>
              <p class="text-xl font-bold" :class="profitColorClass(netProfitRidingTotal)">
                {{ fmt(netProfitRidingTotal) }}
              </p>
            </div>
            <div class="rounded-xl p-3 text-center" :class="marginBgClass(profitMarginRiding)">
              <p class="text-xs text-gray-400 mb-1">Margem de lucro</p>
              <p class="text-2xl font-bold" :class="marginColorClass(profitMarginRiding)">
                {{ profitMarginRiding !== null ? profitMarginRiding.toFixed(1) + '%' : '—' }}
              </p>
              <p class="text-xs mt-1" :class="marginColorClass(profitMarginRiding)">
                <template v-if="profitMarginRiding !== null && profitMarginRiding < 0"
                  >Prejuízo</template
                >
                <template v-else-if="profitMarginRiding !== null && profitMarginRiding < 10"
                  >Margem baixa</template
                >
                <template v-else-if="profitMarginRiding !== null && profitMarginRiding < 20"
                  >Margem boa</template
                >
                <template v-else-if="profitMarginRiding !== null">Margem ótima</template>
              </p>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ════════════════════════════════════════════════════════════════ -->
    <!-- SECONDARY MODE                                                    -->
    <!-- ════════════════════════════════════════════════════════════════ -->
    <template v-if="mode === 'secondary'">
      <!-- Row 1 -->
      <div class="flex flex-col md:flex-row items-stretch gap-2 mb-6">
        <!-- Animal selector -->
        <div class="bg-gray-900 rounded-xl p-4 flex-1">
          <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Animal (adulto)
          </h2>
          <div class="flex flex-col gap-1.5">
            <button
              v-for="opt in SECONDARY_OPTIONS"
              :key="opt.value"
              @click="secondaryAnimal = opt.value"
              :class="[
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer text-left',
                secondaryAnimal === opt.value
                  ? 'bg-yellow-400 text-gray-950'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700',
              ]"
            >
              <span
                :class="['text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0', tierBg(opt.tier)]"
                :style="{ color: tierTextColor(opt.tier) }"
              >
                T{{ opt.tier }}
              </span>
              {{ opt.label }}
            </button>
          </div>

          <!-- Production info card -->
          <div class="mt-4 bg-gray-800 rounded-lg p-3">
            <p class="text-xs text-gray-400 uppercase tracking-wider mb-2">Produção por ciclo</p>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p class="text-xs text-gray-500 mb-0.5">Itens / animal (sem premium)</p>
                <p class="font-semibold text-gray-300">7 – 11 (~9)</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-0.5">Itens / animal (com premium)</p>
                <p class="font-semibold text-yellow-300">14 – 22 (~18)</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-0.5">Produto</p>
                <p class="text-xs font-semibold text-yellow-300">
                  {{ secondaryProductionData.secondaryName }}
                </p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-0.5">Comida favorita</p>
                <p class="text-xs font-semibold text-orange-300">
                  {{ secondaryProductionData.favFood }}
                </p>
              </div>
            </div>
            <p class="text-xs text-gray-600 mt-2 pt-2 border-t border-gray-700">
              O animal adulto é consumido a cada ciclo para gerar o produto secundário.
            </p>
          </div>
        </div>

        <!-- Arrow -->
        <div
          class="flex items-center justify-center flex-shrink-0 text-gray-600 py-1 md:py-0 md:px-1"
        >
          <svg
            class="hidden md:block w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
          <svg
            class="block md:hidden w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>

        <!-- Pasto & Produção -->
        <div class="bg-gray-900 rounded-xl p-4 flex-1">
          <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Pasto &amp; Produção
          </h2>

          <div class="mb-4">
            <label class="text-xs text-gray-500 mb-2 block">Número de pastos</label>
            <input
              type="number"
              v-model.number="pastures"
              min="1"
              class="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-yellow-400"
            />
          </div>

          <div class="border-t border-gray-700 pt-4 mb-4">
            <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Configurações
            </h3>
            <div class="space-y-2">
              <label
                class="flex items-center gap-2 cursor-pointer hover:text-yellow-300 transition-colors"
              >
                <input type="checkbox" v-model="premium" class="accent-yellow-400" />
                <span class="text-sm">Premium ativo</span>
                <span class="ml-auto text-xs text-gray-500">Produção ×2</span>
              </label>
              <label
                class="flex items-center gap-2 cursor-pointer hover:text-orange-300 transition-colors"
              >
                <input type="checkbox" v-model="favFoodActiveSecondary" class="accent-orange-400" />
                <span class="text-sm">Comida favorita</span>
                <span class="ml-auto text-xs text-gray-500">Comida ÷2</span>
              </label>
            </div>
          </div>

          <!-- Cycle summary -->
          <div class="bg-gray-800 rounded-lg p-3 text-sm">
            <p class="text-xs text-gray-400 uppercase tracking-wider mb-2">Resumo do ciclo</p>
            <div class="space-y-1 text-xs">
              <div class="flex justify-between">
                <span class="text-gray-500">Animais adultos / pasto</span>
                <span class="text-gray-300 font-semibold">9</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Itens / animal / ciclo</span>
                <span class="font-semibold" :class="premium ? 'text-yellow-300' : 'text-gray-300'">
                  {{ premium ? '14–22 (~18)' : '7–11 (~9)' }}
                  <span v-if="premium" class="text-xs text-yellow-400 ml-1">(premium)</span>
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500"
                  >{{ secondaryProductionData.secondaryName }} / pasto</span
                >
                <span class="text-green-400 font-semibold">~{{ secondaryItemsPerPasture }}</span>
              </div>
              <div v-if="pastures > 1" class="flex justify-between">
                <span class="text-gray-500">{{ secondaryProductionData.secondaryName }} total</span>
                <span class="text-green-400 font-semibold">~{{ secondaryItemsTotal }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Comida / animal / ciclo</span>
                <span class="text-orange-300 font-semibold">{{ secondaryFoodPerAnimal }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Row 2: mobile arrow ─────────────────────────────────────── -->
      <div class="flex md:hidden items-center justify-center text-gray-600 mb-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      <!-- Row 2: Prices + Summary -->
      <div class="flex flex-col md:flex-row items-stretch gap-2 mb-6">
        <!-- Prices -->
        <div class="bg-gray-900 rounded-xl p-4 flex-1">
          <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Preços (prata)
          </h2>
          <div class="space-y-3">
            <div>
              <label class="text-xs text-gray-400 mb-1 block">
                Preço de
                <span class="text-yellow-300 font-semibold">{{
                  secondaryProductionData.adultName
                }}</span>
                (adulto — custo por ciclo)
              </label>
              <input
                type="number"
                v-model.number="priceSecondaryAdult"
                min="0"
                placeholder="0"
                class="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-yellow-400 placeholder-gray-600"
              />
            </div>
            <div>
              <label class="text-xs text-gray-400 mb-1 block">
                Preço de
                <span class="text-yellow-300 font-semibold">{{
                  secondaryProductionData.secondaryName
                }}</span>
                (produto)
              </label>
              <input
                type="number"
                v-model.number="priceSecondaryProduct"
                min="0"
                placeholder="0"
                class="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-yellow-400 placeholder-gray-600"
              />
            </div>
            <div>
              <label class="text-xs text-gray-400 mb-1 block">
                Preço da comida / por item <span class="text-gray-600 text-xs">(opcional)</span>
              </label>
              <input
                type="number"
                v-model.number="priceSecondaryFood"
                min="0"
                placeholder="0"
                class="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-yellow-400 placeholder-gray-600"
              />
            </div>
          </div>
        </div>

        <!-- Arrow -->
        <div
          class="flex items-center justify-center flex-shrink-0 text-gray-600 py-1 md:py-0 md:px-1"
        >
          <svg
            class="hidden md:block w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
          <svg
            class="block md:hidden w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>

        <!-- Summary -->
        <div class="bg-gray-900 rounded-xl p-4 flex-1 flex flex-col gap-4">
          <div>
            <p class="text-xs text-gray-500 uppercase tracking-wider mb-2">Configuração ativa</p>
            <div class="flex flex-wrap gap-1.5 text-xs">
              <span class="bg-gray-800 px-2 py-1 rounded-full text-gray-300">
                {{ secondaryProductionData.adultName }}
              </span>
              <span
                v-if="premium"
                class="bg-yellow-400/20 text-yellow-300 px-2 py-1 rounded-full border border-yellow-400/30"
                >Premium</span
              >
              <span
                v-if="favFoodActiveSecondary"
                class="bg-orange-400/20 text-orange-300 px-2 py-1 rounded-full border border-orange-400/30"
                >Comida favorita</span
              >
              <span
                class="bg-purple-400/20 text-purple-300 px-2 py-1 rounded-full border border-purple-400/30"
              >
                Produção secundária
              </span>
              <span class="bg-gray-700 text-yellow-300 px-2 py-1 rounded-full font-semibold">
                {{ pastures }} pasto{{ pastures !== 1 ? 's' : '' }}
              </span>
            </div>
          </div>

          <div class="bg-gray-800 rounded-lg p-3">
            <p class="text-xs text-gray-400 uppercase tracking-wider mb-2">
              Produção por pasto (1 ciclo)
            </p>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p class="text-xs text-gray-500 mb-0.5">
                  {{ secondaryProductionData.secondaryName }}
                </p>
                <p class="font-semibold text-green-400">~{{ secondaryItemsPerPasture }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-0.5">Custo animais / pasto</p>
                <p class="text-red-400 font-semibold">{{ fmt(9 * priceSecondaryAdult) }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-0.5">Receita / pasto</p>
                <p class="font-semibold text-yellow-300">{{ fmt(revenueSecondaryPerPasture) }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-0.5">Custo comida / pasto</p>
                <p class="text-red-400 font-semibold">{{ fmt(secondaryFoodCostPerPasture) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Results -->
      <div class="bg-gray-900 rounded-xl p-6">
        <h2 class="text-lg font-semibold text-yellow-400 mb-5">Resultados - Produção Secundária</h2>

        <!-- KPI per pasture -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-gray-800 rounded-xl p-4 text-center">
            <p class="text-xs text-gray-400 mb-1">Receita / pasto</p>
            <p class="text-2xl font-bold text-yellow-300">{{ fmt(revenueSecondaryPerPasture) }}</p>
            <p class="text-xs text-gray-600 mt-1">prata</p>
          </div>
          <div class="bg-gray-800 rounded-xl p-4 text-center">
            <p class="text-xs text-gray-400 mb-1">Custo / pasto</p>
            <p class="text-2xl font-bold text-red-400">{{ fmt(costSecondaryPerPasture) }}</p>
            <p class="text-xs text-gray-600 mt-1">animais + comida</p>
          </div>
          <div class="bg-gray-800 rounded-xl p-4 text-center col-span-2 md:col-span-1">
            <p class="text-xs text-gray-400 mb-1">Lucro líquido / pasto</p>
            <p class="text-2xl font-bold" :class="profitColorClass(netProfitSecondaryPerPasture)">
              {{ fmt(netProfitSecondaryPerPasture) }}
            </p>
            <p class="text-xs text-gray-600 mt-1">prata</p>
          </div>
          <div class="bg-gray-800 rounded-xl p-4 text-center">
            <p class="text-xs text-gray-400 mb-1">Itens / pasto</p>
            <p class="text-2xl font-bold text-green-400">~{{ secondaryItemsPerPasture }}</p>
            <p class="text-xs text-gray-600 mt-1">{{ secondaryProductionData.secondaryName }}</p>
          </div>
        </div>

        <!-- Multi-pasture totals -->
        <div v-if="pastures > 1" class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-blue-900/20 border border-blue-700/40 rounded-xl p-4 text-center">
            <p class="text-xs text-gray-400 mb-1">Receita total / {{ pastures }} pastos</p>
            <p class="text-xl font-bold text-yellow-300">{{ fmt(revenueSecondaryTotal) }}</p>
          </div>
          <div class="bg-red-900/20 border border-red-700/40 rounded-xl p-4 text-center">
            <p class="text-xs text-gray-400 mb-1">Custo total / {{ pastures }} pastos</p>
            <p class="text-xl font-bold text-red-400">{{ fmt(costSecondaryTotal) }}</p>
          </div>
          <div
            :class="[
              'rounded-xl p-4 text-center col-span-2 md:col-span-1 border',
              netProfitSecondaryTotal >= 0
                ? 'bg-green-900/20 border-green-700/40'
                : 'bg-red-900/20 border-red-700/40',
            ]"
          >
            <p class="text-xs text-gray-400 mb-1">Lucro total / {{ pastures }} pastos</p>
            <p class="text-xl font-bold" :class="profitColorClass(netProfitSecondaryTotal)">
              {{ fmt(netProfitSecondaryTotal) }}
            </p>
          </div>
          <div class="bg-green-900/20 border border-green-700/40 rounded-xl p-4 text-center">
            <p class="text-xs text-gray-400 mb-1">Itens totais / {{ pastures }} pastos</p>
            <p class="text-xl font-bold text-green-400">~{{ secondaryItemsTotal }}</p>
          </div>
        </div>

        <!-- Breakdown table -->
        <div class="overflow-x-auto mb-6">
          <table class="w-full text-sm border-collapse">
            <thead>
              <tr class="bg-gray-800 text-gray-400 text-left text-xs">
                <th class="px-3 py-2 rounded-tl-lg">Item</th>
                <th class="px-3 py-2">Qtd. (1 pasto)</th>
                <th class="px-3 py-2">Preço unit.</th>
                <th class="px-3 py-2 text-yellow-400">Valor (1 pasto)</th>
                <th v-if="pastures > 1" class="px-3 py-2 border-l border-gray-700">
                  Qtd. ({{ pastures }} pastos)
                </th>
                <th v-if="pastures > 1" class="px-3 py-2 text-yellow-400 rounded-tr-lg">
                  Valor ({{ pastures }} pastos)
                </th>
                <th v-else class="px-3 py-2 rounded-tr-lg"></th>
              </tr>
            </thead>
            <tbody>
              <!-- Secondary product revenue -->
              <tr class="border-t border-gray-800 hover:bg-gray-800/40 transition-colors">
                <td class="px-3 py-2 text-yellow-300">
                  <span
                    :class="[
                      'text-xs font-bold px-1 rounded mr-1',
                      tierBg(secondaryProductionData.tier),
                    ]"
                    :style="{ color: tierTextColor(secondaryProductionData.tier) }"
                    >T{{ secondaryProductionData.tier }}</span
                  >
                  {{ secondaryProductionData.secondaryName }}
                </td>
                <td class="px-3 py-2 text-gray-400">~{{ secondaryItemsPerPasture }}</td>
                <td class="px-3 py-2">{{ fmt(priceSecondaryProduct) }}</td>
                <td class="px-3 py-2 text-green-400 font-semibold">
                  {{ fmt(revenueSecondaryPerPasture) }}
                </td>
                <td v-if="pastures > 1" class="px-3 py-2 text-gray-400 border-l border-gray-700">
                  ~{{ secondaryItemsTotal }}
                </td>
                <td v-if="pastures > 1" class="px-3 py-2 text-green-400 font-semibold">
                  {{ fmt(revenueSecondaryTotal) }}
                </td>
              </tr>
              <!-- Adult animal cost -->
              <tr class="border-t border-gray-800 hover:bg-gray-800/40 transition-colors">
                <td class="px-3 py-2 text-red-400">
                  <span
                    :class="[
                      'text-xs font-bold px-1 rounded mr-1',
                      tierBg(secondaryProductionData.tier),
                    ]"
                    :style="{ color: tierTextColor(secondaryProductionData.tier) }"
                    >T{{ secondaryProductionData.tier }}</span
                  >
                  {{ secondaryProductionData.adultName }} (custo)
                </td>
                <td class="px-3 py-2 text-gray-400">9</td>
                <td class="px-3 py-2">{{ fmt(priceSecondaryAdult) }}</td>
                <td class="px-3 py-2 text-red-400 font-semibold">
                  −{{ fmt(9 * priceSecondaryAdult) }}
                </td>
                <td v-if="pastures > 1" class="px-3 py-2 text-gray-400 border-l border-gray-700">
                  {{ 9 * pastures }}
                </td>
                <td v-if="pastures > 1" class="px-3 py-2 text-red-400 font-semibold">
                  −{{ fmt(9 * pastures * priceSecondaryAdult) }}
                </td>
              </tr>
              <!-- Food cost -->
              <tr
                v-if="priceSecondaryFood > 0"
                class="border-t border-gray-800 hover:bg-gray-800/40 transition-colors"
              >
                <td class="px-3 py-2 text-red-400">
                  Comida ({{ secondaryFoodPerAnimal }} × 9 animais)
                </td>
                <td class="px-3 py-2 text-gray-400">{{ secondaryFoodPerAnimal * 9 }}</td>
                <td class="px-3 py-2">{{ fmt(priceSecondaryFood) }}</td>
                <td class="px-3 py-2 text-red-400 font-semibold">
                  −{{ fmt(secondaryFoodCostPerPasture) }}
                </td>
                <td v-if="pastures > 1" class="px-3 py-2 text-gray-400 border-l border-gray-700">
                  {{ secondaryFoodPerAnimal * 9 * pastures }}
                </td>
                <td v-if="pastures > 1" class="px-3 py-2 text-red-400 font-semibold">
                  −{{ fmt(secondaryFoodCostTotal) }}
                </td>
              </tr>
              <tr class="border-t-2 border-gray-700 bg-gray-800/60 font-semibold">
                <td class="px-3 py-2 text-yellow-400 rounded-bl-lg">LUCRO LÍQUIDO</td>
                <td class="px-3 py-2 text-gray-500">—</td>
                <td class="px-3 py-2 text-gray-500">—</td>
                <td
                  class="px-3 py-2 text-base"
                  :class="profitColorClass(netProfitSecondaryPerPasture)"
                >
                  {{ fmt(netProfitSecondaryPerPasture) }}
                </td>
                <td v-if="pastures > 1" class="px-3 py-2 text-gray-500 border-l border-gray-700">
                  —
                </td>
                <td
                  v-if="pastures > 1"
                  class="px-3 py-2 text-base rounded-br-lg"
                  :class="profitColorClass(netProfitSecondaryTotal)"
                >
                  {{ fmt(netProfitSecondaryTotal) }}
                </td>
                <td v-else class="px-3 py-2 rounded-br-lg"></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Profitability -->
        <div class="border-t border-gray-700 pt-5">
          <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Lucratividade ({{ pastures > 1 ? pastures + ' pastos' : '1 pasto' }})
          </h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-gray-800 rounded-xl p-3 text-center">
              <p class="text-xs text-gray-400 mb-1">Receita total</p>
              <p class="text-xl font-bold text-gray-200">{{ fmt(revenueSecondaryTotal) }}</p>
            </div>
            <div class="bg-gray-800 rounded-xl p-3 text-center">
              <p class="text-xs text-gray-400 mb-1">Custo total</p>
              <p class="text-xl font-bold text-red-400">{{ fmt(costSecondaryTotal) }}</p>
            </div>
            <div class="bg-gray-800 rounded-xl p-3 text-center">
              <p class="text-xs text-gray-400 mb-1">Lucro líquido total</p>
              <p class="text-xl font-bold" :class="profitColorClass(netProfitSecondaryTotal)">
                {{ fmt(netProfitSecondaryTotal) }}
              </p>
            </div>
            <div class="rounded-xl p-3 text-center" :class="marginBgClass(profitMarginSecondary)">
              <p class="text-xs text-gray-400 mb-1">Margem de lucro</p>
              <p class="text-2xl font-bold" :class="marginColorClass(profitMarginSecondary)">
                {{ profitMarginSecondary !== null ? profitMarginSecondary.toFixed(1) + '%' : '—' }}
              </p>
              <p class="text-xs mt-1" :class="marginColorClass(profitMarginSecondary)">
                <template v-if="profitMarginSecondary !== null && profitMarginSecondary < 0"
                  >Prejuízo</template
                >
                <template v-else-if="profitMarginSecondary !== null && profitMarginSecondary < 10"
                  >Margem baixa</template
                >
                <template v-else-if="profitMarginSecondary !== null && profitMarginSecondary < 20"
                  >Margem boa</template
                >
                <template v-else-if="profitMarginSecondary !== null">Margem ótima</template>
              </p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
