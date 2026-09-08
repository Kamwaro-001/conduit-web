<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useToast } from './composables/useToast'

const { activeToast } = useToast()
</script>

<template>
  <RouterView />

  <Transition name="fade">
    <div
      v-if="activeToast"
      class="fixed bottom-4 right-4 px-4 py-3 rounded shadow-lg text-sm font-mono z-50 border"
      :class="{
        'bg-[#1E293B] text-emerald-400 border-emerald-500/30': activeToast.type === 'success',
        'bg-[#1E293B] text-primary border-primary/30': activeToast.type === 'info',
      }"
    >
      {{ activeToast.message }}
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
