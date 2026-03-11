<script setup lang="ts">
import NavbarMenu from './components/NavbarMenu.vue'
</script>

<template>
  <NavbarMenu />
  <main class="flex-1 p-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64">
    <RouterView />
  </main>
</template>

<style scoped></style>
