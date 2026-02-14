#!/usr/bin/env node

/**
 * Script de configuración automática para PanaPagos
 * Ejecutar con: node setup.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function exec(command, options = {}) {
  try {
    console.log(`\n🔧 Ejecutando: ${command}`);
    execSync(command, { stdio: 'inherit', ...options });
    return true;
  } catch (error) {
    console.error(`❌ Error ejecutando: ${command}`);
    return false;
  }
}

function generateSecureKey() {
  return require('crypto').randomBytes(32).toString('hex');
}

async function main() {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 PanaPagos - Setup Automático                        ║
║                                                           ║
║   Este script configurará tu entorno de desarrollo       ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);

  // 1. Verificar Node.js
  console.log('\n📦 Verificando Node.js...');
  try {
    const nodeVersion = execSync('node --version').toString().trim();
    console.log(`✅ Node.js ${nodeVersion} instalado`);
  } catch {
    console.error('❌ Node.js no está instalado. Instálalo desde https://nodejs.org/');
    process.exit(1);
  }

  // 2. Verificar Docker
  console.log('\n🐳 Verificando Docker...');
  try {
    execSync('docker --version', { stdio: 'ignore' });
    console.log('✅ Docker instalado');
  } catch {
    console.log('⚠️  Docker no está instalado. Puedes usar bases de datos en la nube.');
  }

  // 3. Instalar dependencias
  console.log('\n📦 Instalando dependencias...');
  
  if (!exec('npm install')) {
    console.error('❌ Error instalando dependencias raíz');
    process.exit(1);
  }

  // Instalar Stripe en el backend
  console.log('\n💳 Instalando Stripe SDK...');
  if (!exec('npm install stripe', { cwd: 'apps/api' })) {
    console.log('⚠️  Error instalando Stripe. Instálalo manualmente: cd apps/api && npm install stripe');
  }

  // 4. Configurar variables de entorno
  console.log('\n🔐 Configurando variables de entorno...');
  
  const useStripe = await question('\n¿Tienes una cuenta de Stripe? (s/n): ');
  
  let stripeSecretKey = 'sk_test_YOUR_KEY_HERE';
  let stripePublishableKey = 'pk_test_YOUR_KEY_HERE';
  let stripeWebhookSecret = 'whsec_YOUR_WEBHOOK_SECRET_HERE';

  if (useStripe.toLowerCase() === 's') {
    console.log('\n📝 Ingresa tus credenciales de Stripe (modo test):');
    console.log('   Obtén tus keys en: https://dashboard.stripe.com/test/apikeys\n');
    
    stripeSecretKey = await question('Secret Key (sk_test_...): ') || stripeSecretKey;
    stripePublishableKey = await question('Publishable Key (pk_test_...): ') || stripePublishableKey;
    stripeWebhookSecret = await question('Webhook Secret (whsec_...) [opcional]: ') || stripeWebhookSecret;
  } else {
    console.log('\n💡 Puedes configurar Stripe más tarde editando apps/api/.env');
    console.log('   Regístrate gratis en: https://dashboard.stripe.com/register');
  }

  // Generar keys de seguridad
  const encryptionKey = generateSecureKey();
  const ledgerPrivateKey = generateSecureKey();
  const webhookSecret = generateSecureKey();
  const jwtSecret = generateSecureKey();

  // Crear archivo .env para el backend
  const backendEnv = `# ============================================
# DATABASE
# ============================================
DATABASE_URL="postgresql://oropay:oropay_secure_password@localhost:5432/oropay"

# ============================================
# REDIS CACHE
# ============================================
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""
REDIS_DB=0

# ============================================
# ENCRYPTION & SECURITY
# ============================================
ENCRYPTION_KEY="${encryptionKey}"
LEDGER_PRIVATE_KEY="${ledgerPrivateKey}"
WEBHOOK_SECRET="${webhookSecret}"
JWT_SECRET="${jwtSecret}"

# ============================================
# STRIPE (Modo Test)
# ============================================
STRIPE_SECRET_KEY="${stripeSecretKey}"
STRIPE_PUBLISHABLE_KEY="${stripePublishableKey}"
STRIPE_WEBHOOK_SECRET="${stripeWebhookSecret}"

# ============================================
# BANCARD
# ============================================
BANCARD_API_URL="https://vpos.infonet.com.py:8888"
BANCARD_PUBLIC_KEY="your_public_key"
BANCARD_PRIVATE_KEY="your_private_key"
BANCARD_PROCESS_ID="your_process_id"

# ============================================
# CURRENCY EXCHANGE
# ============================================
EXCHANGE_API_URL="https://api.exchangerate-api.com/v4/latest"

# ============================================
# EMAIL - Mailtrap
# ============================================
SMTP_HOST="sandbox.smtp.mailtrap.io"
SMTP_PORT=2525
SMTP_USER="your_mailtrap_username"
SMTP_PASSWORD="your_mailtrap_password"
SMTP_FROM="noreply@panapagos.com"

# ============================================
# SMS - Twilio
# ============================================
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token"
TWILIO_PHONE_NUMBER="+1234567890"

# ============================================
# APPLICATION
# ============================================
APP_URL="http://localhost:3000"
PORT=4000
NODE_ENV="development"
ALLOWED_ORIGINS="http://localhost:3000"
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100
`;

  fs.writeFileSync('apps/api/.env', backendEnv);
  console.log('✅ Archivo apps/api/.env creado');

  // Crear archivo .env.local para el frontend
  const frontendEnv = `# ============================================
# API
# ============================================
NEXT_PUBLIC_API_URL="http://localhost:4000"

# ============================================
# STRIPE (Frontend)
# ============================================
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="${stripePublishableKey}"

# ============================================
# FEATURE FLAGS
# ============================================
NEXT_PUBLIC_ENABLE_BIOMETRIC=true
NEXT_PUBLIC_ENABLE_QR_PAYMENTS=true
NEXT_PUBLIC_ENABLE_MULTI_CURRENCY=true
`;

  fs.writeFileSync('apps/web/.env.local', frontendEnv);
  console.log('✅ Archivo apps/web/.env.local creado');

  // 5. Configurar base de datos
  console.log('\n🗄️  Configurando base de datos...');
  
  const useDocker = await question('\n¿Quieres iniciar PostgreSQL y Redis con Docker? (s/n): ');
  
  if (useDocker.toLowerCase() === 's') {
    console.log('\n🐳 Iniciando contenedores Docker...');
    if (exec('docker-compose up -d')) {
      console.log('✅ PostgreSQL y Redis iniciados');
      
      // Esperar a que la base de datos esté lista
      console.log('\n⏳ Esperando a que la base de datos esté lista...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    } else {
      console.log('⚠️  Error iniciando Docker. Configura la base de datos manualmente.');
    }
  } else {
    console.log('\n💡 Configura tu base de datos y actualiza DATABASE_URL en apps/api/.env');
  }

  // 6. Migrar base de datos
  console.log('\n🔄 Configurando Prisma...');
  
  if (exec('npx prisma generate', { cwd: 'apps/api' })) {
    console.log('✅ Cliente Prisma generado');
  }

  const runMigrations = await question('\n¿Ejecutar migraciones de base de datos? (s/n): ');
  
  if (runMigrations.toLowerCase() === 's') {
    if (exec('npx prisma migrate deploy', { cwd: 'apps/api' })) {
      console.log('✅ Migraciones ejecutadas');
    }
  }

  // 7. Resumen
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ✅ ¡Setup Completado!                                   ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

🎯 Próximos pasos:

1. Inicia la aplicación:
   npm run dev

2. Abre tu navegador:
   🌐 Frontend: http://localhost:3000
   🔧 API: http://localhost:4000

3. Prueba pagos con tarjetas de Stripe:
   ✅ Exitoso: 4242 4242 4242 4242
   ❌ Rechazado: 4000 0000 0000 0002

4. Documentación:
   📖 Setup Rápido: SETUP_RAPIDO.md
   🔧 APIs: CONFIGURACION_APIS_PRUEBA.md

5. Herramientas útiles:
   - Prisma Studio: cd apps/api && npx prisma studio
   - Logs Docker: docker-compose logs -f
   - Stripe CLI: stripe listen --forward-to localhost:4000/api/webhooks/stripe

🔐 Keys generadas:
   - Encryption Key: ${encryptionKey.substring(0, 20)}...
   - JWT Secret: ${jwtSecret.substring(0, 20)}...
   - Webhook Secret: ${webhookSecret.substring(0, 20)}...

💡 Tip: Guarda estas keys de forma segura. Están en apps/api/.env

¡Feliz desarrollo! 🚀
  `);

  rl.close();
}

main().catch(error => {
  console.error('\n❌ Error durante el setup:', error);
  process.exit(1);
});
