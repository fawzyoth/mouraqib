const FB_PIXEL_ID = '1441842677620397'

declare global {
  interface Window { fbq: (...args: any[]) => void }
}

let loaded = false

export function loadFacebookPixel() {
  if (loaded || typeof window === 'undefined') return
  loaded = true

  const f = window as any
  if (f.fbq) return
  const n = f.fbq = function (...args: any[]) {
    n.callMethod ? n.callMethod.apply(n, args) : n.queue.push(args)
  }
  if (!f._fbq) f._fbq = n
  n.push = n
  n.loaded = true
  n.version = '2.0'
  n.queue = [] as any[]

  const t = document.createElement('script')
  t.async = true
  t.src = 'https://connect.facebook.net/en_US/fbevents.js'
  const s = document.getElementsByTagName('script')[0]
  s.parentNode!.insertBefore(t, s)

  f.fbq('init', FB_PIXEL_ID)
  f.fbq('track', 'PageView')
}
