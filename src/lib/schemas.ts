import { z } from 'zod'

const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/

export const leadFormSchema = z.object({
  nom: z.string().min(2, 'Veuillez entrer votre nom complet'),
  email: z.string().email('Veuillez entrer une adresse email valide'),
  telephone: z.string().regex(phoneRegex, 'Veuillez entrer un numero de telephone francais valide'),
  consentementRGPD: z.literal(true, {
    errorMap: () => ({ message: 'Vous devez accepter la politique de confidentialite' }),
  }),
  consentementMarketing: z.boolean().default(false),
})

export type LeadFormData = z.infer<typeof leadFormSchema>

export const diagnosticStep1Schema = z.object({
  objectif: z.enum(['revenu-complementaire', 'independance-financiere', 'patrimoine'], {
    errorMap: () => ({ message: 'Veuillez selectionner un objectif' }),
  }),
})

export const diagnosticStep2Schema = z.object({
  niveau: z.enum(['debutant', 'intermediaire', 'avance'], {
    errorMap: () => ({ message: 'Veuillez selectionner votre niveau' }),
  }),
})

export const diagnosticStep3Schema = z.object({
  difficulte: z.enum(['manque-methode', 'gestion-emotions', 'manque-temps', 'peur-pertes'], {
    errorMap: () => ({ message: 'Veuillez selectionner votre difficulte' }),
  }),
})

export const diagnosticFullSchema = diagnosticStep1Schema
  .merge(diagnosticStep2Schema)
  .merge(diagnosticStep3Schema)
  .merge(leadFormSchema)

export type DiagnosticFormData = z.infer<typeof diagnosticFullSchema>
