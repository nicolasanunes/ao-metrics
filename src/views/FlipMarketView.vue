<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { Quality, Location, Market } from '@/types/items'
import { fetchPrices, type PriceData } from '@/services/marketService'
import { useItemsStore } from '@/stores/items'
import NoteInformation from '@/components/NoteInformation.vue'
import { tierBadgeClasses } from '@/data/tierColors'

const itemsStore = useItemsStore()
const { itemMap: itemLabel } = storeToRefs(itemsStore)

const allEquippableIds = ref<string[]>([])
const results = ref<PriceData[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const progress = ref({ done: 0, total: 0 })

onMounted(async () => {
  itemsStore.load()
  try {
    const res = await fetch('/equippable_items.json')
    allEquippableIds.value = await res.json()
  } catch {
    error.value = 'Falha ao carregar lista de itens equipáveis.'
  }
})

function tierBadge(id: string): { bg: string; tierColor: string; tier: number; subtier: number } {
  const tierMatch = id.match(/^T(\d+)_/i)
  const subtierMatch = id.match(/@(\d+)$/)
  const tier = tierMatch ? Number(tierMatch[1]) : 0
  const subtier = subtierMatch ? Number(subtierMatch[1]) : 0
  const { bg, tierColor } = tierBadgeClasses(tier)
  return { bg, tierColor, tier, subtier }
}

function baseId(id: string) {
  return id.split('@')[0] ?? id
}

function itemName(id: string): string {
  return itemLabel.value[id] ?? itemLabel.value[baseId(id)] ?? baseId(id)
}

const qualityOptions = [
  { label: 'Normal', value: Quality.NORMAL },
  { label: 'Bom', value: Quality.GOOD },
  { label: 'Excepcional', value: Quality.OUTSTANDING },
  { label: 'Excelente', value: Quality.EXCELLENT },
  { label: 'Obra-prima', value: Quality.MASTERPIECE },
]

const selectedQualities = ref<Quality[]>([Quality.NORMAL])

const FIXED_LOCATIONS = [Location.Caerleon, Market.BlackMarket]
const CHUNK_SIZE = 200
const CONCURRENCY = 5

let currentAbortController: AbortController | null = null

async function search() {
  const ids = allEquippableIds.value
  if (!ids.length || !selectedQualities.value.length) return

  currentAbortController?.abort()
  currentAbortController = new AbortController()
  const signal = currentAbortController.signal

  const chunks: string[][] = []
  for (let i = 0; i < ids.length; i += CHUNK_SIZE) {
    chunks.push(ids.slice(i, i + CHUNK_SIZE))
  }

  loading.value = true
  error.value = null
  results.value = []
  progress.value = { done: 0, total: chunks.length }

  try {
    for (let i = 0; i < chunks.length; i += CONCURRENCY) {
      const batch = chunks.slice(i, i + CONCURRENCY)
      const batchResults = await Promise.all(
        batch.map((chunk) =>
          fetchPrices(
            { ids: chunk, locations: FIXED_LOCATIONS, qualities: selectedQualities.value },
            signal,
          ),
        ),
      )
      for (const r of batchResults) {
        results.value.push(...r)
      }
      progress.value.done = Math.min(i + CONCURRENCY, chunks.length)
    }
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') return
    error.value = e instanceof Error ? e.message : 'Erro desconhecido'
  } finally {
    loading.value = false
  }
}

interface FlipRow {
  item_id: string
  quality: number
  caerleon: PriceData | null
  blackMarket: PriceData | null
}

const SENTINEL_DATE = '0001-01-01'

function formatDate(dateStr: string) {
  if (!dateStr || dateStr.startsWith(SENTINEL_DATE)) return '-'
  const normalized = /[Zz]$|[+-]\d{2}:?\d{2}$/.test(dateStr) ? dateStr : dateStr + 'Z'
  const date = new Date(normalized)
  if (isNaN(date.getTime())) return '-'
  return date.toLocaleString('pt-BR', { timeZone: 'UTC' })
}

function dateBgClass(dateStr: string): string {
  if (!dateStr || dateStr.startsWith(SENTINEL_DATE)) return ''
  const normalized = /[Zz]$|[+-]\d{2}:?\d{2}$/.test(dateStr) ? dateStr : dateStr + 'Z'
  const date = new Date(normalized)
  if (isNaN(date.getTime())) return ''
  const hoursAgo = (Date.now() - date.getTime()) / 1000 / 3600
  if (hoursAgo < 0.5) return 'bg-blue-900/60 text-blue-300'
  if (hoursAgo < 6) return 'bg-green-900/60 text-green-300'
  if (hoursAgo < 24) return 'bg-yellow-900/60 text-yellow-300'
  return 'bg-red-900/60 text-red-300'
}

const qualityLabel: Record<number, string> = Object.fromEntries(
  qualityOptions.map((q) => [q.value, q.label]),
)

const onlyProfitable = ref(true)
const minProfitPct = ref<number | null>(null)

const flipRows = computed<FlipRow[]>(() => {
  const map = new Map<string, FlipRow>()
  for (const row of results.value) {
    const key = `${row.item_id}__${row.quality}`
    if (!map.has(key)) {
      map.set(key, {
        item_id: row.item_id,
        quality: row.quality,
        caerleon: null,
        blackMarket: null,
      })
    }
    const entry = map.get(key)!
    if (row.city === 'Caerleon') entry.caerleon = row
    else if (row.city === 'Black Market') entry.blackMarket = row
  }
  // keep only rows that have prices in both cities
  return [...map.values()].filter(
    (r) => r.caerleon?.sell_price_min && r.blackMarket?.sell_price_min,
  )
})

function profit(row: FlipRow): number | null {
  if (!row.caerleon || !row.blackMarket) return null
  if (row.caerleon.sell_price_min === 0 || row.blackMarket.sell_price_min === 0) return null
  return row.blackMarket.sell_price_min - row.caerleon.sell_price_min
}

function profitPct(row: FlipRow): number | null {
  if (!row.caerleon || !row.blackMarket) return null
  if (row.caerleon.sell_price_min === 0 || row.blackMarket.sell_price_min === 0) return null
  return (
    ((row.blackMarket.sell_price_min - row.caerleon.sell_price_min) / row.caerleon.sell_price_min) *
    100
  )
}

type SortKey = 'item_label' | 'quality' | 'caerleon_price' | 'bm_price' | 'profit' | 'profit_pct'
type SortDir = 'asc' | 'desc'

const sortKey = ref<SortKey>('profit_pct')
const sortDir = ref<SortDir>('desc')

function toggleSort(key: SortKey) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'desc'
  }
}

function sortIndicator(key: SortKey) {
  if (sortKey.value !== key) return '↕'
  return sortDir.value === 'asc' ? '↑' : '↓'
}

const sortedFlipRows = computed(() => {
  const key = sortKey.value
  const dir = sortDir.value === 'asc' ? 1 : -1
  let rows = [...flipRows.value]

  if (onlyProfitable.value) {
    rows = rows.filter((r) => (profit(r) ?? 0) > 0)
  }
  if (minProfitPct.value !== null && minProfitPct.value > 0) {
    rows = rows.filter((r) => (profitPct(r) ?? 0) >= minProfitPct.value!)
  }

  return rows.sort((a, b) => {
    if (key === 'item_label') {
      return itemName(a.item_id).localeCompare(itemName(b.item_id), 'pt-BR') * dir
    }
    if (key === 'quality') return (a.quality - b.quality) * dir
    if (key === 'caerleon_price') {
      return ((a.caerleon?.sell_price_min ?? 0) - (b.caerleon?.sell_price_min ?? 0)) * dir
    }
    if (key === 'bm_price') {
      return ((a.blackMarket?.sell_price_min ?? 0) - (b.blackMarket?.sell_price_min ?? 0)) * dir
    }
    if (key === 'profit') {
      return ((profit(a) ?? -Infinity) - (profit(b) ?? -Infinity)) * dir
    }
    if (key === 'profit_pct') {
      return ((profitPct(a) ?? -Infinity) - (profitPct(b) ?? -Infinity)) * dir
    }
    return 0
  })
})

const computedRows = computed(() =>
  sortedFlipRows.value.map((row) => ({
    ...row,
    badge: tierBadge(row.item_id),
    profitVal: profit(row),
    profitPctVal: profitPct(row),
  })),
)
</script>

<template>
  <div class="bg-gray-950/90 text-gray-100 rounded-lg p-6">
    <h1 class="text-2xl font-bold mb-6 text-yellow-400">Flip de Mercado</h1>

    <div class="flex flex-col md:flex-row items-stretch gap-2 mb-6">
      <!-- All equippable items info -->
      <div class="bg-gray-900 rounded-xl p-4 flex-1 relative">
        <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Itens</h2>
        <p class="text-sm text-gray-300 mb-1">
          <span class="text-yellow-400 font-semibold">{{
            allEquippableIds.length.toLocaleString()
          }}</span>
          itens carregados
        </p>
        <button
          @click="search"
          :disabled="loading || !allEquippableIds.length || !selectedQualities.length"
          class="absolute bottom-4 left-4 right-4 py-2 rounded-lg text-sm font-semibold transition-colors bg-yellow-400 text-gray-950 hover:bg-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {{ loading ? 'Buscando...' : 'Buscar flips' }}
        </button>
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

      <!-- Fixed Locations -->
      <div class="bg-gray-900 rounded-xl p-4 flex-1">
        <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Localidades
        </h2>
        <div class="flex flex-col gap-2 mb-3">
          <div class="flex items-center gap-2 text-sm">
            <span class="w-2.5 h-2.5 rounded-full bg-sky-400 flex-shrink-0"></span>
            <span class="text-gray-200">Caerleon</span>
            <span class="text-xs text-gray-500 ml-1">(compra)</span>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <span class="w-2.5 h-2.5 rounded-full bg-red-400 flex-shrink-0"></span>
            <span class="text-gray-200">Black Market</span>
            <span class="text-xs text-gray-500 ml-1">(venda)</span>
          </div>
        </div>
        <p class="text-xs text-gray-600 leading-relaxed">
          Localidades fixas para calcular o lucro de flip entre as duas cidades.
        </p>
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

      <!-- Quality -->
      <div class="bg-gray-900 rounded-xl p-4 flex-1">
        <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Qualidades
        </h2>
        <label
          v-for="q in qualityOptions"
          :key="q.value"
          class="flex items-center gap-2 py-1 cursor-pointer hover:text-yellow-300 transition-colors"
        >
          <input
            type="checkbox"
            :value="q.value"
            v-model="selectedQualities"
            class="accent-yellow-400"
          />
          <span class="text-sm">{{ q.label }}</span>
        </label>
      </div>
    </div>

    <!-- Progress bar -->
    <div v-if="loading" class="mb-4 bg-gray-900 rounded-xl p-4">
      <div class="flex items-center justify-between text-xs text-gray-400 mb-2">
        <span>Buscando preços...</span>
        <span>{{ progress.done }} / {{ progress.total }} lotes</span>
      </div>
      <div class="w-full bg-gray-800 rounded-full h-2">
        <div
          class="bg-yellow-400 h-2 rounded-full transition-all duration-300"
          :style="{ width: progress.total ? `${(progress.done / progress.total) * 100}%` : '0%' }"
        ></div>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="mt-4 bg-red-900/50 border border-red-700 rounded-xl p-4 text-red-300">
      {{ error }}
    </div>

    <!-- Filters + Results -->
    <div v-if="flipRows.length" class="mt-6 bg-gray-900 rounded-xl p-4">
      <div class="flex flex-wrap items-center gap-4 mb-4">
        <h2 class="text-lg font-semibold text-yellow-400">
          Comparativo de Preços
          <span class="text-sm text-gray-400 font-normal ml-2"
            >({{ sortedFlipRows.length }} itens)</span
          >
        </h2>
        <label
          class="flex items-center gap-2 text-sm cursor-pointer hover:text-yellow-300 transition-colors ml-auto"
        >
          <input type="checkbox" v-model="onlyProfitable" class="accent-yellow-400" />
          Somente lucrativos
        </label>
        <div class="flex items-center gap-2 text-sm">
          <span class="text-gray-400">Lucro mín. (%)</span>
          <input
            v-model.number="minProfitPct"
            type="number"
            min="0"
            placeholder="0"
            class="w-20 bg-gray-800 text-gray-100 rounded-lg px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-yellow-400"
          />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm border-collapse">
          <thead>
            <tr class="bg-gray-800 text-gray-400 text-left text-xs">
              <th
                class="px-3 py-2 rounded-tl-lg cursor-pointer select-none hover:text-yellow-300 transition-colors"
                @click="toggleSort('item_label')"
              >
                Item <span class="ml-1">{{ sortIndicator('item_label') }}</span>
              </th>
              <th
                class="px-3 py-2 cursor-pointer select-none hover:text-yellow-300 transition-colors"
                @click="toggleSort('quality')"
              >
                Qualidade <span class="ml-1">{{ sortIndicator('quality') }}</span>
              </th>
              <th
                class="px-3 py-2 text-sky-400 cursor-pointer select-none hover:text-sky-300 transition-colors"
                @click="toggleSort('caerleon_price')"
              >
                Caerleon (Venda Mín.)
                <span class="ml-1">{{ sortIndicator('caerleon_price') }}</span>
              </th>
              <th class="px-3 py-2 text-gray-500 text-xs font-normal">Atualizado em (UTC)</th>
              <th
                class="px-3 py-2 text-red-400 cursor-pointer select-none hover:text-red-300 transition-colors"
                @click="toggleSort('bm_price')"
              >
                Black Market (Venda Mín.) <span class="ml-1">{{ sortIndicator('bm_price') }}</span>
              </th>
              <th class="px-3 py-2 text-gray-500 text-xs font-normal">Atualizado em (UTC)</th>
              <th
                class="px-3 py-2 cursor-pointer select-none hover:text-yellow-300 transition-colors"
                @click="toggleSort('profit')"
              >
                Lucro <span class="ml-1">{{ sortIndicator('profit') }}</span>
              </th>
              <th
                class="px-3 py-2 rounded-tr-lg cursor-pointer select-none hover:text-yellow-300 transition-colors"
                @click="toggleSort('profit_pct')"
              >
                % Lucro <span class="ml-1">{{ sortIndicator('profit_pct') }}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in computedRows"
              :key="`${row.item_id}__${row.quality}`"
              class="border-t border-gray-800 hover:bg-gray-800/50 transition-colors"
            >
              <td class="px-3 py-2 text-xs text-yellow-300">
                <span class="inline-flex items-center gap-1.5">
                  <span :class="['font-bold px-1.5 py-0.5 rounded', row.badge.bg]">
                    <span :style="{ color: row.badge.tierColor }">T{{ row.badge.tier }}</span
                    ><span v-if="row.badge.subtier > 0" :style="{ color: row.badge.tierColor }"
                      >.{{ row.badge.subtier }}</span
                    >
                  </span>
                  {{ itemName(row.item_id) }}
                </span>
              </td>
              <td class="px-3 py-2">{{ qualityLabel[row.quality] ?? row.quality }}</td>
              <td class="px-3 py-2 text-sky-400">
                {{ row.caerleon!.sell_price_min.toLocaleString() }}
              </td>
              <td
                class="px-3 py-2 text-xs rounded"
                :class="dateBgClass(row.caerleon!.sell_price_min_date)"
              >
                {{ formatDate(row.caerleon!.sell_price_min_date) }}
              </td>
              <td class="px-3 py-2 text-red-400">
                {{ row.blackMarket!.sell_price_min.toLocaleString() }}
              </td>
              <td
                class="px-3 py-2 text-xs rounded"
                :class="dateBgClass(row.blackMarket!.sell_price_min_date)"
              >
                {{ formatDate(row.blackMarket!.sell_price_min_date) }}
              </td>
              <td
                class="px-3 py-2 font-semibold"
                :class="row.profitVal! > 0 ? 'text-green-400' : 'text-red-400'"
              >
                {{ row.profitVal!.toLocaleString() }}
              </td>
              <td
                class="px-3 py-2 font-semibold"
                :class="row.profitPctVal! > 0 ? 'text-green-400' : 'text-red-400'"
              >
                {{ row.profitPctVal!.toFixed(1) }}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div
      v-if="!loading && !flipRows.length && !error && results.length === 0"
      class="mt-10 text-center text-gray-600 text-sm"
    >
      Selecione ao menos uma qualidade e clique em "Buscar Flips".
    </div>

    <div
      v-if="!loading && results.length > 0 && sortedFlipRows.length === 0"
      class="mt-10 text-center text-gray-500 text-sm"
    >
      Nenhum item lucrativo encontrado com os filtros atuais.
    </div>

    <NoteInformation />
  </div>
</template>
