import { Controller, Post, Body, Get, Param, HttpCode, HttpStatus } from '@nestjs/common'
import { CheckoutService } from './application/checkout.service'
import { CreateCheckoutDto } from './dto/create-checkout.dto'
import { ProcessPaymentDto } from './dto/process-payment.dto'

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async createCheckout(@Body() dto: CreateCheckoutDto) {
    return this.checkoutService.createCheckout(dto)
  }

  @Get('link/:shortCode')
  async getPaymentLink(@Param('shortCode') shortCode: string) {
    return this.checkoutService.getPaymentLinkDetails(shortCode)
  }

  @Post('process')
  @HttpCode(HttpStatus.OK)
  async processPayment(@Body() dto: ProcessPaymentDto) {
    return this.checkoutService.processPayment(dto)
  }

  @Get('transaction/:id')
  async getTransaction(@Param('id') id: string) {
    return this.checkoutService.getTransactionStatus(id)
  }

  @Get('merchant')
  async getMerchant() {
    return this.checkoutService.getDefaultMerchant()
  }
}
