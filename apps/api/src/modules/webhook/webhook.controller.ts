import { 
  Controller, 
  Post, 
  Body, 
  Headers, 
  HttpCode, 
  HttpStatus, 
  UnauthorizedException,
  RawBodyRequest,
  Req,
} from '@nestjs/common'
import { Request } from 'express'
import { WebhookService } from './webhook.service'
import { BancardWebhookDto } from './dto/bancard-webhook.dto'

@Controller('webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('bancard')
  @HttpCode(HttpStatus.OK)
  async handleBancardWebhook(
    @Body() dto: BancardWebhookDto,
    @Headers('x-bancard-signature') signature: string,
  ) {
    if (!signature) {
      throw new UnauthorizedException('Missing signature')
    }

    return this.webhookService.processBancardWebhook(dto, signature)
  }

  @Post('stripe')
  @HttpCode(HttpStatus.OK)
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!signature) {
      throw new UnauthorizedException('Missing Stripe signature')
    }

    // Stripe requires raw body for signature verification
    const rawBody = req.rawBody?.toString('utf8') || JSON.stringify(req.body)

    return this.webhookService.processStripeWebhook(rawBody, signature)
  }
}
