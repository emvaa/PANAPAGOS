import { IsString, IsObject, IsOptional } from 'class-validator'

export class BancardWebhookDto {
  @IsString()
  status: string

  @IsObject()
  operation: {
    shop_process_id: string
    token: string
    amount: string
    currency: string
  }

  @IsOptional()
  @IsObject()
  confirmation?: {
    authorization_number: string
    ticket_number: string
    response_code: string
    response_description: string
  }
}
