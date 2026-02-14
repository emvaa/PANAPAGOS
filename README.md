# 💳 PANAPAGOS

La infraestructura de pagos definitiva para Paraguay con arquitectura de microservicios, seguridad bancaria de alto nivel y diseño de ultra-lujo.

## 🚀 Inicio Rápido (5 minutos)

### Opción 1: Setup Automático (Recomendado)

```bash
# Ejecutar script de configuración
node setup.js
```

El script te guiará paso a paso para:
- ✅ Instalar dependencias
- ✅ Configurar Stripe (modo test gratis)
- ✅ Generar keys de seguridad
- ✅ Iniciar base de datos con Docker
- ✅ Ejecutar migraciones

### Opción 2: Setup Manual

```bash
# 1. Instalar dependencias
npm install
cd apps/api && npm install stripe && cd ../..

# 2. Configurar variables de entorno
cp .env.example apps/api/.env
# Edita apps/api/.env con tus credenciales

# 3. Iniciar servicios con Docker
docker-compose up -d

# 4. Migrar base de datos
cd apps/api
npx prisma generate
npx prisma migrate deploy
cd ../..

# 5. Iniciar aplicación
npm run dev
```

### 🌐 Acceder a la Aplicación

- **Frontend**: http://localhost:3000
- **API**: http://localhost:4000
- **Prisma Studio**: `cd apps/api && npx prisma studio`

---

## 📚 Documentación

- 📖 [Setup Rápido](./SETUP_RAPIDO.md) - Guía de inicio en 5 minutos
- 🔧 [Configuración de APIs](./CONFIGURACION_APIS_PRUEBA.md) - Todas las APIs gratuitas necesarias
- 🔒 [Seguridad](./SEGURIDAD_CORREGIDA.md) - Vulnerabilidades corregidas y mejores prácticas
- 💼 [Plan de Negocio](./PLAN_NEGOCIO_PANAPAGOS.md) - Visión y estrategia
- 🏗️ [Estructura](./ESTRUCTURA_ORGANIZACIONAL_Y_FLUJOS.md) - Arquitectura del sistema

---

## 🧪 Probar Pagos

### Tarjetas de Prueba Stripe (100% GRATIS)

```
✅ Pago exitoso:
   Número: 4242 4242 4242 4242
   Exp: 12/34 | CVV: 123

❌ Pago rechazado:
   Número: 4000 0000 0000 0002
   Exp: 12/34 | CVV: 123

💰 Fondos insuficientes:
   Número: 4000 0000 0000 9995
   Exp: 12/34 | CVV: 123

🔐 Requiere 3D Secure:
   Número: 4000 0025 0000 3155
   Exp: 12/34 | CVV: 123
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
    "description": "Test Payment"
  }'
```

---

---

## 🏗️ Arquitectura

### Frontend
- **Next.js 14+** con App Router
- **Tailwind CSS** para estilos
- **Framer Motion** para animaciones premium
- **Lucide Icons** para iconografía
- **Stripe Elements** para formularios de pago seguros

### Backend
- **NestJS** con TypeScript
- **Arquitectura Hexagonal** (Domain-Driven Design)
- **PostgreSQL** para transacciones (ACID compliance)
- **Redis** para caché y rate limiting
- **Prisma ORM** para gestión de base de datos

### Integraciones de Pago (GRATIS en modo test)
- ✅ **Stripe** - Pagos internacionales con tarjeta
- ✅ **Bancard** - Pagos locales en Paraguay
- ✅ **ExchangeRate-API** - Conversión de monedas en tiempo real

### Seguridad
- ✅ Encriptación **AES-256-GCM** para datos sensibles
- ✅ Validación de tarjetas con **Algoritmo de Luhn**
- ✅ **Rate Limiting**: 100 req/min, bloqueo tras 3 intentos fallidos
- ✅ **Detección de Fraude**: Análisis de comportamiento y scoring de riesgo
- ✅ **Webhook Verification**: Firmas MD5 (Bancard) y HMAC (Stripe)
- ✅ **Auditoría Completa**: Logs de todas las transacciones
- ✅ **CORS Restrictivo** y headers de seguridad con Helmet
- ✅ Cumplimiento **PCI-DSS** (nivel básico)

---

## 🔐 APIs Necesarias (Todas GRATIS)

### 1. Stripe (Pagos con Tarjeta)
- **Plan**: Test Mode - 100% gratis, sin límites
- **Registro**: https://dashboard.stripe.com/register
- **Qué obtienes**: Procesar pagos con tarjeta en modo prueba

### 2. ExchangeRate-API (Conversión de Monedas)
- **Plan**: Free tier - 1,500 requests/mes
- **Registro**: No requiere (o https://www.exchangerate-api.com/)
- **Qué obtienes**: Tasas de cambio en tiempo real

### 3. Mailtrap (Emails de Prueba)
- **Plan**: Free - 500 emails/mes
- **Registro**: https://mailtrap.io/register/signup
- **Qué obtienes**: Probar envío de emails sin enviar emails reales

### 4. Twilio (SMS - Opcional)
- **Plan**: Trial - $15 crédito gratis
- **Registro**: https://www.twilio.com/try-twilio
- **Qué obtienes**: Enviar SMS de alertas

### 5. Redis Cloud (Cache - Opcional)
- **Plan**: Free - 30MB
- **Registro**: https://redis.com/try-free/
- **Alternativa**: Redis local con Docker (incluido en docker-compose.yml)

Ver [CONFIGURACION_APIS_PRUEBA.md](./CONFIGURACION_APIS_PRUEBA.md) para instrucciones detalladas.

---

## 📦 Estructura del Proyecto

```
panapagos/
├── apps/
│   ├── api/                          # Backend NestJS
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── checkout/         # Módulo de checkout
│   │   │   │   │   ├── application/  # Servicios de aplicación
│   │   │   │   │   ├── domain/       # Lógica de negocio
│   │   │   │   │   └── infrastructure/ # Gateways (Stripe, Bancard)
│   │   │   │   ├── webhook/          # Webhooks de pagos
│   │   │   │   ├── ledger/           # Contabilidad de doble entrada
│   │   │   │   └── security/         # Detección de fraude
│   │   │   └── infrastructure/
│   │   │       ├── database/         # Prisma
│   │   │       ├── cache/            # Redis
│   │   │       ├── crypto/           # Encriptación AES-256
│   │   │       └── currency/         # Conversión de monedas
│   │   └── prisma/
│   │       └── schema.prisma         # Esquema de BD
│   └── web/                          # Frontend Next.js
│       ├── app/
│       │   ├── pay/[shortCode]/      # Página de checkout
│       │   ├── dashboard/            # Panel de control
│       │   ├── wallet/               # Billetera digital
│       │   └── page.tsx              # Landing page
│       └── components/
│           ├── checkout/             # Componentes de pago
│           ├── wallet/               # Componentes de billetera
│           ├── security/             # Análisis de comportamiento
│           └── ui/                   # Componentes UI
├── docker-compose.yml                # PostgreSQL + Redis
├── setup.js                          # Script de configuración automática
└── docs/
    ├── SETUP_RAPIDO.md              # Guía de inicio rápido
    ├── CONFIGURACION_APIS_PRUEBA.md # Configuración de APIs
    └── SEGURIDAD_CORREGIDA.md       # Documentación de seguridad
```

---

### Configuración

1. Obtener credenciales de Bancard:
   - `shop_process_id`
   - `private_key`

2. Configurar en la base de datos (tabla `merchants`):
```sql
INSERT INTO merchants (name, email, ruc, shop_process_id, private_key, ...)
VALUES ('Mi Comercio', 'email@example.com', '80012345-6', 'shop_id', 'private_key', ...);
```

### Flujo de Pago

1. **Crear Link de Pago**
```bash
POST /v1/checkout/create
{
  "merchantId": "merchant-id",
  "amount": 100000,
  "currency": "PYG",
  "description": "Producto XYZ",
  "expirationSeconds": 3600
}
```

2. **Cliente accede al link**
```
https://oropay.com/pay/{shortCode}
```

3. **Procesar pago**
- El sistema valida la tarjeta con Algoritmo de Luhn
- Encripta datos sensibles con AES-256
- Envía a Bancard con firma MD5
- Actualiza estado en tiempo real

4. **Webhook de confirmación**
```bash
POST /v1/webhooks/bancard
X-Bancard-Signature: {signature}
{
  "status": "success",
  "operation": {...},
  "confirmation": {...}
}
```

## 🎨 Diseño de Lujo

### Paleta de Colores
- **Obsidian**: `#050505` (Fondo principal)
- **Gold**: `#D4AF37` (Acentos premium)
- **Silver**: `#C0C0C0` (Texto secundario)

### Efectos Visuales
- **Glassmorphism**: Tarjetas con `backdrop-blur-xl`
- **Glow Cursor**: Efecto de luz que sigue el mouse
- **Animaciones**: Transiciones suaves con Framer Motion
- **Gradientes**: Efectos dorados y plateados

## 🔒 Seguridad

### Encriptación de Datos
```typescript
// Encriptar número de tarjeta
const encrypted = cryptoService.encrypt(cardNumber)

// Desencriptar (solo para procesamiento)
const decrypted = cryptoService.decrypt(encrypted)
```

### Validación de Tarjetas
```typescript
// Algoritmo de Luhn
const isValid = validateCardNumber('4111111111111111')
```

### Firmas Bancard
```typescript
// Generar firma MD5
const signature = cryptoService.generateBancardSignature(data, privateKey)

// Verificar firma
const isValid = cryptoService.verifyBancardSignature(data, signature, privateKey)
```

## 📊 Base de Datos

### Modelos Principales

- **Merchants**: Comercios registrados
- **Transactions**: Transacciones de pago
- **PaymentLinks**: Links de pago generados
- **Settlements**: Liquidaciones a comercios
- **AuditLogs**: Registro de auditoría

### Migraciones
```bash
# Crear migración
pnpm db:migrate

# Generar cliente Prisma
pnpm db:generate
```

## 🧪 Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Coverage
pnpm test:cov
```

## 📈 Monitoreo

- Logs estructurados con Winston
- Métricas de transacciones
- Auditoría completa de operaciones
- Alertas de seguridad

## 🚢 Deployment

### Docker
```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

### Variables de Producción
- ✅ Usar secretos seguros para `ENCRYPTION_KEY`
- ✅ Configurar CORS apropiadamente
- ✅ Habilitar rate limiting
- ✅ Configurar SSL/TLS
- ✅ Rotar keys cada 90 días
- ✅ Monitorear logs de seguridad

---

## 🛠️ Comandos Útiles

### Desarrollo
```bash
# Iniciar en modo desarrollo
npm run dev

# Linter
npm run lint

# Formatear código
npm run format

# Build para producción
npm run build
```

### Base de Datos
```bash
cd apps/api

# Generar cliente Prisma
npx prisma generate

# Crear migración
npx prisma migrate dev --name nombre_migracion

# Aplicar migraciones
npx prisma migrate deploy

# Abrir Prisma Studio
npx prisma studio

# Seed con datos de prueba
npx prisma db seed
```

### Docker
```bash
# Iniciar servicios
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f api

# Reiniciar un servicio
docker-compose restart api

# Detener todo
docker-compose down

# Limpiar volúmenes
docker-compose down -v
```

### Stripe CLI (Webhooks locales)
```bash
# Instalar Stripe CLI
# https://stripe.com/docs/stripe-cli

# Escuchar webhooks
stripe listen --forward-to localhost:4000/api/webhooks/stripe

# Trigger eventos de prueba
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
```

### Seguridad
```bash
# Generar key de encriptación
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Escanear vulnerabilidades
npm audit

# Actualizar dependencias
npm update

# Análisis de seguridad con Snyk
npx snyk test
```

---

## 🐛 Solución de Problemas

### Error: "Cannot find module 'stripe'"
```bash
cd apps/api
npm install stripe
```

### Error: "Database connection failed"
```bash
# Verificar que Docker esté corriendo
docker ps

# Reiniciar contenedores
docker-compose restart postgres redis
```

### Error: "Port already in use"
```bash
# Cambiar puerto en apps/api/.env
PORT=4001

# O matar el proceso
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:4000 | xargs kill -9
```

### Error: "Prisma Client not generated"
```bash
cd apps/api
npx prisma generate
```

### Webhooks no funcionan
```bash
# Usar Stripe CLI para webhooks locales
stripe listen --forward-to localhost:4000/api/webhooks/stripe

# Verificar que STRIPE_WEBHOOK_SECRET esté configurado
```

---

## 📊 Monitoreo y Logs

### Ver Logs de la API
```bash
# Logs en tiempo real
docker-compose logs -f api

# Últimas 100 líneas
docker-compose logs --tail=100 api
```

### Métricas de Transacciones
```bash
# Acceder a Prisma Studio
cd apps/api
npx prisma studio

# Ver tabla de transacciones
# http://localhost:5555
```

### Logs de Auditoría
Todos los eventos importantes se registran en la tabla `audit_logs`:
- Intentos de pago
- Cambios de estado
- Accesos a datos sensibles
- Webhooks recibidos

---

## 🔒 Seguridad

### Vulnerabilidades Corregidas
- ✅ Validación de entrada con Luhn y regex
- ✅ Rate limiting (100 req/min)
- ✅ Encriptación AES-256-GCM
- ✅ Verificación de webhooks
- ✅ Detección de fraude
- ✅ Secrets management
- ✅ Logging y auditoría
- ✅ CORS restrictivo
- ✅ Headers de seguridad
- ✅ Sanitización de datos

Ver [SEGURIDAD_CORREGIDA.md](./SEGURIDAD_CORREGIDA.md) para detalles completos.

---

## 🧪 Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov

# Watch mode
npm run test:watch
```

---

## 📈 Roadmap

### Fase 1 (Actual) - MVP
- ✅ Pagos con Stripe
- ✅ Integración Bancard
- ✅ Payment links
- ✅ Webhooks
- ✅ Seguridad básica

### Fase 2 - Q2 2026
- [ ] Autenticación de usuarios
- [ ] Dashboard de comerciantes
- [ ] Reportes y analytics
- [ ] Pagos recurrentes
- [ ] Refunds automáticos

### Fase 3 - Q3 2026
- [ ] Billetera digital
- [ ] QR dinámicos
- [ ] Pagos P2P
- [ ] Multi-moneda
- [ ] App móvil

### Fase 4 - Q4 2026
- [ ] Préstamos express
- [ ] Inversiones
- [ ] Marketplace
- [ ] API pública
- [ ] Expansión regional

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 Licencia

Propietario - Todos los derechos reservados

---

## 🆘 Soporte

### Documentación
- 📖 [Setup Rápido](./SETUP_RAPIDO.md)
- 🔧 [Configuración de APIs](./CONFIGURACION_APIS_PRUEBA.md)
- 🔒 [Seguridad](./SEGURIDAD_CORREGIDA.md)
- 💼 [Plan de Negocio](./PLAN_NEGOCIO_PANAPAGOS.md)

### Contacto
- Email: support@panapagos.com
- Documentación: https://docs.panapagos.com
- Issues: GitHub Issues

---

**Hecho con ❤️ en Paraguay 🇵🇾**
