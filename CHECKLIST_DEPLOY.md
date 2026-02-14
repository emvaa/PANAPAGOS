# ✅ Checklist Deploy PANAPAGOS

## 📋 Antes de empezar

- [ ] Cuenta GitHub creada
- [ ] Código subido a GitHub
- [ ] Archivo `.env` NO subido (verificar `.gitignore`)

---

## 1️⃣ SUPABASE (5 minutos)

- [ ] Crear cuenta en https://supabase.com
- [ ] Crear nuevo proyecto "panapagos"
- [ ] Guardar contraseña de la base de datos
- [ ] Copiar `DATABASE_URL` desde Settings → Database → Connection String (URI)
- [ ] Pegar en `.env` local para probar

```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
```

---

## 2️⃣ UPSTASH REDIS (3 minutos)

- [ ] Crear cuenta en https://upstash.com
- [ ] Create Database → Redis
- [ ] Nombre: "panapagos-cache"
- [ ] Region: South America
- [ ] Copiar credenciales:

```env
REDIS_HOST="your-redis.upstash.io"
REDIS_PORT=6379
REDIS_PASSWORD="your-password"
```

---

## 3️⃣ STRIPE (5 minutos)

- [ ] Crear cuenta en https://stripe.com
- [ ] Ir a Developers → API Keys
- [ ] Copiar Publishable key (pk_test_...)
- [ ] Copiar Secret key (sk_test_...)
- [ ] Guardar para después configurar webhooks

```env
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

---

## 4️⃣ GENERAR KEYS DE SEGURIDAD (2 minutos)

Ejecutar 4 veces y guardar cada resultado:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

```env
ENCRYPTION_KEY="resultado1"
LEDGER_PRIVATE_KEY="resultado2"
WEBHOOK_SECRET="resultado3"
JWT_SECRET="resultado4"
```

---

## 5️⃣ RAILWAY - Backend API (10 minutos)

- [ ] Crear cuenta en https://railway.app
- [ ] New Project → Deploy from GitHub
- [ ] Seleccionar repositorio "panapagos"
- [ ] Esperar que detecte el proyecto

### Agregar variables de entorno:

- [ ] `DATABASE_URL` (de Supabase)
- [ ] `REDIS_HOST` (de Upstash)
- [ ] `REDIS_PORT` (6379)
- [ ] `REDIS_PASSWORD` (de Upstash)
- [ ] `ENCRYPTION_KEY` (generada)
- [ ] `LEDGER_PRIVATE_KEY` (generada)
- [ ] `WEBHOOK_SECRET` (generada)
- [ ] `JWT_SECRET` (generada)
- [ ] `STRIPE_SECRET_KEY` (de Stripe)
- [ ] `STRIPE_PUBLISHABLE_KEY` (de Stripe)
- [ ] `PORT` = 4000
- [ ] `NODE_ENV` = production
- [ ] `APP_URL` = (dejar vacío por ahora)
- [ ] `ALLOWED_ORIGINS` = (dejar vacío por ahora)

### Después del deploy:

- [ ] Copiar la URL de Railway (ej: `https://panapagos-api.railway.app`)
- [ ] Probar: `curl https://tu-url.railway.app/health`

---

## 6️⃣ VERCEL - Frontend Web (5 minutos)

- [ ] Crear cuenta en https://vercel.com
- [ ] Import Project → Seleccionar repo
- [ ] Root Directory: `apps/web`
- [ ] Framework Preset: Next.js

### Agregar variables de entorno:

- [ ] `NEXT_PUBLIC_API_URL` = URL de Railway
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = pk_test_...

### Después del deploy:

- [ ] Copiar URL de Vercel (ej: `https://panapagos.vercel.app`)

---

## 7️⃣ ACTUALIZAR CONFIGURACIONES (3 minutos)

### En Railway, actualizar:

- [ ] `APP_URL` = URL de Vercel
- [ ] `ALLOWED_ORIGINS` = URL de Vercel

### En Stripe:

- [ ] Developers → Webhooks → Add endpoint
- [ ] URL: `https://tu-api.railway.app/v1/webhooks/stripe`
- [ ] Eventos: `payment_intent.succeeded`, `payment_intent.payment_failed`
- [ ] Copiar Signing secret (whsec_...)

### En Railway, agregar:

- [ ] `STRIPE_WEBHOOK_SECRET` = whsec_...

---

## 8️⃣ VERIFICAR TODO FUNCIONA (5 minutos)

### API:
- [ ] `curl https://tu-api.railway.app/health` → debe responder

### Frontend:
- [ ] Abrir `https://tu-app.vercel.app`
- [ ] Debe cargar sin errores

### Base de datos:
- [ ] Ir a Supabase → Table Editor
- [ ] Verificar que existen las tablas

### Flujo completo:
- [ ] Crear payment link en el dashboard
- [ ] Abrir link de pago
- [ ] Pagar con tarjeta de prueba: `4242 4242 4242 4242`
- [ ] Verificar transacción en Supabase

---

## 🎉 ¡LISTO!

Tu app está en producción:
- 🌐 Frontend: https://tu-app.vercel.app
- 🔧 API: https://tu-api.railway.app
- 💾 Database: Supabase
- ⚡ Cache: Upstash Redis
- 💳 Pagos: Stripe (test mode)

---

## 📝 Guardar estas URLs

```
Frontend: https://_____________________.vercel.app
API: https://_____________________.railway.app
Supabase: https://app.supabase.com/project/_____
Upstash: https://console.upstash.com/redis/_____
Stripe: https://dashboard.stripe.com
```

---

## 🔄 Para actualizar en el futuro

```bash
git add .
git commit -m "Nueva feature"
git push origin main
```

Railway y Vercel se actualizan automáticamente 🚀

---

## 🆘 Si algo falla

1. **Revisar logs**:
   - Railway: Click en el deploy → View Logs
   - Vercel: Deployments → Click en el deploy → Function Logs

2. **Variables de entorno**:
   - Verificar que todas estén configuradas
   - Sin espacios extra
   - Sin comillas en Railway/Vercel

3. **Base de datos**:
   - Verificar que las migraciones corrieron
   - Railway logs debe mostrar: "Migrations applied successfully"

4. **Redis**:
   - Verificar que Upstash esté activo
   - Probar conexión desde Railway logs
