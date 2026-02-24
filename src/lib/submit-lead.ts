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

async function submitToDiagnostic(payload: LeadPayload): Promise<void> {
  const response = await fetch('/api/diagnostic', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      objectif: payload.objectif,
      niveau: payload.niveau,
      difficulte: payload.difficulte,
      nom: payload.nom,
      email: payload.email,
      telephone: payload.telephone,
    }),
  })

  if (!response.ok) {
    throw new Error('Erreur lors de l\'envoi du diagnostic')
  }
}

export async function submitLead(payload: LeadPayload): Promise<{ success: boolean }> {
  const needsBrevo =
    payload.source === 'guide' || payload.consentementMarketing

  const promises: Promise<void>[] = []

  if (needsBrevo) {
    promises.push(submitToBrevo(payload))
  }

  if (payload.source === 'diagnostic') {
    promises.push(submitToDiagnostic(payload))
  }

  const results = await Promise.allSettled(promises)

  const firstFailure = results.find((r) => r.status === 'rejected')
  if (firstFailure && firstFailure.status === 'rejected') {
    throw new Error(firstFailure.reason?.message ?? 'Erreur lors de l\'envoi')
  }

  return { success: true }
}

export function fireMetaPixelLead(): void {
  if (typeof window !== 'undefined' && typeof (window as any).fbq === 'function') {
    ;(window as any).fbq('track', 'Lead')
  }
}
