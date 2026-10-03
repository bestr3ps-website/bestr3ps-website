export type CurrencyCode = 'USD' | 'GBP' | 'EUR' | 'CAD' | 'AUD' | 'CNY';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateFromUSD: number; // 1 USD = X Currency
  flag: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    rateFromUSD: 1.0,
    flag: '🇺🇸'
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    rateFromUSD: 0.77,
    flag: '🇬🇧'
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    rateFromUSD: 0.92,
    flag: '🇪🇺'
  },
  CAD: {
    code: 'CAD',
    symbol: 'CA$',
    name: 'Canadian Dollar',
    rateFromUSD: 1.36,
    flag: '🇨🇦'
  },
  AUD: {
    code: 'AUD',
    symbol: 'AU$',
    name: 'Australian Dollar',
    rateFromUSD: 1.52,
    flag: '🇦🇺'
  },
  CNY: {
    code: 'CNY',
    symbol: '¥',
    name: 'Chinese Yuan',
    rateFromUSD: 7.24,
    flag: '🇨🇳'
  }
};

export type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'it' | 'zh';

export interface LanguageConfig {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  defaultCurrency: CurrencyCode;
}

export const LANGUAGES: Record<LanguageCode, LanguageConfig> = {
  en: {
    code: 'en',
    name: 'English (US/UK)',
    nativeName: 'English',
    flag: '🇺🇸',
    defaultCurrency: 'USD'
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    defaultCurrency: 'EUR'
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    defaultCurrency: 'EUR'
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    defaultCurrency: 'EUR'
  },
  it: {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    defaultCurrency: 'EUR'
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    defaultCurrency: 'CNY'
  }
};

/**
 * Format price according to target currency
 */
export function formatPrice(rawPrice: string | number, currencyCode: CurrencyCode = 'USD'): string {
  if (!rawPrice) return '';
  const str = rawPrice.toString();
  const numMatch = str.match(/([0-9]+(?:\.[0-9]+)?)/);
  if (!numMatch) return str;

  const usdValue = parseFloat(numMatch[1]);
  if (isNaN(usdValue)) return str;

  const curr = CURRENCIES[currencyCode] || CURRENCIES.USD;
  const converted = usdValue * curr.rateFromUSD;

  if (curr.code === 'CNY') {
    return `¥${Math.round(converted)}`;
  }
  if (curr.code === 'GBP') {
    return `£${converted.toFixed(2)}`;
  }
  if (curr.code === 'EUR') {
    return `€${converted.toFixed(2)}`;
  }
  return `${curr.symbol}${converted.toFixed(2)}`;
}
