<script setup lang="ts">
import { ref } from 'vue'

const visible = ref(true)
</script>

<template>
  <Transition name="note">
    <div
      v-if="visible"
      class="fixed bottom-6 right-6 z-50 w-72 select-none"
      style="filter: drop-shadow(0 4px 16px rgba(0, 0, 0, 0.5))"
    >
      <!-- Tape strip -->
      <div class="flex justify-center -mb-1 relative z-10">
        <div class="w-12 h-5 bg-yellow-200/70 rounded-sm rotate-1" />
      </div>

      <!-- Ticket body -->
      <div
        class="relative bg-yellow-100 rounded-md px-5 pt-4 pb-5"
        style="
          background-image: repeating-linear-gradient(
            transparent,
            transparent 27px,
            #fbbf2455 27px,
            #fbbf2455 28px
          );
          font-family: 'Segoe UI', sans-serif;
        "
      >
        <!-- Torn edge top -->
        <div
          class="absolute -top-1 left-0 right-0 h-2 overflow-hidden"
          style="
            background: repeating-linear-gradient(
              90deg,
              #fef9c3 0px,
              #fef9c3 6px,
              transparent 6px,
              transparent 10px
            );
          "
        />

        <!-- Close button -->
        <button
          @click="visible = false"
          class="absolute top-2 right-2 text-yellow-700 hover:text-yellow-900 text-lg leading-none font-bold transition-colors cursor-pointer"
          aria-label="Fechar"
        >
          &times;
        </button>

        <!-- Title -->
        <h3 class="text-yellow-900 font-bold text-sm mb-3 pr-4 tracking-wide uppercase">
          📋 Legenda de Datas
        </h3>

        <!-- Legend items -->
        <ul class="space-y-2">
          <li class="flex items-center gap-3">
            <span class="inline-block w-3.5 h-3.5 rounded-sm bg-blue-700 flex-shrink-0" />
            <span class="text-yellow-900 text-xs leading-snug">
              <strong>Azul</strong> — Atualizado há menos de <strong>1 hora</strong>
            </span>
          </li>
          <li class="flex items-center gap-3">
            <span class="inline-block w-3.5 h-3.5 rounded-sm bg-green-700 flex-shrink-0" />
            <span class="text-yellow-900 text-xs leading-snug">
              <strong>Verde</strong> — Entre <strong>1h</strong> e <strong>6h</strong> atrás
            </span>
          </li>
          <li class="flex items-center gap-3">
            <span class="inline-block w-3.5 h-3.5 rounded-sm bg-yellow-500 flex-shrink-0" />
            <span class="text-yellow-900 text-xs leading-snug">
              <strong>Amarelo</strong> — Entre <strong>6h</strong> e <strong>24h</strong> atrás
            </span>
          </li>
          <li class="flex items-center gap-3">
            <span class="inline-block w-3.5 h-3.5 rounded-sm bg-red-700 flex-shrink-0" />
            <span class="text-yellow-900 text-xs leading-snug">
              <strong>Vermelho</strong> — Mais de <strong>24 horas</strong> atrás
            </span>
          </li>
          <li class="flex items-center gap-3">
            <span class="inline-block w-3.5 h-3.5 rounded-sm bg-gray-400 flex-shrink-0" />
            <span class="text-yellow-900 text-xs leading-snug">
              <strong>Sem cor</strong> — Dado indisponível
            </span>
          </li>
        </ul>

        <!-- Footer note -->
        <p class="text-yellow-700 text-xs mt-3 italic border-t border-yellow-300 pt-2">
          Todos os horários exibidos estão em UTC.
        </p>

        <!-- Torn edge bottom -->
        <div
          class="absolute -bottom-1 left-0 right-0 h-2 overflow-hidden"
          style="
            background: repeating-linear-gradient(
              90deg,
              #fef9c3 0px,
              #fef9c3 6px,
              transparent 6px,
              transparent 10px
            );
          "
        />
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.note-enter-active,
.note-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}
.note-enter-from,
.note-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.97);
}
</style>
