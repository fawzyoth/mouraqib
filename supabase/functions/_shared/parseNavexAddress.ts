import zones from './zones.ts'

export interface ParsedNavexAddress {
  street: string
  locality: string | null
  delegation: string | null
  governorate: string | null
  postalCode: string | null
}

type ZonesData = typeof zones
type Governorate = keyof ZonesData

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['']/g, "'")
    .trim()
}

const govMap = new Map<string, Governorate>()
const delMap = new Map<string, { governorate: Governorate; delegation: string }>()
const locMap = new Map<string, { governorate: Governorate; delegation: string; locality: string; postalCode: string }>()

for (const gov of Object.keys(zones) as Governorate[]) {
  govMap.set(norm(gov), gov)
  const delegations = zones[gov]
  for (const del of Object.keys(delegations)) {
    delMap.set(norm(del), { governorate: gov, delegation: del })
    const localities = delegations[del as keyof typeof delegations] as Record<string, { codePostal: string }>
    for (const [loc, data] of Object.entries(localities)) {
      locMap.set(norm(loc), { governorate: gov, delegation: del, locality: loc, postalCode: data.codePostal })
    }
  }
}

function matchSuffix<T>(tokens: string[], map: Map<string, T>, maxWords = 4): { value: T; consumed: number } | null {
  for (let n = Math.min(maxWords, tokens.length); n >= 1; n--) {
    const key = norm(tokens.slice(tokens.length - n).join(' '))
    if (map.has(key)) return { value: map.get(key)!, consumed: n }
  }
  return null
}

export function parseNavexAddress(raw: string): ParsedNavexAddress {
  const tokens = raw.trim().split(/\s+/)
  let remaining = [...tokens]

  let governorate: string | null = null
  let delegation: string | null = null
  let locality: string | null = null
  let postalCode: string | null = null

  const govHit = matchSuffix(remaining, govMap)
  if (govHit) {
    governorate = govHit.value
    remaining = remaining.slice(0, remaining.length - govHit.consumed)

    const gov = govHit.value
    const govDels = zones[gov]
    const scopedDelMap = new Map<string, string>()
    for (const del of Object.keys(govDels)) scopedDelMap.set(norm(del), del)

    const delHit = matchSuffix(remaining, scopedDelMap)
    if (delHit) {
      delegation = delHit.value
      remaining = remaining.slice(0, remaining.length - delHit.consumed)

      const delLocs = govDels[delegation as keyof typeof govDels] as Record<string, { codePostal: string }>
      const scopedLocMap = new Map<string, { locality: string; postalCode: string }>()
      for (const [loc, data] of Object.entries(delLocs)) {
        scopedLocMap.set(norm(loc), { locality: loc, postalCode: data.codePostal })
      }

      const locHit = matchSuffix(remaining, scopedLocMap, 5)
      if (locHit) {
        locality = locHit.value.locality
        postalCode = locHit.value.postalCode
        remaining = remaining.slice(0, remaining.length - locHit.consumed)
      }
    }
  }

  return {
    street: remaining.join(' '),
    locality,
    delegation,
    governorate,
    postalCode,
  }
}
