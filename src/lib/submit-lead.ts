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

async function submitToBrevo(payload: LeadPayload): Promise<void> {
  const response = await fetch('/api/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: payload.email,
      nom: payload.nom,
      telephone: payload.telephone,
      source: payload.source,
      consentementMarketing: payload.consentementMarketing,
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
  const needsBrevo =
    payload.source === 'guide' || payload.consentementMarketing

  const promises: Promise<void>[] = []

  if (needsBrevo) {
    promises.push(submitToBrevo(payload))
  }

  if (payload.source === 'diagnostic') {
    promises.push(submitToZapier(payload))
  }

  const results = await Promise.allSettled(promises)

  if (needsBrevo) {
    const brevoResult = results[0]
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
