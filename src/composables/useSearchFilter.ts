import { ref, computed, type Ref } from 'vue'

/**
 * Provides a search query ref and a computed filtered list.
 * Filters items by matching the query against specified string fields.
 */
export function useSearchFilter<T>(
  items: Ref<T[]>,
  searchFields: (keyof T)[],
  additionalFilter?: Ref<((item: T) => boolean) | null>
) {
  const query = ref('')

  const filtered = computed(() => {
    let result = items.value

    if (query.value) {
      const q = query.value.toLowerCase()
      result = result.filter(item =>
        searchFields.some(field => {
          const val = item[field]
          return typeof val === 'string' && val.toLowerCase().includes(q)
        })
      )
    }

    if (additionalFilter?.value) {
      result = result.filter(additionalFilter.value)
    }

    return result
  })

  return { query, filtered }
}
