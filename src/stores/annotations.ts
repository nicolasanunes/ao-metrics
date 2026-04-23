import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'pirate-chest-notes'
const ENTRIES_KEY = 'pirate-chest-entries'

export interface AnnotationEntry {
  itemId: string
  label: string
  price: number
  priceField: 'sell_price_min' | 'sell_price_max' | 'buy_price_max'
  city: string
  savedAt: number
}

function loadEntries(): AnnotationEntry[] {
  try {
    return JSON.parse(localStorage.getItem(ENTRIES_KEY) ?? '[]')
  } catch {
    return []
  }
}

export const useAnnotationsStore = defineStore('annotations', () => {
  const notes = ref<string>(localStorage.getItem(STORAGE_KEY) ?? '')
  const entries = ref<AnnotationEntry[]>(loadEntries())

  watch(notes, (val) => {
    localStorage.setItem(STORAGE_KEY, val)
  })

  watch(
    entries,
    (val) => {
      localStorage.setItem(ENTRIES_KEY, JSON.stringify(val))
    },
    { deep: true },
  )

  function addEntry(entry: AnnotationEntry) {
    entries.value.push(entry)
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries.value))
  }

  function removeEntry(index: number) {
    entries.value.splice(index, 1)
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries.value))
  }

  function entriesForItem(itemId: string): AnnotationEntry[] {
    return entries.value.filter((e) => e.itemId === itemId)
  }

  return { notes, entries, addEntry, removeEntry, entriesForItem }
})
