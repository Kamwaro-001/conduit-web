<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkflowStore } from '@/stores/useWorkflowStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const workflowStore = useWorkflowStore()
const authStore = useAuthStore()
const { showToast } = useToast()

const saving = ref(false)
const publishing = ref(false)

async function handleSave() {
  if (saving.value || !workflowStore.workflowId) return
  saving.value = true
  try {
    await workflowStore.syncCanvas()
    showToast('Workflow saved.', 'success')
  } catch {
    showToast('Failed to save workflow.', 'error')
  } finally {
    saving.value = false
  }
}

async function handlePublish() {
  if (publishing.value || !workflowStore.workflowId) return
  publishing.value = true
  try {
    const isPublished = workflowStore.workflowStatus === 'PUBLISHED'
    await workflowStore.setWorkflowStatus(isPublished ? 'DRAFT' : 'PUBLISHED')
    showToast(isPublished ? 'Workflow set to draft.' : 'Workflow published!', isPublished ? 'info' : 'success')
  } catch {
    showToast('Failed to update workflow status.', 'error')
  } finally {
    publishing.value = false
  }
}

const STATUS_LABEL: Record<string, string> = {
  PUBLISHED: 'Active (Production)',
  DRAFT:     'Draft',
  ARCHIVED:  'Archived',
}
const STATUS_STYLES: Record<string, string> = {
  PUBLISHED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  DRAFT:     'bg-slate-700/50 text-slate-400 border-slate-600/30',
  ARCHIVED:  'bg-amber-500/10 text-amber-400 border-amber-500/20',
}
</script>

<template>
  <header
    class="h-14 bg-[#0F172A] border-b border-slate-700 flex items-center justify-between px-4 text-xs font-sans select-none z-20"
  >
    <!-- Left: Branding & Breadcrumbs -->
    <div class="flex items-center gap-4">
      <div class="flex items-center gap-2">
        <span class="text-primary text-lg font-bold">⑂ CONDUIT</span>
      </div>

      <div class="h-4 w-px bg-slate-700" />

      <div class="text-slate-400 flex items-center gap-2">
        <button
          class="hover:text-slate-300 cursor-pointer transition-colors"
          @click="router.push({ name: 'workflows' })"
        >
          Workflows
        </button>
        <span>/</span>
        <span class="text-slate-100 font-bold truncate max-w-48">
          {{ workflowStore.workflowName || '…' }}
        </span>
      </div>

      <!-- Status badge -->
      <div v-if="workflowStore.workflowStatus" class="flex items-center gap-2 ml-2">
        <span
          class="px-2 py-0.5 rounded-full flex items-center gap-1.5 text-[10px] uppercase font-bold border"
          :class="STATUS_STYLES[workflowStore.workflowStatus] ?? STATUS_STYLES.DRAFT"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-current" />
          {{ STATUS_LABEL[workflowStore.workflowStatus] ?? workflowStore.workflowStatus }}
        </span>
      </div>
    </div>

    <!-- Right: Actions -->
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-2 border-r border-slate-700 pr-3">
        <!-- Save -->
        <button
          @click="handleSave"
          :disabled="saving || !workflowStore.workflowId"
          class="flex items-center gap-1 bg-transparent border border-slate-700 text-slate-300 px-3 py-1.5 rounded hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-4 shrink-0">
            <path fill-rule="evenodd" d="M10 3a.75.75 0 0 1 .75.75v8.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V3.75A.75.75 0 0 1 10 3ZM3.75 16a.75.75 0 0 0 0 1.5h12.5a.75.75 0 0 0 0-1.5H3.75Z" clip-rule="evenodd" />
          </svg>
          {{ saving ? 'Saving…' : 'Save' }}
        </button>

        <!-- Publish / Unpublish toggle -->
        <button
          @click="handlePublish"
          :disabled="publishing || !workflowStore.workflowId"
          class="flex items-center gap-1 px-3 py-1.5 rounded transition-colors font-bold disabled:opacity-40 disabled:cursor-not-allowed"
          :class="workflowStore.workflowStatus === 'PUBLISHED'
            ? 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600'
            : 'bg-primary text-white hover:bg-blue-500 shadow-[0_0_10px_rgba(99,102,241,0.3)]'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-4 shrink-0">
            <path d="M11.983 1.907a.75.75 0 0 0-1.292-.657l-8.5 9.5A.75.75 0 0 0 2.75 12h6.572l-1.305 6.093a.75.75 0 0 0 1.292.657l8.5-9.5A.75.75 0 0 0 17.25 8h-6.572l1.305-6.093Z" />
          </svg>
          {{ publishing ? '…' : workflowStore.workflowStatus === 'PUBLISHED' ? 'Unpublish' : 'Publish Flow' }}
        </button>
      </div>

      <!-- User & logout -->
      <div class="flex items-center gap-3 pl-1">
        <span class="text-slate-500 font-mono text-[10px] hidden sm:block">{{ authStore.user?.email }}</span>
        <button
          @click="authStore.logout()"
          class="text-slate-500 hover:text-slate-300 transition-colors text-[10px] uppercase tracking-wider"
        >
          Sign out
        </button>
      </div>
    </div>
  </header>
</template>
