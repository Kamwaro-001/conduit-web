<script setup lang="ts">
import type { ConduitNodeData } from '@/stores/useWorkflowStore'
import { Handle, Position, type NodeProps } from '@vue-flow/core'

defineProps<NodeProps<ConduitNodeData>>()
</script>

<template>
  <div
    :class="[
      'w-80 rounded-md bg-neutral-800 shadow-2xl text-slate-300 font-sans transition-all pb-2',
      selected ? 'border-2 border-primary' : 'border border-slate-700',
    ]"
  >
    <!-- Selected indicator bar -->
    <div
      v-if="selected"
      class="bg-primary/20 text-primary text-[10px] uppercase font-bold px-3 py-1 flex justify-between border-b border-primary"
    >
      <span class="flex items-center gap-1">⎘ Selected</span>
      <span class="font-mono opacity-60">{{ id }}</span>
    </div>

    <div class="p-4 relative">
      <!-- hide target handle for entry-point nodes -->
      <Handle
        v-if="!['TRIGGER', 'WEBHOOK', 'SCHEDULE'].includes(data.backendType)"
        type="target"
        :position="Position.Left"
        class="w-3 h-3 bg-slate-500 border-2 border-neutral-800 -ml-1"
      />

      <!-- Node header -->
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center gap-3">
          <!-- Icon -->
          <div
            class="w-8 h-8 rounded bg-slate-800 border border-slate-700 flex items-center justify-center shadow-sm"
          >
            <!-- CONDITION -->
            <svg
              v-if="data.backendType === 'CONDITION'"
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
            <!-- EMAIL -->
            <svg
              v-else-if="data.backendType === 'EMAIL'"
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
            <!-- DELAY -->
            <svg
              v-else-if="data.backendType === 'DELAY'"
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
            <!-- HTTP_FETCH -->
            <svg
              v-else-if="data.backendType === 'HTTP_FETCH'"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="size-5 text-sky-400"
            >
              <path
                fill-rule="evenodd"
                d="M4.25 2A2.25 2.25 0 0 0 2 4.25v11.5A2.25 2.25 0 0 0 4.25 18h11.5A2.25 2.25 0 0 0 18 15.75V4.25A2.25 2.25 0 0 0 15.75 2H4.25Zm4.03 6.28a.75.75 0 0 0-1.06-1.06L4.97 9.47a.75.75 0 0 0 0 1.06l2.25 2.25a.75.75 0 0 0 1.06-1.06L6.56 10l1.72-1.72Zm4.5-1.06a.75.75 0 1 0-1.06 1.06L13.44 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06l2.25-2.25a.75.75 0 0 0 0-1.06l-2.25-2.25Z"
                clip-rule="evenodd"
              />
            </svg>
            <!-- VISION -->
            <svg
              v-else-if="data.backendType === 'VISION'"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="size-5 text-violet-400"
            >
              <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
              <path
                fill-rule="evenodd"
                d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
                clip-rule="evenodd"
              />
            </svg>
            <!-- REGEX -->
            <svg
              v-else-if="data.backendType === 'REGEX'"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="size-5 text-rose-400"
            >
              <path
                fill-rule="evenodd"
                d="M9.638 1.093a.75.75 0 0 1 .724 0l2 1.104a.75.75 0 1 1-.724 1.313L10 2.607l-1.638.903a.75.75 0 1 1-.724-1.313l2-1.104ZM5.403 4.287a.75.75 0 0 1-.295 1.019l-.805.444.805.444a.75.75 0 0 1-.724 1.314L4 7.028v.744a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 1 .388-.657l1.996-1.1a.75.75 0 0 1 1.019.294Zm9.194 0a.75.75 0 0 1 1.02-.295l1.995 1.101A.75.75 0 0 1 18 5.75v2a.75.75 0 0 1-1.5 0v-.744l-.384.181a.75.75 0 0 1-.724-1.314l.805-.444-.805-.444a.75.75 0 0 1-.295-1.02ZM7.104 10a.75.75 0 0 1 1.02-.295l.876.483V9.75a.75.75 0 0 1 1.5 0v.438l.876-.483a.75.75 0 1 1 .724 1.314L11.3 11.5l.8.496a.75.75 0 1 1-.8 1.28l-.8-.496v.47a.75.75 0 0 1-1.5 0v-.47l-.8.497a.75.75 0 0 1-.8-1.28l.8-.497-.8-.476A.75.75 0 0 1 7.104 10Z"
                clip-rule="evenodd"
              />
            </svg>
            <!-- SCHEDULE -->
            <svg
              v-else-if="data.backendType === 'SCHEDULE'"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="size-5 text-emerald-400"
            >
              <path
                fill-rule="evenodd"
                d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z"
                clip-rule="evenodd"
              />
            </svg>
            <!-- TRIGGER / WEBHOOK (default) -->
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="size-5 text-primary"
            >
              <path
                d="M11.983 1.907a.75.75 0 0 0-1.292-.657l-8.5 9.5A.75.75 0 0 0 2.75 12h6.572l-1.305 6.093a.75.75 0 0 0 1.292.657l8.5-9.5A.75.75 0 0 0 17.25 8h-6.572l1.305-6.093Z"
              />
            </svg>
          </div>

          <div class="flex flex-col">
            <!-- Use data.label so the name is persisted through sync/reload -->
            <span class="text-slate-100 font-bold text-sm">{{ data.label }}</span>
            <span class="text-xs text-slate-400">{{ data.description }}</span>
          </div>
        </div>
      </div>

      <div class="h-px w-full bg-slate-700/50 mb-3" />

      <!-- Execution status -->
      <div class="flex items-center justify-between text-xs font-mono mb-2">
        <span
          v-if="data.status && data.status !== 'IDLE'"
          :class="{
            'text-emerald-400': data.status === 'SUCCESS',
            'text-amber-400': data.status === 'RUNNING',
            'text-rose-400': data.status === 'FAILED',
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

      <!-- Standard output handle -->
      <Handle
        v-if="data.backendType !== 'CONDITION'"
        type="source"
        :position="Position.Right"
        class="w-3 h-3 bg-primary border-2 border-neutral-800 -mr-1"
      />
    </div>

    <!-- Condition dual-port outputs -->
    <div v-if="data.backendType === 'CONDITION'" class="flex flex-col gap-2 mt-2">
      <div
        class="relative text-[10px] text-emerald-400 font-mono px-4 flex justify-between items-center"
      >
        <span>▶ PORT TRUE (ACTIVE)</span>
        <Handle
          type="source"
          id="true"
          :position="Position.Right"
          class="w-3 h-3 bg-emerald-500 border-2 border-neutral-800 -mr-1.25 top-auto! transform-none! relative"
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
          class="w-3 h-3 bg-slate-500 border-2 border-neutral-800 -mr-1.25 top-auto! transform-none! relative"
        />
      </div>
    </div>
  </div>
</template>
