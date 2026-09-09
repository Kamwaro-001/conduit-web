import * as vue from 'vue'

export type ToastType = 'success' | 'info' | 'error'

const activeToast = vue.ref<{ message: string; type: ToastType } | null>(null)

export function useToast() {
  const showToast = (message: string, type: ToastType = 'info') => {
    activeToast.value = { message, type }
    setTimeout(() => {
      activeToast.value = null
    }, 3000)
  }
  return { activeToast, showToast }
}
