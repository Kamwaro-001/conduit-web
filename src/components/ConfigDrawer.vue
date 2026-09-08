<!-- src/components/ConfigDrawer.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue'
import type { GraphNode } from '@vue-flow/core'
import type { ConditionRule, ConduitNodeData } from '@/stores/useWorkflowStore';
// import type { ConduitNodeData, ConditionRule } from '../stores/workflow.store'

const props = defineProps<{
  selectedNode: GraphNode<ConduitNodeData> | null
}>()

const emit = defineEmits(['close'])

// Local working copy to support "Discard" functionality
const localDescription = ref('')
const localRules = ref<ConditionRule[]>([])
const localMatchType = ref<'AND' | 'OR'>('AND')

watch(() => props.selectedNode, (node) => {
  if (node) {
    localDescription.value = node.data.description || ''
    localRules.value = JSON.parse(JSON.stringify(node.data.rules || []))
    localMatchType.value = node.data.matchType || 'AND'
  }
}, { immediate: true })

const addRule = () => {
  localRules.value.push({
    id: `rule_${Date.now()}`,
    field: 'payload.',
    operator: '>=',
    value: ''
  })
}

const removeRule = (index: number) => {
  localRules.value.splice(index, 1)
}

const saveChanges = () => {
  if (!props.selectedNode) return
  props.selectedNode.data.description = localDescription.value
  props.selectedNode.data.rules = JSON.parse(JSON.stringify(localRules.value))
  props.selectedNode.data.matchType = localMatchType.value
}

const discardChanges = () => {
  if (!props.selectedNode) return
  localDescription.value = props.selectedNode.data.description
  localRules.value = JSON.parse(JSON.stringify(props.selectedNode.data.rules || []))
}
</script>

<template>
  <aside v-if="selectedNode" class="w-96 bg-[#0F172A] border-l border-slate-700 p-5 h-full flex flex-col z-10 shadow-2xl overflow-y-auto">

    <div class="flex justify-between items-start mb-6">
      <div>
        <h3 class="text-slate-100 font-bold text-base flex items-center gap-2">
          {{ selectedNode.data.backendType === 'CONDITION' ? '🔀' : '⚡' }}
          {{ selectedNode.label }} Settings
        </h3>
        <span class="text-[10px] text-slate-500 font-mono mt-1 block">ID: {{ selectedNode.id }}</span>
      </div>
      <button @click="$emit('close')" class="text-slate-500 hover:text-slate-300">✕</button>
    </div>

    <div class="flex-1 space-y-6">
      <div>
        <label class="block text-[10px] text-slate-500 mb-1 uppercase tracking-wider font-bold">Description</label>
        <input
          v-model="localDescription"
          type="text"
          class="w-full bg-[#1E293B] border border-slate-700 rounded p-2 text-sm text-slate-300 font-mono focus:border-primary focus:outline-none"
        />
      </div>

      <!-- Condition Rules Builder -->
      <div v-if="selectedNode.data.backendType === 'CONDITION'" class="space-y-4">
        <div class="flex justify-between items-center text-[10px] uppercase font-bold text-slate-500">
          <span>Branching Criteria</span>
          <span class="text-emerald-500 normal-case font-mono">{{ localRules.length }} Rules</span>
        </div>

        <div class="flex bg-[#1E293B] rounded p-1">
          <button
            @click="localMatchType = 'AND'"
            :class="['flex-1 text-xs py-1 rounded transition-colors', localMatchType === 'AND' ? 'bg-slate-700 text-slate-200' : 'text-slate-500 hover:text-slate-300']">
            Match ALL (AND)
          </button>
          <button
            @click="localMatchType = 'OR'"
            :class="['flex-1 text-xs py-1 rounded transition-colors', localMatchType === 'OR' ? 'bg-slate-700 text-slate-200' : 'text-slate-500 hover:text-slate-300']">
            Match ANY (OR)
          </button>
        </div>

        <div v-for="(rule, index) in localRules" :key="rule.id" class="bg-[#1E293B] border border-slate-700 rounded p-3 space-y-3">
          <div class="flex justify-between items-center text-xs font-bold text-slate-400">
            <span>CONDITION #{{ index + 1 }}</span>
            <button @click="removeRule(index)" class="text-slate-500 hover:text-rose-400">🗑</button>
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
              <select v-model="rule.operator" class="w-full bg-[#0F172A] border border-slate-700 rounded p-2 text-xs text-slate-300 focus:border-primary focus:outline-none">
                <option value=">=">&gt;= (Greater or equal)</option>
                <option value="==">== (Strict equal)</option>
                <option value="!=">!= (Not equal)</option>
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

        <button @click="addRule" class="w-full py-2 border border-slate-700 rounded text-xs text-slate-300 hover:bg-slate-800 transition-colors mt-2">
          ⊕ Add Condition Rule
        </button>
      </div>
    </div>

    <div class="mt-8 pt-4 border-t border-slate-700 flex gap-2">
      <button @click="discardChanges" class="flex-1 bg-transparent border border-slate-700 text-slate-300 text-xs py-2 rounded hover:bg-slate-800 transition-colors">Discard</button>
      <button @click="saveChanges" class="flex-1 bg-primary text-white text-xs py-2 rounded hover:bg-blue-500 transition-colors">Save Changes</button>
    </div>

  </aside>
</template>
