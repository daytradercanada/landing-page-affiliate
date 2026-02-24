import { z } from 'zod'

// Validate phone by normalizing to E.164 and checking digit count (8-15 digits)
function isValidPhone(value: string): boolean {
  const cleaned = value.replace(/[\s.\-()\u00A0]/g, '')
  let digits: string
  if (cleaned.startsWith('+')) {
    digits = cleaned.slice(1)
  } else if (cleaned.startsWith('00')) {
    digits = cleaned.slice(2)
  } else if (cleaned.startsWith('0')) {
    digits = '33' + cleaned.slice(1)
  } else {
    return false
  }
  return /^[1-9]\d{7,14}$/.test(digits)
}

export const leadFormSchema = z.object({
  nom: z.string().min(2, 'Veuillez entrer votre nom complet'),
  email: z.string().email('Veuillez entrer une adresse email valide'),
  telephone: z.string()
    .min(1, 'Veuillez entrer un numéro de téléphone')
    .refine(isValidPhone, 'Format accepté : +1 437 216 1523, +33 6 12 34 56 78 ou 06 12 34 56 78'),
  consentementRGPD: z.literal(true, {
    errorMap: () => ({ message: 'Vous devez accepter la politique de confidentialité' }),
  }),
  consentementMarketing: z.boolean().default(false),
})

export type LeadFormData = z.infer<typeof leadFormSchema>

export const diagnosticStep1Schema = z.object({
  objectif: z.enum(['revenu-complementaire', 'independance-financiere', 'patrimoine'], {
    errorMap: () => ({ message: 'Veuillez sélectionner un objectif' }),
  }),
})

export const diagnosticStep2Schema = z.object({
  niveau: z.enum(['debutant', 'intermediaire', 'avance'], {
    errorMap: () => ({ message: 'Veuillez sélectionner votre niveau' }),
  }),
})

export const diagnosticStep3Schema = z.object({
  difficulte: z.enum(['manque-methode', 'gestion-emotions', 'manque-temps', 'peur-pertes'], {
    errorMap: () => ({ message: 'Veuillez sélectionner votre difficulté' }),
  }),
})

export const diagnosticFullSchema = diagnosticStep1Schema
  .merge(diagnosticStep2Schema)
  .merge(diagnosticStep3Schema)
  .merge(leadFormSchema)

export type DiagnosticFormData = z.infer<typeof diagnosticFullSchema>
