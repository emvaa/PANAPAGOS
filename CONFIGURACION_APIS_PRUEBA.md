# 🔧 Configuración de APIs de Prueba - PanaPagos

Esta guía te ayudará a configurar todas las APIs necesarias para probar PanaPagos en modo desarrollo con datos de prueba.

## 📋 Índice

1. [APIs Gratuitas Requeridas](#apis-gratuitas-requeridas)
2. [Configuración Paso a Paso](#configuración-paso-a-paso)
3. [Variables de Entorno](#variables-de-entorno)
4. [Datos de Prueba](#datos-de-prueba)
5. [Problemas de Seguridad Corregidos](#problemas-de-seguridad-corregidos)

---

## 🆓 APIs Gratuitas Requeridas

### 1. Stripe (Pagos con Tarjeta) - GRATIS
- **Propósito**: Procesar pagos con tarjeta de crédito/débito
- **Plan**: Test Mode (100% gratis, sin límites)
- **Registro**: https://dashboard.stripe.com/register
- **Documentación**: https://stripe.com/docs/testing

### 2. ExchangeRate-API (Conversión de Monedas) - GRATIS
- **Propósito**: Obtener tasas de cambio en tiempo real
- **Plan**: Free tier (1,500 requests/mes)
- **Registro**: https://www.exchangerate-api.com/
- **Alternativa sin registro**: https://api.exchangerate-api.com/v4/latest/USD

### 3. Mailtrap (Emails de Prueba) - GRATIS
- **Propósito**: Probar envío de emails sin enviar emails reales
- **Plan**: Free (500 emails/mes)
- **Registro**: https://mailtrap.io/register/signup
- **Documentación**: https://mailtrap.io/inboxes

### 4. Twilio (SMS de Prueba) - GRATIS
- **Propósito**: Enviar SMS de alertas
- **Plan**: Trial ($15 crédito gratis)
- **Registro**: https://www.twilio.com/try-twilio
- **Documentación**: https://www.twilio.com/docs/sms/quickstart

### 5. Redis Cloud (Cache) - GRATIS
- **Propósito**: Cache y rate limiting
- **Plan**: Free (30MB)
- **Registro**: https://redis.com/try-free/
- **Alternativa**: Redis local con Docker

### 6. PostgreSQL (Base de Datos) - GRATIS
- **Propósito**: Base de datos principal
- **Opciones**:
  - Local con Docker (recomendado)
  - Supabase: https://supabase.com/ (500MB gratis)
  - Neon: https://neon.tech/ (3GB gratis)

---

## 🚀 Configuración Paso a Paso

### Paso 1: Stripe (Pagos)

1. Regístrate en https://dashboard.stripe.com/register
2. Ve a **Developers > API Keys**
3. Copia las claves de prueba:
   - **Publishable key**: `pk_test_...`
   - **Secret key**: `sk_test_...`
4. Ve a **Developers > Webhooks**
5. Crea un endpoint: `http://localhost:4000/api/webhooks/stripe`
6. Selecciona eventos: `payment_intent.succeeded`, `payment_intent.payment_failed`
7. Copia el **Signing secret**: `whsec_...`

### Paso 2: ExchangeRate-API (Monedas)

**Opción A: Sin registro (limitado)**
```bash
# Ya está configurado en el código, no necesitas hacer nada
# URL: https://api.exchangerate-api.com/v4/latest/USD
```

**Opción B: Con API Key (recomendado)**
1. Regístrate en https://www.exchangerate-api.com/
2. Copia tu API Key
3. Actualiza el código para usar: `https://v6.exchangerate-api.com/v6/YOUR-API-KEY/latest/USD`

### Paso 3: Mailtrap (Emails)

1. Regístrate en https://mailtrap.io/register/signup
2. Ve a **Email Testing > Inboxes**
3. Crea un inbox llamado "PanaPagos Dev"
4. Copia las credenciales SMTP:
   - Host: `sandbox.smtp.mailtrap.io`
   - Port: `2525`
   - Username: `tu_username`
   - Password: `tu_password`

### Paso 4: Twilio (SMS)

1. Regístrate en https://www.twilio.com/try-twilio
2. Ve a **Console > Account Info**
3. Copia:
   - **Account SID**: `ACxxxxx...`
   - **Auth Token**: `xxxxx...`
4. Ve a **Phone Numbers > Manage > Buy a number**
5. Compra un número gratis (con el crédito trial)
6. Copia el número: `+1234567890`

### Paso 5: Redis (Cache)

**Opción A: Docker (recomendado)**
```bash
docker run -d --name redis-panapagos -p 6379:6379 redis:alpine
```

**Opción B: Redis Cloud**
1. Regístrate en https://redis.com/try-free/
2. Crea una base de datos
3. Copia:
   - Host: `redis-xxxxx.cloud.redislabs.com`
   - Port: `12345`
   - Password: `tu_password`

### Paso 6: PostgreSQL (Base de Datos)

**Opción A: Docker (recomendado)**
```bash
docker run -d \
  --name postgres-panapagos \
  -e POSTGRES_USER=oropay \
  -e POSTGRES_PASSWORD=oropay_secure_password \
  -e POSTGRES_DB=oropay \
  -p 5432:5432 \
  postgres:15-alpine
```

**Opción B: Supabase**
1. Regístrate en https://supabase.com/
2. Crea un proyecto
3. Ve a **Settings > Database**
4. Copia la **Connection string** (modo directo)

---

## 🔐 Variables de Entorno

### Archivo: `apps/api/.env`

```env
# ============================================
# DATABASE
# ============================================
# Opción 1: Docker local
DATABASE_URL="postgresql://oropay:oropay_secure_password@localhost:5432/oropay"

# Opción 2: Supabase
# DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"

# ============================================
# REDIS CACHE
# ============================================
# Opción 1: Docker local
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""
REDIS_DB=0

# Opción 2: Redis Cloud
# REDIS_HOST="redis-xxxxx.cloud.redislabs.com"
# REDIS_PORT=12345
# REDIS_PASSWORD="tu_password"
# REDIS_DB=0

# ============================================
# ENCRYPTION & SECURITY
# ============================================
# Genera con: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_KEY="a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2"
LEDGER_PRIVATE_KEY="b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3"
WEBHOOK_SECRET="c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4"

# ============================================
# STRIPE (Pagos con Tarjeta)
# ============================================
STRIPE_SECRET_KEY="sk_test_YOUR_KEY_HERE"
STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_KEY_HERE"
STRIPE_WEBHOOK_SECRET="whsec_YOUR_WEBHOOK_SECRET_HERE"

# ============================================
# BANCARD (Pagos Locales Paraguay)
# ============================================
# Modo prueba - Solicita credenciales en: https://www.bancard.com.py/
BANCARD_API_URL="https://vpos.infonet.com.py:8888"
BANCARD_PUBLIC_KEY="tu_public_key_de_prueba"
BANCARD_PRIVATE_KEY="tu_private_key_de_prueba"
BANCARD_PROCESS_ID="tu_process_id"

# ============================================
# CURRENCY EXCHANGE
# ============================================
# Opción 1: Sin API Key (limitado)
EXCHANGE_API_URL="https://api.exchangerate-api.com/v4/latest"

# Opción 2: Con API Key (recomendado)
# EXCHANGE_API_KEY="tu_api_key"
# EXCHANGE_API_URL="https://v6.exchangerate-api.com/v6"

# ============================================
# EMAIL (Mailtrap para pruebas)
# ============================================
SMTP_HOST="sandbox.smtp.mailtrap.io"
SMTP_PORT=2525
SMTP_USER="tu_mailtrap_username"
SMTP_PASSWORD="tu_mailtrap_password"
SMTP_FROM="noreply@panapagos.com"

# ============================================
# SMS (Twilio)
# ============================================
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="tu_auth_token"
TWILIO_PHONE_NUMBER="+1234567890"

# ============================================
# PUSH NOTIFICATIONS (Opcional)
# ============================================
# OneSignal (gratis hasta 10k usuarios)
# ONESIGNAL_APP_ID="tu_app_id"
# ONESIGNAL_API_KEY="tu_api_key"

# ============================================
# APPLICATION
# ============================================
APP_URL="http://localhost:3000"
PORT=4000
NODE_ENV="development"
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3001"

# ============================================
# RATE LIMITING
# ============================================
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100

# ============================================
# JWT (para autenticación futura)
# ============================================
JWT_SECRET="d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5"
JWT_EXPIRES_IN="7d"
```

### Archivo: `apps/web/.env.local`

```env
# ============================================
# API
# ============================================
NEXT_PUBLIC_API_URL="http://localhost:4000"

# ============================================
# STRIPE (Frontend)
# ============================================
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_51xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# ============================================
# ANALYTICS (Opcional)
# ============================================
# Google Analytics
# NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"

# ============================================
# FEATURE FLAGS
# ============================================
NEXT_PUBLIC_ENABLE_BIOMETRIC=true
NEXT_PUBLIC_ENABLE_QR_PAYMENTS=true
NEXT_PUBLIC_ENABLE_MULTI_CURRENCY=true
```

---

## 🧪 Datos de Prueba

### Tarjetas de Prueba Stripe

```javascript
// ✅ Pago exitoso
Card: 4242 4242 4242 4242
Exp: 12/34
CVC: 123
ZIP: 12345

// ❌ Pago rechazado (fondos insuficientes)
Card: 4000 0000 0000 9995
Exp: 12/34
CVC: 123

// ⏳ Requiere autenticación 3D Secure
Card: 4000 0025 0000 3155
Exp: 12/34
CVC: 123

// 🚫 Tarjeta declinada
Card: 4000 0000 0000 0002
Exp: 12/34
CVC: 123
```

### Usuarios de Prueba

```javascript
// Usuario Admin
{
  email: "admin@panapagos.com",
  password: "Admin123!",
  role: "ADMIN"
}

// Usuario Regular
{
  email: "user@test.com",
  password: "User123!",
  role: "USER"
}

// Comerciante
{
  email: "merchant@test.com",
  password: "Merchant123!",
  role: "MERCHANT"
}
```

### Webhooks de Prueba

```bash
# Instala Stripe CLI para probar webhooks localmente
stripe listen --forward-to localhost:4000/api/webhooks/stripe

# Trigger eventos de prueba
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
```

---

## 🔒 Problemas de Seguridad Corregidos

### 1. ✅ Validación de Entrada
- Agregado: Validación de DTOs con class-validator
- Sanitización de inputs para prevenir XSS
- Validación de tipos y formatos

### 2. ✅ Rate Limiting
- Implementado: Límite de 100 requests/minuto por IP
- Protección contra ataques de fuerza bruta
- Bloqueo temporal después de 3 intentos fallidos

### 3. ✅ Encriptación de Datos Sensibles
- Tarjetas: Encriptadas con AES-256-GCM
- PII: Hash con SHA-256
- Tokens: Generación segura con crypto.randomBytes

### 4. ✅ Protección CSRF
- Tokens CSRF en formularios
- Validación de origen en webhooks
- SameSite cookies

### 5. ✅ Headers de Seguridad
- Helmet.js configurado
- CORS restrictivo
- Content Security Policy

### 6. ✅ Detección de Fraude
- Velocity checks (3 intentos en 5 minutos)
- Análisis de comportamiento (detección de bots)
- Scoring de riesgo por transacción

### 7. ✅ Logging y Auditoría
- Logs de todas las transacciones
- Registro de intentos fallidos
- Alertas en tiempo real

### 8. ✅ Secrets Management
- Variables de entorno para secrets
- No hay credenciales hardcodeadas
- Rotación de keys recomendada

---

## 🚀 Comandos Rápidos

### Generar Keys de Seguridad

```bash
# Encryption Key (64 caracteres hex)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# JWT Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Webhook Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Iniciar Servicios con Docker

```bash
# Iniciar todo (PostgreSQL + Redis)
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener todo
docker-compose down
```

### Migrar Base de Datos

```bash
cd apps/api

# Generar migración
npx prisma migrate dev --name init

# Aplicar migraciones
npx prisma migrate deploy

# Seed con datos de prueba
npx prisma db seed
```

### Probar la API

```bash
# Health check
curl http://localhost:4000/health

# Crear payment link
curl -X POST http://localhost:4000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100000,
    "currency": "PYG",
    "description": "Test Payment",
    "merchantId": "test-merchant"
  }'
```

---

## 📞 Soporte

Si tienes problemas con alguna configuración:

1. Revisa los logs: `docker-compose logs -f api`
2. Verifica las variables de entorno
3. Consulta la documentación oficial de cada servicio
4. Abre un issue en el repositorio

---

## 🎯 Próximos Pasos

1. ✅ Configurar todas las APIs
2. ✅ Probar pagos con tarjetas de prueba
3. ✅ Verificar emails en Mailtrap
4. ✅ Probar webhooks con Stripe CLI
5. ✅ Revisar logs de seguridad
6. 🚀 ¡Empezar a desarrollar!

---

**Última actualización**: Febrero 2026
**Versión**: 1.0.0
