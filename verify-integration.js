#!/usr/bin/env node

/**
 * Script de Verificación de Integración
 * Verifica que todas las mejoras de seguridad y UX estén correctamente integradas
 */

const fs = require('fs');
const path = require('path');

const checks = {
  backend: [
    {
      name: 'SecurityModule en app.module.ts',
      file: 'apps/api/src/app.module.ts',
      contains: "import { SecurityModule } from './modules/security/security.module'",
    },
    {
      name: 'FraudDetection en checkout.service.ts',
      file: 'apps/api/src/modules/checkout/application/checkout.service.ts',
      contains: 'FraudDetectionService',
    },
    {
      name: 'DigitalSignature en ledger.service.ts',
      file: 'apps/api/src/modules/ledger/domain/ledger.service.ts',
      contains: 'DigitalSignatureService',
    },
    {
      name: 'GoldenAlert en ledger.service.ts',
      file: 'apps/api/src/modules/ledger/domain/ledger.service.ts',
      contains: 'GoldenAlertService',
    },
    {
      name: 'DataMasking en checkout.service.ts',
      file: 'apps/api/src/modules/checkout/application/checkout.service.ts',
      contains: 'DataMaskingService',
    },
  ],
  frontend: [
    {
      name: 'BehavioralAnalytics en CardForm',
      file: 'apps/web/components/checkout/CardForm.tsx',
      contains: 'BehavioralAnalytics',
    },
    {
      name: 'PrivacyMode en Wallet',
      file: 'apps/web/app/wallet/page.tsx',
      contains: 'PrivacyMode',
    },
    {
      name: 'CurrencyConverter en Wallet',
      file: 'apps/web/app/wallet/page.tsx',
      contains: 'CurrencyConverter',
    },
    {
      name: 'SmartSearch en Wallet',
      file: 'apps/web/app/wallet/page.tsx',
      contains: 'SmartSearch',
    },
    {
      name: 'ShimmerLoader en Dashboard',
      file: 'apps/web/app/dashboard/page.tsx',
      contains: 'CardSkeleton',
    },
    {
      name: 'DynamicQRGenerator en QR Collect',
      file: 'apps/web/app/qr-collect/page.tsx',
      contains: 'DynamicQRGenerator',
    },
  ],
  services: [
    {
      name: 'FraudDetectionService existe',
      file: 'apps/api/src/modules/security/fraud-detection.service.ts',
      exists: true,
    },
    {
      name: 'DigitalSignatureService existe',
      file: 'apps/api/src/modules/security/digital-signature.service.ts',
      exists: true,
    },
    {
      name: 'DataMaskingService existe',
      file: 'apps/api/src/modules/security/data-masking.service.ts',
      exists: true,
    },
    {
      name: 'GoldenAlertService existe',
      file: 'apps/api/src/modules/security/golden-alert.service.ts',
      exists: true,
    },
    {
      name: 'SecurityModule existe',
      file: 'apps/api/src/modules/security/security.module.ts',
      exists: true,
    },
  ],
  components: [
    {
      name: 'BehavioralAnalytics existe',
      file: 'apps/web/components/security/BehavioralAnalytics.tsx',
      exists: true,
    },
    {
      name: 'PrivacyMode existe',
      file: 'apps/web/components/wallet/PrivacyMode.tsx',
      exists: true,
    },
    {
      name: 'ShimmerLoader existe',
      file: 'apps/web/components/ui/ShimmerLoader.tsx',
      exists: true,
    },
    {
      name: 'CurrencyConverter existe',
      file: 'apps/web/components/wallet/CurrencyConverter.tsx',
      exists: true,
    },
    {
      name: 'SmartSearch existe',
      file: 'apps/web/components/wallet/SmartSearch.tsx',
      exists: true,
    },
    {
      name: 'DynamicQRGenerator existe',
      file: 'apps/web/components/qr/DynamicQRGenerator.tsx',
      exists: true,
    },
  ],
};

function checkFile(check) {
  const filePath = path.join(__dirname, check.file);
  
  if (!fs.existsSync(filePath)) {
    return { success: false, message: `Archivo no encontrado: ${check.file}` };
  }

  if (check.exists) {
    return { success: true, message: 'Archivo existe' };
  }

  if (check.contains) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(check.contains)) {
      return { success: true, message: 'Integración encontrada' };
    } else {
      return { success: false, message: `No se encontró: ${check.contains}` };
    }
  }

  return { success: true, message: 'OK' };
}

function runChecks() {
  console.log('\n🔍 VERIFICACIÓN DE INTEGRACIÓN - PANAPAGOS\n');
  console.log('='.repeat(60));

  let totalChecks = 0;
  let passedChecks = 0;

  for (const [category, categoryChecks] of Object.entries(checks)) {
    console.log(`\n📦 ${category.toUpperCase()}\n`);

    for (const check of categoryChecks) {
      totalChecks++;
      const result = checkFile(check);

      const icon = result.success ? '✅' : '❌';
      console.log(`${icon} ${check.name}`);

      if (!result.success) {
        console.log(`   └─ ${result.message}`);
      }

      if (result.success) {
        passedChecks++;
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 RESULTADO: ${passedChecks}/${totalChecks} checks pasados`);

  if (passedChecks === totalChecks) {
    console.log('\n🎉 ¡TODAS LAS INTEGRACIONES ESTÁN CORRECTAS!\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  Algunas integraciones faltan o están incorrectas.\n');
    process.exit(1);
  }
}

runChecks();
