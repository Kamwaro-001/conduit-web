<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { apiService, type ApiWorkflow } from '@/services/api.service'
import { useAuthStore } from '@/stores/useAuthStore'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const authStore = useAuthStore()
const { showToast } = useToast()

const workflows = ref<ApiWorkflow[]>([])
const loading = ref(true)
const newName = ref('')
const creating = ref(false)
const deletingId = ref<string | null>(null)

onMounted(async () => {
  await fetchWorkflows()
})

async function fetchWorkflows() {
  loading.value = true
  try {
    workflows.value = await apiService.getWorkflows()
  } catch {
    showToast('Failed to load workflows.', 'error')
  } finally {
    loading.value = false
  }
}

async function createWorkflow() {
  const name = newName.value.trim()
  if (!name || creating.value) return
  creating.value = true
  try {
    const workflow = await apiService.createWorkflow(name)
    newName.value = ''
    router.push({ name: 'editor', params: { id: workflow.id } })
  } catch {
    showToast('Failed to create workflow.', 'error')
  } finally {
    creating.value = false
  }
}

async function deleteWorkflow(id: string) {
  deletingId.value = id
  try {
    await apiService.deleteWorkflow(id)
    workflows.value = workflows.value.filter((w) => w.id !== id)
    showToast('Workflow deleted.', 'info')
  } catch {
    showToast('Failed to delete workflow.', 'error')
  } finally {
    deletingId.value = null
  }
}

function openEditor(id: string) {
  router.push({ name: 'editor', params: { id } })
}

const STATUS_STYLES: Record<string, string> = {
  PUBLISHED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  DRAFT:     'bg-slate-700/50 text-slate-400 border-slate-600/30',
  ARCHIVED:  'bg-amber-500/10 text-amber-400 border-amber-500/20',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <div class="min-h-screen w-screen bg-[#0B1120] font-sans text-slate-300">

    <!-- Top bar -->
    <header class="h-14 bg-[#0F172A] border-b border-slate-700 flex items-center justify-between px-6 select-none">
      <span class="text-primary text-lg font-bold">⑂ CONDUIT</span>
      <div class="flex items-center gap-4">
        <span class="text-slate-500 text-xs font-mono">{{ authStore.user?.email }}</span>
        <button
          @click="authStore.logout()"
          class="text-xs text-slate-400 hover:text-slate-200 transition-colors border border-slate-700 px-3 py-1.5 rounded hover:bg-slate-800"
        >
          Sign out
        </button>
      </div>
    </header>

    <main class="max-w-3xl mx-auto px-6 py-12">

      <!-- Page heading + create -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-slate-100 text-xl font-bold">My Workflows</h1>
          <p class="text-slate-500 text-xs mt-1 font-mono">{{ workflows.length }} workflow{{ workflows.length !== 1 ? 's' : '' }}</p>
        </div>

        <!-- Inline create form -->
        <form @submit.prevent="createWorkflow" class="flex items-center gap-2">
          <input
            v-model="newName"
            type="text"
            placeholder="New workflow name…"
            class="bg-[#1E293B] border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-300 font-mono focus:border-primary focus:outline-none w-52 transition-colors"
          />
          <button
            type="submit"
            :disabled="!newName.trim() || creating"
            class="bg-primary text-white text-xs font-bold px-3 py-1.5 rounded hover:bg-blue-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {{ creating ? '…' : '+ Create' }}
          </button>
        </form>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="space-y-3">
        <div v-for="i in 3" :key="i" class="h-20 bg-[#0F172A] border border-slate-800 rounded-lg animate-pulse" />
      </div>

      <!-- Empty state -->
      <div
        v-else-if="workflows.length === 0"
        class="text-center py-24 border border-dashed border-slate-700 rounded-lg"
      >
        <p class="text-slate-500 text-sm">No workflows yet.</p>
        <p class="text-slate-600 text-xs mt-1 font-mono">Create one above to get started.</p>
      </div>

      <!-- Workflow list -->
      <ul v-else class="space-y-3">
        <li
          v-for="workflow in workflows"
          :key="workflow.id"
          class="group flex items-center justify-between bg-[#0F172A] border border-slate-700 rounded-lg px-5 py-4 cursor-pointer hover:border-primary/50 hover:bg-slate-800/30 transition-all"
          @click="openEditor(workflow.id)"
        >
          <div class="flex items-center gap-4">
            <div class="text-primary text-lg select-none">⑂</div>
            <div>
              <p class="text-slate-100 text-sm font-bold">{{ workflow.name }}</p>
              <p class="text-slate-600 text-[10px] font-mono mt-0.5">Created {{ formatDate(workflow.createdAt) }}</p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <span
              class="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border"
              :class="STATUS_STYLES[workflow.status] ?? STATUS_STYLES.DRAFT"
            >
              {{ workflow.status }}
            </span>

            <!-- Delete button — only visible on hover -->
            <button
              class="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-all p-1 rounded"
              :disabled="deletingId === workflow.id"
              @click.stop="deleteWorkflow(workflow.id)"
              title="Delete workflow"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-4">
                <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 3.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </li>
      </ul>

    </main>
  </div>
</template>
