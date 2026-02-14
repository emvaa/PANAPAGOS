import { IsString, IsNumber, IsEnum, IsOptional, Min, MaxLength } from 'class-validator'

export class CreateCheckoutDto {
  @IsString()
  merchantId: string

  @IsNumber()
  @Min(0.01)
  amount: number

  @IsEnum(['PYG', 'USD'])
  currency: 'PYG' | 'USD'

  @IsString()
  @MaxLength(500)
  description: string

  @IsOptional()
  @IsNumber()
  @Min(300)
  expirationSeconds?: number

  @IsOptional()
  metadata?: Record<string, any>
}
