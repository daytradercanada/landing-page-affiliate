import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect } from 'react'
import { leadFormSchema, type LeadFormData } from '../lib/schemas'
import { submitLead, fireMetaPixelLead } from '../lib/submit-lead'
import { captureUtmParams } from '../lib/utm'

export default function LeadForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    captureUtmParams()
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      consentementRGPD: false as unknown as true,
      consentementMarketing: false,
    },
  })

  const onSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true)
    setSubmitError('')

    try {
      await submitLead({
        nom: data.nom,
        email: data.email,
        telephone: data.telephone,
        source: 'guide',
        consentementMarketing: data.consentementMarketing,
      })
      fireMetaPixelLead()
      window.location.href = '/merci?type=guide'
    } catch {
      setSubmitError("Une erreur est survenue. Veuillez reessayer.")
      setIsSubmitting(false)
    }
  }

  return (
    <div
      id="formulaire"
      className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl shadow-gray-200/50 sm:p-8"
    >
      <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary-500" />
        OFFRE EXCLUSIVE
      </div>

      <h2 className="text-xl font-bold text-gray-900">
        Pret a Investir dans la Prochaine Licorne ?
      </h2>
      <p className="mt-2 text-sm text-gray-600">
        Remplissez le formulaire maintenant pour recevoir des alertes sur les
        nouvelles levees de fonds en cryptomonnaie et beneficier de bonus exclusifs.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        {/* Nom */}
        <div>
          <label htmlFor="nom" className="mb-1 block text-sm font-medium text-gray-700">
            Nom complet
          </label>
          <input
            id="nom"
            type="text"
            placeholder="Jean Dupont"
            className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 ${
              errors.nom ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
            }`}
            {...register('nom')}
          />
          {errors.nom && (
            <p className="mt-1 text-xs text-red-600">{errors.nom.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
            Adresse email
          </label>
          <input
            id="email"
            type="email"
            placeholder="jean@exemple.fr"
            className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 ${
              errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
            }`}
            {...register('email')}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Telephone */}
        <div>
          <label htmlFor="telephone" className="mb-1 block text-sm font-medium text-gray-700">
            Telephone
          </label>
          <input
            id="telephone"
            type="tel"
            placeholder="06 12 34 56 78"
            className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 ${
              errors.telephone ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
            }`}
            {...register('telephone')}
          />
          {errors.telephone && (
            <p className="mt-1 text-xs text-red-600">{errors.telephone.message}</p>
          )}
        </div>

        {/* RGPD Consent */}
        <div className="space-y-3 pt-2">
          <label className="flex items-start gap-2.5 text-xs text-gray-600">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              {...register('consentementRGPD')}
            />
            <span>
              J'accepte la{' '}
              <a href="#politique-confidentialite" className="text-primary-600 underline">
                politique de confidentialite
              </a>{' '}
              et les{' '}
              <a href="#politique-confidentialite" className="text-primary-600 underline">
                CGU
              </a>{' '}
              *
            </span>
          </label>
          {errors.consentementRGPD && (
            <p className="text-xs text-red-600">{errors.consentementRGPD.message}</p>
          )}

          <label className="flex items-start gap-2.5 text-xs text-gray-600">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              {...register('consentementMarketing')}
            />
            <span>
              J'accepte de recevoir des communications marketing (optionnel)
            </span>
          </label>
        </div>

        {submitError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {submitError}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-gradient-to-r from-primary-600 to-accent-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary-500/25 transition-all hover:shadow-xl hover:shadow-primary-500/30 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Envoi en cours...' : 'Je recois mon guide maintenant'}
        </button>
      </form>

      {/* Micro-assurances */}
      <div className="mt-4 flex flex-col gap-1.5 text-center text-xs text-gray-500">
        <div className="flex items-center justify-center gap-1.5">
          <svg className="h-3.5 w-3.5 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
          Vos donnees sont protegees et confidentielles
        </div>
        <span>Desinscription possible a tout moment</span>
        <span>Pas de spam, promis.</span>
      </div>
    </div>
  )
}
