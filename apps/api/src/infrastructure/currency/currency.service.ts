import { Injectable, Logger } from '@nestjs/common'
import { RedisService } from '../cache/redis.service'

interface ExchangeRates {
  base: string
  rates: Record<string, number>
  timestamp: number
}

@Injectable()
export class CurrencyService {
  private readonly logger = new Logger(CurrencyService.name)
  private readonly CACHE_KEY = 'exchange_rates'
  private readonly CACHE_TTL = 3600 // 1 hour

  constructor(private readonly redisService: RedisService) {}

  /**
   * Get exchange rate from base currency to target currency
   */
  async getExchangeRate(from: string, to: string): Promise<number> {
    if (from === to) return 1

    const rates = await this.getExchangeRates(from)
    const rate = rates.rates[to]

    if (!rate) {
      throw new Error(`Exchange rate not found for ${from} to ${to}`)
    }

    return rate
  }

  /**
   * Convert amount from one currency to another
   */
  async convertCurrency(
    amount: number,
    from: string,
    to: string,
  ): Promise<{ convertedAmount: number; rate: number }> {
    const rate = await this.getExchangeRate(from, to)
    const convertedAmount = amount * rate

    return {
      convertedAmount: Math.round(convertedAmount * 100) / 100,
      rate,
    }
  }

  /**
   * Get all exchange rates for a base currency
   */
  private async getExchangeRates(base: string): Promise<ExchangeRates> {
    // Try to get from cache first
    const cached = await this.redisService.get(`${this.CACHE_KEY}:${base}`)
    if (cached) {
      return JSON.parse(cached)
    }

    // Fetch from API
    const rates = await this.fetchExchangeRates(base)

    // Cache the result
    await this.redisService.set(
      `${this.CACHE_KEY}:${base}`,
      JSON.stringify(rates),
      this.CACHE_TTL,
    )

    return rates
  }

  /**
   * Fetch exchange rates from external API
   */
  private async fetchExchangeRates(base: string): Promise<ExchangeRates> {
    try {
      // Using ExchangeRate-API (free, no API key required)
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/${base}`,
      )

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`)
      }

      const data = await response.json()

      return {
        base: data.base,
        rates: data.rates,
        timestamp: Date.now(),
      }
    } catch (error) {
      this.logger.error(`Failed to fetch exchange rates: ${error.message}`)

      // Fallback to hardcoded rates if API fails
      return this.getFallbackRates(base)
    }
  }

  /**
   * Fallback rates in case API is down
   */
  private getFallbackRates(base: string): ExchangeRates {
    const fallbackRates: Record<string, Record<string, number>> = {
      USD: {
        PYG: 7200,
        EUR: 0.92,
        BRL: 5.0,
        ARS: 850,
        GBP: 0.79,
        JPY: 148,
        CNY: 7.2,
      },
      PYG: {
        USD: 0.000139,
        EUR: 0.000128,
        BRL: 0.000694,
        ARS: 0.118,
      },
      EUR: {
        USD: 1.09,
        PYG: 7850,
        BRL: 5.45,
        ARS: 925,
      },
    }

    const rates = fallbackRates[base] || {}

    this.logger.warn(`Using fallback exchange rates for ${base}`)

    return {
      base,
      rates,
      timestamp: Date.now(),
    }
  }

  /**
   * Get supported currencies
   */
  getSupportedCurrencies(): string[] {
    return [
      'USD', // US Dollar
      'PYG', // Paraguayan Guaraní
      'EUR', // Euro
      'BRL', // Brazilian Real
      'ARS', // Argentine Peso
      'GBP', // British Pound
      'JPY', // Japanese Yen
      'CNY', // Chinese Yuan
      'MXN', // Mexican Peso
      'CLP', // Chilean Peso
      'COP', // Colombian Peso
      'PEN', // Peruvian Sol
      'UYU', // Uruguayan Peso
      'BOB', // Bolivian Boliviano
    ]
  }

  /**
   * Format amount with currency symbol
   */
  formatAmount(amount: number, currency: string): string {
    const symbols: Record<string, string> = {
      USD: '$',
      PYG: 'Gs.',
      EUR: '€',
      BRL: 'R$',
      ARS: '$',
      GBP: '£',
      JPY: '¥',
      CNY: '¥',
    }

    const symbol = symbols[currency] || currency
    const formatted = new Intl.NumberFormat('es-PY', {
      minimumFractionDigits: currency === 'PYG' ? 0 : 2,
      maximumFractionDigits: currency === 'PYG' ? 0 : 2,
    }).format(amount)

    return `${symbol} ${formatted}`
  }
}
