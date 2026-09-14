<script setup lang="ts">
import { telemetryState } from '@/services/socket.service'
import { ref, computed } from 'vue'

const searchQuery = ref('')

const triggers = [
  { type: 'trigger', name: 'App Trigger', sub: 'Manual or API execution', draggable: true },
  { type: 'webhook', name: 'Webhook Listener', sub: 'HTTP POST/GET', draggable: true },
  { type: 'schedule', name: 'Schedule (Cron)', sub: 'Cron timer interval', draggable: true },
]

const logicNodes = [
  { type: 'condition', name: 'Condition / Branch', sub: 'IF / ELSE Boolean', draggable: true },
  { type: 'delay', name: 'Delay', sub: 'Wait N milliseconds', draggable: true },
]

const actionNodes = [
  { type: 'http_fetch', name: 'HTTP Fetch', sub: 'REST API Call', draggable: true },
  { type: 'email', name: 'Send Email', sub: 'SMTP / SendGrid', draggable: true },
  { type: 'vision', name: 'Vision / AI', sub: 'Analyze image or prompt', draggable: true },
  { type: 'regex', name: 'Regex Match', sub: 'Pattern extraction', draggable: true },
]
function matches(name: string) {
  return name.toLowerCase().includes(searchQuery.value.toLowerCase())
}

const filteredTriggers = computed(() => triggers.filter((t) => matches(t.name)))
const filteredLogic = computed(() => logicNodes.filter((n) => matches(n.name)))
const filteredActions = computed(() => actionNodes.filter((n) => matches(n.name)))

function onDragStart(event: DragEvent, nodeType: string) {
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
      </div>
      <div class="relative flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          class="size-4 absolute left-2 text-slate-500"
        >
          <path
            fill-rule="evenodd"
            d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
            clip-rule="evenodd"
          />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Filter nodes"
          class="w-full bg-neutral-800 border border-slate-700 rounded pl-7 pr-3 py-1.5 text-xs text-slate-300 focus:border-primary focus:outline-none"
        />
      </div>
    </div>

    <!-- Node list -->
    <div class="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-4 custom-scrollbar">
      <!-- TRIGGERS -->
      <div v-if="filteredTriggers.length" class="space-y-1">
        <div class="px-2 py-1 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
          ((•)) Triggers
        </div>
        <div
          v-for="node in filteredTriggers"
          :key="node.type"
          :draggable="node.draggable"
          :title="node.draggable ? 'Drag and drop onto canvas' : ''"
          :class="[
            'group flex items-center justify-between p-2 rounded border border-transparent transition-colors',
            node.draggable
              ? 'cursor-grab hover:bg-neutral-800 hover:border-slate-700'
              : 'opacity-40 cursor-not-allowed',
          ]"
          @dragstart="node.draggable && onDragStart($event, node.type)"
        >
          <div class="flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              :class="['size-5', node.draggable ? 'text-primary' : 'text-slate-400']"
            >
              <path
                d="M11.983 1.907a.75.75 0 0 0-1.292-.657l-8.5 9.5A.75.75 0 0 0 2.75 12h6.572l-1.305 6.093a.75.75 0 0 0 1.292.657l8.5-9.5A.75.75 0 0 0 17.25 8h-6.572l1.305-6.093Z"
              />
            </svg>
            <div>
              <p class="text-slate-200 text-xs font-bold">{{ node.name }}</p>
              <p class="text-slate-500 text-[10px] font-mono">{{ node.sub }}</p>
            </div>
          </div>
          <span v-if="!node.draggable" class="text-[9px] text-slate-600 font-mono">Soon</span>
        </div>
      </div>

      <!-- LOGIC & FLOW -->
      <div v-if="filteredLogic.length" class="space-y-1 border-t border-slate-800 pt-3">
        <div class="px-2 py-1 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
          ⑂ Logic & Flow
        </div>
        <div
          v-for="node in filteredLogic"
          :key="node.type"
          draggable="true"
          title="Drag and drop onto canvas"
          class="group flex items-center justify-between p-2 rounded cursor-grab hover:bg-neutral-800 border border-transparent hover:border-slate-700 transition-colors relative"
          @dragstart="onDragStart($event, node.type)"
        >
          <div
            class="absolute left-0 top-2 bottom-2 w-0.5 bg-secondary rounded-r hidden group-hover:block"
          />
          <div class="flex items-center gap-3 ml-1">
            <!-- Condition icon -->
            <svg
              v-if="node.type === 'condition'"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="size-5 text-secondary"
            >
              <path
                fill-rule="evenodd"
                d="M13.2 2.24a.75.75 0 0 0 .04 1.06l2.1 1.95H6.75a.75.75 0 0 0 0 1.5h8.59l-2.1 1.95a.75.75 0 1 0 1.02 1.1l3.5-3.25a.75.75 0 0 0 0-1.1l-3.5-3.25a.75.75 0 0 0-1.06.04Zm-6.4 8a.75.75 0 0 0-1.06-.04l-3.5 3.25a.75.75 0 0 0 0 1.1l3.5 3.25a.75.75 0 1 0 1.02-1.1l-2.1-1.95h8.59a.75.75 0 0 0 0-1.5H4.66l2.1-1.95a.75.75 0 0 0 .04-1.06Z"
                clip-rule="evenodd"
              />
            </svg>
            <!-- Delay icon -->
            <svg
              v-else-if="node.type === 'delay'"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="size-5 text-amber-400"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z"
                clip-rule="evenodd"
              />
            </svg>
            <div>
              <p class="text-slate-200 text-xs font-bold">{{ node.name }}</p>
              <p class="text-secondary text-[10px] font-mono">{{ node.sub }}</p>
            </div>
          </div>
          <span class="text-slate-600 group-hover:text-slate-400 tracking-[-2px]">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <!-- Icon from Google Material Icons by Material Design Authors - https://github.com/material-icons/material-icons/blob/master/LICENSE -->
              <path
                fill="currentColor"
                d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2s.9-2 2-2s2 .9 2 2m-2-8c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2m0-6c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2m6 4c1.1 0 2-.9 2-2s-.9-2-2-2s-2 .9-2 2s.9 2 2 2m0 2c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2m0 6c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2"
              />
            </svg>
          </span>
        </div>
      </div>

      <!-- ACTIONS -->
      <div v-if="filteredActions.length" class="space-y-1 border-t border-slate-800 pt-3 mb-4">
        <div class="px-2 py-1 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
          ▷ Actions & Outputs
        </div>
        <div
          v-for="node in filteredActions"
          :key="node.type"
          draggable="true"
          title="Drag and drop onto canvas"
          class="group flex items-center justify-between p-2 rounded cursor-grab hover:bg-neutral-800 border border-transparent hover:border-slate-700 transition-colors"
          @dragstart="onDragStart($event, node.type)"
        >
          <div class="flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="size-5 text-slate-200"
            >
              <path
                d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z"
              />
              <path
                d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z"
              />
            </svg>
            <div>
              <p class="text-slate-200 text-xs font-bold">{{ node.name }}</p>
              <p class="text-slate-500 text-[10px] font-mono">{{ node.sub }}</p>
            </div>
          </div>
          <span class="text-slate-600 group-hover:text-slate-400 tracking-[-2px]"
            ><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <!-- Icon from Google Material Icons by Material Design Authors - https://github.com/material-icons/material-icons/blob/master/LICENSE -->
              <path
                fill="currentColor"
                d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2s.9-2 2-2s2 .9 2 2m-2-8c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2m0-6c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2m6 4c1.1 0 2-.9 2-2s-.9-2-2-2s-2 .9-2 2s.9 2 2 2m0 2c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2m0 6c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2"
              /></svg
          ></span>
        </div>
      </div>
    </div>

    <!-- Engine Telemetry -->
    <div class="mt-auto border-t border-slate-700 bg-[#0B1120] p-4 font-mono text-[10px] space-y-2">
      <div class="flex justify-between items-center mb-3">
        <span class="text-slate-500 font-bold tracking-wider">● ENGINE TELEMETRY</span>
        <span class="text-emerald-400">Live</span>
      </div>
      <div class="flex justify-between">
        <span class="text-slate-500">Worker pool</span>
        <span class="text-slate-300">{{ telemetryState.workerHealth }}% healthy</span>
      </div>
      <div class="h-px w-full bg-slate-800" />
      <div class="flex justify-between">
        <span class="text-slate-500">Queue depth</span>
        <span class="text-secondary font-bold">{{ telemetryState.activeJobs }} active jobs</span>
      </div>
    </div>
  </aside>
</template>

<style scoped>
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
