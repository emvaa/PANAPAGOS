import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as crypto from 'crypto'

@Injectable()
export class CryptoService {
  private readonly algorithm = 'aes-256-gcm'
  private readonly encryptionKey: Buffer

  constructor(private configService: ConfigService) {
    const key = this.configService.get<string>('ENCRYPTION_KEY')
    if (!key || key.length !== 64) {
      throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes)')
    }
    this.encryptionKey = Buffer.from(key, 'hex')
  }

  /**
   * Encrypt sensitive data using AES-256-GCM
   */
  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv)

    let encrypted = cipher.update(plaintext, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    const authTag = cipher.getAuthTag()

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
  }

  /**
   * Decrypt data encrypted with AES-256-GCM
   */
  decrypt(ciphertext: string): string {
    const parts = ciphertext.split(':')
    if (parts.length !== 3) {
      throw new Error('Invalid ciphertext format')
    }

    const [ivHex, authTagHex, encryptedHex] = parts
    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')

    const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  }

  /**
   * Hash sensitive data using SHA-256 (simplified for development)
   */
  async hash(data: string): Promise<string> {
    return crypto.createHash('sha256').update(data).digest('hex')
  }

  /**
   * Verify hashed data
   */
  async verify(hash: string, plain: string): Promise<boolean> {
    try {
      const plainHash = await this.hash(plain)
      return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(plainHash))
    } catch {
      return false
    }
  }

  /**
   * Generate MD5 signature for Bancard integration
   */
  generateBancardSignature(data: Record<string, any>, privateKey: string): string {
    const sortedKeys = Object.keys(data).sort()
    const concatenated = sortedKeys.map(key => `${key}${data[key]}`).join('')
    const toSign = `${privateKey}${concatenated}`
    
    return crypto.createHash('md5').update(toSign).digest('hex')
  }

  /**
   * Verify Bancard webhook signature
   */
  verifyBancardSignature(
    data: Record<string, any>,
    signature: string,
    privateKey: string,
  ): boolean {
    const expectedSignature = this.generateBancardSignature(data, privateKey)
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    )
  }

  /**
   * Generate secure random token
   */
  generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex')
  }

  /**
   * Mask card number for display
   */
  maskCardNumber(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\s/g, '')
    if (cleaned.length < 4) return '****'
    return `****${cleaned.slice(-4)}`
  }
}
