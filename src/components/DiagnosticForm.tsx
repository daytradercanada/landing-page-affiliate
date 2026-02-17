import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect } from 'react'
import {
  diagnosticStep1Schema,
  diagnosticStep2Schema,
  diagnosticStep3Schema,
  leadFormSchema,
  type DiagnosticFormData,
} from '../lib/schemas'
import { submitLead, fireMetaPixelLead } from '../lib/submit-lead'
import { captureUtmParams } from '../lib/utm'

const TOTAL_STEPS = 4

const stepSchemas = [
  diagnosticStep1Schema,
  diagnosticStep2Schema,
  diagnosticStep3Schema,
  leadFormSchema,
]

const objectifOptions = [
  { value: 'revenu-complementaire', label: 'Générer un revenu complémentaire' },
  { value: 'independance-financiere', label: 'Atteindre l\'indépendance financière' },
  { value: 'patrimoine', label: 'Faire fructifier mon patrimoine' },
] as const

const niveauOptions = [
  { value: 'debutant', label: 'Débutant — je découvre' },
  { value: 'intermediaire', label: 'Intermédiaire — j\'ai des bases' },
  { value: 'avance', label: 'Avancé — je veux me perfectionner' },
] as const

const difficulteOptions = [
  { value: 'manque-methode', label: 'Je manque de méthode et de structure' },
  { value: 'gestion-emotions', label: 'J\'ai du mal à gérer mes émotions' },
  { value: 'manque-temps', label: 'Je n\'ai pas assez de temps' },
  { value: 'peur-pertes', label: 'J\'ai peur de perdre de l\'argent' },
] as const

export default function DiagnosticForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')

  useEffect(() => {
    captureUtmParams()
  }, [])

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<DiagnosticFormData>({
    resolver: zodResolver(stepSchemas[currentStep]),
    defaultValues: {
      consentementRGPD: false as unknown as true,
      consentementMarketing: false,
    },
  })

  const goNext = async () => {
    const fields = Object.keys(stepSchemas[currentStep].shape) as (keyof DiagnosticFormData)[]
    const valid = await trigger(fields)
    if (valid) {
      setDirection('forward')
      setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS - 1))
    }
  }

  const goBack = () => {
    setDirection('backward')
    setCurrentStep((s) => Math.max(s - 1, 0))
  }

  const onSubmit = async (data: DiagnosticFormData) => {
    setIsSubmitting(true)
    setSubmitError('')

    const allValues = { ...getValues(), ...data }

    try {
      await submitLead({
        nom: allValues.nom,
        email: allValues.email,
        telephone: allValues.telephone,
        source: 'diagnostic',
        consentementMarketing: allValues.consentementMarketing,
        objectif: allValues.objectif,
        niveau: allValues.niveau,
        difficulte: allValues.difficulte,
      })
      fireMetaPixelLead()
      window.location.href = '/merci?type=diagnostic'
    } catch {
      setSubmitError("Une erreur est survenue. Veuillez réessayer.")
      setIsSubmitting(false)
    }
  }

  const progressPercent = ((currentStep + 1) / TOTAL_STEPS) * 100

  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-xl shadow-gray-200/50 sm:p-8">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm text-gray-600">
          <span className="font-medium">Diagnostic personnalisé</span>
          <span>Étape {currentStep + 1}/{TOTAL_STEPS}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary-600 to-accent-500 transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Step animation wrapper */}
        <div
          key={currentStep}
          className={`animate-fade-in ${
            direction === 'forward' ? 'animate-slide-left' : 'animate-slide-right'
          }`}
        >
          {/* Step 1: Objectif */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">
                Quel est votre principal objectif avec le trading ?
              </h3>
              <div className="space-y-3">
                {objectifOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-4 transition-colors hover:border-primary-300 hover:bg-primary-50/50 has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50"
                  >
                    <input
                      type="radio"
                      value={opt.value}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                      {...register('objectif')}
                    />
                    <span className="text-sm font-medium text-gray-700">{opt.label}</span>
                  </label>
                ))}
              </div>
              {errors.objectif && (
                <p className="text-xs text-red-600">{errors.objectif.message}</p>
              )}
            </div>
          )}

          {/* Step 2: Niveau */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">
                Quel est votre niveau actuel ?
              </h3>
              <div className="space-y-3">
                {niveauOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-4 transition-colors hover:border-primary-300 hover:bg-primary-50/50 has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50"
                  >
                    <input
                      type="radio"
                      value={opt.value}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                      {...register('niveau')}
                    />
                    <span className="text-sm font-medium text-gray-700">{opt.label}</span>
                  </label>
                ))}
              </div>
              {errors.niveau && (
                <p className="text-xs text-red-600">{errors.niveau.message}</p>
              )}
            </div>
          )}

          {/* Step 3: Difficulte */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">
                Quelle est votre principale difficulté aujourd'hui ?
              </h3>
              <div className="space-y-3">
                {difficulteOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-4 transition-colors hover:border-primary-300 hover:bg-primary-50/50 has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50"
                  >
                    <input
                      type="radio"
                      value={opt.value}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                      {...register('difficulte')}
                    />
                    <span className="text-sm font-medium text-gray-700">{opt.label}</span>
                  </label>
                ))}
              </div>
              {errors.difficulte && (
                <p className="text-xs text-red-600">{errors.difficulte.message}</p>
              )}
            </div>
          )}

          {/* Step 4: Lead Capture */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">
                Recevez votre plan personnalisé
              </h3>
              <p className="text-sm text-gray-600">
                Remplissez vos coordonnées pour recevoir un diagnostic adapté à
                votre profil.
              </p>

              <div>
                <label htmlFor="diag-nom" className="mb-1 block text-sm font-medium text-gray-700">
                  Nom complet
                </label>
                <input
                  id="diag-nom"
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

              <div>
                <label htmlFor="diag-email" className="mb-1 block text-sm font-medium text-gray-700">
                  Adresse email
                </label>
                <input
                  id="diag-email"
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

              <div>
                <label htmlFor="diag-tel" className="mb-1 block text-sm font-medium text-gray-700">
                  Téléphone
                </label>
                <input
                  id="diag-tel"
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

              {/* RGPD */}
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
                      politique de confidentialité
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
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="mt-6 flex items-center gap-3">
          {currentStep > 0 && (
            <button
              type="button"
              onClick={goBack}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Retour
            </button>
          )}

          {currentStep < TOTAL_STEPS - 1 ? (
            <button
              type="button"
              onClick={goNext}
              className="ml-auto rounded-xl bg-gradient-to-r from-primary-600 to-accent-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary-500/25 transition-all hover:shadow-xl hover:brightness-110"
            >
              Continuer
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="ml-auto rounded-xl bg-gradient-to-r from-primary-600 to-accent-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary-500/25 transition-all hover:shadow-xl hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Envoi en cours...' : 'Recevoir mon plan personnalisé'}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
