import { z } from 'zod'

// Validate E.164 phone number (composed by PhoneInput component)
function isValidPhone(value: string): boolean {
  return /^\+[1-9]\d{7,14}$/.test(value)
}

export const leadFormSchema = z.object({
  nom: z.string().min(2, 'Veuillez entrer votre nom complet'),
  email: z.string().email('Veuillez entrer une adresse email valide'),
  telephone: z.string()
    .min(1, 'Veuillez entrer un numéro de téléphone')
    .refine(isValidPhone, 'Veuillez entrer un numéro de téléphone valide'),
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
