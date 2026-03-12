import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'pirate-chest-notes'

export const useAnnotationsStore = defineStore('annotations', () => {
  const notes = ref<string>(localStorage.getItem(STORAGE_KEY) ?? '')

  watch(notes, (val) => {
    localStorage.setItem(STORAGE_KEY, val)
  })

  return { notes }
})
