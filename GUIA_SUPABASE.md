# 🚀 Guía: Migrar a Supabase (PostgreSQL)

## ¿Por qué Supabase?

- ✅ PostgreSQL gratuito (500 MB)
- ✅ Backups automáticos
- ✅ Dashboard visual
- ✅ API REST automática
- ✅ Autenticación incluida
- ✅ Storage de archivos

---

## Paso 1: Crear cuenta en Supabase

1. Ve a https://supabase.com
2. Crea cuenta (gratis)
3. Click en "New Project"
4. Completa:
   - **Name**: panapagos
   - **Database Password**: (guarda esta contraseña)
   - **Region**: South America (São Paulo)
   - Click "Create new project"

⏱️ Espera 2-3 minutos mientras se crea el proyecto

---

## Paso 2: Obtener Connection String

1. En tu proyecto, ve a **Settings** (⚙️ abajo a la izquierda)
2. Click en **Database**
3. Busca la sección **Connection String**
4. Selecciona **URI** (no Pooling)
5. Copia la URL que se ve así:

```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
```

6. Reemplaza `[YOUR-PASSWORD]` con la contraseña que creaste

---

## Paso 3: Configurar en tu proyecto

Abre `apps/api/.env` y actualiza:

```env
DATABASE_URL="postgresql://postgres:TU_PASSWORD_AQUI@db.xxxxxxxxxxxxx.supabase.co:5432/postgres"
```

---

## Paso 4: Ejecutar migraciones

```bash
cd apps/api
npx prisma migrate deploy
npx ts-node prisma/seed.ts
```

---

## Paso 5: Verificar en Supabase

1. Ve a **Table Editor** en Supabase
2. Deberías ver todas tus tablas:
   - merchants
   - transactions
   - users
   - wallets
   - accounts
   - etc.

---

## 🔒 Seguridad

### Variables de entorno en producción

Cuando despliegues (Vercel, Railway, etc.), agrega estas variables:

```env
DATABASE_URL=tu_supabase_url
ENCRYPTION_KEY=genera_uno_nuevo_32_chars
JWT_SECRET=genera_uno_nuevo_32_chars
STRIPE_SECRET_KEY=tu_stripe_key
```

### Generar keys seguras:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📊 Monitoreo

En Supabase Dashboard puedes ver:

- **Database**: Tablas y datos
- **SQL Editor**: Ejecutar queries
- **Logs**: Ver errores
- **Reports**: Uso de recursos

---

## 🆘 Problemas comunes

### Error: "Can't reach database server"
- Verifica que la URL esté correcta
- Verifica que la contraseña no tenga caracteres especiales sin escapar

### Error: "SSL connection required"
Agrega al final de tu DATABASE_URL:
```
?sslmode=require
```

### Migraciones fallan
```bash
# Resetear y volver a migrar
npx prisma migrate reset
npx prisma migrate deploy
```

---

## 💰 Límites del plan gratuito

- 500 MB de base de datos
- 1 GB de transferencia
- 2 GB de storage
- Backups por 7 días

Para PANAPAGOS en desarrollo, esto es más que suficiente.

---

## 🚀 Siguiente paso: Deploy

Una vez que funcione con Supabase, puedes desplegar:

1. **Backend (API)**: Railway, Render, o Fly.io
2. **Frontend (Web)**: Vercel o Netlify

Ambos tienen planes gratuitos generosos.
