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

  const listIds: number[] = []
  if (source === 'guide') {
    listIds.push(9)
  }
  if (consentementMarketing) {
    listIds.push(3)
  }

  const brevoPayload = {
    email,
    attributes: {
      PRENOM: prenom,
      NOM: nomDeFamille || prenom,
      SMS: telephone,
    },
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
