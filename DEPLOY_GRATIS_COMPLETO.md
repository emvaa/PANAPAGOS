# 🚀 Deploy GRATIS Completo - PANAPAGOS

## 📋 Checklist de servicios necesarios

### ✅ Ya tienes configurado:
- [x] Código fuente
- [x] Estructura del proyecto

### 🔧 Necesitas configurar (TODO GRATIS):

1. **Base de datos** → Supabase (PostgreSQL)
2. **Cache** → Upstash Redis
3. **Backend API** → Railway o Render
4. **Frontend Web** → Vercel
5. **Pagos** → Stripe (modo test)
6. **Email** → Resend o Mailtrap

---

## 1️⃣ SUPABASE (Base de datos PostgreSQL)

### Plan gratuito:
- 500 MB de base de datos
- 1 GB de transferencia/mes
- Backups automáticos

### Pasos:
1. Ir a https://supabase.com
2. Crear cuenta y proyecto
3. Copiar `DATABASE_URL` de Settings → Database
4. Pegar en `.env`

```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
```

---

## 2️⃣ UPSTASH REDIS (Cache)

### Plan gratuito:
- 10,000 comandos/día
- 256 MB de memoria
- Perfecto para rate limiting y cache

### Pasos:
1. Ir a https://upstash.com
2. Crear cuenta
3. Create Database → Redis
4. Copiar credenciales:

```env
REDIS_HOST="your-redis.upstash.io"
REDIS_PORT=6379
REDIS_PASSWORD="your-password-here"
```

**IMPORTANTE**: Upstash usa TLS, actualiza el código:

```typescript
// apps/api/src/infrastructure/cache/redis.service.ts
this.client = new Redis({
  host: this.configService.get('REDIS_HOST'),
  port: this.configService.get('REDIS_PORT', 6379),
  password: this.configService.get('REDIS_PASSWORD'),
  tls: {}, // ← Agregar esto para Upstash
})
```

---

## 3️⃣ RAILWAY (Backend API)

### Plan gratuito:
- $5 de crédito/mes (suficiente para desarrollo)
- Deploy automático desde GitHub
- Variables de entorno fáciles

### Pasos:

1. **Preparar el proyecto**:
   - Crear cuenta en https://railway.app
   - Conectar con GitHub

2. **Crear `railway.json`** en la raíz:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd apps/api && npm install && npx prisma generate && npm run build"
  },
  "deploy": {
    "startCommand": "cd apps/api && npx prisma migrate deploy && npm run start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

3. **En Railway Dashboard**:
   - New Project → Deploy from GitHub
   - Seleccionar tu repo
   - Agregar variables de entorno (ver abajo)

4. **Variables de entorno en Railway**:

```env
DATABASE_URL=tu_supabase_url
REDIS_HOST=tu_upstash_host
REDIS_PORT=6379
REDIS_PASSWORD=tu_upstash_password
ENCRYPTION_KEY=genera_32_chars_random
LEDGER_PRIVATE_KEY=genera_32_chars_random
WEBHOOK_SECRET=genera_32_chars_random
JWT_SECRET=genera_32_chars_random
STRIPE_SECRET_KEY=sk_test_tu_key
STRIPE_PUBLISHABLE_KEY=pk_test_tu_key
APP_URL=https://tu-app.vercel.app
PORT=4000
NODE_ENV=production
ALLOWED_ORIGINS=https://tu-app.vercel.app
```

5. **Generar keys seguras**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 4️⃣ VERCEL (Frontend Web)

### Plan gratuito:
- 100 GB de ancho de banda/mes
- Deploy automático desde GitHub
- SSL gratis
- CDN global

### Pasos:

1. **Preparar `vercel.json`** en `apps/web/`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "npm install"
}
```

2. **Crear cuenta en https://vercel.com**
   - Conectar con GitHub

3. **Import Project**:
   - Seleccionar tu repo
   - Root Directory: `apps/web`
   - Framework: Next.js
   - Click Deploy

4. **Variables de entorno en Vercel**:

```env
NEXT_PUBLIC_API_URL=https://tu-api.railway.app
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_tu_key
```

---

## 5️⃣ STRIPE (Pagos - Modo Test)

### Plan gratuito:
- Modo test 100% gratis
- Sin límites de transacciones
- Tarjetas de prueba ilimitadas

### Pasos:

1. Ir a https://stripe.com
2. Crear cuenta
3. Ir a Developers → API Keys
4. Copiar:
   - **Publishable key** (pk_test_...)
   - **Secret key** (sk_test_...)

5. Para webhooks:
   - Developers → Webhooks
   - Add endpoint: `https://tu-api.railway.app/v1/webhooks/stripe`
   - Eventos: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copiar **Signing secret** (whsec_...)

### Tarjetas de prueba:
```
Éxito: 4242 4242 4242 4242
Falla: 4000 0000 0000 0002
3D Secure: 4000 0027 6000 3184
Fecha: Cualquier fecha futura
CVC: Cualquier 3 dígitos
```

---

## 6️⃣ RESEND (Email - Opcional)

### Plan gratuito:
- 100 emails/día
- 3,000 emails/mes
- Sin tarjeta de crédito

### Pasos:

1. Ir a https://resend.com
2. Crear cuenta
3. API Keys → Create
4. Copiar key

```env
RESEND_API_KEY=re_tu_key_aqui
```

**Alternativa**: Mailtrap (solo para testing)
- https://mailtrap.io
- 500 emails/mes gratis

---

## 📦 Archivos necesarios para deploy

### 1. `.gitignore` (raíz del proyecto):

```gitignore
node_modules/
.env
.env.local
.next/
dist/
*.db
*.db-journal
.DS_Store
```

### 2. `package.json` (raíz) - Agregar scripts:

```json
{
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "start": "turbo run start",
    "deploy:api": "cd apps/api && npm run build && npm run start",
    "deploy:web": "cd apps/web && npm run build && npm run start"
  }
}
```

### 3. `apps/api/package.json` - Verificar scripts:

```json
{
  "scripts": {
    "dev": "nest start --watch",
    "build": "nest build",
    "start": "node dist/main",
    "migrate": "prisma migrate deploy",
    "seed": "ts-node prisma/seed.ts"
  }
}
```

---

## 🔄 Flujo de Deploy

### Primera vez:

1. **Configurar Supabase** → Obtener DATABASE_URL
2. **Configurar Upstash Redis** → Obtener credenciales
3. **Configurar Stripe** → Obtener API keys
4. **Push a GitHub**:
   ```bash
   git add .
   git commit -m "Ready for deploy"
   git push origin main
   ```

5. **Deploy Backend en Railway**:
   - Conectar repo
   - Agregar variables de entorno
   - Deploy automático

6. **Deploy Frontend en Vercel**:
   - Conectar repo
   - Configurar root directory: `apps/web`
   - Agregar variables de entorno
   - Deploy automático

### Actualizaciones futuras:

```bash
git add .
git commit -m "Nueva feature"
git push origin main
```

Railway y Vercel se actualizan automáticamente 🎉

---

## 🧪 Testing después del deploy

### 1. Verificar API:
```bash
curl https://tu-api.railway.app/health
```

### 2. Verificar Frontend:
Abrir https://tu-app.vercel.app

### 3. Probar flujo completo:
1. Crear payment link
2. Abrir link de pago
3. Usar tarjeta de prueba Stripe: `4242 4242 4242 4242`
4. Verificar transacción en Supabase

---

## 💰 Costos mensuales (TODO GRATIS)

| Servicio | Plan | Costo |
|----------|------|-------|
| Supabase | Free | $0 |
| Upstash Redis | Free | $0 |
| Railway | $5 crédito/mes | $0 |
| Vercel | Hobby | $0 |
| Stripe | Test mode | $0 |
| Resend | Free | $0 |
| **TOTAL** | | **$0/mes** |

---

## 🚨 Límites a considerar

### Supabase:
- 500 MB de datos
- 1 GB transferencia/mes
- **Solución**: Limpiar datos viejos, optimizar queries

### Railway:
- $5 crédito/mes (~500 horas)
- **Solución**: Usar sleep mode cuando no se use

### Vercel:
- 100 GB ancho de banda/mes
- **Solución**: Optimizar imágenes, usar CDN

### Upstash:
- 10,000 comandos/día
- **Solución**: Usar TTL cortos, limpiar cache

---

## 🎯 Próximos pasos

1. ✅ Configurar Supabase
2. ✅ Configurar Upstash Redis
3. ✅ Configurar Stripe (test mode)
4. ✅ Push a GitHub
5. ✅ Deploy en Railway (API)
6. ✅ Deploy en Vercel (Web)
7. ✅ Probar flujo completo
8. 🎉 ¡PANAPAGOS en producción!

---

## 📚 Recursos útiles

- [Supabase Docs](https://supabase.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [Stripe Test Cards](https://stripe.com/docs/testing)
- [Upstash Redis](https://docs.upstash.com/redis)

---

## 🆘 Soporte

Si algo falla:
1. Revisar logs en Railway/Vercel
2. Verificar variables de entorno
3. Probar endpoints con Postman
4. Revisar Supabase logs
