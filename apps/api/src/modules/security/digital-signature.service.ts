import { Injectable } from '@nestjs/common'
import * as crypto from 'crypto'

interface SignatureData {
  transactionId?: string
  amount: number
  timestamp: string
  userId?: string
  type?: string
  debitAccountId?: string
  creditAccountId?: string
  currency?: string
}

@Injectable()
export class DigitalSignatureService {
  private readonly ALGORITHM = 'sha256'
  private readonly PRIVATE_KEY = process.env.LEDGER_PRIVATE_KEY || 'default-key-change-in-production'

  /**
   * Generate HMAC signature for ledger entry
   */
  generateLedgerSignature(data: SignatureData): string {
    const payload = this.createCanonicalString(data)
    const hmac = crypto.createHmac(this.ALGORITHM, this.PRIVATE_KEY)
    hmac.update(payload)
    return hmac.digest('hex')
  }

  /**
   * Alias for generateLedgerSignature (for compatibility)
   */
  signLedgerEntry(data: SignatureData): string {
    return this.generateLedgerSignature(data)
  }

  /**
   * Verify ledger signature
   */
  verifyLedgerSignature(data: SignatureData, signature: string): boolean {
    const expectedSignature = this.generateLedgerSignature(data)
    
    // Use timing-safe comparison to prevent timing attacks
    try {
      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex'),
      )
    } catch {
      return false
    }
  }

  /**
   * Create canonical string from data (deterministic ordering)
   */
  private createCanonicalString(data: SignatureData): string {
    const sortedKeys = Object.keys(data).sort()
    const parts = sortedKeys.map((key) => `${key}=${data[key as keyof SignatureData]}`)
    return parts.join('&')
  }

  /**
   * Generate unique transaction fingerprint
   */
  generateTransactionFingerprint(
    userId: string,
    amount: number,
    timestamp: number,
    nonce: string,
  ): string {
    const data = `${userId}:${amount}:${timestamp}:${nonce}`
    return crypto.createHash('sha256').update(data).digest('hex')
  }

  /**
   * Sign transaction with RSA (for high-value transactions)
   */
  signTransactionRSA(data: string, privateKey: string): string {
    const sign = crypto.createSign('RSA-SHA256')
    sign.update(data)
    return sign.sign(privateKey, 'base64')
  }

  /**
   * Verify RSA signature
   */
  verifyTransactionRSA(data: string, signature: string, publicKey: string): boolean {
    try {
      const verify = crypto.createVerify('RSA-SHA256')
      verify.update(data)
      return verify.verify(publicKey, signature, 'base64')
    } catch {
      return false
    }
  }

  /**
   * Generate nonce for replay attack prevention
   */
  generateNonce(): string {
    return crypto.randomBytes(16).toString('hex')
  }

  /**
   * Create tamper-proof audit trail
   */
  createAuditHash(previousHash: string, currentData: string): string {
    const combined = `${previousHash}:${currentData}`
    return crypto.createHash('sha256').update(combined).digest('hex')
  }
}
