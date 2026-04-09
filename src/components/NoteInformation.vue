<script setup lang="ts">
import { ref } from 'vue'

const visible = ref(true)
const shaking = ref(false)

function onParchmentOpened() {
  shaking.value = true
  setTimeout(() => {
    shaking.value = false
  }, 700)
}
</script>

<template>
  <!-- Closed state: rolled scroll icon -->
  <Transition name="closed-scroll">
    <button
      v-if="!visible"
      class="closed-scroll fixed bottom-1 right-1 xl:bottom-4 xl:right-4 z-50 select-none cursor-pointer"
      aria-label="Abrir pergaminho"
      @click="visible = true"
    >
      <img src="/textures/pergaminho-fechado.svg" alt="Pergaminho fechado" />
    </button>
  </Transition>

  <!-- Open state: full parchment -->
  <Transition name="note" @after-enter="onParchmentOpened">
    <div
      v-if="visible"
      :class="[
        'fixed bottom-1 right-1 xl:bottom-4 xl:right-4 z-50 parchment-wrapper select-none',
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
          ☠ Legenda de Datas ☠
        </h3>

        <!-- Divider -->
        <div class="parchment-divider mb-3" />

        <!-- Legend items -->
        <ul class="space-y-1 ml-3">
          <li class="flex items-center gap-3">
            <span class="color-dot bg-blue-700 flex-shrink-0" />
            <span class="legend-text">
              <strong>Azul</strong> - Atualizado há menos de <strong>30min</strong>
            </span>
          </li>
          <li class="flex items-center gap-3">
            <span class="color-dot bg-green-700 flex-shrink-0" />
            <span class="legend-text">
              <strong>Verde</strong> - Entre <strong>30min</strong> e <strong>6h</strong> atrás
            </span>
          </li>
          <li class="flex items-center gap-3">
            <span class="color-dot bg-yellow-500 flex-shrink-0" />
            <span class="legend-text">
              <strong>Amarelo</strong> - Entre <strong>6h</strong> e <strong>24h</strong> atrás
            </span>
          </li>
          <li class="flex items-center gap-3">
            <span class="color-dot bg-red-700 flex-shrink-0" />
            <span class="legend-text">
              <strong>Vermelho</strong> - Mais de <strong>24h</strong> atrás
            </span>
          </li>
          <li class="flex items-center gap-3">
            <span class="color-dot bg-gray-400 flex-shrink-0" />
            <span class="legend-text"> <strong>Sem cor</strong> - Dado indisponível </span>
          </li>
        </ul>

        <!-- Footer -->
        <div class="parchment-divider mt-4 mb-2" />
        <p class="legend-footer text-center text-xs italic">⚓ Horários exibidos em UTC ⚓</p>
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

/* Subtitle */
.parchment-subtitle {
  color: #5c3212;
  font-family: Georgia, 'Times New Roman', serif;
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

/* Legend text */
.legend-text {
  color: #1e0c02;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 0.74rem;
  line-height: 1.35;
}
.legend-text strong {
  color: #0f0501;
}

/* Color indicator dots */
.color-dot {
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 2px;
  box-shadow:
    inset 0 1px 2px rgba(0, 0, 0, 0.45),
    0 1px 3px rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(0, 0, 0, 0.3);
}

/* Footer text */
.legend-footer {
  color: #5c3212;
  font-family: Georgia, 'Times New Roman', serif;
}

/* Closed scroll button */
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

.closed-scroll {
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
.closed-scroll:hover {
  animation: none;
  transform: scale(1.08) rotate(-3deg);
  filter: drop-shadow(0 6px 18px rgba(0, 0, 0, 0.2));
}
.closed-scroll img {
  width: 64px;
  height: auto;
  display: block;
}
@media (max-width: 640px) {
  .closed-scroll img {
    width: 40px;
  }
}

/* Closed scroll transition */
.closed-scroll-enter-active,
.closed-scroll-leave-active {
  transition:
    opacity 0.5s ease,
    transform 0.5s ease;
}
.closed-scroll-enter-from,
.closed-scroll-leave-to {
  opacity: 0;
  transform: scale(0.7);
}

/* Shake on hover */
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
  animation: shake 1s ease;
  animation-iteration-count: 0.6;
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
  transform: translate(60px, 60px) scale(0.7);
}
.note-leave-to {
  opacity: 0;
  transform: translate(60px, 60px) scale(0.7);
}
</style>
