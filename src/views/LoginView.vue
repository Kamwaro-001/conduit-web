<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const authStore = useAuthStore()
const { showToast } = useToast()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await authStore.login(email.value, password.value)
    await router.push('/')
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Login failed'
    error.value = message.includes('401') || message.includes('Invalid')
      ? 'Invalid email or password.'
      : 'Something went wrong. Please try again.'
    showToast(error.value, 'error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen w-screen bg-[#0B1120] flex items-center justify-center font-sans">
    <div class="w-full max-w-sm">

      <!-- Logo -->
      <div class="text-center mb-10">
        <span class="text-primary text-4xl font-bold tracking-tight">⑂ CONDUIT</span>
        <p class="text-slate-500 text-xs mt-2 font-mono tracking-widest uppercase">Workflow Automation Engine</p>
      </div>

      <!-- Card -->
      <div class="bg-[#0F172A] border border-slate-700 rounded-lg p-8 shadow-2xl">
        <h2 class="text-slate-100 text-base font-bold mb-6">Sign in to your account</h2>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-[10px] text-slate-500 mb-1.5 uppercase tracking-wider font-bold">Email</label>
            <input
              v-model="email"
              type="email"
              autocomplete="email"
              required
              placeholder="admin@conduit.com"
              class="w-full bg-[#1E293B] border border-slate-700 rounded p-2.5 text-sm text-slate-300 font-mono focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label class="block text-[10px] text-slate-500 mb-1.5 uppercase tracking-wider font-bold">Password</label>
            <input
              v-model="password"
              type="password"
              autocomplete="current-password"
              required
              placeholder="••••••••"
              class="w-full bg-[#1E293B] border border-slate-700 rounded p-2.5 text-sm text-slate-300 font-mono focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          <!-- Error message -->
          <p v-if="error" class="text-rose-400 text-xs font-mono pt-1">{{ error }}</p>

          <button
            type="submit"
            :disabled="loading"
            class="w-full mt-2 bg-primary text-white font-bold py-2.5 rounded hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(99,102,241,0.3)] text-sm"
          >
            {{ loading ? 'Signing in…' : 'Sign In' }}
          </button>
        </form>

        <!-- Demo credentials hint -->
        <div class="mt-6 pt-5 border-t border-slate-800 text-center">
          <p class="text-slate-600 text-[10px] font-mono uppercase tracking-wider mb-2">Demo credentials</p>
          <button
            type="button"
            class="text-slate-400 text-xs font-mono hover:text-slate-200 transition-colors"
            @click="email = 'admin@conduit.com'; password = 'admin123'"
          >
            admin@conduit.com / admin123
          </button>
        </div>
      </div>

    </div>
  </div>
</template>
