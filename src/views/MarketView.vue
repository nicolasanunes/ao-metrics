<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { Quality, type Item, Location } from '@/types/items'
import { fetchPrices, type PriceData } from '@/services/marketService'
import { useItemsStore } from '@/stores/items'
import { useAnnotationsStore } from '@/stores/annotations'
import NoteInformation from '@/components/NoteInformation.vue'
import { tierBadgeClasses } from '@/data/tierColors'

const itemsStore = useItemsStore()
const annotationsStore = useAnnotationsStore()
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
  search()
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

onUnmounted(() => {
  currentAbortController?.abort()
})

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

const filteredSortedResults = computed(() => {
  const base = sortedResults.value
  if (!filterField.value || !filterAge.value) return base
  const limitMs = filterAge.value * 60 * 1000
  const field = filterField.value
  return base.filter((row) => {
    const date = parseDateStr(row[field])
    if (!date) return false
    return Date.now() - date.getTime() <= limitMs
  })
})

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

// ── Resource quick-select ────────────────────────────────────────────────────

const resourceCardOpen = ref(false)

const rawResourceTypes = [
  { key: 'ORE', label: 'Minério' },
  { key: 'WOOD', label: 'Madeira' },
  { key: 'FIBER', label: 'Fibra' },
  { key: 'HIDE', label: 'Pelego' },
  { key: 'ROCK', label: 'Pedra' },
]

const refinedResourceTypes = [
  { key: 'METALBAR', label: 'Barra de Metal' },
  { key: 'PLANKS', label: 'Tábuas' },
  { key: 'CLOTH', label: 'Tecido' },
  { key: 'LEATHER', label: 'Couro' },
  { key: 'STONEBLOCK', label: 'Bloco de Pedra' },
]

const selectedRawTypes = ref<string[]>([])
const selectedRefinedTypes = ref<string[]>([])
const selectedRawTiers = ref<number[]>([])
const selectedRawEnchants = ref<number[]>([0])
const selectedRefinedTiers = ref<number[]>([])
const selectedRefinedEnchants = ref<number[]>([0])

const allRawSelected = computed(() => selectedRawTypes.value.length === rawResourceTypes.length)
const allRefinedSelected = computed(
  () => selectedRefinedTypes.value.length === refinedResourceTypes.length,
)
const allRawTiersSelected = computed(() => selectedRawTiers.value.length === 8)
const allRefinedTiersSelected = computed(() => selectedRefinedTiers.value.length === 8)
const allRawEnchantsSelected = computed(() => selectedRawEnchants.value.length === 5)
const allRefinedEnchantsSelected = computed(() => selectedRefinedEnchants.value.length === 5)

function toggleAllRaw() {
  selectedRawTypes.value = allRawSelected.value ? [] : rawResourceTypes.map((r) => r.key)
}
function toggleAllRefined() {
  selectedRefinedTypes.value = allRefinedSelected.value
    ? []
    : refinedResourceTypes.map((r) => r.key)
}
function toggleAllRawTiers() {
  selectedRawTiers.value = allRawTiersSelected.value ? [] : [1, 2, 3, 4, 5, 6, 7, 8]
}
function toggleAllRefinedTiers() {
  selectedRefinedTiers.value = allRefinedTiersSelected.value ? [] : [1, 2, 3, 4, 5, 6, 7, 8]
}
function toggleAllRawEnchants() {
  selectedRawEnchants.value = allRawEnchantsSelected.value ? [] : [0, 1, 2, 3, 4]
}
function toggleAllRefinedEnchants() {
  selectedRefinedEnchants.value = allRefinedEnchantsSelected.value ? [] : [0, 1, 2, 3, 4]
}

// Raw resources that don't exist at T1
const noT1RawTypes = new Set(['ORE', 'FIBER'])

const generatedResourceIds = computed(() => {
  const ids: string[] = []
  // Raw types use raw tiers + raw enchants
  for (const type of selectedRawTypes.value) {
    for (const tier of selectedRawTiers.value) {
      if (tier === 1 && noT1RawTypes.has(type)) continue
      const enchants =
        tier <= 3
          ? [0]
          : type === 'ROCK'
            ? selectedRawEnchants.value.filter((e) => e <= 3)
            : selectedRawEnchants.value
      for (const enchant of enchants) {
        ids.push(enchant === 0 ? `T${tier}_${type}` : `T${tier}_${type}@${enchant}`)
      }
    }
  }
  // Refined types use refined tiers + refined enchants
  for (const type of selectedRefinedTypes.value) {
    for (const tier of selectedRefinedTiers.value) {
      if (tier === 1) continue // refined never at T1
      const enchants = type === 'STONEBLOCK' || tier <= 3 ? [0] : selectedRefinedEnchants.value
      for (const enchant of enchants) {
        ids.push(enchant === 0 ? `T${tier}_${type}` : `T${tier}_${type}@${enchant}`)
      }
    }
  }
  return ids
})

const canSearchResources = computed(
  () =>
    generatedResourceIds.value.length > 0 &&
    selectedLocations.value.length > 0 &&
    selectedQualities.value.length > 0,
)

function applyResourceSearch() {
  if (!generatedResourceIds.value.length) return
  selectedItems.value = [...generatedResourceIds.value]
  search()
}

// ── End resource quick-select ─────────────────────────────────────────────────

// ── Table freshness filter ───────────────────────────────────────────────────
type FilterField = 'sell_price_min_date' | 'sell_price_max_date' | 'buy_price_max_date' | null
type FilterAge = 30 | 360 | 1440 | null

const filterField = ref<FilterField>(null)
const filterAge = ref<FilterAge>(null)

const filterFieldOptions: { label: string; value: FilterField }[] = [
  { label: 'Venda Mín.', value: 'sell_price_min_date' },
  { label: 'Venda Máx.', value: 'sell_price_max_date' },
  { label: 'Pedido de Compra', value: 'buy_price_max_date' },
]

const filterAgeOptions: { label: string; value: FilterAge }[] = [
  { label: '< 30min', value: 30 },
  { label: '< 6h', value: 360 },
  { label: '< 24h', value: 1440 },
]

// ── End table freshness filter ────────────────────────────────────────────────

const SENTINEL_DATE = '0001-01-01'

function parseDateStr(dateStr: string): Date | null {
  if (!dateStr || dateStr.startsWith(SENTINEL_DATE)) return null
  const normalized = /[Zz]$|[+-]\d{2}:?\d{2}$/.test(dateStr) ? dateStr : dateStr + 'Z'
  const date = new Date(normalized)
  return isNaN(date.getTime()) ? null : date
}

function formatDate(dateStr: string) {
  const date = parseDateStr(dateStr)
  if (!date) return '-'
  const diffMs = Date.now() - date.getTime()
  if (diffMs < 0) return 'Agora'
  const totalMin = Math.floor(diffMs / 60000)
  if (totalMin < 1) return 'Agora'
  const days = Math.floor(totalMin / 1440)
  const hours = Math.floor((totalMin % 1440) / 60)
  const mins = totalMin % 60
  if (days > 0) return `Há ${days}d ${hours > 0 ? `${hours}h` : ''}`.trimEnd()
  if (hours > 0 && mins > 0) return `Há ${hours}h ${mins}min`
  if (hours > 0) return `Há ${hours}h`
  return `Há ${mins}min`
}

function dateBgClass(dateStr: string): string {
  const date = parseDateStr(dateStr)
  if (!date) return ''
  const hoursAgo = (Date.now() - date.getTime()) / 1000 / 3600
  if (hoursAgo < 0.5) return 'bg-blue-900/60 text-blue-300'
  if (hoursAgo < 6) return 'bg-green-900/60 text-green-300'
  if (hoursAgo < 24) return 'bg-yellow-900/60 text-yellow-300'
  return 'bg-red-900/60 text-red-300'
}

const ANNOTATION_LABELS: Record<'sell_price_min' | 'sell_price_max' | 'buy_price_max', string> = {
  sell_price_min: 'Venda Mín.',
  sell_price_max: 'Venda Máx.',
  buy_price_max: 'Pedido de Compra',
}

function addAnnotation(
  row: PriceData,
  field: 'sell_price_min' | 'sell_price_max' | 'buy_price_max',
) {
  const price = row[field]
  if (!price) return
  const badge = tierBadge(row.item_id)
  const tierLabel = badge.subtier > 0 ? `T${badge.tier}.${badge.subtier}` : `T${badge.tier}`
  const note = `${tierLabel} ${itemName(row.item_id)}: ${price.toLocaleString('pt-BR')} em ${row.city} (${ANNOTATION_LABELS[field]})`
  annotationsStore.notes = annotationsStore.notes ? annotationsStore.notes + '\n' + note : note
}
</script>

<template>
  <div class="bg-gray-950/90 text-gray-100 rounded-lg p-6">
    <h1 class="text-2xl font-bold mb-6 text-yellow-400">Mercado do Albion Online</h1>
    <p class="text-sm text-gray-500 mb-6">
      Compare os preços dos itens nas cidades selecionadas para encontrar as melhores oportunidades
      de compra e de venda.
    </p>

    <div class="flex flex-col md:flex-row items-stretch gap-2 mb-6">
      <!-- Items -->
      <div class="bg-gray-900 rounded-xl p-4 flex-1 flex flex-col relative">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider">Itens</h2>
          <button
            v-if="selectedItems.length"
            @click="selectedItems = []"
            class="text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer"
          >
            Desmarcar todos
          </button>
        </div>

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
          {{ loading ? 'Buscando...' : 'Buscar preços' }}
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
            :class="[
              'text-xs transition-colors cursor-pointer',
              allLocationsSelected
                ? 'text-red-400 hover:text-red-300'
                : 'text-yellow-400 hover:text-yellow-300',
            ]"
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

    <!-- Resources Quick-Select Card -->
    <div class="bg-gray-900 rounded-xl mb-6 overflow-hidden">
      <!-- Header (always visible) -->
      <button
        @click="resourceCardOpen = !resourceCardOpen"
        class="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800/60 transition-colors cursor-pointer"
      >
        <span class="text-sm font-semibold text-gray-300 uppercase tracking-wider">
          Busca Rápida de Recursos
        </span>
        <svg
          class="w-4 h-4 text-gray-400 transition-transform duration-200"
          :class="resourceCardOpen ? 'rotate-180' : ''"
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
      </button>

      <!-- Collapsible body -->
      <div v-if="resourceCardOpen" class="px-4 p-4">
        <!-- Raw + Refined columns, each with their own tiers & enchants -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <!-- ── Raw Resources ── -->
          <div class="bg-gray-800/40 rounded-lg p-3">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold text-yellow-400 uppercase tracking-wider"
                >Recursos Brutos</span
              >
              <button
                @click="toggleAllRaw"
                :class="[
                  'text-xs transition-colors cursor-pointer',
                  allRawSelected
                    ? 'text-red-400 hover:text-red-300'
                    : 'text-yellow-400 hover:text-yellow-300',
                ]"
              >
                {{ allRawSelected ? 'Desmarcar todos' : 'Selecionar todos' }}
              </button>
            </div>
            <label
              v-for="rt in rawResourceTypes"
              :key="rt.key"
              class="flex items-center gap-2 py-1 cursor-pointer hover:text-yellow-300 transition-colors text-sm text-gray-300"
            >
              <input
                type="checkbox"
                :value="rt.key"
                v-model="selectedRawTypes"
                class="accent-yellow-400"
              />
              {{ rt.label }}
            </label>

            <!-- Tiers (raw) -->
            <div class="mt-3 pt-3 border-t border-gray-700">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider"
                  >Tiers</span
                >
                <button
                  @click="toggleAllRawTiers"
                  :class="[
                    'text-xs transition-colors cursor-pointer',
                    allRawTiersSelected
                      ? 'text-red-400 hover:text-red-300'
                      : 'text-yellow-400 hover:text-yellow-300',
                  ]"
                >
                  {{ allRawTiersSelected ? 'Desmarcar todos' : 'Selecionar todos' }}
                </button>
              </div>
              <div class="flex flex-wrap gap-x-2 gap-y-1">
                <label
                  v-for="tier in [1, 2, 3, 4, 5, 6, 7, 8]"
                  :key="tier"
                  class="flex items-center gap-1 cursor-pointer text-sm text-gray-300 hover:text-yellow-300 transition-colors"
                >
                  <input
                    type="checkbox"
                    :value="tier"
                    v-model="selectedRawTiers"
                    class="accent-yellow-400"
                  />
                  <span
                    class="text-xs font-bold px-1.5 py-0.5 rounded"
                    :class="tierBadge(`T${tier}_ORE`).bg"
                    :style="{ color: tierBadge(`T${tier}_ORE`).tierColor }"
                    >T{{ tier }}</span
                  >
                </label>
              </div>
            </div>

            <!-- Enchantments (raw) -->
            <div class="mt-3 pt-3 border-t border-gray-700">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider"
                  >Encantamentos</span
                >
                <button
                  @click="toggleAllRawEnchants"
                  :class="[
                    'text-xs transition-colors cursor-pointer',
                    allRawEnchantsSelected
                      ? 'text-red-400 hover:text-red-300'
                      : 'text-yellow-400 hover:text-yellow-300',
                  ]"
                >
                  {{ allRawEnchantsSelected ? 'Desmarcar todos' : 'Selecionar todos' }}
                </button>
              </div>
              <div class="flex flex-wrap gap-x-3 gap-y-1">
                <label
                  class="flex items-center gap-1.5 cursor-pointer text-sm text-gray-300 hover:text-yellow-300 transition-colors"
                >
                  <input
                    type="checkbox"
                    :value="0"
                    v-model="selectedRawEnchants"
                    class="accent-yellow-400"
                  />
                  Base
                </label>
                <label
                  v-for="e in [1, 2, 3, 4]"
                  :key="e"
                  class="flex items-center gap-1.5 cursor-pointer text-sm text-gray-300 hover:text-yellow-300 transition-colors"
                >
                  <input
                    type="checkbox"
                    :value="e"
                    v-model="selectedRawEnchants"
                    class="accent-yellow-400"
                  />
                  .{{ e }}
                </label>
              </div>
            </div>
          </div>

          <!-- ── Refined Resources ── -->
          <div class="bg-gray-800/40 rounded-lg p-3">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold text-blue-400 uppercase tracking-wider"
                >Recursos Refinados</span
              >
              <button
                @click="toggleAllRefined"
                :class="[
                  'text-xs transition-colors cursor-pointer',
                  allRefinedSelected
                    ? 'text-red-400 hover:text-red-300'
                    : 'text-yellow-400 hover:text-yellow-300',
                ]"
              >
                {{ allRefinedSelected ? 'Desmarcar todos' : 'Selecionar todos' }}
              </button>
            </div>
            <label
              v-for="rt in refinedResourceTypes"
              :key="rt.key"
              class="flex items-center gap-2 py-1 cursor-pointer hover:text-blue-300 transition-colors text-sm text-gray-300"
            >
              <input
                type="checkbox"
                :value="rt.key"
                v-model="selectedRefinedTypes"
                class="accent-blue-400"
              />
              {{ rt.label }}
            </label>

            <!-- Tiers (refined) -->
            <div class="mt-3 pt-3 border-t border-gray-700">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider"
                  >Tiers</span
                >
                <button
                  @click="toggleAllRefinedTiers"
                  :class="[
                    'text-xs transition-colors cursor-pointer',
                    allRefinedTiersSelected
                      ? 'text-red-400 hover:text-red-300'
                      : 'text-yellow-400 hover:text-yellow-300',
                  ]"
                >
                  {{ allRefinedTiersSelected ? 'Desmarcar todos' : 'Selecionar todos' }}
                </button>
              </div>
              <div class="flex flex-wrap gap-x-2 gap-y-1">
                <label
                  v-for="tier in [1, 2, 3, 4, 5, 6, 7, 8]"
                  :key="tier"
                  class="flex items-center gap-1 cursor-pointer text-sm text-gray-300 hover:text-blue-300 transition-colors"
                >
                  <input
                    type="checkbox"
                    :value="tier"
                    v-model="selectedRefinedTiers"
                    class="accent-blue-400"
                  />
                  <span
                    class="text-xs font-bold px-1.5 py-0.5 rounded"
                    :class="tierBadge(`T${tier}_ORE`).bg"
                    :style="{ color: tierBadge(`T${tier}_ORE`).tierColor }"
                    >T{{ tier }}</span
                  >
                </label>
              </div>
            </div>

            <!-- Enchantments (refined) -->
            <div class="mt-3 pt-3 border-t border-gray-700">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider"
                  >Encantamentos</span
                >
                <button
                  @click="toggleAllRefinedEnchants"
                  :class="[
                    'text-xs transition-colors cursor-pointer',
                    allRefinedEnchantsSelected
                      ? 'text-red-400 hover:text-red-300'
                      : 'text-yellow-400 hover:text-yellow-300',
                  ]"
                >
                  {{ allRefinedEnchantsSelected ? 'Desmarcar todos' : 'Selecionar todos' }}
                </button>
              </div>
              <div class="flex flex-wrap gap-x-3 gap-y-1">
                <label
                  class="flex items-center gap-1.5 cursor-pointer text-sm text-gray-300 hover:text-blue-300 transition-colors"
                >
                  <input
                    type="checkbox"
                    :value="0"
                    v-model="selectedRefinedEnchants"
                    class="accent-blue-400"
                  />
                  Base
                </label>
                <label
                  v-for="e in [1, 2, 3, 4]"
                  :key="e"
                  class="flex items-center gap-1.5 cursor-pointer text-sm text-gray-300 hover:text-blue-300 transition-colors"
                >
                  <input
                    type="checkbox"
                    :value="e"
                    v-model="selectedRefinedEnchants"
                    class="accent-blue-400"
                  />
                  .{{ e }}
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer: count + button -->
        <div class="flex items-center justify-between pt-3 border-t border-gray-800">
          <span class="text-xs text-gray-500">
            <template v-if="generatedResourceIds.length">
              {{ generatedResourceIds.length }} item(s) para buscar
            </template>
            <template v-else> Selecione ao menos um tipo, tier e encantamento </template>
          </span>
          <button
            @click="applyResourceSearch"
            :disabled="!canSearchResources"
            class="py-1.5 px-4 rounded-lg text-sm font-semibold transition-colors cursor-pointer bg-yellow-400 text-gray-900 hover:bg-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Buscar recursos
          </button>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="mt-4 bg-red-900/50 border border-red-700 rounded-xl p-4 text-red-300">
      {{ error }}
    </div>

    <!-- Results Table -->
    <div v-if="results.length" class="mt-6 bg-gray-900 rounded-xl p-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <h2 class="text-lg font-semibold text-yellow-400">Resultados</h2>

        <!-- Freshness filter -->
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs text-gray-500 mr-1">Filtrar por:</span>

          <!-- Field toggles -->
          <div class="flex rounded-lg overflow-hidden border border-gray-700">
            <button
              v-for="opt in filterFieldOptions"
              :key="opt.value!"
              @click="filterField = filterField === opt.value ? null : opt.value"
              :class="[
                'px-2 py-1 text-xs transition-colors cursor-pointer',
                filterField === opt.value
                  ? 'bg-yellow-400 text-gray-900 font-semibold'
                  : 'bg-gray-800 text-gray-400 hover:text-yellow-300',
              ]"
            >
              {{ opt.label }}
            </button>
          </div>

          <!-- Age toggles -->
          <div class="flex rounded-lg overflow-hidden border border-gray-700">
            <button
              v-for="opt in filterAgeOptions"
              :key="opt.value!"
              @click="filterAge = filterAge === opt.value ? null : opt.value"
              :class="[
                'px-2 py-1 text-xs transition-colors cursor-pointer',
                filterAge === opt.value
                  ? 'bg-yellow-400 text-gray-900 font-semibold'
                  : 'bg-gray-800 text-gray-400 hover:text-yellow-300',
              ]"
            >
              {{ opt.label }}
            </button>
          </div>

          <!-- Clear filter -->
          <button
            v-if="filterField || filterAge"
            @click="((filterField = null), (filterAge = null))"
            class="text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer"
          >
            Limpar
          </button>

          <span v-if="filterField && filterAge" class="text-xs text-gray-500">
            {{ filteredSortedResults.length }} / {{ sortedResults.length }} linhas
          </span>
        </div>
      </div>

      <!-- Filter hint -->
      <p class="text-xs text-right text-gray-600 mb-3">
        <template v-if="!filterField && !filterAge">
          Selecione um campo e um intervalo de tempo para filtrar os resultados pela data de
          atualização.
        </template>
        <template v-else-if="filterField && !filterAge">
          Agora selecione um intervalo de tempo para aplicar o filtro.
        </template>
        <template v-else-if="!filterField && filterAge">
          Agora selecione o campo a ser filtrado (Venda Mín., Venda Máx. ou Pedido de Compra).
        </template>
        <template v-else>
          Exibindo apenas registros de
          <span class="text-gray-400">{{
            filterFieldOptions.find((o) => o.value === filterField)?.label
          }}</span>
          atualizados há
          <span class="text-gray-400">{{
            filterAgeOptions.find((o) => o.value === filterAge)?.label.replace('< ', 'menos de ')
          }}</span
          >.
        </template>
      </p>

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
                Atualizado
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
                Atualizado
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
                Atualizado
                <span class="ml-1">{{ sortIndicator('buy_price_max_date') }}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in filteredSortedResults"
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
              <td class="px-3 py-2 text-green-400">
                <span
                  v-if="row.sell_price_min > 0"
                  class="relative group cursor-pointer hover:text-green-300 transition-colors"
                  @click="addAnnotation(row, 'sell_price_min')"
                >
                  {{ row.sell_price_min.toLocaleString() }}
                  <span
                    class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-gray-900 border border-gray-700 rounded text-xs text-gray-300 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[100] shadow-lg"
                  >
                    📌 Clique para anotar no baú de anotações
                  </span>
                </span>
                <span v-else class="text-gray-600">0</span>
              </td>
              <td class="px-3 py-2 text-xs rounded" :class="dateBgClass(row.sell_price_min_date)">
                {{ formatDate(row.sell_price_min_date) }}
              </td>
              <td class="px-3 py-2 text-green-400">
                <span
                  v-if="row.sell_price_max > 0"
                  class="relative group cursor-pointer hover:text-green-300 transition-colors"
                  @click="addAnnotation(row, 'sell_price_max')"
                >
                  {{ row.sell_price_max.toLocaleString() }}
                  <span
                    class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-gray-900 border border-gray-700 rounded text-xs text-gray-300 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[100] shadow-lg"
                  >
                    📌 Clique para anotar no baú de anotações
                  </span>
                </span>
                <span v-else class="text-gray-600">0</span>
              </td>
              <td class="px-3 py-2 text-xs rounded" :class="dateBgClass(row.sell_price_max_date)">
                {{ formatDate(row.sell_price_max_date) }}
              </td>
              <td class="px-3 py-2 text-blue-400">
                <span
                  v-if="row.buy_price_max > 0"
                  class="relative group cursor-pointer hover:text-blue-300 transition-colors"
                  @click="addAnnotation(row, 'buy_price_max')"
                >
                  {{ row.buy_price_max.toLocaleString() }}
                  <span
                    class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-gray-900 border border-gray-700 rounded text-xs text-gray-300 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[100] shadow-lg"
                  >
                    📌 Clique para anotar no baú de anotações
                  </span>
                </span>
                <span v-else class="text-gray-600">0</span>
              </td>
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
