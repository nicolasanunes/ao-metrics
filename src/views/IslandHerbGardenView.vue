<script setup lang="ts">
import { useHerbCalculator } from '@/composables/useHerbCalculator'
import { HERB_OPTIONS } from '@/composables/useHerbCalculator'
import {
  tierBg,
  tierTextColor,
  fmt,
  profitColorClass,
  marginColorClass,
  marginBgClass,
} from '@/composables/useFarmingCalculator'

const {
  // State
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
  // Focus
  focusEfficiency,
  focusPerSeed,
  focusReductionPct,
  focusThisCycle,
  focusTotal,
  // Per plot
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
  // Totals
  seedsBackTotal,
  herbsHarvestedTotal,
  earthwormsTotal,
  revenueTotal,
  costTotal,
  netProfitTotal,
  // Derived
  profitMarginPct,
  isSeedSustainable,
  bonusCities,
} = useHerbCalculator()
</script>

<template>
  <div class="bg-gray-950/90 text-gray-100 rounded-lg p-6">
    <h1 class="text-2xl font-bold mb-1 text-yellow-400">AO Calculadora de Horta de Ervas</h1>
    <p class="text-sm text-gray-500 mb-6">
      Calcule o lucro do cultivo de ervas por horta, considerando irrigação com foco, bônus de
      cidade e status de premium.
    </p>

    <!-- ── Row 1: Erva + Foco & Premium + Cidade ───────────────────────── -->
    <div class="flex flex-col md:flex-row items-stretch gap-2 mb-6">
      <!-- Herb selector -->
      <div class="bg-gray-900 rounded-xl p-4 flex-1">
        <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Erva</h2>
        <div class="flex flex-col gap-1.5">
          <button
            v-for="opt in HERB_OPTIONS"
            :key="opt.value"
            @click="herb = opt.value"
            :class="[
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer text-left',
              herb === opt.value
                ? 'bg-yellow-400 text-gray-950'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700',
            ]"
          >
            {{ opt.label }}
          </button>
        </div>

        <!-- Seed yield info card -->
        <div class="mt-4 bg-gray-800 rounded-lg p-3">
          <p class="text-xs text-gray-400 uppercase tracking-wider mb-2">% retorno de Sementes</p>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p class="text-xs text-gray-500 mb-0.5">% retorno sem irrigação</p>
              <p class="font-semibold text-gray-300">
                {{ (herbData.yieldUnwatered * 100).toFixed(0) }}%
              </p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-0.5">% retorno com irrigação</p>
              <p class="font-semibold text-green-400">
                {{ (herbData.yieldWatered * 100).toFixed(0) }}%
              </p>
            </div>
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

      <!-- Focus & Premium -->
      <div class="bg-gray-900 rounded-xl p-4 flex-1">
        <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Foco &amp; Especialização
        </h2>

        <div class="grid grid-cols-2 gap-3 mb-4">
          <div class="flex flex-col gap-1">
            <label class="text-xs text-gray-500">Especialização em Herborista (0–100)</label>
            <input
              type="number"
              v-model.number="specFarming"
              min="0"
              max="100"
              class="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-yellow-400 text-center"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs text-gray-500"
              >Especialização em {{ herbData.name }} (0–100)</label
            >
            <input
              type="number"
              v-model.number="specCultura"
              min="0"
              max="100"
              class="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-yellow-400 text-center"
            />
          </div>
        </div>

        <!-- Focus cost breakdown -->
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
              <p class="text-xs text-gray-500 mb-0.5">Foco / semente</p>
              <p class="font-bold text-blue-400">{{ fmt(focusPerSeed) }}</p>
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
            <span class="ml-auto text-xs text-gray-500">Colheita ×2 · Minhoca ×2</span>
          </label>
          <label
            class="flex items-center gap-2 cursor-pointer hover:text-yellow-300 transition-colors"
          >
            <input type="checkbox" v-model="cityBonus" class="accent-yellow-400" />
            <span class="text-sm">Bônus de cidade (+10% colheita)</span>
          </label>
          <div class="mt-1.5 flex flex-wrap gap-1">
            <span
              v-for="city in bonusCities"
              :key="city"
              :class="[
                'text-xs px-2 py-0.5 rounded-full border font-medium',
                cityBonus
                  ? 'bg-green-400/20 text-green-300 border-green-400/30'
                  : 'bg-gray-800 text-gray-500 border-gray-700',
              ]"
            >
              {{ city }}
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

      <!-- Seeds watered + Plots -->
      <div class="bg-gray-900 rounded-xl p-4 flex-1">
        <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Hortas &amp; Irrigação
        </h2>

        <div class="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label class="text-xs text-gray-500 mb-2 block">Número de hortas</label>
            <input
              type="number"
              v-model.number="plots"
              min="1"
              class="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-yellow-400"
            />
          </div>

          <div>
            <label class="text-xs text-gray-500 mb-2 block">Ervas / horta (máx. 9)</label>
            <input
              type="number"
              v-model.number="seedsPerPlot"
              min="1"
              max="9"
              class="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-yellow-400"
            />
          </div>
        </div>

        <div class="border-t border-gray-700 pt-4 mb-4">
          <label class="text-xs text-gray-500 mb-2 block"
            >Total de sementes irrigadas (máx. {{ seedsPerPlot * plots }})</label
          >
          <input
            type="number"
            v-model.number="seedsWatered"
            min="0"
            :max="seedsPerPlot * plots"
            class="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-yellow-400"
          />
          <div class="flex items-center justify-between text-xs text-gray-500 mt-1.5">
            <span>{{ seedsWatered }} irrigadas · {{ seedsUnwatered }} secas</span>
            <span class="text-blue-400 font-semibold">{{ fmt(focusTotal) }} foco total</span>
          </div>
        </div>

        <!-- Cycle summary -->
        <div class="mt-4 bg-gray-800 rounded-lg p-3 text-sm">
          <p class="text-xs text-gray-400 uppercase tracking-wider mb-2">Resumo do ciclo</p>
          <div class="space-y-1 text-xs">
            <div class="flex justify-between">
              <span class="text-gray-500">Sementes plantadas</span>
              <span class="text-gray-300 font-semibold"
                >{{ seedsPerPlot }} × {{ plots }} = {{ seedsPerPlot * plots }}</span
              >
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Colheita esperada / horta</span>
              <span class="text-gray-300 font-semibold"
                >~{{ herbYieldAvg.toFixed(1) }} × {{ seedsPerPlot }}</span
              >
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Tempo de crescimento</span>
              <span class="text-gray-300 font-semibold">22 horas</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Fame por colheita</span>
              <span class="text-yellow-300 font-semibold">{{ totalFame }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Sementes de retorno / horta</span>
              <span
                :class="['font-semibold', isSeedSustainable ? 'text-green-400' : 'text-red-400']"
              >
                ~{{ seedsBack.toFixed(2) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Row 2: mobile arrow ─────────────────────────────────────────── -->
    <div class="flex md:hidden items-center justify-center text-gray-600 mb-2">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>

    <!-- ── Row 2: Prices + Active config summary ──────────────────────── -->
    <div class="flex flex-col md:flex-row items-stretch gap-2 mb-6">
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
                <span
                  :class="['text-xs font-bold px-1 rounded', tierBg(herbData.tier)]"
                  :style="{ color: tierTextColor(herbData.tier) }"
                >
                  T{{ herbData.tier }}
                </span>
                {{ herbData.name }}
              </div>
            </div>
            <input
              type="number"
              v-model.number="priceCrop"
              min="0"
              placeholder="0"
              class="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-yellow-400 placeholder-gray-600"
            />
          </div>
          <div>
            <div class="flex items-center gap-1">
              <label class="text-xs text-gray-400 mb-1 block">Preço das </label>
              <div
                class="bg-gray-700 text-yellow-300 px-1 py-0.5 rounded flex items-center gap-1.5 text-xs mb-1.5 w-fit"
              >
                <span
                  :class="['text-xs font-bold px-1 rounded', tierBg(herbData.tier)]"
                  :style="{ color: tierTextColor(herbData.tier) }"
                >
                  T{{ herbData.tier }}
                </span>
                {{ herbData.seedName }}
              </div>
            </div>
            <input
              type="number"
              v-model.number="priceSeed"
              min="0"
              placeholder="0"
              class="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-yellow-400 placeholder-gray-600"
            />
          </div>
          <div>
            <div class="flex items-center gap-1">
              <label class="text-xs text-gray-400 mb-1 block">Preço do</label>
              <div
                class="bg-gray-700 text-yellow-300 px-1 py-0.5 rounded flex items-center gap-1.5 text-xs mb-1.5 w-fit"
              >
                <span class="text-xs font-bold px-1 rounded bg-[#707070] text-white">T1</span>
                Minhoca
              </div>
              <span class="text-gray-600 text-xs mb-1">(opcional)</span>
            </div>
            <input
              type="number"
              v-model.number="priceEarthworm"
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

      <!-- Active config summary -->
      <div class="bg-gray-900 rounded-xl p-4 flex-1 flex flex-col gap-4">
        <div>
          <p class="text-xs text-gray-500 uppercase tracking-wider mb-2">Configuração ativa</p>
          <div class="flex flex-wrap gap-1.5 text-xs">
            <span class="bg-gray-800 px-2 py-1 rounded-full text-gray-300">
              {{ herbData.name }}
            </span>
            <span
              v-if="premium"
              class="bg-yellow-400/20 text-yellow-300 px-2 py-1 rounded-full border border-yellow-400/30"
            >
              Premium
            </span>
            <span
              v-if="cityBonus"
              class="bg-green-400/20 text-green-300 px-2 py-1 rounded-full border border-green-400/30"
            >
              Bônus cidade +10%
            </span>
            <span
              class="bg-blue-400/20 text-blue-300 px-2 py-1 rounded-full border border-blue-400/30"
            >
              {{ seedsWatered }}/{{ 9 * plots }} irrigadas
            </span>
            <span
              v-if="focusEfficiency > 0"
              class="bg-blue-900/40 text-blue-300 px-2 py-1 rounded-full border border-blue-700/40"
            >
              Foco −{{ focusReductionPct.toFixed(1) }}%
            </span>
            <span class="bg-gray-700 text-yellow-300 px-2 py-1 rounded-full font-semibold">
              {{ plots }} horta{{ plots !== 1 ? 's' : '' }}
            </span>
          </div>
        </div>

        <!-- Per-plot production preview -->
        <div class="bg-gray-800 rounded-lg p-3">
          <p class="text-xs text-gray-400 uppercase tracking-wider mb-2">
            Produção por horta (1 ciclo)
          </p>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div>
              <div class="flex items-center gap-1">
                <p class="text-xs text-gray-500 mb-0.5">Retorno de</p>
                <div
                  class="bg-gray-700 text-yellow-300 px-1 py-0.5 rounded flex items-center gap-1.5 text-xs mb-1.5 w-fit"
                >
                  <span
                    :class="['text-xs font-bold px-1 rounded', tierBg(herbData.tier)]"
                    :style="{ color: tierTextColor(herbData.tier) }"
                  >
                    T{{ herbData.tier }}
                  </span>
                  {{ herbData.name }}
                </div>
              </div>
              <p class="text-gray-200 font-semibold">~{{ herbsHarvested.toFixed(1) }}</p>
            </div>
            <div>
              <div class="flex items-center gap-1">
                <p class="text-xs text-gray-500 mb-0.5">Retorno de</p>
                <div
                  class="bg-gray-700 text-yellow-300 px-1 py-0.5 rounded flex items-center gap-1.5 text-xs mb-1.5 w-fit"
                >
                  <span
                    :class="['text-xs font-bold px-1 rounded', tierBg(herbData.tier)]"
                    :style="{ color: tierTextColor(herbData.tier) }"
                  >
                    T{{ herbData.tier }}
                  </span>
                  {{ herbData.seedName }}
                </div>
              </div>
              <p :class="['font-semibold', isSeedSustainable ? 'text-green-400' : 'text-red-400']">
                ~{{ seedsBack.toFixed(2) }}
              </p>
            </div>
            <div>
              <div class="flex items-center gap-1">
                <p class="text-xs text-gray-500 mb-0.5">Retorno de</p>
                <div
                  class="bg-gray-700 text-yellow-300 px-1 py-0.5 rounded flex items-center gap-1.5 text-xs mb-1.5 w-fit"
                >
                  <span class="text-xs font-bold px-1 rounded bg-[#707070] text-white">T1</span>
                  Minhoca
                </div>
              </div>
              <p class="text-gray-200 font-semibold">~{{ earthworms.toFixed(2) }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-0.5">Foco gasto</p>
              <p class="text-blue-400 font-semibold">{{ fmt(focusThisCycle) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Results ────────────────────────────────────────────────────── -->
    <div class="bg-gray-900 rounded-xl p-6">
      <h2 class="text-lg font-semibold text-yellow-400 mb-5">Resultados do Cálculo</h2>

      <!-- KPI cards -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div class="bg-gray-800 rounded-xl p-4 text-center">
          <p class="text-xs text-gray-400 mb-1">Receita / horta</p>
          <p class="text-2xl font-bold text-yellow-300">{{ fmt(revenue) }}</p>
          <p class="text-xs text-gray-600 mt-1">prata</p>
        </div>
        <div class="bg-gray-800 rounded-xl p-4 text-center">
          <p class="text-xs text-gray-400 mb-1">Custo de sementes / horta</p>
          <p class="text-2xl font-bold text-red-400">{{ fmt(cost) }}</p>
          <p class="text-xs text-gray-600 mt-1">9 × preço / semente</p>
        </div>
        <div class="bg-gray-800 rounded-xl p-4 text-center col-span-2 md:col-span-1">
          <p class="text-xs text-gray-400 mb-1">Lucro líquido / horta</p>
          <p class="text-2xl font-bold" :class="profitColorClass(netProfit)">
            {{ fmt(netProfit) }}
          </p>
          <p class="text-xs text-gray-600 mt-1">prata</p>
        </div>
        <div class="bg-gray-800 rounded-xl p-4 text-center">
          <p class="text-xs text-gray-400 mb-1">Foco / horta</p>
          <p
            class="text-2xl font-bold"
            :class="seedsWatered > 0 ? 'text-blue-400' : 'text-gray-600'"
          >
            {{ seedsWatered > 0 ? fmt(focusThisCycle) : '—' }}
          </p>
          <p v-if="seedsWatered > 0" class="text-xs text-gray-600 mt-1">
            {{ fmt(focusPerSeed) }} / semente
          </p>
        </div>
        <div class="bg-gray-800 rounded-xl p-4 text-center col-span-2 md:col-span-1">
          <p class="text-xs text-gray-400 mb-1">Sementes retornadas / horta</p>
          <p
            class="text-2xl font-bold"
            :class="isSeedSustainable ? 'text-green-400' : 'text-red-400'"
          >
            ~{{ seedsBack.toFixed(1) }}
          </p>
          <p class="text-xs text-gray-600 mt-1">de 9 plantadas</p>
        </div>
      </div>

      <!-- Multi-plot cards (visible when plots > 1) -->
      <div v-if="plots > 1" class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div class="bg-blue-900/20 border border-blue-700/40 rounded-xl p-4 text-center">
          <p class="text-xs text-gray-400 mb-1">Receita total / {{ plots }} jardins</p>
          <p class="text-xl font-bold text-yellow-300">{{ fmt(revenueTotal) }}</p>
        </div>
        <div class="bg-red-900/20 border border-red-700/40 rounded-xl p-4 text-center">
          <p class="text-xs text-gray-400 mb-1">Custo total / {{ plots }} jardins</p>
          <p class="text-xl font-bold text-red-400">{{ fmt(costTotal) }}</p>
        </div>
        <div
          :class="[
            'rounded-xl p-4 text-center col-span-2 md:col-span-1 border',
            netProfitTotal >= 0
              ? 'bg-green-900/20 border-green-700/40'
              : 'bg-red-900/20 border-red-700/40',
          ]"
        >
          <p class="text-xs text-gray-400 mb-1">Lucro líquido total / {{ plots }} jardins</p>
          <p class="text-xl font-bold" :class="profitColorClass(netProfitTotal)">
            {{ fmt(netProfitTotal) }}
          </p>
        </div>
        <div class="bg-blue-900/20 border border-blue-700/40 rounded-xl p-4 text-center">
          <p class="text-xs text-gray-400 mb-1">Foco total / {{ plots }} jardins</p>
          <p class="text-xl font-bold text-blue-400">
            {{ seedsWatered > 0 ? fmt(focusTotal) : '—' }}
          </p>
        </div>
        <div
          :class="[
            'rounded-xl p-4 text-center col-span-2 md:col-span-1 border',
            isSeedSustainable
              ? 'bg-green-900/20 border-green-700/40'
              : 'bg-red-900/20 border-red-700/40',
          ]"
        >
          <p class="text-xs text-gray-400 mb-1">Sementes retornadas / {{ plots }} jardins</p>
          <p
            class="text-xl font-bold"
            :class="isSeedSustainable ? 'text-green-400' : 'text-red-400'"
          >
            ~{{ seedsBackTotal.toFixed(1) }}
          </p>
          <p class="text-xs text-gray-600 mt-1">de {{ 9 * plots }} plantadas</p>
        </div>
      </div>

      <!-- Detailed breakdown table -->
      <div class="overflow-x-auto mb-6">
        <table class="w-full text-sm border-collapse">
          <thead>
            <tr class="bg-gray-800 text-gray-400 text-left text-xs">
              <th class="px-3 py-2 rounded-tl-lg">Item</th>
              <th class="px-3 py-2">Qtd. (1 horta)</th>
              <th class="px-3 py-2">Preço unit.</th>
              <th class="px-3 py-2 text-yellow-400">Valor (1 horta)</th>
              <th v-if="plots > 1" class="px-3 py-2 border-l border-gray-700">
                Qtd. ({{ plots }} hortas)
              </th>
              <th v-if="plots > 1" class="px-3 py-2 text-yellow-400 rounded-tr-lg">
                Valor ({{ plots }} hortas)
              </th>
              <th v-else class="px-3 py-2 rounded-tr-lg"></th>
            </tr>
          </thead>
          <tbody>
            <!-- Herbs row -->
            <tr class="border-t border-gray-800 hover:bg-gray-800/40 transition-colors">
              <td class="px-3 py-2 text-yellow-300">
                <span
                  :class="['text-xs font-bold px-1 rounded mr-1', tierBg(herbData.tier)]"
                  :style="{ color: tierTextColor(herbData.tier) }"
                >
                  T{{ herbData.tier }}
                </span>
                {{ herbData.name }}
              </td>
              <td class="px-3 py-2 text-gray-400">~{{ herbsHarvested.toFixed(1) }}</td>
              <td class="px-3 py-2">{{ fmt(priceCrop) }}</td>
              <td class="px-3 py-2 text-green-400 font-semibold">
                {{ fmt(herbsHarvested * priceCrop) }}
              </td>
              <td v-if="plots > 1" class="px-3 py-2 text-gray-400 border-l border-gray-700">
                ~{{ herbsHarvestedTotal.toFixed(1) }}
              </td>
              <td v-if="plots > 1" class="px-3 py-2 text-green-400 font-semibold">
                {{ fmt(herbsHarvestedTotal * priceCrop) }}
              </td>
            </tr>

            <!-- Seeds back row -->
            <tr class="border-t border-gray-800 hover:bg-gray-800/40 transition-colors">
              <td class="px-3 py-2 text-yellow-300">
                <span
                  :class="['text-xs font-bold px-1 rounded mr-1', tierBg(herbData.tier)]"
                  :style="{ color: tierTextColor(herbData.tier) }"
                >
                  T{{ herbData.tier }}
                </span>
                Sementes de {{ herbData.name }}
              </td>
              <td class="px-3 py-2 text-gray-400">~{{ seedsBack.toFixed(2) }}</td>
              <td class="px-3 py-2">{{ fmt(priceSeed) }}</td>
              <td class="px-3 py-2 text-green-400 font-semibold">
                {{ fmt(seedsBack * priceSeed) }}
              </td>
              <td v-if="plots > 1" class="px-3 py-2 text-gray-400 border-l border-gray-700">
                ~{{ seedsBackTotal.toFixed(2) }}
              </td>
              <td v-if="plots > 1" class="px-3 py-2 text-green-400 font-semibold">
                {{ fmt(seedsBackTotal * priceSeed) }}
              </td>
            </tr>

            <!-- Byproduct row -->
            <tr class="border-t border-gray-800 hover:bg-gray-800/40 transition-colors">
              <td class="px-3 py-2 text-yellow-300">
                <span class="text-xs font-bold px-1 mr-1 rounded bg-gray-600 text-gray-100"
                  >T1</span
                >
                Minhoca
              </td>
              <td class="px-3 py-2 text-gray-400">~{{ earthworms.toFixed(2) }}</td>
              <td class="px-3 py-2">{{ fmt(priceEarthworm) }}</td>
              <td class="px-3 py-2 text-green-400 font-semibold">
                {{ fmt(earthworms * priceEarthworm) }}
              </td>
              <td v-if="plots > 1" class="px-3 py-2 text-gray-400 border-l border-gray-700">
                ~{{ earthwormsTotal.toFixed(2) }}
              </td>
              <td v-if="plots > 1" class="px-3 py-2 text-green-400 font-semibold">
                {{ fmt(earthwormsTotal * priceEarthworm) }}
              </td>
            </tr>

            <!-- Seed cost row -->
            <tr class="border-t border-gray-800 hover:bg-gray-800/40 transition-colors">
              <td class="px-3 py-2 text-red-400">Custo de sementes (9)</td>
              <td class="px-3 py-2 text-gray-400">9</td>
              <td class="px-3 py-2">{{ fmt(priceSeed) }}</td>
              <td class="px-3 py-2 text-red-400 font-semibold">−{{ fmt(cost) }}</td>
              <td v-if="plots > 1" class="px-3 py-2 text-gray-400 border-l border-gray-700">
                {{ 9 * plots }}
              </td>
              <td v-if="plots > 1" class="px-3 py-2 text-red-400 font-semibold">
                −{{ fmt(costTotal) }}
              </td>
            </tr>

            <!-- Total row -->
            <tr class="border-t-2 border-gray-700 bg-gray-800/60 font-semibold">
              <td class="px-3 py-2 text-yellow-400 rounded-bl-lg">LUCRO LÍQUIDO</td>
              <td class="px-3 py-2 text-gray-500">—</td>
              <td class="px-3 py-2 text-gray-500">—</td>
              <td class="px-3 py-2 text-base" :class="profitColorClass(netProfit)">
                {{ fmt(netProfit) }}
              </td>
              <td v-if="plots > 1" class="px-3 py-2 text-gray-500 border-l border-gray-700">—</td>
              <td
                v-if="plots > 1"
                class="px-3 py-2 text-base rounded-br-lg"
                :class="profitColorClass(netProfitTotal)"
              >
                {{ fmt(netProfitTotal) }}
              </td>
              <td v-else class="px-3 py-2 rounded-br-lg"></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Focus breakdown -->
      <div
        v-if="seedsWatered > 0"
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
            <p class="text-xs text-gray-500 mb-0.5">Foco por semente</p>
            <p class="text-blue-400 font-bold">{{ fmt(focusPerSeed) }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-0.5">Foco por horta</p>
            <p class="text-blue-400 font-bold">{{ fmt(focusThisCycle) }}</p>
          </div>
        </div>
        <div v-if="plots > 1" class="mt-3 border-t border-blue-700/40 pt-3">
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p class="text-xs text-gray-500 mb-0.5">Foco total ({{ plots }} hortas)</p>
              <p class="text-blue-400 font-bold">{{ fmt(focusTotal) }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-0.5">Sementes irrigadas total</p>
              <p class="text-gray-300 font-semibold">{{ seedsWatered }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-0.5">Foco base (sem spec.)</p>
              <p class="text-gray-400 font-semibold">1.000 / semente</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Seed sustainability banner -->
      <div
        :class="[
          'rounded-xl p-4 mb-4 border',
          isSeedSustainable
            ? 'bg-green-900/20 border-green-700/40'
            : 'bg-red-900/20 border-red-700/40',
        ]"
      >
        <h3
          :class="[
            'text-sm font-semibold uppercase tracking-wider mb-2',
            isSeedSustainable ? 'text-green-300' : 'text-red-300',
          ]"
        >
          Sustentabilidade de Sementes
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p class="text-xs text-gray-500 mb-0.5">Sementes plantadas</p>
            <p class="text-gray-300 font-semibold">9</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-0.5">Retorno esperado</p>
            <p :class="['font-semibold', isSeedSustainable ? 'text-green-400' : 'text-red-400']">
              ~{{ seedsBack.toFixed(2) }}
            </p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-0.5">% retorno irrigado</p>
            <p class="text-gray-300 font-semibold">
              {{ (herbData.yieldWatered * 100).toFixed(0) }}%
            </p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-0.5">% retorno sem irrigação</p>
            <p class="text-gray-300 font-semibold">
              {{ (herbData.yieldUnwatered * 100).toFixed(0) }}%
            </p>
          </div>
        </div>
        <p v-if="!isSeedSustainable" class="text-xs text-red-300 mt-2">
          ⚠️ Com {{ seedsWatered }} semente(s) irrigada(s) e a combinação atual de % retorno, você
          perde sementes a cada ciclo. Considere irrigar mais sementes ou verificar o % retorno da
          erva selecionada.
        </p>
        <p v-else class="text-xs text-green-300 mt-2">
          ✓ Você recupera sementes suficientes para manter o ciclo de produção.
        </p>
      </div>

      <!-- Profitability section -->
      <div class="border-t border-gray-700 pt-5">
        <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Lucratividade ({{ plots > 1 ? plots + ' jardins' : '1 jardim' }})
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-gray-800 rounded-xl p-3 text-center">
            <p class="text-xs text-gray-400 mb-1">Receita total</p>
            <p class="text-xl font-bold text-gray-200">{{ fmt(revenueTotal) }}</p>
          </div>
          <div class="bg-gray-800 rounded-xl p-3 text-center">
            <p class="text-xs text-gray-400 mb-1">Custo total de sementes</p>
            <p class="text-xl font-bold text-red-400">{{ fmt(costTotal) }}</p>
          </div>
          <div class="bg-gray-800 rounded-xl p-3 text-center">
            <p class="text-xs text-gray-400 mb-1">Lucro líquido total</p>
            <p class="text-xl font-bold" :class="profitColorClass(netProfitTotal)">
              {{ fmt(netProfitTotal) }}
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
    </div>
  </div>
</template>
