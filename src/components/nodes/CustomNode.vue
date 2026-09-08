<!-- src/components/nodes/CustomNode.vue -->
<script setup lang="ts">
import type { ConduitNodeData } from '@/stores/useWorkflowStore'
import { Handle, Position, type NodeProps } from '@vue-flow/core'
// import type { ConduitNodeData } from '../../stores/workflow.store'

defineProps<NodeProps<ConduitNodeData>>()
</script>

<template>
  <div
    :class="[
      'w-80 rounded-md bg-[#1E293B] shadow-2xl text-slate-300 font-sans transition-all pb-2',
      selected ? 'border-2 border-primary' : 'border border-slate-700',
    ]"
  >
    <div
      v-if="selected"
      class="bg-primary/20 text-primary text-[10px] uppercase font-bold px-3 py-1 flex justify-between border-b border-primary"
    >
      <span class="flex items-center gap-1">⎘ Selected Node</span>
      <span class="font-mono">ID: {{ id.split('_')[1] || id }}</span>
    </div>

    <div class="p-4 relative">
      <Handle
        type="target"
        :position="Position.Left"
        class="w-3 h-3 bg-slate-500 border-2 border-[#1E293B] -ml-1"
      />

      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-primary shadow-sm"
          >
            <!-- ArrowsRightLeft: Condition / Branch -->
              <svg v-if="data.backendType === 'CONDITION'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5 text-secondary">
                <path fill-rule="evenodd" d="M13.2 2.24a.75.75 0 0 0 .04 1.06l2.1 1.95H6.75a.75.75 0 0 0 0 1.5h8.59l-2.1 1.95a.75.75 0 1 0 1.02 1.1l3.5-3.25a.75.75 0 0 0 0-1.1l-3.5-3.25a.75.75 0 0 0-1.06.04Zm-6.4 8a.75.75 0 0 0-1.06-.04l-3.5 3.25a.75.75 0 0 0 0 1.1l3.5 3.25a.75.75 0 1 0 1.02-1.1l-2.1-1.95h8.59a.75.75 0 0 0 0-1.5H4.66l2.1-1.95a.75.75 0 0 0 .04-1.06Z" clip-rule="evenodd" />
              </svg>
              <!-- Envelope: Send Email -->
              <svg v-else-if="data.backendType === 'EMAIL'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5 text-slate-200">
                <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
                <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
              </svg>
              <!-- Bolt: Webhook / Trigger (default) -->
              <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5 text-primary">
                <path d="M11.983 1.907a.75.75 0 0 0-1.292-.657l-8.5 9.5A.75.75 0 0 0 2.75 12h6.572l-1.305 6.093a.75.75 0 0 0 1.292.657l8.5-9.5A.75.75 0 0 0 17.25 8h-6.572l1.305-6.093Z" />
              </svg>
          </div>
          <div class="flex flex-col">
            <span class="text-slate-100 font-bold text-sm">{{ label }}</span>
            <span class="text-xs text-slate-400">{{ data.description }}</span>
          </div>
        </div>
      </div>

      <div class="h-px w-full bg-slate-700/50 mb-3"></div>

      <div class="flex items-center justify-between text-xs font-mono mb-2">
        <span
          v-if="data.status"
          :class="{
            'text-emerald-400': data.status === 'SUCCESS',
            'text-amber-400': data.status === 'RUNNING',
            'text-rose-400': data.status === 'FAILED',
            'text-slate-500': data.status === 'IDLE',
          }"
        >
          ●
          {{
            data.status === 'SUCCESS' && data.executionTimeMs
              ? `Success (${data.executionTimeMs}ms)`
              : data.status
          }}
        </span>
      </div>

      <!-- Single Output for Standard Nodes -->
      <Handle
        v-if="data.backendType !== 'CONDITION'"
        type="source"
        :position="Position.Right"
        class="w-3 h-3 bg-primary border-2 border-[#1E293B] -mr-1"
      />
    </div>

    <!-- Conditional Multi-Ports for Branching Logic -->
    <div v-if="data.backendType === 'CONDITION'" class="flex flex-col gap-2 mt-2">
      <div
        class="relative text-[10px] text-emerald-400 font-mono px-4 flex justify-between items-center group"
      >
        <span>▶ PORT TRUE (ACTIVE)</span>
        <Handle
          type="source"
          id="true"
          :position="Position.Right"
          class="w-3 h-3 bg-emerald-500 border-2 border-[#1E293B] -mr-[5px] !top-auto !transform-none relative"
        />
      </div>
      <div
        class="relative text-[10px] text-slate-500 font-mono px-4 flex justify-between items-center"
      >
        <span>▶ PORT FALSE (FALLBACK)</span>
        <Handle
          type="source"
          id="false"
          :position="Position.Right"
          class="w-3 h-3 bg-slate-500 border-2 border-[#1E293B] -mr-[5px] !top-auto !transform-none relative"
        />
      </div>
    </div>
  </div>
</template>
