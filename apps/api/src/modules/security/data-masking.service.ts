import { Injectable } from '@nestjs/common'

@Injectable()
export class DataMaskingService {
  /**
   * Mask credit card number (PCI-DSS compliant)
   */
  maskCardNumber(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\s/g, '')
    if (cleaned.length < 4) return '****'
    
    const lastFour = cleaned.slice(-4)
    const masked = '*'.repeat(cleaned.length - 4)
    return `${masked}${lastFour}`
  }

  /**
   * Mask email address
   */
  maskEmail(email: string): string {
    const [username, domain] = email.split('@')
    if (!username || !domain) return '***@***.com'

    const visibleChars = Math.min(3, Math.floor(username.length / 2))
    const maskedUsername = username.slice(0, visibleChars) + '*'.repeat(username.length - visibleChars)
    
    return `${maskedUsername}@${domain}`
  }

  /**
   * Mask RUC/CI (Paraguay documents)
   */
  maskDocument(document: string, type: 'RUC' | 'CI'): string {
    const cleaned = document.replace(/[^0-9]/g, '')
    if (cleaned.length < 4) return '****'

    const lastFour = cleaned.slice(-4)
    const masked = '*'.repeat(cleaned.length - 4)
    return `${masked}${lastFour}`
  }

  /**
   * Mask phone number
   */
  maskPhone(phone: string): string {
    const cleaned = phone.replace(/[^0-9]/g, '')
    if (cleaned.length < 4) return '****'

    const lastFour = cleaned.slice(-4)
    const masked = '*'.repeat(cleaned.length - 4)
    return `${masked}${lastFour}`
  }

  /**
   * Mask balance amount (show only if authorized)
   */
  maskBalance(amount: number, showFull: boolean = false): string {
    if (showFull) {
      return amount.toLocaleString('es-PY')
    }
    return '••••••'
  }

  /**
   * Mask sensitive data in logs
   */
  maskLogData(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data
    }

    const masked = { ...data }
    const sensitiveFields = [
      'cardNumber',
      'cvv',
      'password',
      'passwordHash',
      'apiSecret',
      'privateKey',
      'twoFactorSecret',
      'pin',
      'ssn',
      'documentNumber',
    ]

    for (const key in masked) {
      if (sensitiveFields.includes(key)) {
        masked[key] = '***MASKED***'
      } else if (key === 'email') {
        masked[key] = this.maskEmail(masked[key])
      } else if (typeof masked[key] === 'object') {
        masked[key] = this.maskLogData(masked[key])
      }
    }

    return masked
  }

  /**
   * Redact sensitive data for PCI-DSS compliance
   */
  redactPCIData(data: any): any {
    const redacted = { ...data }

    // Remove all card data
    delete redacted.cardNumber
    delete redacted.cvv
    delete redacted.expiryDate
    delete redacted.cardHolder

    // Mask remaining sensitive fields
    if (redacted.email) redacted.email = this.maskEmail(redacted.email)
    if (redacted.phone) redacted.phone = this.maskPhone(redacted.phone)
    if (redacted.documentNumber) redacted.documentNumber = this.maskDocument(redacted.documentNumber, 'CI')

    return redacted
  }

  /**
   * Create safe display object for UI
   */
  createSafeDisplayObject(data: any): any {
    return {
      ...data,
      cardNumber: data.cardNumber ? this.maskCardNumber(data.cardNumber) : undefined,
      email: data.email ? this.maskEmail(data.email) : undefined,
      phone: data.phone ? this.maskPhone(data.phone) : undefined,
      documentNumber: data.documentNumber ? this.maskDocument(data.documentNumber, 'CI') : undefined,
      balance: data.balance !== undefined ? this.maskBalance(data.balance, false) : undefined,
    }
  }
}
