<script setup lang="ts">
import { watch } from 'vue'
import {
  usePastureCalculator,
  PRODUCTION_OPTIONS,
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
  animalsPerPasture,
  focusEfficiency,
  focusPerAnimal,
  focusReductionPct,
  // Production state
  productionAnimal,
  animalsWithFocus,
  animalsUnfocused,
  useSecondary,
  favFoodActive,
  priceYoung,
  priceAdult,
  priceFood,
  foodPerAnimal,
  priceSecondary,
  // Production computed
  productionData,
  totalAnimals,
  adultsPerPasture,
  adultsTotal,
  secondaryPerPasture,
  secondaryTotal,
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
  ridingGrowthHours,
} = usePastureCalculator()

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
                  {{ (productionData.yieldUnfocused * 100).toFixed(0) }}%
                </p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-0.5">Com foco</p>
                <p class="font-semibold text-green-400">
                  {{ (productionData.yieldFocused * 100).toFixed(0) }}%
                </p>
              </div>
            </div>
            <div class="mt-2 pt-2 border-t border-gray-700">
              <p class="text-xs text-gray-500 mb-0.5">Comida favorita</p>
              <p class="text-xs font-semibold text-yellow-300">{{ productionData.favFood }}</p>
              <p v-if="productionData.hasSecondary" class="text-xs text-gray-500 mt-1">
                Produção secundária:
                <span class="text-gray-300 font-semibold">{{ productionData.secondaryName }}</span>
                (~9 por animal)
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
            <label
              class="flex items-center gap-2 cursor-pointer hover:text-yellow-300 transition-colors mb-2"
            >
              <input type="checkbox" v-model="premium" class="accent-yellow-400" />
              <span class="text-sm">Premium ativo</span>
              <span class="ml-auto text-xs text-gray-500">Ciclo ×2 mais rápido</span>
            </label>
            <label
              class="flex items-center gap-2 cursor-pointer hover:text-yellow-300 transition-colors mb-2"
            >
              <input type="checkbox" v-model="favFoodActive" class="accent-yellow-400" />
              <span class="text-sm">Comida favorita ({{ productionData.favFood }})</span>
              <span class="ml-auto text-xs text-gray-500">Comida ÷2</span>
            </label>
            <label
              v-if="productionData.hasSecondary"
              class="flex items-center gap-2 cursor-pointer hover:text-yellow-300 transition-colors"
            >
              <input type="checkbox" v-model="useSecondary" class="accent-yellow-400" />
              <span class="text-sm">Produção secundária</span>
              <span class="ml-auto text-xs text-gray-500"
                >Animal → {{ productionData.secondaryName }}</span
              >
            </label>
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
        </div>

        <!-- Pasture & Animals -->
        <div class="bg-gray-900 rounded-xl p-4 flex-1">
          <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Pasto &amp; Animais
          </h2>

          <div class="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label class="text-xs text-gray-500 mb-2 block">Número de pastos</label>
              <input
                type="number"
                v-model.number="pastures"
                min="1"
                class="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-yellow-400"
              />
            </div>
            <div>
              <label class="text-xs text-gray-500 mb-2 block"
                >Animais / pasto (máx. {{ animalsPerPasture * pastures }})</label
              >
              <input
                type="number"
                v-model.number="animalsPerPasture"
                min="1"
                :max="animalsPerPasture * pastures"
                class="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-yellow-400"
              />
            </div>
          </div>

          <div class="border-t border-gray-700 pt-4 mb-4">
            <label class="text-xs text-gray-500 mb-2 block">
              Animais com foco (máx. {{ animalsPerPasture * pastures }})
            </label>
            <input
              type="number"
              v-model.number="animalsWithFocus"
              min="0"
              :max="animalsPerPasture * pastures"
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
                  {{ animalsPerPasture }} × {{ pastures }} = {{ totalAnimals }}
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
              <div v-if="useSecondary && productionData.hasSecondary" class="flex justify-between">
                <span class="text-gray-500">{{ productionData.secondaryName }} / pasto</span>
                <span class="text-green-400 font-semibold"
                  >~{{ secondaryPerPasture.toFixed(1) }}</span
                >
              </div>
            </div>
          </div>
        </div>
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
                <span class="text-yellow-300 font-semibold">{{ productionData.youngName }}</span>
                (filhote)
              </label>
              <input
                type="number"
                v-model.number="priceYoung"
                min="0"
                placeholder="0"
                class="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-yellow-400 placeholder-gray-600"
              />
            </div>
            <div v-if="!useSecondary || !productionData.hasSecondary">
              <label class="text-xs text-gray-400 mb-1 block">
                Preço de
                <span class="text-yellow-300 font-semibold">{{ productionData.adultName }}</span>
                (adulto)
              </label>
              <input
                type="number"
                v-model.number="priceAdult"
                min="0"
                placeholder="0"
                class="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-yellow-400 placeholder-gray-600"
              />
            </div>
            <div v-if="useSecondary && productionData.hasSecondary">
              <label class="text-xs text-gray-400 mb-1 block">
                Preço de
                <span class="text-yellow-300 font-semibold">{{
                  productionData.secondaryName
                }}</span>
              </label>
              <input
                type="number"
                v-model.number="priceSecondary"
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
                v-if="useSecondary && productionData.hasSecondary"
                class="bg-purple-400/20 text-purple-300 px-2 py-1 rounded-full border border-purple-400/30"
                >Produção secundária</span
              >
              <span
                v-if="focusEfficiency > 0"
                class="bg-blue-900/40 text-blue-300 px-2 py-1 rounded-full border border-blue-700/40"
                >Foco −{{ focusReductionPct.toFixed(1) }}%</span
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
              <div v-if="useSecondary && productionData.hasSecondary">
                <p class="text-xs text-gray-500 mb-0.5">{{ productionData.secondaryName }}</p>
                <p class="font-semibold text-green-400">~{{ secondaryPerPasture.toFixed(1) }}</p>
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
        <h2 class="text-lg font-semibold text-yellow-400 mb-5">Resultados — Produção</h2>

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
              <!-- Secondary mode: secondary products row -->
              <tr
                v-if="useSecondary && productionData.hasSecondary"
                class="border-t border-gray-800 hover:bg-gray-800/40 transition-colors"
              >
                <td class="px-3 py-2 text-yellow-300">
                  <span
                    :class="['text-xs font-bold px-1 rounded mr-1', tierBg(productionData.tier)]"
                    :style="{ color: tierTextColor(productionData.tier) }"
                    >T{{ productionData.tier }}</span
                  >
                  {{ productionData.secondaryName }}
                </td>
                <td class="px-3 py-2 text-gray-400">~{{ secondaryPerPasture.toFixed(1) }}</td>
                <td class="px-3 py-2">{{ fmt(priceSecondary) }}</td>
                <td class="px-3 py-2 text-green-400 font-semibold">
                  {{ fmt(revenueProdPerPasture) }}
                </td>
                <td v-if="pastures > 1" class="px-3 py-2 text-gray-400 border-l border-gray-700">
                  ~{{ secondaryTotal.toFixed(1) }}
                </td>
                <td v-if="pastures > 1" class="px-3 py-2 text-green-400 font-semibold">
                  {{ fmt(revenueProdTotal) }}
                </td>
              </tr>
              <!-- Normal mode: adults row -->
              <tr v-else class="border-t border-gray-800 hover:bg-gray-800/40 transition-colors">
                <td class="px-3 py-2 text-yellow-300">
                  <span
                    :class="['text-xs font-bold px-1 rounded mr-1', tierBg(productionData.tier)]"
                    :style="{ color: tierTextColor(productionData.tier) }"
                    >T{{ productionData.tier }}</span
                  >
                  {{ productionData.adultName }}
                </td>
                <td class="px-3 py-2 text-gray-400">{{ animalsPerPasture }}</td>
                <td class="px-3 py-2">{{ fmt(priceAdult) }}</td>
                <td class="px-3 py-2 text-green-400 font-semibold">
                  {{ fmt(animalsPerPasture * priceAdult) }}
                </td>
                <td v-if="pastures > 1" class="px-3 py-2 text-gray-400 border-l border-gray-700">
                  {{ animalsPerPasture * pastures }}
                </td>
                <td v-if="pastures > 1" class="px-3 py-2 text-green-400 font-semibold">
                  {{ fmt(animalsPerPasture * pastures * priceAdult) }}
                </td>
              </tr>
              <!-- Normal mode: offspring (filhotes) row -->
              <tr
                v-if="!(useSecondary && productionData.hasSecondary)"
                class="border-t border-gray-800 hover:bg-gray-800/40 transition-colors"
              >
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
                <td class="px-3 py-2 text-gray-400">{{ animalsPerPasture }}</td>
                <td class="px-3 py-2">{{ fmt(priceYoung) }}</td>
                <td class="px-3 py-2 text-red-400 font-semibold">
                  −{{ fmt(animalsPerPasture * priceYoung) }}
                </td>
                <td v-if="pastures > 1" class="px-3 py-2 text-gray-400 border-l border-gray-700">
                  {{ animalsPerPasture * pastures }}
                </td>
                <td v-if="pastures > 1" class="px-3 py-2 text-red-400 font-semibold">
                  −{{ fmt(animalsPerPasture * pastures * priceYoung) }}
                </td>
              </tr>
              <tr
                v-if="foodPerAnimal > 0"
                class="border-t border-gray-800 hover:bg-gray-800/40 transition-colors"
              >
                <td class="px-3 py-2 text-red-400">
                  <span class="text-xs font-bold px-1 rounded mr-1 bg-gray-600 text-gray-100"
                    >T?</span
                  >
                  Comida (custo)
                </td>
                <td class="px-3 py-2 text-gray-400">—</td>
                <td class="px-3 py-2">—</td>
                <td class="px-3 py-2 text-red-400 font-semibold">−{{ fmt(foodCostPerPasture) }}</td>
                <td v-if="pastures > 1" class="px-3 py-2 text-gray-400 border-l border-gray-700">
                  —
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
              <p class="text-gray-300 font-semibold">{{ animalsPerPasture }}</p>
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
                {{ (productionData.yieldFocused * 100).toFixed(0) }}%
              </p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-0.5">% retorno sem foco</p>
              <p class="text-gray-300 font-semibold">
                {{ (productionData.yieldUnfocused * 100).toFixed(0) }}%
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
                <p class="text-gray-500 mb-0.5">Prole / nutrição (sem foco)</p>
                <p class="font-semibold text-gray-300">
                  {{ (ridingData.yieldUnfocused * 100).toFixed(1) }}%
                </p>
              </div>
              <div>
                <p class="text-gray-500 mb-0.5">Prole / nutrição (com foco)</p>
                <p class="font-semibold text-green-400">
                  {{ (ridingData.yieldFocused * 100).toFixed(1) }}%
                </p>
              </div>
              <div>
                <p class="text-gray-500 mb-0.5">Nutrições máx. (premium)</p>
                <p class="font-semibold text-yellow-300">{{ ridingData.maxNurtures }}×</p>
              </div>
              <div>
                <p class="text-gray-500 mb-0.5">Comida / 24h</p>
                <p class="font-semibold text-orange-300">{{ ridingData.foodPer24h }}</p>
              </div>
              <div>
                <p class="text-gray-500 mb-0.5">Crescimento (sem premium)</p>
                <p class="font-semibold text-gray-300">
                  {{ formatGrowthTime(ridingData.growthHoursBase) }}
                </p>
              </div>
              <div>
                <p class="text-gray-500 mb-0.5">Comida total / animal</p>
                <p class="font-semibold text-orange-300">{{ foodPerAnimalRiding }}</p>
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
        </div>

        <!-- Pasture & Nutrition -->
        <div class="bg-gray-900 rounded-xl p-4 flex-1">
          <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Pasto &amp; Nutrição
          </h2>

          <div class="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label class="text-xs text-gray-500 mb-2 block">Número de pastos</label>
              <input
                type="number"
                v-model.number="pastures"
                min="1"
                class="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-yellow-400"
              />
            </div>
            <div>
              <label class="text-xs text-gray-500 mb-2 block">Animais / pasto (máx. 9)</label>
              <input
                type="number"
                v-model.number="animalsPerPasture"
                min="1"
                max="9"
                class="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-yellow-400"
              />
            </div>
          </div>

          <div class="border-t border-gray-700 pt-4 mb-4">
            <label class="text-xs text-gray-500 mb-2 block">
              Com foco (máx. {{ animalsPerPasture * pastures }})
            </label>
            <input
              type="number"
              v-model.number="ridingAnimalsWithFocus"
              min="0"
              :max="animalsPerPasture * pastures"
              class="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-yellow-400"
            />
            <div class="flex items-center justify-between text-xs text-gray-500 mt-1.5">
              <span
                >{{ ridingAnimalsWithFocus }} com foco ·
                {{ animalsPerPasture * pastures - ridingAnimalsWithFocus }} sem foco</span
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
                  >{{ animalsPerPasture }} × {{ pastures }} =
                  {{ animalsPerPasture * pastures }}</span
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
                <span class="text-yellow-300 font-semibold">{{ ridingData.youngName }}</span>
              </label>
              <input
                type="number"
                v-model.number="priceRidingYoung"
                min="0"
                placeholder="0"
                class="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-yellow-400 placeholder-gray-600"
              />
            </div>
            <div>
              <label class="text-xs text-gray-400 mb-1 block">
                Preço de
                <span class="text-yellow-300 font-semibold">{{ ridingData.adultName }}</span>
              </label>
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
                v-if="focusEfficiency > 0"
                class="bg-blue-900/40 text-blue-300 px-2 py-1 rounded-full border border-blue-700/40"
                >Foco −{{ focusReductionPct.toFixed(1) }}%</span
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
                <p class="text-xs text-gray-500 mb-0.5">{{ ridingData.adultName }} esperados</p>
                <p class="font-semibold text-green-400">
                  ~{{ expectedFoalsPerPasture.toFixed(2) }}
                </p>
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
        <h2 class="text-lg font-semibold text-yellow-400 mb-5">Resultados — Montaria</h2>

        <!-- KPI per pasture -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
            <p class="text-xs text-gray-400 mb-1">Filhotes / pasto</p>
            <p class="text-2xl font-bold text-green-400">
              ~{{ expectedFoalsPerPasture.toFixed(1) }}
            </p>
            <p class="text-xs text-gray-600 mt-1">{{ ridingData.adultName }}</p>
          </div>
        </div>

        <!-- Multi-pasture totals -->
        <div v-if="pastures > 1" class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
            <p class="text-xs text-gray-400 mb-1">Filhotes totais / {{ pastures }} pastos</p>
            <p class="text-xl font-bold text-green-400">~{{ expectedFoalsTotal.toFixed(1) }}</p>
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
              <tr class="border-t border-gray-800 hover:bg-gray-800/40 transition-colors">
                <td class="px-3 py-2 text-yellow-300">
                  <span
                    :class="['text-xs font-bold px-1 rounded mr-1', tierBg(ridingData.tier)]"
                    :style="{ color: tierTextColor(ridingData.tier) }"
                    >T{{ ridingData.tier }}</span
                  >
                  {{ ridingData.adultName }}
                </td>
                <td class="px-3 py-2 text-gray-400">~{{ expectedFoalsPerPasture.toFixed(2) }}</td>
                <td class="px-3 py-2">{{ fmt(priceRidingAdult) }}</td>
                <td class="px-3 py-2 text-green-400 font-semibold">
                  {{ fmt(revenueRidingPerPasture) }}
                </td>
                <td v-if="pastures > 1" class="px-3 py-2 text-gray-400 border-l border-gray-700">
                  ~{{ expectedFoalsTotal.toFixed(2) }}
                </td>
                <td v-if="pastures > 1" class="px-3 py-2 text-green-400 font-semibold">
                  {{ fmt(revenueRidingTotal) }}
                </td>
              </tr>
              <tr class="border-t border-gray-800 hover:bg-gray-800/40 transition-colors">
                <td class="px-3 py-2 text-red-400">{{ ridingData.youngName }} (custo)</td>
                <td class="px-3 py-2 text-gray-400">{{ animalsPerPasture }}</td>
                <td class="px-3 py-2">{{ fmt(priceRidingYoung) }}</td>
                <td class="px-3 py-2 text-red-400 font-semibold">
                  −{{ fmt(animalsPerPasture * priceRidingYoung) }}
                </td>
                <td v-if="pastures > 1" class="px-3 py-2 text-gray-400 border-l border-gray-700">
                  {{ animalsPerPasture * pastures }}
                </td>
                <td v-if="pastures > 1" class="px-3 py-2 text-red-400 font-semibold">
                  −{{ fmt(animalsPerPasture * pastures * priceRidingYoung) }}
                </td>
              </tr>
              <tr
                v-if="priceRidingFood > 0"
                class="border-t border-gray-800 hover:bg-gray-800/40 transition-colors"
              >
                <td class="px-3 py-2 text-red-400">
                  Comida ({{ foodPerAnimalRiding }} × {{ animalsPerPasture }} animais)
                </td>
                <td class="px-3 py-2 text-gray-400">
                  {{ foodPerAnimalRiding * animalsPerPasture }}
                </td>
                <td class="px-3 py-2">{{ fmt(priceRidingFood) }}</td>
                <td class="px-3 py-2 text-red-400 font-semibold">
                  −{{ fmt(foodCostRidingPerPasture) }}
                </td>
                <td v-if="pastures > 1" class="px-3 py-2 text-gray-400 border-l border-gray-700">
                  {{ foodPerAnimalRiding * animalsPerPasture * pastures }}
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
  </div>
</template>
