import { getUtmParams } from './utm'

interface LeadPayload {
  nom: string
  email: string
  telephone: string
  source: 'guide' | 'diagnostic'
  consentementMarketing: boolean
  objectif?: string
  niveau?: string
  difficulte?: string
}

export async function submitLead(payload: LeadPayload): Promise<{ success: boolean }> {
  const endpoint = import.meta.env.PUBLIC_SHEETS_ENDPOINT

  if (!endpoint) {
    throw new Error('Endpoint de soumission non configure')
  }

  const utmParams = getUtmParams()

  const data = {
    ...payload,
    timestamp: new Date().toISOString(),
    utm_source: utmParams.utm_source ?? '',
    utm_medium: utmParams.utm_medium ?? '',
    utm_campaign: utmParams.utm_campaign ?? '',
    utm_content: utmParams.utm_content ?? '',
    fbclid: utmParams.fbclid ?? '',
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    mode: 'no-cors',
  })

  if (response.type === 'opaque') {
    return { success: true }
  }

  if (!response.ok) {
    throw new Error('Erreur lors de la soumission')
  }

  return { success: true }
}

export function fireMetaPixelLead(): void {
  if (typeof window !== 'undefined' && typeof (window as any).fbq === 'function') {
    ;(window as any).fbq('track', 'Lead')
  }
}
