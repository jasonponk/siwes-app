<template>
  <div>
    <div class="tags-container" @click="focusInput">
      <span v-for="tag in modelValue" :key="tag" class="tag">
        {{ tag }}
        <button type="button" class="tag-remove" @click.stop="removeTag(tag)">×</button>
      </span>
      <input
        ref="inputRef"
        v-model="inputVal"
        :placeholder="modelValue.length ? '' : placeholder"
        style="border:none; outline:none; background:transparent; font-size:0.9rem; min-width:120px; flex:1;"
        @keydown.enter.prevent="addTag"
        @keydown.backspace="handleBackspace"
        @keydown.tab.prevent="addTag"
      />
    </div>
    <div style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;">Press Enter or Tab to add</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  placeholder: { type: String, default: 'Type and press Enter...' }
})
const emit = defineEmits(['update:modelValue'])

const inputRef = ref(null)
const inputVal = ref('')

const focusInput = () => inputRef.value?.focus()

const addTag = () => {
  const val = inputVal.value.trim()
  if (val && !props.modelValue.includes(val)) {
    emit('update:modelValue', [...props.modelValue, val])
  }
  inputVal.value = ''
}

const removeTag = (tag) => {
  emit('update:modelValue', props.modelValue.filter(t => t !== tag))
}

const handleBackspace = () => {
  if (!inputVal.value && props.modelValue.length) {
    emit('update:modelValue', props.modelValue.slice(0, -1))
  }
}
</script>
