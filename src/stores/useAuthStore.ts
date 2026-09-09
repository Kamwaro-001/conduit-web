import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { apiService } from '@/services/api.service'
import router from '@/router'

const TOKEN_KEY = 'conduit_token'

export interface AuthUser {
  id: string
  email: string
  role: 'ADMIN' | 'USER'
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const user = ref<AuthUser | null>(null)

  const isAuthenticated = computed(() => !!token.value)

  function _persist(newToken: string, newUser: AuthUser) {
    token.value = newToken
    user.value = newUser
    localStorage.setItem(TOKEN_KEY, newToken)
  }

  async function login(email: string, password: string) {
    const res = await apiService.login(email, password)
    _persist(res.access_token, res.user)
  }

  async function register(email: string, password: string) {
    const res = await apiService.register(email, password)
    _persist(res.access_token, res.user)
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
    router.push({ name: 'login' })
  }

  return { token, user, isAuthenticated, login, register, logout }
})
