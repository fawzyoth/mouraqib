/**
 * Toggle an item in a reactive array (mutating).
 * Adds the item if absent, removes it if present.
 */
export function toggleInArray<T>(arr: T[], item: T): void {
  const index = arr.indexOf(item)
  if (index === -1) {
    arr.push(item)
  } else {
    arr.splice(index, 1)
  }
}
