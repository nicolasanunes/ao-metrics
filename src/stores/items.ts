import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface RawItem {
  UniqueName: string
  LocalizedNames?: Record<string, string>
}

export interface GameItem {
  id: string
  name: string
}

export const useItemsStore = defineStore('items', () => {
  const items = ref<GameItem[]>([])
  const loading = ref(false)
  const loaded = ref(false)
  const error = ref<string | null>(null)

  const itemMap = computed<Record<string, string>>(() =>
    Object.fromEntries(items.value.map((i) => [i.id, i.name])),
  )

  async function load() {
    if (loaded.value) return
    loading.value = true
    error.value = null

    try {
      const res = await fetch('/items.json')
      if (!res.ok) throw new Error(`Erro ao carregar items: ${res.status}`)
      const raw: RawItem[] = await res.json()

      items.value = raw
        .filter(
          (entry) =>
            entry.UniqueName && (entry.LocalizedNames?.['ptbr'] || entry.LocalizedNames?.['EN-US']),
        )
        .map((entry) => ({
          id: entry.UniqueName,
          name:
            entry.LocalizedNames?.['ptbr'] ?? entry.LocalizedNames?.['EN-US'] ?? entry.UniqueName,
        }))

      loaded.value = true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erro desconhecido'
    } finally {
      loading.value = false
    }
  }

  return { items, loading, loaded, error, itemMap, load }
})
