import type { APIRoute } from 'astro'

export const prerender = false

export const POST: APIRoute = async ({ request }) => {
  const apiKey = import.meta.env.BREVO_API_KEY

  if (!apiKey) {
    return new Response(
      JSON.stringify({ success: false, error: 'Brevo API key not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const body = await request.json()
  const { email, nom, telephone, source, consentementMarketing } = body

  if (!email || !nom || !telephone) {
    return new Response(
      JSON.stringify({ success: false, error: 'Champs requis manquants' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const [prenom, ...rest] = nom.trim().split(' ')
  const nomDeFamille = rest.join(' ')

  // Normalize phone to E.164 format for Brevo SMS attribute
  const cleaned = telephone.replace(/[\s.\-()\u00A0]/g, '')
  const normalizedPhone = cleaned.startsWith('00')
    ? `+${cleaned.slice(2)}`
    : cleaned.startsWith('0')
      ? `+33${cleaned.slice(1)}`
      : cleaned.startsWith('+')
        ? cleaned
        : `+${cleaned}`

  // E.164: + followed by 8–15 digits (country code + subscriber number)
  const isValidE164 = /^\+[1-9]\d{7,14}$/.test(normalizedPhone)

  const listIds: number[] = []
  if (source === 'guide') {
    listIds.push(9)
  }
  if (consentementMarketing) {
    listIds.push(3)
  }

  const attributes: Record<string, string> = {
    PRENOM: prenom,
    NOM: nomDeFamille || prenom,
  }
  if (isValidE164) {
    attributes.SMS = normalizedPhone
  }

  const brevoPayload = {
    email,
    attributes,
    listIds,
    updateEnabled: true,
  }

  const response = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(brevoPayload),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Brevo API error:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Erreur lors de l\'ajout du contact' }),
      { status: response.status, headers: { 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
}
