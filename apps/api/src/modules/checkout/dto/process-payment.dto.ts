import { IsString, IsEnum, Matches, Length, IsOptional, IsEmail } from 'class-validator'

export class ProcessPaymentDto {
  @IsString()
  transactionId: string

  @IsString()
  @Matches(/^\d{13,19}$/, { message: 'Invalid card number format' })
  cardNumber: string

  @IsString()
  @Length(2, 100)
  cardHolder: string

  @IsString()
  @Matches(/^\d{2}\/\d{2}$/, { message: 'Expiry date must be MM/YY format' })
  expiryDate: string

  @IsString()
  @Matches(/^\d{3,4}$/, { message: 'CVV must be 3 or 4 digits' })
  cvv: string

  @IsEnum(['RUC', 'CI'])
  documentType: 'RUC' | 'CI'

  @IsString()
  @Matches(/^\d+$/, { message: 'Document number must contain only digits' })
  documentNumber: string

  @IsString()
  ipAddress: string

  @IsString()
  userAgent: string

  @IsOptional()
  @IsString()
  idempotencyKey?: string

  @IsOptional()
  @IsString()
  currency?: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  behavioralData?: any
}
