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

async function submitToSheets(data: Record<string, unknown>): Promise<void> {
  const endpoint = import.meta.env.PUBLIC_SHEETS_ENDPOINT
  if (!endpoint) return

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    mode: 'no-cors',
  })

  if (response.type !== 'opaque' && !response.ok) {
    throw new Error('Erreur lors de la soumission Google Sheets')
  }
}

async function submitToBrevo(payload: LeadPayload): Promise<void> {
  const response = await fetch('/api/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: payload.email,
      nom: payload.nom,
      telephone: payload.telephone,
    }),
  })

  if (!response.ok) {
    throw new Error('Erreur lors de l\'ajout du contact Brevo')
  }
}

async function submitToZapier(payload: LeadPayload): Promise<void> {
  const endpoint = import.meta.env.PUBLIC_ZAPIER_DIAGNOSTIC_WEBHOOK
  if (!endpoint) return

  await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      objectif: payload.objectif ?? '',
      niveau: payload.niveau ?? '',
      difficulte: payload.difficulte ?? '',
      fullname: payload.nom,
      Phone: payload.telephone,
      Email: payload.email,
    }),
  })
}

export async function submitLead(payload: LeadPayload): Promise<{ success: boolean }> {
  const utmParams = getUtmParams()

  const sheetsData = {
    ...payload,
    timestamp: new Date().toISOString(),
    utm_source: utmParams.utm_source ?? '',
    utm_medium: utmParams.utm_medium ?? '',
    utm_campaign: utmParams.utm_campaign ?? '',
    utm_content: utmParams.utm_content ?? '',
    fbclid: utmParams.fbclid ?? '',
  }

  const promises: Promise<void>[] = [submitToSheets(sheetsData)]

  if (payload.source === 'guide') {
    promises.push(submitToBrevo(payload))
  }

  if (payload.source === 'diagnostic') {
    promises.push(submitToZapier(payload))
  }

  const results = await Promise.allSettled(promises)

  if (payload.source === 'guide') {
    const brevoResult = results[1]
    if (brevoResult.status === 'rejected') {
      throw new Error(brevoResult.reason?.message ?? 'Erreur Brevo')
    }
  }

  return { success: true }
}

export function fireMetaPixelLead(): void {
  if (typeof window !== 'undefined' && typeof (window as any).fbq === 'function') {
    ;(window as any).fbq('track', 'Lead')
  }
}
