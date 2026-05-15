<script setup lang="ts">
import { ref } from 'vue'
import { useAnnotationsStore } from '@/stores/annotations'

const FIELD_LABELS: Record<string, string> = {
  sell_price_min: 'Venda Mín.',
  sell_price_max: 'Venda Máx.',
  buy_price_max: 'Pedido de Compra',
}

const store = useAnnotationsStore()
const visible = ref(false)
const shaking = ref(false)

function onParchmentOpened() {
  shaking.value = true
  setTimeout(() => {
    shaking.value = false
  }, 700)
}
</script>

<template>
  <!-- Closed state: chest icon -->
  <Transition name="closed-chest">
    <button
      v-if="!visible"
      class="closed-chest fixed bottom-1 left-1 xl:bottom-4 xl:left-4 z-50 select-none cursor-pointer"
      aria-label="Abrir baú de anotações"
      @click="visible = true"
    >
      <img src="/textures/bau-aberto.svg" alt="Baú de anotações" />
    </button>
  </Transition>

  <!-- Open state: parchment with notes -->
  <Transition name="note" @after-enter="onParchmentOpened">
    <div
      v-if="visible"
      :class="[
        'fixed bottom-1 left-1 xl:bottom-4 xl:left-4 z-50 parchment-wrapper select-none',
        { 'parchment-shake': shaking },
      ]"
      style="filter: drop-shadow(0 10px 32px rgba(0, 0, 0, 0.8))"
    >
      <!-- Parchment body -->
      <div
        class="parchment-body relative px-5 pt-10 pb-8 cursor-pointer"
        title="Clique para fechar"
        @click="visible = false"
      >
        <!-- Title -->
        <h3 class="parchment-title text-center text-sm font-bold mb-1 tracking-widest uppercase">
          ☠ Baú de Anotações ☠
        </h3>

        <!-- Divider -->
        <div class="parchment-divider mb-3" />

        <!-- Structured entries -->
        <div v-if="store.entries.length > 0" class="mb-2">
          <p class="entries-label text-xs uppercase tracking-widest mb-2">📌 Preços anotados</p>
          <div
            v-for="(entry, i) in store.entries"
            :key="i"
            class="entry-chip flex items-start justify-between gap-2 px-2 py-1 mb-1 rounded"
            @click.stop
          >
            <span class="entry-text text-xs leading-snug flex-1">
              {{ entry.label }}:<br />
              {{ entry.price.toLocaleString('pt-BR') }} em {{ entry.city }}
              <em>({{ FIELD_LABELS[entry.priceField] }})</em>
            </span>
            <button
              class="entry-delete flex-shrink-0 mt-0.5"
              title="Remover anotação"
              @click.stop="store.removeEntry(i)"
            >
              ✕
            </button>
          </div>
          <div class="parchment-divider mt-2 mb-3" />
        </div>

        <!-- Notes textarea -->
        <textarea
          v-model="store.notes"
          class="notes-textarea"
          placeholder="Escreva suas anotações aqui..."
          @click.stop
        />

        <!-- Footer -->
        <div class="parchment-divider mt-3 mb-2" />
        <p class="legend-footer text-center text-xs italic">⚓ Clique aqui para fechar ⚓</p>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Parchment wrapper — expands with content */
.parchment-wrapper {
  width: max-content;
  min-width: 17rem;
}

/* Aged parchment body */
.parchment-body {
  background-image: url('/textures/pergaminho.svg');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  position: relative;
  z-index: 1;
  overflow: hidden;
}

/* Title */
.parchment-title {
  color: #1e0c02;
  font-family: Georgia, 'Times New Roman', serif;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.28);
  letter-spacing: 0.1em;
}

/* Ornamental divider line */
.parchment-divider {
  height: 1px;
  background: linear-gradient(
    to right,
    transparent,
    rgba(90, 52, 12, 0.75) 15%,
    rgba(90, 52, 12, 0.75) 85%,
    transparent
  );
  position: relative;
}
.parchment-divider::before,
.parchment-divider::after {
  content: '✦';
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 7px;
  color: rgba(90, 52, 12, 0.75);
  line-height: 1;
}
.parchment-divider::before {
  left: 8%;
}
.parchment-divider::after {
  right: 8%;
}

/* Entries label */
.entries-label {
  color: rgba(90, 52, 12, 0.65);
  font-family: Georgia, 'Times New Roman', serif;
}

/* Entry chip */
.entry-chip {
  background: rgba(90, 52, 12, 0.07);
  border: 1px solid rgba(90, 52, 12, 0.18);
}

.entry-text {
  color: #1e0c02;
  font-family: Georgia, 'Times New Roman', serif;
}

.entry-delete {
  color: #8b1a1a;
  font-size: 0.75rem;
  font-weight: bold;
  line-height: 1;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0 2px;
  opacity: 0.6;
  transition: opacity 0.15s;
}
.entry-delete:hover {
  opacity: 1;
}

/* Notes textarea */
.notes-textarea {
  width: 100%;
  min-height: 140px;
  resize: vertical;
  background: transparent;
  border: none;
  outline: none;
  color: #1e0c02;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 0.78rem;
  line-height: 1.6;
  padding: 4px 12px;
  cursor: text;
}
.notes-textarea::placeholder {
  color: rgba(90, 52, 12, 0.5);
  font-style: italic;
}
.notes-textarea::-webkit-scrollbar {
  width: 4px;
}
.notes-textarea::-webkit-scrollbar-thumb {
  background: rgba(90, 52, 12, 0.4);
  border-radius: 2px;
}

/* Footer text */
.legend-footer {
  color: #5c3212;
  font-family: Georgia, 'Times New Roman', serif;
}

/* Closed chest button */
@keyframes idle-wobble {
  0%,
  8% {
    transform: rotate(0deg);
  }
  2% {
    transform: rotate(-4deg);
  }
  4% {
    transform: rotate(4deg);
  }
  6% {
    transform: rotate(-2deg);
  }
  100% {
    transform: rotate(0deg);
  }
}

.closed-chest {
  background: none;
  border: none;
  padding: 0;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.7));
  transition:
    transform 0.2s ease,
    filter 0.2s ease;
  animation: idle-wobble 3s ease-in-out infinite;
  transform-origin: bottom center;
}
.closed-chest:hover {
  animation: none;
  transform: scale(1.08) rotate(-3deg);
  filter: drop-shadow(0 6px 18px rgba(0, 0, 0, 0.8));
}
.closed-chest img {
  width: 64px;
  height: auto;
  display: block;
}
@media (max-width: 640px) {
  .closed-chest img {
    width: 40px;
  }
}

/* Closed chest transition */
.closed-chest-enter-active,
.closed-chest-leave-active {
  transition:
    opacity 0.5s ease,
    transform 0.5s ease;
}
.closed-chest-enter-from,
.closed-chest-leave-to {
  opacity: 0;
  transform: scale(0.7);
}

/* Shake on open */
@keyframes shake {
  0% {
    transform: rotate(0deg);
  }
  15% {
    transform: rotate(-2deg);
  }
  30% {
    transform: rotate(2deg);
  }
  45% {
    transform: rotate(-2deg);
  }
  60% {
    transform: rotate(2deg);
  }
  75% {
    transform: rotate(-1deg);
  }
  90% {
    transform: rotate(1deg);
  }
  100% {
    transform: rotate(0deg);
  }
}
.parchment-shake {
  animation: shake 0.7s ease;
  transform-origin: center;
}

/* Enter / leave transition */
.note-enter-active,
.note-leave-active {
  transition:
    opacity 0.6s ease,
    transform 0.6s ease;
}
.note-enter-from {
  opacity: 0;
  transform: translate(-60px, 60px) scale(0.7);
}
.note-leave-to {
  opacity: 0;
  transform: translate(-60px, 60px) scale(0.7);
}
</style>
