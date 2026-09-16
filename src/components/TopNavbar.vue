<script setup lang="ts">
import { ref, nextTick } from 'vue'
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

const isEditingName = ref(false)
const editedName = ref('')
const nameInputRef = ref<HTMLInputElement | null>(null)

function startEditingName() {
  editedName.value = workflowStore.workflowName || ''
  isEditingName.value = true
  nextTick(() => {
    nameInputRef.value?.focus()
    nameInputRef.value?.select()
  })
}

async function saveName() {
  if (!isEditingName.value) return
  const trimmed = editedName.value.trim()
  if (!trimmed || trimmed === workflowStore.workflowName) {
    isEditingName.value = false
    return
  }
  try {
    await workflowStore.renameWorkflow(trimmed)
    showToast('Workflow renamed.', 'success')
  } catch {
    showToast('Failed to rename workflow.', 'error')
  } finally {
    isEditingName.value = false
  }
}

function cancelEditingName() {
  isEditingName.value = false
}

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
    showToast(
      isPublished ? 'Workflow set to draft.' : 'Workflow published!',
      isPublished ? 'info' : 'success',
    )
  } catch {
    showToast('Failed to update workflow status.', 'error')
  } finally {
    publishing.value = false
  }
}

const STATUS_LABEL: Record<string, string> = {
  PUBLISHED: 'Active (Production)',
  DRAFT: 'Draft',
  ARCHIVED: 'Archived',
}
const STATUS_STYLES: Record<string, string> = {
  PUBLISHED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  DRAFT: 'bg-slate-700/50 text-slate-400 border-slate-600/30',
  ARCHIVED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
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
        <div v-if="isEditingName" class="flex items-center gap-1">
          <input
            ref="nameInputRef"
            v-model="editedName"
            type="text"
            class="bg-[#1E293B] border border-primary text-slate-100 px-2 py-0.5 rounded text-xs font-bold focus:outline-none w-44"
            @keydown.enter="saveName"
            @keydown.esc="cancelEditingName"
            @blur="saveName"
          />
        </div>
        <div v-else class="group flex items-center gap-1.5">
          <span
            class="text-slate-100 font-bold truncate max-w-48 cursor-pointer hover:text-white transition-colors"
            @click="startEditingName"
            title="Click to rename"
          >
            {{ workflowStore.workflowName || '…' }}
          </span>
          <button
            @click="startEditingName"
            class="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-200 transition-opacity p-0.5 rounded"
            title="Rename workflow"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="size-3"
            >
              <path
                d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z"
              />
              <path
                d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z"
              />
            </svg>
          </button>
        </div>
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
        <!-- Undo / Redo -->
        <div class="flex items-center gap-1 border-r border-slate-700 pr-2 mr-2">
          <button
            @click="workflowStore.undo"
            :disabled="workflowStore.historyIndex <= 0"
            title="Undo"
            class="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="w-4 h-4"
            >
              <path
                fill-rule="evenodd"
                d="M7.793 2.232a.75.75 0 0 1-.025 1.06L3.622 7.25h10.003a5.375 5.375 0 0 1 0 10.75H10.75a.75.75 0 0 1 0-1.5h2.875a3.875 3.875 0 0 0 0-7.75H3.622l4.146 3.957a.75.75 0 0 1-1.036 1.085l-5.5-5.25a.75.75 0 0 1 0-1.085l5.5-5.25a.75.75 0 0 1 1.06.025Z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
          <button
            @click="workflowStore.redo"
            :disabled="workflowStore.historyIndex >= workflowStore.historyLength - 1"
            title="Redo"
            class="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="w-4 h-4"
            >
              <path
                fill-rule="evenodd"
                d="M12.207 2.232a.75.75 0 0 0 .025 1.06l4.146 3.958H6.375a5.375 5.375 0 0 0 0 10.75H9.25a.75.75 0 0 0 0-1.5H6.375a3.875 3.875 0 0 1 0-7.75h10.003l-4.146 3.957a.75.75 0 0 0 1.036 1.085l5.5-5.25a.75.75 0 0 0 0-1.085l-5.5-5.25a.75.75 0 0 0-1.06.025Z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>

        <!-- Save -->
        <button
          @click="handleSave"
          :disabled="saving || !workflowStore.workflowId"
          :class="[
            'flex items-center gap-1 px-3 py-1.5 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
            workflowStore.hasUnsavedChanges
              ? 'bg-amber-600 hover:bg-amber-500 text-white font-bold border border-amber-500'
              : 'bg-transparent border border-slate-700 text-slate-300 hover:bg-slate-800',
          ]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="size-4 shrink-0"
          >
            <path
              fill-rule="evenodd"
              d="M10 3a.75.75 0 0 1 .75.75v8.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V3.75A.75.75 0 0 1 10 3ZM3.75 16a.75.75 0 0 0 0 1.5h12.5a.75.75 0 0 0 0-1.5H3.75Z"
              clip-rule="evenodd"
            />
          </svg>
          <span
            v-if="workflowStore.hasUnsavedChanges && !saving"
            class="w-1.5 h-1.5 bg-white rounded-full animate-pulse absolute top-1 right-1 hidden"
          ></span>
          {{ saving ? 'Saving…' : workflowStore.hasUnsavedChanges ? 'Save Changes*' : 'Save' }}
        </button>

        <!-- Publish / Unpublish toggle -->
        <button
          @click="handlePublish"
          :disabled="publishing || !workflowStore.workflowId"
          class="flex items-center gap-1 px-3 py-1.5 rounded transition-colors font-bold disabled:opacity-40 disabled:cursor-not-allowed"
          :class="
            workflowStore.workflowStatus === 'PUBLISHED'
              ? 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600'
              : 'bg-primary text-white hover:bg-blue-500 shadow-[0_0_10px_rgba(99,102,241,0.3)]'
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="size-4 shrink-0"
          >
            <path
              d="M11.983 1.907a.75.75 0 0 0-1.292-.657l-8.5 9.5A.75.75 0 0 0 2.75 12h6.572l-1.305 6.093a.75.75 0 0 0 1.292.657l8.5-9.5A.75.75 0 0 0 17.25 8h-6.572l1.305-6.093Z"
            />
          </svg>
          {{
            publishing
              ? '…'
              : workflowStore.workflowStatus === 'PUBLISHED'
                ? 'Unpublish'
                : 'Publish Flow'
          }}
        </button>
      </div>

      <!-- User & logout -->
      <div class="flex items-center gap-3 pl-1">
        <span class="text-slate-500 font-mono text-[10px] hidden sm:block">{{
          authStore.user?.email
        }}</span>
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
