<!-- src/components/SidebarPalette.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'

const searchQuery = ref('')

const triggers = [
  { type: 'webhook', name: 'Webhook Listener', sub: 'HTTP POST/GET', realtime: true },
  { type: 'schedule', name: 'Schedule (Cron)', sub: 'Timer interval', disabled: true },
]

const logicNodes = [
  { type: 'condition', name: 'Condition / Branch', sub: 'IF / ELSE Boolean', active: true },
]

const actionNodes = [{ type: 'email', name: 'Send Email', sub: 'SMTP / SendGrid' }]

// Simple filter logic
const filteredTriggers = computed(() =>
  triggers.filter((t) => t.name.toLowerCase().includes(searchQuery.value.toLowerCase())),
)
const filteredLogic = computed(() =>
  logicNodes.filter((l) => l.name.toLowerCase().includes(searchQuery.value.toLowerCase())),
)
const filteredActions = computed(() =>
  actionNodes.filter((a) => a.name.toLowerCase().includes(searchQuery.value.toLowerCase())),
)

const onDragStart = (event: DragEvent, nodeType: string) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/vueflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }
}
</script>

<template>
  <aside
    class="w-64 bg-[#0F172A] border-r border-slate-700 flex flex-col h-full z-10 font-sans select-none"
  >
    <!-- Header & Search -->
    <div class="p-4 border-b border-slate-700 space-y-4">
      <div
        class="flex justify-between items-center text-xs font-bold text-slate-300 uppercase tracking-wider"
      >
        <span>Node Palette</span>
        <span
          class="bg-[#1E293B] text-primary px-2 py-0.5 rounded border border-primary/30 text-[10px]"
          >11 Ops</span
        >
      </div>

      <div class="relative flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-4 absolute left-2 text-slate-500">
          <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clip-rule="evenodd" />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Filter nodes"
          class="w-full bg-[#1E293B] border border-slate-700 rounded pl-7 pr-8 py-1.5 text-xs text-slate-300 focus:border-primary focus:outline-none"
        />
        <!-- <span
          class="absolute right-2 bg-slate-800 text-slate-500 text-[9px] px-1 rounded border border-slate-700 font-mono"
          >⌘K</span
        > -->
      </div>
    </div>

    <!-- Draggable Node List -->
    <div class="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-4 custom-scrollbar">
      <!-- TRIGGERS -->
      <div class="space-y-1">
        <div
          class="flex justify-between items-center px-2 py-1 text-[10px] text-slate-500 font-bold uppercase tracking-wider cursor-pointer hover:text-slate-300"
        >
          <span>((•)) Triggers (3)</span>
          <span>⌃</span>
        </div>

        <div
          class="group flex items-center justify-between p-2 rounded cursor-grab hover:bg-[#1E293B] border border-transparent hover:border-slate-700 transition-colors"
          draggable="true"
          @dragstart="onDragStart($event, 'webhook')"
        >
          <div class="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5 text-primary">
              <path d="M11.983 1.907a.75.75 0 0 0-1.292-.657l-8.5 9.5A.75.75 0 0 0 2.75 12h6.572l-1.305 6.093a.75.75 0 0 0 1.292.657l8.5-9.5A.75.75 0 0 0 17.25 8h-6.572l1.305-6.093Z" />
            </svg>
            <div class="flex flex-col">
              <span class="text-slate-200 text-xs font-bold">Webhook Listener</span>
              <span class="text-slate-500 text-[10px] font-mono">HTTP POST/GET</span>
            </div>
          </div>
          <span
            class="text-[9px] text-emerald-400 bg-emerald-400/10 px-1 rounded hidden group-hover:block border border-emerald-400/20"
            >Realtime</span
          >
        </div>

        <div
          class="group flex items-center justify-between p-2 rounded cursor-not-allowed opacity-50"
        >
          <div class="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5 text-slate-400">
              <path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clip-rule="evenodd" />
            </svg>
            <div class="flex flex-col">
              <span class="text-slate-200 text-xs font-bold">Schedule (Cron)</span>
              <span class="text-slate-500 text-[10px] font-mono">Timer interval</span>
            </div>
          </div>
        </div>
      </div>

      <!-- LOGIC & FLOW -->
      <div class="space-y-1 border-t border-slate-800 pt-3">
        <div
          class="flex justify-between items-center px-2 py-1 text-[10px] text-slate-500 font-bold uppercase tracking-wider cursor-pointer hover:text-slate-300"
        >
          <span>⑂ Logic & Flow (4)</span>
          <span>⌃</span>
        </div>

        <div
          class="group flex items-center justify-between p-2 rounded cursor-grab hover:bg-[#1E293B] border border-transparent hover:border-slate-700 transition-colors relative"
          draggable="true"
          @dragstart="onDragStart($event, 'condition')"
        >
          <!-- Active indicator line -->
          <div
            class="absolute left-0 top-2 bottom-2 w-[2px] bg-secondary rounded-r hidden group-hover:block"
          ></div>

          <div class="flex items-center gap-3 ml-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5 text-secondary">
              <path fill-rule="evenodd" d="M13.2 2.24a.75.75 0 0 0 .04 1.06l2.1 1.95H6.75a.75.75 0 0 0 0 1.5h8.59l-2.1 1.95a.75.75 0 1 0 1.02 1.1l3.5-3.25a.75.75 0 0 0 0-1.1l-3.5-3.25a.75.75 0 0 0-1.06.04Zm-6.4 8a.75.75 0 0 0-1.06-.04l-3.5 3.25a.75.75 0 0 0 0 1.1l3.5 3.25a.75.75 0 1 0 1.02-1.1l-2.1-1.95h8.59a.75.75 0 0 0 0-1.5H4.66l2.1-1.95a.75.75 0 0 0 .04-1.06Z" clip-rule="evenodd" />
            </svg>
            <div class="flex flex-col">
              <span class="text-slate-200 text-xs font-bold flex items-center gap-1">
                Condition / Branch <span class="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              </span>
              <span class="text-secondary text-[10px] font-mono">IF / ELSE Boolean</span>
            </div>
          </div>
          <span class="text-slate-600 group-hover:text-slate-400 tracking-[-2px]">⋮⋮</span>
        </div>

        <div
          class="group flex items-center justify-between p-2 rounded cursor-not-allowed opacity-50"
        >
          <div class="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5 text-slate-400">
              <path fill-rule="evenodd" d="M4.25 2A2.25 2.25 0 0 0 2 4.25v2.5A2.25 2.25 0 0 0 4.25 9h2.5A2.25 2.25 0 0 0 9 6.75v-2.5A2.25 2.25 0 0 0 6.75 2h-2.5Zm0 9A2.25 2.25 0 0 0 2 13.25v2.5A2.25 2.25 0 0 0 4.25 18h2.5A2.25 2.25 0 0 0 9 15.75v-2.5A2.25 2.25 0 0 0 6.75 11h-2.5Zm9-9A2.25 2.25 0 0 0 11 4.25v2.5A2.25 2.25 0 0 0 13.25 9h2.5A2.25 2.25 0 0 0 18 6.75v-2.5A2.25 2.25 0 0 0 15.75 2h-2.5Zm0 9A2.25 2.25 0 0 0 11 13.25v2.5A2.25 2.25 0 0 0 13.25 18h2.5A2.25 2.25 0 0 0 18 15.75v-2.5A2.25 2.25 0 0 0 15.75 11h-2.5Z" clip-rule="evenodd" />
            </svg>
            <div class="flex flex-col">
              <span class="text-slate-200 text-xs font-bold">Parallel Split</span>
              <span class="text-slate-500 text-[10px] font-mono">Fan-out worker</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ACTIONS & OUTPUTS -->
      <div class="space-y-1 border-t border-slate-800 pt-3 mb-4">
        <div
          class="flex justify-between items-center px-2 py-1 text-[10px] text-slate-500 font-bold uppercase tracking-wider cursor-pointer hover:text-slate-300"
        >
          <span>▷ Actions & Outputs (4)</span>
          <span>⌃</span>
        </div>

        <div
          class="group flex items-center justify-between p-2 rounded cursor-grab hover:bg-[#1E293B] border border-transparent hover:border-slate-700 transition-colors"
          draggable="true"
          @dragstart="onDragStart($event, 'email')"
        >
          <div class="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5 text-slate-200">
              <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
              <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
            </svg>


            <div class="flex flex-col">
              <span class="text-slate-200 text-xs font-bold">Send Email</span>
              <span class="text-slate-500 text-[10px] font-mono">SMTP / SendGrid</span>
            </div>
          </div>
          <span class="text-slate-600 group-hover:text-slate-400 tracking-[-2px]">⋮⋮</span>
        </div>
      </div>
    </div>

    <!-- Engine Telemetry Bottom Panel -->
    <div class="mt-auto border-t border-slate-700 bg-[#0B1120] p-4 font-mono text-[10px] space-y-2">
      <div class="flex justify-between items-center mb-3">
        <span class="text-slate-500 font-bold tracking-wider">● ENGINE TELEMETRY</span>
        <span class="text-emerald-400">Live</span>
      </div>
      <div class="flex justify-between">
        <span class="text-slate-500">Worker pool</span>
        <span class="text-slate-300">99.98% healthy</span>
      </div>
      <div class="h-px w-full bg-slate-800"></div>
      <div class="flex justify-between">
        <span class="text-slate-500">Queue depth</span>
        <span class="text-secondary font-bold">12 active jobs</span>
      </div>
      <div class="flex justify-between">
        <span class="text-slate-500">Cluster load</span>
        <span class="text-slate-300">0.18 / 0.24 (avg)</span>
      </div>
    </div>
  </aside>
</template>

<style scoped>
/* Optional: Minimalist scrollbar to match the design */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 4px;
}
.custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background: #475569;
}
</style>
