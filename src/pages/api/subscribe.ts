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

  // Phone is already E.164 from PhoneInput component; safety fallback
  const normalizedPhone = telephone.startsWith('+') ? telephone : '+' + telephone

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

  const brevoHeaders = {
    'api-key': apiKey,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }

  let response = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: brevoHeaders,
    body: JSON.stringify(brevoPayload),
  })

  // If SMS is already associated with another contact, retry without SMS
  if (!response.ok && attributes.SMS) {
    try {
      const errorData = await response.json()
      if (errorData.code === 'duplicate_parameter') {
        const { SMS: _, ...attributesWithoutSms } = attributes
        const retryPayload = { ...brevoPayload, attributes: attributesWithoutSms }
        response = await fetch('https://api.brevo.com/v3/contacts', {
          method: 'POST',
          headers: brevoHeaders,
          body: JSON.stringify(retryPayload),
        })
      }
    } catch {
      // If JSON parse fails, fall through to the error handling below
    }
  }

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
