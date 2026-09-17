export interface CurrencyInfo {
  code: string;
  name: string;
  nameEn: string;
  symbol: string;
  flag: string;
  decimals: number;
  isMain?: boolean;
}

export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
  {
    code: 'SYP',
    name: 'ليرة سورية (العملة الأساسية)',
    nameEn: 'Syrian Pound',
    symbol: 'ل.س',
    flag: '🇸🇾',
    decimals: 0,
    isMain: true
  },
  {
    code: 'USD',
    name: 'دولار أمريكي',
    nameEn: 'US Dollar',
    symbol: '$',
    flag: '🇺🇸',
    decimals: 2
  },
  {
    code: 'EUR',
    name: 'يورو',
    nameEn: 'Euro',
    symbol: '€',
    flag: '🇪🇺',
    decimals: 2
  },
  {
    code: 'TRY',
    name: 'ليرة تركية',
    nameEn: 'Turkish Lira',
    symbol: '₺',
    flag: '🇹🇷',
    decimals: 2
  },
  {
    code: 'SAR',
    name: 'ريال سعودي',
    nameEn: 'Saudi Riyal',
    symbol: 'ر.س',
    flag: '🇸🇦',
    decimals: 2
  },
  {
    code: 'AED',
    name: 'درهم إماراتي',
    nameEn: 'UAE Dirham',
    symbol: 'د.إ',
    flag: '🇦🇪',
    decimals: 2
  },
  {
    code: 'EGP',
    name: 'جنيه مصري',
    nameEn: 'Egyptian Pound',
    symbol: 'ج.م',
    flag: '🇪🇬',
    decimals: 2
  },
  {
    code: 'JOD',
    name: 'دينار أردني',
    nameEn: 'Jordanian Dinar',
    symbol: 'د.أ',
    flag: '🇯🇴',
    decimals: 3
  },
  {
    code: 'KWD',
    name: 'دينار كويتي',
    nameEn: 'Kuwaiti Dinar',
    symbol: 'د.ك',
    flag: '🇰🇼',
    decimals: 3
  },
  {
    code: 'IQD',
    name: 'دينار عراقي',
    nameEn: 'Iraqi Dinar',
    symbol: 'د.ع',
    flag: '🇮🇶',
    decimals: 0
  },
  {
    code: 'LBP',
    name: 'ليرة لبنانية',
    nameEn: 'Lebanese Pound',
    symbol: 'ل.ل',
    flag: '🇱🇧',
    decimals: 0
  },
  {
    code: 'QAR',
    name: 'ريال قطري',
    nameEn: 'Qatari Riyal',
    symbol: 'ر.ق',
    flag: '🇶🇦',
    decimals: 2
  }
];

export const DEFAULT_CURRENCY_CODE = 'SYP';

export interface AppCurrencySettings {
  primaryCurrency: string; // Default: 'SYP'
  secondaryCurrency?: string; // e.g. 'USD'
  exchangeRate?: number; // 1 secondary = exchangeRate primary (e.g. 1 USD = 15,000 SYP)
  showDualCurrency?: boolean; // Show secondary currency in subtitles
}

export const defaultCurrencySettings: AppCurrencySettings = {
  primaryCurrency: 'SYP',
  secondaryCurrency: 'USD',
  exchangeRate: 15000,
  showDualCurrency: false
};

export function getCurrencyInfo(code: string = DEFAULT_CURRENCY_CODE): CurrencyInfo {
  const found = SUPPORTED_CURRENCIES.find(c => c.code.toUpperCase() === code.toUpperCase());
  if (found) return found;
  return SUPPORTED_CURRENCIES[0]; // fallback to SYP
}

/**
 * Formats a monetary amount into a clean, locale-aware string with proper currency symbol.
 * Example: 25000 SYP => "25,000 ل.س"
 * Example: 25.50 USD => "$25.50"
 */
export function formatMoney(
  amount: number | undefined | null,
  currencyCode: string = DEFAULT_CURRENCY_CODE,
  options?: {
    hideSymbol?: boolean;
    showCodeOnly?: boolean;
    compact?: boolean;
  }
): string {
  const val = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  const info = getCurrencyInfo(currencyCode);

  const isWhole = val % 1 === 0;
  const decimals = info.decimals === 0 ? (isWhole ? 0 : 2) : info.decimals;

  const numStr = val.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });

  if (options?.hideSymbol) {
    return numStr;
  }

  if (options?.showCodeOnly) {
    return `${numStr} ${info.code}`;
  }

  // Pre-fixed currencies
  if (info.code === 'USD') {
    return `$${numStr}`;
  }
  if (info.code === 'EUR') {
    return `€${numStr}`;
  }
  if (info.code === 'TRY') {
    return `₺${numStr}`;
  }

  // Post-fixed Arabic symbols (e.g. 25,000 ل.س)
  return `${numStr} ${info.symbol}`;
}

/**
 * Convert an amount from primary currency to secondary currency based on exchange rate
 */
export function convertToSecondary(
  primaryAmount: number,
  exchangeRate: number = 15000
): number {
  if (!exchangeRate || exchangeRate <= 0) return 0;
  return primaryAmount / exchangeRate;
}

/**
 * Open Gmail compose directly in the user's browser with pre-filled recipient, subject, and body (including JSON)
 */
export function openDirectGmailCompose(
  recipientEmail: string,
  subject: string,
  body: string
): void {
  const targetEmail = (recipientEmail || '').trim();
  const mailSubject = subject || 'نسخة احتياطية - بيت المحاسبة';
  
  // Standard web Gmail compose link
  let gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(body)}`;
  if (targetEmail) {
    gmailUrl += `&to=${encodeURIComponent(targetEmail)}`;
  }
  
  // Try opening popup/tab
  const win = window.open(gmailUrl, '_blank', 'noopener,noreferrer');
  
  // If popup was blocked, fallback to standard mailto link
  if (!win || win.closed || typeof win.closed === 'undefined') {
    const mailtoUrl = targetEmail
      ? `mailto:${encodeURIComponent(targetEmail)}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(body)}`
      : `mailto:?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  }
}
