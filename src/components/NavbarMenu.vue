<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()
const islandOpen = ref(false)

const isIslandActive = () => route.path.startsWith('/island')
</script>

<template>
  <nav
    class="flex items-center justify-between px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64 py-3 bg-gray-950 border-b border-gray-800"
  >
    <span class="font-semibold text-lg text-gray-100">AO Metrics</span>
    <div class="flex gap-2">
      <RouterLink
        to="/market"
        class="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-800 text-gray-300 hover:bg-gray-700"
        active-class="!bg-yellow-400 !text-gray-950"
      >
        Mercado
      </RouterLink>
      <RouterLink
        to="/refine"
        class="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-800 text-gray-300 hover:bg-gray-700"
        active-class="!bg-yellow-400 !text-gray-950"
      >
        Refino
      </RouterLink>
      <div class="relative" @mouseenter="islandOpen = true" @mouseleave="islandOpen = false">
        <button
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-800 text-gray-300 hover:bg-gray-700"
          :class="{ '!bg-yellow-400 !text-gray-950': isIslandActive() }"
        >
          <span class="flex items-center gap-1">
            Ilha
            <svg
              class="w-3 h-3 transition-transform"
              :class="{ 'rotate-180': islandOpen }"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06z"
                clip-rule="evenodd"
              />
            </svg>
          </span>
        </button>
        <div
          v-show="islandOpen"
          class="absolute right-0 top-full min-w-full bg-gray-800 border border-gray-700 rounded-lg overflow-hidden z-50 flex flex-col"
        >
          <RouterLink
            to="/island-farm"
            class="px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 whitespace-nowrap"
            active-class="!bg-yellow-400 !text-gray-950"
          >
            Fazendas
          </RouterLink>
          <RouterLink
            to="/island-herb-garden"
            class="px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 whitespace-nowrap"
            active-class="!bg-yellow-400 !text-gray-950"
          >
            Hortas
          </RouterLink>
          <RouterLink
            to="/island-pasture"
            class="px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 whitespace-nowrap"
            active-class="!bg-yellow-400 !text-gray-950"
          >
            Pastos
          </RouterLink>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped></style>
