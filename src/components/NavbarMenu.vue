<script setup lang="ts">
import { RouterLink } from 'vue-router'
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
    </div>
  </nav>
</template>

<style scoped></style>
