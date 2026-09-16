<script setup lang="ts">
import type { GraphNode } from '@vue-flow/core'
import type { ConduitNodeData } from '@/stores/useWorkflowStore'
import { useWorkflowStore } from '@/stores/useWorkflowStore'

const props = defineProps<{
  selectedNode: GraphNode<ConduitNodeData> | null
}>()

const emit = defineEmits(['close'])

const workflowStore = useWorkflowStore()

function addRule() {
  if (!props.selectedNode) return
  if (!props.selectedNode.data.rules) {
    props.selectedNode.data.rules = []
  }
  props.selectedNode.data.rules.push({ id: `rule_${Date.now()}`, field: 'payload.', operator: '>=', value: '' })
}

function removeRule(index: number) {
  if (!props.selectedNode || !props.selectedNode.data.rules) return
  props.selectedNode.data.rules.splice(index, 1)
}
</script>

<template>
  <aside
    v-if="selectedNode"
    class="w-96 bg-[#0F172A] border-l border-slate-700 p-5 h-full flex flex-col z-10 shadow-2xl overflow-y-auto"
  >
    <!-- Header -->
    <div class="flex justify-between items-start mb-6">
      <div>
        <h3 class="text-slate-100 font-bold text-base flex items-center gap-2">
          <svg
            v-if="selectedNode.data.backendType === 'CONDITION'"
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
          <svg
            v-else-if="selectedNode.data.backendType === 'EMAIL'"
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
          <svg
            v-else-if="selectedNode.data.backendType === 'DELAY'"
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
          Node Settings
        </h3>
        <span class="text-[10px] text-slate-500 font-mono mt-1 block">
          {{ selectedNode.data.backendType }} · {{ selectedNode.id }}
        </span>
      </div>
      <button @click="$emit('close')" class="text-slate-500 hover:text-slate-300">✕</button>
    </div>

    <div class="flex-1 space-y-5">
      <!-- Label -->
      <div>
        <label class="block text-[10px] text-slate-500 mb-1 uppercase tracking-wider font-bold"
          >Label</label
        >
        <input
          v-model="selectedNode.data.label"
          type="text"
          class="w-full bg-neutral-800 border border-slate-700 rounded p-2 text-sm text-slate-300 font-mono focus:border-primary focus:outline-none"
        />
      </div>

      <!-- Description -->
      <div>
        <label class="block text-[10px] text-slate-500 mb-1 uppercase tracking-wider font-bold"
          >Description</label
        >
        <input
          v-model="selectedNode.data.description"
          type="text"
          class="w-full bg-neutral-800 border border-slate-700 rounded p-2 text-sm text-slate-300 font-mono focus:border-primary focus:outline-none"
        />
      </div>

      <!-- HTTP_FETCH Config -->
      <div v-if="selectedNode.data.backendType === 'HTTP_FETCH'" class="space-y-4">
        <div>
          <label class="block text-[10px] text-slate-500 mb-1">Method</label>
          <select
            v-model="selectedNode.data.method"
            class="w-full bg-neutral-800 border border-slate-700 rounded p-2 text-sm text-slate-300"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>
        <div>
          <label class="block text-[10px] text-slate-500 mb-1">Endpoint URL</label>
          <input
            v-model="selectedNode.data.url"
            type="text"
            placeholder="https://api.example.com/v1"
            class="w-full bg-neutral-800 border border-slate-700 rounded p-2 text-sm text-slate-300 font-mono"
          />
        </div>
      </div>

      <!-- SCHEDULE Config -->
      <div v-if="selectedNode.data.backendType === 'SCHEDULE'" class="space-y-4">
        <div>
          <label class="block text-[10px] text-slate-500 mb-1 uppercase tracking-wider font-bold"
            >Cron Expression</label
          >
          <input
            v-model="selectedNode.data.cronExpression"
            type="text"
            placeholder="* * * * *"
            class="w-full bg-[#1E293B] border border-slate-700 rounded p-2 text-sm text-slate-300 font-mono focus:border-primary focus:outline-none"
          />
          <p class="text-[10px] text-slate-500 mt-1 font-mono">min hour day month weekday</p>
        </div>
      </div>

      <!-- VISION Config -->
      <div v-if="selectedNode.data.backendType === 'VISION'" class="space-y-4">
        <div>
          <label class="block text-[10px] text-slate-500 mb-1 uppercase tracking-wider font-bold"
            >Image URL Field</label
          >
          <input
            v-model="selectedNode.data.imageUrlField"
            type="text"
            placeholder="node-id.extracted"
            class="w-full bg-[#1E293B] border border-slate-700 rounded p-2 text-sm text-slate-300 font-mono focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label class="block text-[10px] text-slate-500 mb-1 uppercase tracking-wider font-bold"
            >Vision Prompt / Instruction</label
          >
          <textarea
            v-model="selectedNode.data.prompt"
            rows="5"
            placeholder="Describe what to analyze or extract from the image..."
            class="w-full bg-neutral-800 border border-slate-700 rounded p-2 text-xs text-slate-300 font-mono focus:border-primary focus:outline-none"
          ></textarea>
        </div>
        <div>
          <label class="block text-[10px] text-slate-500 mb-1 uppercase tracking-wider font-bold"
            >Model</label
          >
          <input
            v-model="selectedNode.data.model"
            type="text"
            placeholder="gemini-3.6-flash"
            class="w-full bg-[#1E293B] border border-slate-700 rounded p-2 text-sm text-slate-300 font-mono focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <!-- REGEX Config -->
      <div v-if="selectedNode.data.backendType === 'REGEX'" class="space-y-4">
        <div>
          <label class="block text-[10px] text-slate-500 mb-1 uppercase tracking-wider font-bold"
            >Input Field Path</label
          >
          <input
            v-model="selectedNode.data.inputField"
            type="text"
            placeholder="payload.text"
            class="w-full bg-[#1E293B] border border-slate-700 rounded p-2 text-sm text-slate-300 font-mono focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label class="block text-[10px] text-slate-500 mb-1 uppercase tracking-wider font-bold"
            >Regex Pattern</label
          >
          <input
            v-model="selectedNode.data.pattern"
            type="text"
            placeholder="^[a-z]+$"
            class="w-full bg-[#1E293B] border border-slate-700 rounded p-2 text-sm text-slate-300 font-mono focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label class="block text-[10px] text-slate-500 mb-1 uppercase tracking-wider font-bold"
            >Flags</label
          >
          <input
            v-model="selectedNode.data.flags"
            type="text"
            placeholder="i"
            class="w-full bg-[#1E293B] border border-slate-700 rounded p-2 text-sm text-slate-300 font-mono focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <!-- Condition rules builder -->
      <div v-if="selectedNode.data.backendType === 'CONDITION'" class="space-y-4">
        <div
          class="flex justify-between items-center text-[10px] uppercase font-bold text-slate-500"
        >
          <span>Branching Criteria</span>
          <span class="text-emerald-500 normal-case font-mono">{{ selectedNode.data.rules?.length || 0 }} Rules</span>
        </div>

        <div class="flex bg-neutral-800 rounded p-1">
          <button
            @click="selectedNode.data.matchType = 'AND'"
            :class="[
              'flex-1 text-xs py-1 rounded transition-colors',
              selectedNode.data.matchType === 'AND'
                ? 'bg-slate-700 text-slate-200'
                : 'text-slate-500 hover:text-slate-300',
            ]"
          >
            Match ALL (AND)
          </button>
          <button
            @click="selectedNode.data.matchType = 'OR'"
            :class="[
              'flex-1 text-xs py-1 rounded transition-colors',
              selectedNode.data.matchType === 'OR'
                ? 'bg-slate-700 text-slate-200'
                : 'text-slate-500 hover:text-slate-300',
            ]"
          >
            Match ANY (OR)
          </button>
        </div>

        <div
          v-for="(rule, index) in selectedNode.data.rules"
          :key="rule.id"
          class="bg-neutral-800 border border-slate-700 rounded p-3 space-y-3"
        >
          <div class="flex justify-between items-center text-xs font-bold text-slate-400">
            <span>CONDITION #{{ index + 1 }}</span>
            <button @click="removeRule(index)" class="text-slate-500 hover:text-rose-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                class="size-4"
              >
                <path
                  fill-rule="evenodd"
                  d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 3.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
          <div>
            <label class="block text-[10px] text-slate-500 mb-1">Field Expression</label>
            <input
              v-model="rule.field"
              type="text"
              class="w-full bg-[#0F172A] border border-slate-700 rounded p-2 text-xs text-secondary font-mono focus:border-primary focus:outline-none"
            />
          </div>
          <div class="flex gap-2">
            <div class="flex-1">
              <label class="block text-[10px] text-slate-500 mb-1">Operator</label>
              <select
                v-model="rule.operator"
                class="w-full bg-[#0F172A] border border-slate-700 rounded p-2 text-xs text-slate-300 focus:border-primary focus:outline-none"
              >
                <option value=">=">&gt;= (Greater or equal)</option>
                <option value="==">== (Strict equal)</option>
                <option value="!=">!= (Not equal)</option>
                <option value="contains">contains</option>
              </select>
            </div>
            <div class="flex-1">
              <label class="block text-[10px] text-slate-500 mb-1">Value</label>
              <input
                v-model="rule.value"
                type="text"
                class="w-full bg-[#0F172A] border border-slate-700 rounded p-2 text-xs text-slate-300 font-mono focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        <button
          @click="addRule"
          class="w-full py-2 border border-slate-700 rounded text-xs text-slate-300 hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
        >
          <span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              class="size-4"
            >
              <path
                fill-rule="evenodd"
                d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm.75-10.25v2.5h2.5a.75.75 0 0 1 0 1.5h-2.5v2.5a.75.75 0 0 1-1.5 0v-2.5h-2.5a.75.75 0 0 1 0-1.5h2.5v-2.5a.75.75 0 0 1 1.5 0Z"
                clip-rule="evenodd"
              />
            </svg>
          </span>
          Add Condition Rule
        </button>
      </div>

      <!-- Delay config -->
      <div v-if="selectedNode.data.backendType === 'DELAY'">
        <label class="block text-[10px] text-slate-500 mb-1 uppercase tracking-wider font-bold"
          >Delay Duration (ms)</label
        >
        <input
          v-model="selectedNode.data.delay_ms"
          type="number"
          step="1000"
          class="w-full bg-[#1E293B] border border-slate-700 rounded p-2 text-sm text-slate-300 font-mono focus:border-primary focus:outline-none"
        />
      </div>

      <div v-if="selectedNode.data.backendType === 'EMAIL'" class="space-y-4">
        <div>
          <label class="block text-[10px] text-slate-500 mb-1 uppercase tracking-wider font-bold"
            >Recipient Email</label
          >
          <input
            v-model="selectedNode.data.recipient"
            type="text"
            placeholder="user@example.com"
            class="w-full bg-[#1E293B] border border-slate-700 rounded p-2 text-sm text-slate-300 font-mono focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label class="block text-[10px] text-slate-500 mb-1 uppercase tracking-wider font-bold"
            >Subject</label
          >
          <input
            v-model="selectedNode.data.subject"
            type="text"
            placeholder="Notification"
            class="w-full bg-[#1E293B] border border-slate-700 rounded p-2 text-sm text-slate-300 font-mono focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label class="block text-[10px] text-slate-500 mb-1 uppercase tracking-wider font-bold"
            >Body (HTML allowed)</label
          >
          <textarea
            v-model="selectedNode.data.body"
            rows="5"
            placeholder="<p>Hello...</p>"
            class="w-full bg-neutral-800 border border-slate-700 rounded p-2 text-xs text-slate-300 font-mono focus:border-primary focus:outline-none"
          ></textarea>
        </div>
      </div>
    </div>
  </aside>
</template>
