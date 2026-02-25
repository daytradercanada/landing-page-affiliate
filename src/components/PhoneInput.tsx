import { useState, useCallback } from 'react'
import { COUNTRY_CODES, DEFAULT_COUNTRY } from '../lib/country-codes'

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  hasError: boolean
  id: string
}

const francophone = COUNTRY_CODES.filter((c) => c.group === 'francophone')
const international = COUNTRY_CODES.filter((c) => c.group === 'international')

export default function PhoneInput({ value, onChange, onBlur, hasError, id }: PhoneInputProps) {
  const [selectedCode, setSelectedCode] = useState(DEFAULT_COUNTRY.code)
  const [localNumber, setLocalNumber] = useState(() => {
    // If value already has a dial code, extract local part
    if (value) {
      const country = COUNTRY_CODES.find((c) => value.startsWith('+' + c.dial))
      if (country) {
        return value.slice(1 + country.dial.length)
      }
    }
    return ''
  })

  const compose = useCallback(
    (countryCode: string, local: string) => {
      const digits = local.replace(/\D/g, '')
      if (!digits) {
        onChange('')
        return
      }
      const country = COUNTRY_CODES.find((c) => c.code === countryCode)
      if (country) {
        onChange('+' + country.dial + digits)
      }
    },
    [onChange]
  )

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value
    setSelectedCode(code)
    compose(code, localNumber)
  }

  const handleLocalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setLocalNumber(val)
    compose(selectedCode, val)
  }

  const borderClass = hasError
    ? 'border-red-400 bg-red-50'
    : 'border-gray-300 bg-white'

  const selectedCountry = COUNTRY_CODES.find((c) => c.code === selectedCode)

  return (
    <div className="flex gap-2">
      <select
        value={selectedCode}
        onChange={handleCountryChange}
        onBlur={onBlur}
        className={`w-[140px] shrink-0 rounded-lg border px-2 py-2.5 text-sm outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 ${borderClass}`}
        aria-label="Indicatif pays"
      >
        <optgroup label="Pays francophones">
          {francophone.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.name} (+{c.dial})
            </option>
          ))}
        </optgroup>
        <optgroup label="International">
          {international.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.name} (+{c.dial})
            </option>
          ))}
        </optgroup>
      </select>
      <input
        id={id}
        type="tel"
        inputMode="numeric"
        placeholder={selectedCountry?.code === 'FR' ? '6 12 34 56 78' : 'Numéro local'}
        value={localNumber}
        onChange={handleLocalChange}
        onBlur={onBlur}
        className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 ${borderClass}`}
      />
    </div>
  )
}
