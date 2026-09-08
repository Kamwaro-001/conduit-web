<script setup lang="ts">
import { useToast } from '../composables/useToast'

const { showToast } = useToast()
</script>

<template>
  <header
    class="h-14 bg-[#0F172A] border-b border-slate-700 flex items-center justify-between px-4 text-xs font-sans select-none z-20"
  >
    <!-- Left: Branding & Breadcrumbs -->
    <div class="flex items-center gap-4">
      <div class="flex items-center gap-2">
        <span class="text-primary text-lg font-bold">⑂ CONDUIT</span>
        <span
          class="text-slate-500 font-mono text-[10px] border border-slate-700 px-1.5 py-0.5 rounded"
          >v2.4.0-rc2</span
        >
      </div>

      <div class="h-4 w-px bg-slate-700"></div>

      <div class="text-slate-400 flex items-center gap-2">
        <span class="hover:text-slate-300 cursor-pointer">Workflows</span>
        <span>/</span>
        <span class="text-slate-100 font-bold">User Onboarding & KYC Pipeline</span>
      </div>

      <div class="flex items-center gap-2 ml-4">
        <span
          class="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1.5 text-[10px] uppercase font-bold"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Active (Production)
        </span>
        <span class="text-slate-500 text-[10px]">Last run 2m ago (Success)</span>
      </div>
    </div>

    <!-- Right: Actions & Profile -->
    <div class="flex items-center gap-3">
      <!-- View Controls -->
      <div class="flex items-center gap-3 text-slate-400 border-r border-slate-700 pr-3">
        <button class="hover:text-slate-200 flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-4 shrink-0">
            <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clip-rule="evenodd" />
          </svg> 100%
        </button>
        <button class="hover:text-slate-200 flex items-center gap-1 text-primary">
          <span class="text-sm">▦</span> Snap 16px
        </button>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2 border-r border-slate-700 pr-3">
        <button
          @click="showToast('Initiating execution dry run...', 'info')"
          class="flex items-center gap-1 bg-transparent border border-slate-700 text-slate-300 px-3 py-1.5 rounded hover:bg-slate-800 transition-colors"
        >
          <span class="text-primary">▷</span> Dry Run
        </button>
        <button
          @click="showToast('Workflow saved locally.', 'info')"
          class="flex items-center gap-1 bg-transparent border border-slate-700 text-slate-300 px-3 py-1.5 rounded hover:bg-slate-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-4 shrink-0">
            <path fill-rule="evenodd" d="M10 3a.75.75 0 0 1 .75.75v8.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V3.75A.75.75 0 0 1 10 3ZM3.75 16a.75.75 0 0 0 0 1.5h12.5a.75.75 0 0 0 0-1.5H3.75Z" clip-rule="evenodd" />
          </svg> Save
        </button>
        <button
          @click="showToast('Workflow published to production.', 'success')"
          class="flex items-center gap-1 bg-primary text-white px-3 py-1.5 rounded hover:bg-blue-500 transition-colors font-bold shadow-[0_0_10px_rgba(99,102,241,0.3)]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-4 shrink-0">
            <path d="M11.983 1.907a.75.75 0 0 0-1.292-.657l-8.5 9.5A.75.75 0 0 0 2.75 12h6.572l-1.305 6.093a.75.75 0 0 0 1.292.657l8.5-9.5A.75.75 0 0 0 17.25 8h-6.572l1.305-6.093Z" />
          </svg> Publish Flow
        </button>
      </div>

      <!-- Environment & Profile -->
      <div class="flex items-center gap-3 pl-1">
        <span class="text-slate-500 font-mono text-[10px] uppercase">PROD:us-east-1</span>
        <div
          class="w-7 h-7 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-4">
            <path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-5.5-2.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM10 12a5.99 5.99 0 0 0-4.793 2.39A6.483 6.483 0 0 0 10 16.5a6.483 6.483 0 0 0 4.793-2.11A5.99 5.99 0 0 0 10 12Z" clip-rule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  </header>
</template>
