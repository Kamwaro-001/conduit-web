// src/composables/useToast.ts
import { ref } from 'vue'

const activeToast = ref<{ message: string, type: 'success' | 'info' } | null>(null)

export function useToast() {
  const showToast = (message: string, type: 'success' | 'info' = 'info') => {
    activeToast.value = { message, type }
    setTimeout(() => { activeToast.value = null }, 3000)
  }
  return { activeToast, showToast }
}
