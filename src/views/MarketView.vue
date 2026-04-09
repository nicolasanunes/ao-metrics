<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { Quality, type Item, Location } from '@/types/items'
import { fetchPrices, type PriceData } from '@/services/marketService'
import { useItemsStore } from '@/stores/items'
import NoteInformation from '@/components/NoteInformation.vue'
import { tierBadgeClasses } from '@/data/tierColors'

const itemsStore = useItemsStore()
onMounted(() => itemsStore.load())

const itemSearch = ref('')
const showDropdown = ref(false)

function normalize(str: string) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

const { itemMap: itemLabel } = storeToRefs(itemsStore)

function tierBadge(id: string): {
  bg: string
  tierColor: string
  tier: number
  subtier: number
} {
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

const filteredItems = computed(() => {
  const q = normalize(itemSearch.value.trim())
  if (!q) return []
  return itemsStore.items
    .filter((item) => normalize(item.name).includes(q) || normalize(item.id).includes(q))
    .sort((a, b) => {
      const baseA = baseId(a.id)
      const baseB = baseId(b.id)
      if (baseA !== baseB) return baseA.localeCompare(baseB)
      const subA = a.id.includes('@') ? Number(a.id.split('@')[1]) : 0
      const subB = b.id.includes('@') ? Number(b.id.split('@')[1]) : 0
      return subA - subB
    })
    .slice(0, 30)
})

function addItem(id: string) {
  if (!selectedItems.value.includes(id)) {
    selectedItems.value.push(id)
  }
  itemSearch.value = ''
  search()
}

function removeItem(id: string) {
  selectedItems.value = selectedItems.value.filter((i) => i !== id)
}

const allLocations = Object.values(Location)

const qualityOptions = [
  { label: 'Normal', value: Quality.NORMAL },
  { label: 'Bom', value: Quality.GOOD },
  { label: 'Excepcional', value: Quality.OUTSTANDING },
  { label: 'Excelente', value: Quality.EXCELLENT },
  { label: 'Obra-prima', value: Quality.MASTERPIECE },
]

const selectedItems = ref<Item[]>([])
const selectedLocations = ref<Location[]>([...allLocations])
const selectedQualities = ref<Quality[]>([Quality.NORMAL])

const isValid = computed(
  () =>
    selectedItems.value.length > 0 &&
    selectedLocations.value.length > 0 &&
    selectedQualities.value.length > 0,
)

const results = ref<PriceData[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

let currentAbortController: AbortController | null = null

watch(isValid, (valid) => {
  if (!valid) {
    currentAbortController?.abort()
    results.value = []
    error.value = null
  }
})

async function search() {
  if (!isValid.value) return

  currentAbortController?.abort()
  currentAbortController = new AbortController()

  loading.value = true
  error.value = null
  results.value = []

  try {
    results.value = await fetchPrices(
      {
        ids: selectedItems.value,
        locations: selectedLocations.value,
        qualities: selectedQualities.value,
      },
      currentAbortController.signal,
    )
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') return
    error.value = e instanceof Error ? e.message : 'Erro desconhecido'
  } finally {
    loading.value = false
  }
}

watch([selectedLocations, selectedQualities], () => search())

const allLocationsSelected = computed(() => selectedLocations.value.length === allLocations.length)

function toggleAllLocations() {
  if (allLocationsSelected.value) {
    selectedLocations.value = []
  } else {
    selectedLocations.value = [...allLocations]
  }
}

const qualityLabel: Record<number, string> = Object.fromEntries(
  qualityOptions.map((q) => [q.value, q.label]),
)

type SortKey =
  | 'item_label'
  | 'city'
  | 'quality'
  | 'sell_price_min'
  | 'sell_price_min_date'
  | 'sell_price_max'
  | 'sell_price_max_date'
  | 'buy_price_max'
  | 'buy_price_max_date'
type SortDir = 'asc' | 'desc'

const sortKey = ref<SortKey | null>(null)
const sortDir = ref<SortDir>('asc')

function toggleSort(key: SortKey) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'asc'
  }
}

function sortIndicator(key: SortKey) {
  if (sortKey.value !== key) return '↕'
  return sortDir.value === 'asc' ? '↑' : '↓'
}

const sortedResults = computed(() => {
  if (!sortKey.value) return results.value
  const key = sortKey.value
  const dir = sortDir.value === 'asc' ? 1 : -1
  return [...results.value].sort((a, b) => {
    if (key === 'item_label') {
      const la = itemName(a.item_id)
      const lb = itemName(b.item_id)
      return la.localeCompare(lb, 'pt-BR') * dir
    }
    if (key === 'city') {
      return a.city.localeCompare(b.city, 'pt-BR') * dir
    }
    if (
      key === 'sell_price_min_date' ||
      key === 'sell_price_max_date' ||
      key === 'buy_price_max_date'
    ) {
      const da = new Date(a[key]).getTime() || 0
      const db = new Date(b[key]).getTime() || 0
      return (da - db) * dir
    }
    return ((a[key as keyof typeof a] as number) - (b[key as keyof typeof b] as number)) * dir
  })
})

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
</script>

<template>
  <div class="bg-gray-950/90 text-gray-100 rounded-lg p-6">
    <h1 class="text-2xl font-bold mb-6 text-yellow-400">Mercado do Albion Online</h1>

    <div class="flex flex-col md:flex-row items-stretch gap-2 mb-6">
      <!-- Items -->
      <div class="bg-gray-900 rounded-xl p-4 flex-1 flex flex-col relative">
        <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Itens</h2>

        <div class="text-xs text-gray-500 mb-2" v-if="itemsStore.loading">Carregando items...</div>
        <div class="text-xs text-red-400 mb-2" v-else-if="itemsStore.error">
          {{ itemsStore.error }}
        </div>

        <!-- Search input -->
        <div class="relative mb-2">
          <input
            v-model="itemSearch"
            type="text"
            placeholder="Buscar item..."
            :disabled="!itemsStore.loaded"
            @focus="showDropdown = true"
            @blur="showDropdown = false"
            class="w-full bg-gray-800 text-gray-100 text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-yellow-400 placeholder-gray-500 disabled:opacity-40"
          />
          <!-- Dropdown -->
          <ul
            v-if="showDropdown && filteredItems.length"
            class="absolute z-10 left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg max-h-48 overflow-y-auto shadow-xl"
          >
            <li
              v-for="item in filteredItems"
              :key="item.id"
              @mousedown.prevent
              @click="addItem(item.id)"
              class="px-3 py-2 text-sm cursor-pointer hover:bg-gray-700 hover:text-yellow-300 transition-colors flex items-center gap-2"
            >
              <span
                :class="[
                  'text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0',
                  tierBadge(item.id).bg,
                ]"
              >
                <span :style="{ color: tierBadge(item.id).tierColor }"
                  >T{{ tierBadge(item.id).tier }}</span
                ><span
                  v-if="tierBadge(item.id).subtier > 0"
                  :style="{ color: tierBadge(item.id).tierColor }"
                  >.{{ tierBadge(item.id).subtier }}</span
                >
              </span>
              {{ item.name }}
            </li>
          </ul>
        </div>

        <!-- Selected chips -->
        <div class="flex flex-wrap gap-1 mt-2 pb-12">
          <span
            v-for="id in selectedItems"
            :key="id"
            class="inline-flex items-center gap-1 bg-yellow-400/10 text-yellow-300 text-xs px-2 py-1 rounded-full border border-yellow-400/30"
          >
            <span :class="['text-xs font-bold px-1 rounded', tierBadge(id).bg]">
              <span :style="{ color: tierBadge(id).tierColor }">T{{ tierBadge(id).tier }}</span
              ><span v-if="tierBadge(id).subtier > 0" :style="{ color: tierBadge(id).tierColor }"
                >.{{ tierBadge(id).subtier }}</span
              >
            </span>
            {{ itemName(id) }}

            <button
              @click="removeItem(id)"
              class="hover:text-red-400 transition-colors leading-none cursor-pointer"
            >
              &times;
            </button>
          </span>
          <span v-if="!selectedItems.length" class="text-xs text-gray-600"
            >Nenhum item selecionado</span
          >
        </div>

        <!-- Search button -->
        <button
          @click="search"
          :disabled="!isValid || loading"
          class="absolute bottom-4 left-4 right-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer bg-yellow-400 text-gray-900 hover:bg-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Buscando...' : 'Atualizar preços' }}
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

      <!-- Locations -->
      <div class="bg-gray-900 rounded-xl p-4 flex-1">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider">Localidades</h2>
          <button
            @click="toggleAllLocations"
            class="text-xs text-yellow-400 hover:text-yellow-300 transition-colors cursor-pointer"
          >
            {{ allLocationsSelected ? 'Desmarcar todas' : 'Selecionar todas' }}
          </button>
        </div>
        <label
          v-for="location in allLocations"
          :key="location"
          class="flex items-center gap-2 py-1 cursor-pointer hover:text-yellow-300 transition-colors"
        >
          <input
            type="checkbox"
            :value="location"
            v-model="selectedLocations"
            class="accent-yellow-400"
          />
          <span class="text-sm">{{ location }}</span>
        </label>
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

    <!-- URL Preview -->
    <!-- <div v-if="previewUrl" class="bg-gray-900 rounded-xl p-4 mb-4">
      <p class="text-xs text-gray-400 mb-1">Query URL</p>
      <code class="text-xs text-green-400 break-all">{{ previewUrl }}</code>
    </div> -->

    <!-- Error -->
    <div v-if="error" class="mt-4 bg-red-900/50 border border-red-700 rounded-xl p-4 text-red-300">
      {{ error }}
    </div>

    <!-- Results Table -->
    <div v-if="results.length" class="mt-6 bg-gray-900 rounded-xl p-4">
      <h2 class="text-lg font-semibold text-yellow-400 mb-3">Resultados</h2>
      <div class="overflow-x-auto">
        <table class="w-full text-sm border-collapse">
          <thead>
            <tr class="bg-gray-800 text-gray-400 text-left text-xs">
              <th
                class="px-3 py-2 rounded-tl-lg cursor-pointer select-none hover:text-yellow-300 transition-colors"
                @click="toggleSort('item_label')"
              >
                Item
                <span class="ml-1 text-xs">{{ sortIndicator('item_label') }}</span>
              </th>
              <th
                class="px-3 py-2 cursor-pointer select-none hover:text-yellow-300 transition-colors"
                @click="toggleSort('city')"
              >
                Cidade
                <span class="ml-1 text-xs">{{ sortIndicator('city') }}</span>
              </th>
              <th
                class="px-3 py-2 cursor-pointer select-none hover:text-yellow-300 transition-colors"
                @click="toggleSort('quality')"
              >
                Qualidade
                <span class="ml-1 text-xs">{{ sortIndicator('quality') }}</span>
              </th>
              <th
                class="px-3 py-2 cursor-pointer select-none hover:text-yellow-300 transition-colors"
                @click="toggleSort('sell_price_min')"
              >
                Venda Mín.
                <span class="ml-1 text-xs">{{ sortIndicator('sell_price_min') }}</span>
              </th>
              <th
                class="px-3 py-2 text-gray-500 text-xs font-normal cursor-pointer select-none hover:text-yellow-300 transition-colors"
                @click="toggleSort('sell_price_min_date')"
              >
                Atualizado em (UTC)
                <span class="ml-1">{{ sortIndicator('sell_price_min_date') }}</span>
              </th>
              <th
                class="px-3 py-2 cursor-pointer select-none hover:text-yellow-300 transition-colors"
                @click="toggleSort('sell_price_max')"
              >
                Venda Máx.
                <span class="ml-1 text-xs">{{ sortIndicator('sell_price_max') }}</span>
              </th>
              <th
                class="px-3 py-2 text-gray-500 text-xs font-normal cursor-pointer select-none hover:text-yellow-300 transition-colors"
                @click="toggleSort('sell_price_max_date')"
              >
                Atualizado em (UTC)
                <span class="ml-1">{{ sortIndicator('sell_price_max_date') }}</span>
              </th>
              <th
                class="px-3 py-2 cursor-pointer select-none hover:text-yellow-300 transition-colors"
                @click="toggleSort('buy_price_max')"
              >
                Pedido de Compra
                <span class="ml-1 text-xs">{{ sortIndicator('buy_price_max') }}</span>
              </th>
              <th
                class="px-3 py-2 rounded-tr-lg text-gray-500 text-xs font-normal cursor-pointer select-none hover:text-yellow-300 transition-colors"
                @click="toggleSort('buy_price_max_date')"
              >
                Atualizado em (UTC)
                <span class="ml-1">{{ sortIndicator('buy_price_max_date') }}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in sortedResults"
              :key="`${row.item_id}_${row.city}_${row.quality}`"
              class="border-t border-gray-800 hover:bg-gray-800/50 transition-colors"
            >
              <td class="px-3 py-2 text-xs text-yellow-300">
                <span class="inline-flex items-center gap-1.5">
                  <span :class="['font-bold px-1.5 py-0.5 rounded', tierBadge(row.item_id).bg]">
                    <span :style="{ color: tierBadge(row.item_id).tierColor }"
                      >T{{ tierBadge(row.item_id).tier }}</span
                    ><span
                      v-if="tierBadge(row.item_id).subtier > 0"
                      :style="{ color: tierBadge(row.item_id).tierColor }"
                      >.{{ tierBadge(row.item_id).subtier }}</span
                    >
                  </span>
                  {{ itemName(row.item_id) }}
                </span>
              </td>
              <td class="px-3 py-2">{{ row.city }}</td>
              <td class="px-3 py-2">{{ qualityLabel[row.quality] ?? row.quality }}</td>
              <td class="px-3 py-2 text-green-400">{{ row.sell_price_min.toLocaleString() }}</td>
              <td class="px-3 py-2 text-xs rounded" :class="dateBgClass(row.sell_price_min_date)">
                {{ formatDate(row.sell_price_min_date) }}
              </td>
              <td class="px-3 py-2 text-green-400">{{ row.sell_price_max.toLocaleString() }}</td>
              <td class="px-3 py-2 text-xs rounded" :class="dateBgClass(row.sell_price_max_date)">
                {{ formatDate(row.sell_price_max_date) }}
              </td>
              <td class="px-3 py-2 text-blue-400">{{ row.buy_price_max.toLocaleString() }}</td>
              <td class="px-3 py-2 text-xs rounded" :class="dateBgClass(row.buy_price_max_date)">
                {{ formatDate(row.buy_price_max_date) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div
      v-if="!loading && !results.length && !error"
      class="mt-10 text-center text-gray-600 text-sm"
    >
      Selecione ao menos um item, uma localização e uma qualidade para buscar.
    </div>

    <NoteInformation />
  </div>
</template>
