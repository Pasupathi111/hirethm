<script setup lang="ts">
import { X } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  modelValue: string[]
  placeholder?: string
  maxSkills?: number
}>(), {
  placeholder: 'e.g. React, TypeScript, PostgreSQL — press Enter to add',
  maxSkills: 50,
})

const emit = defineEmits<{ 'update:modelValue': [string[]] }>()

const draft = ref('')
const inputRef = useTemplateRef<HTMLInputElement>('inputRef')

function addSkill(raw: string) {
  const value = raw.trim()
  if (!value) return
  if (props.modelValue.length >= props.maxSkills) return
  const exists = props.modelValue.some(s => s.toLowerCase() === value.toLowerCase())
  if (exists) {
    draft.value = ''
    return
  }
  emit('update:modelValue', [...props.modelValue, value.slice(0, 100)])
  draft.value = ''
}

function removeSkill(index: number) {
  emit('update:modelValue', props.modelValue.filter((_, i) => i !== index))
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ',') {
    event.preventDefault()
    addSkill(draft.value)
  } else if (event.key === 'Backspace' && !draft.value && props.modelValue.length > 0) {
    removeSkill(props.modelValue.length - 1)
  }
}

function handleBlur() {
  if (draft.value.trim()) addSkill(draft.value)
}
</script>

<template>
  <div
    class="flex w-full flex-wrap items-center gap-1.5 rounded-lg border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-900 px-2.5 py-2 focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-500 transition-colors"
    @click="inputRef?.focus()"
  >
    <span
      v-for="(skill, index) in modelValue"
      :key="`${skill}-${index}`"
      class="inline-flex items-center gap-1 rounded-md bg-brand-50 dark:bg-brand-950/50 px-2 py-1 text-xs font-medium text-brand-700 dark:text-brand-300 ring-1 ring-inset ring-brand-200 dark:ring-brand-800"
    >
      {{ skill }}
      <button
        type="button"
        class="inline-flex items-center justify-center rounded-sm hover:bg-brand-100 dark:hover:bg-brand-900 transition-colors"
        :aria-label="`Remove ${skill}`"
        @click.stop="removeSkill(index)"
      >
        <X class="size-3" />
      </button>
    </span>
    <input
      ref="inputRef"
      v-model="draft"
      type="text"
      :placeholder="modelValue.length === 0 ? placeholder : ''"
      class="min-w-[8rem] flex-1 border-0 bg-transparent p-0.5 text-sm text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-0"
      @keydown="handleKeydown"
      @blur="handleBlur"
    />
  </div>
</template>
