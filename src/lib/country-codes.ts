export interface CountryCode {
  code: string
  name: string
  dial: string
  flag: string
  group: 'francophone' | 'international'
}

export const COUNTRY_CODES: CountryCode[] = [
  // Pays francophones
  { code: 'FR', name: 'France', dial: '33', flag: '🇫🇷', group: 'francophone' },
  { code: 'BE', name: 'Belgique', dial: '32', flag: '🇧🇪', group: 'francophone' },
  { code: 'CH', name: 'Suisse', dial: '41', flag: '🇨🇭', group: 'francophone' },
  { code: 'CA', name: 'Canada', dial: '1', flag: '🇨🇦', group: 'francophone' },
  { code: 'LU', name: 'Luxembourg', dial: '352', flag: '🇱🇺', group: 'francophone' },
  { code: 'MC', name: 'Monaco', dial: '377', flag: '🇲🇨', group: 'francophone' },
  { code: 'MA', name: 'Maroc', dial: '212', flag: '🇲🇦', group: 'francophone' },
  { code: 'TN', name: 'Tunisie', dial: '216', flag: '🇹🇳', group: 'francophone' },
  { code: 'DZ', name: 'Algérie', dial: '213', flag: '🇩🇿', group: 'francophone' },
  { code: 'SN', name: 'Sénégal', dial: '221', flag: '🇸🇳', group: 'francophone' },
  { code: 'CI', name: "Côte d'Ivoire", dial: '225', flag: '🇨🇮', group: 'francophone' },
  { code: 'CM', name: 'Cameroun', dial: '237', flag: '🇨🇲', group: 'francophone' },
  { code: 'CD', name: 'RD Congo', dial: '243', flag: '🇨🇩', group: 'francophone' },
  { code: 'MG', name: 'Madagascar', dial: '261', flag: '🇲🇬', group: 'francophone' },
  // International
  { code: 'US', name: 'États-Unis', dial: '1', flag: '🇺🇸', group: 'international' },
  { code: 'GB', name: 'Royaume-Uni', dial: '44', flag: '🇬🇧', group: 'international' },
  { code: 'DE', name: 'Allemagne', dial: '49', flag: '🇩🇪', group: 'international' },
  { code: 'ES', name: 'Espagne', dial: '34', flag: '🇪🇸', group: 'international' },
  { code: 'IT', name: 'Italie', dial: '39', flag: '🇮🇹', group: 'international' },
  { code: 'PT', name: 'Portugal', dial: '351', flag: '🇵🇹', group: 'international' },
  { code: 'NL', name: 'Pays-Bas', dial: '31', flag: '🇳🇱', group: 'international' },
  { code: 'BR', name: 'Brésil', dial: '55', flag: '🇧🇷', group: 'international' },
  { code: 'JP', name: 'Japon', dial: '81', flag: '🇯🇵', group: 'international' },
  { code: 'AU', name: 'Australie', dial: '61', flag: '🇦🇺', group: 'international' },
]

export const DEFAULT_COUNTRY = COUNTRY_CODES[0] // France
