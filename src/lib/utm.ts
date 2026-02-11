const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'fbclid'] as const

type UtmParams = Partial<Record<(typeof UTM_KEYS)[number], string>>

export function captureUtmParams(): void {
  if (typeof window === 'undefined') return

  const params = new URLSearchParams(window.location.search)
  const utmData: UtmParams = {}

  for (const key of UTM_KEYS) {
    const value = params.get(key)
    if (value) {
      utmData[key] = value
    }
  }

  if (Object.keys(utmData).length > 0) {
    sessionStorage.setItem('utm_params', JSON.stringify(utmData))
  }
}

export function getUtmParams(): UtmParams {
  if (typeof window === 'undefined') return {}

  try {
    const stored = sessionStorage.getItem('utm_params')
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}
