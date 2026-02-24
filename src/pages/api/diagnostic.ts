import type { APIRoute } from 'astro'

export const prerender = false

const objectifLabels: Record<string, string> = {
  'revenu-complementaire': 'Générer un revenu complémentaire',
  'independance-financiere': 'Atteindre l\'indépendance financière',
  'patrimoine': 'Faire fructifier mon patrimoine',
}

const niveauLabels: Record<string, string> = {
  'debutant': 'Débutant — je découvre',
  'intermediaire': 'Intermédiaire — j\'ai des bases',
  'avance': 'Avancé — je veux me perfectionner',
}

const difficulteLabels: Record<string, string> = {
  'manque-methode': 'Je manque de méthode et de structure',
  'gestion-emotions': 'J\'ai du mal à gérer mes émotions',
  'manque-temps': 'Je n\'ai pas assez de temps',
  'peur-pertes': 'J\'ai peur de perdre de l\'argent',
}

export const POST: APIRoute = async ({ request }) => {
  const webhookUrl = import.meta.env.ZAPIER_DIAGNOSTIC_WEBHOOK

  if (!webhookUrl) {
    console.error('ZAPIER_DIAGNOSTIC_WEBHOOK not configured')
    return new Response(
      JSON.stringify({ success: false, error: 'Webhook not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const body = await request.json()
  const { objectif, niveau, difficulte, nom, email, telephone } = body

  if (!nom || !email || !telephone) {
    return new Response(
      JSON.stringify({ success: false, error: 'Champs requis manquants' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const zapierPayload = {
    objectif: objectifLabels[objectif] ?? objectif ?? '',
    niveau: niveauLabels[niveau] ?? niveau ?? '',
    difficulte: difficulteLabels[difficulte] ?? difficulte ?? '',
    fullname: nom,
    Email: email,
    Phone: telephone,
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(zapierPayload),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Zapier webhook error:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Erreur webhook' }),
      { status: response.status, headers: { 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
}
