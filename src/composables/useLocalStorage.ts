import { ref, watch, type Ref } from 'vue'

/**
 * A ref that persists its value to localStorage.
 * Reads the initial value from localStorage, falls back to the default.
 */
export function useLocalStorageRef<T extends string>(key: string, defaultValue: T): Ref<T> {
  const stored = localStorage.getItem(key)
  const value = ref((stored as T) || defaultValue) as Ref<T>

  watch(value, (newVal) => {
    localStorage.setItem(key, newVal)
  })

  return value
}
