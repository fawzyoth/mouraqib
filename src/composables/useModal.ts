import { ref } from 'vue'

export function useModal(resetFn?: () => void) {
  const isOpen = ref(false)

  function open() {
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
    resetFn?.()
  }

  return { isOpen, open, close }
}
