import { Module, Global } from '@nestjs/common'
import { DigitalSignatureService } from './digital-signature.service'
import { GoldenAlertService } from './golden-alert.service'
import { FraudDetectionService } from './fraud-detection.service'
import { DataMaskingService } from './data-masking.service'

@Global()
@Module({
  providers: [
    DigitalSignatureService,
    GoldenAlertService,
    FraudDetectionService,
    DataMaskingService,
  ],
  exports: [
    DigitalSignatureService,
    GoldenAlertService,
    FraudDetectionService,
    DataMaskingService,
  ],
})
export class SecurityModule {}
