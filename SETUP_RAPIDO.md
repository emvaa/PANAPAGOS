# 🚀 Setup Rápido - PanaPagos

Guía de 5 minutos para tener PanaPagos funcionando en modo desarrollo.

## ⚡ Inicio Rápido

### 1. Instalar Dependencias

```bash
# Instalar dependencias del proyecto
npm install

# Instalar Stripe SDK (necesario para pagos)
cd apps/api
npm install stripe
cd ../..

# Instalar dependencias del frontend
cd apps/web
npm install
cd ../..
```

### 2. Configurar Base de Datos y Redis con Docker

```bash
# Iniciar PostgreSQL y Redis
docker-compose up -d

# Verificar que estén corriendo
docker ps
```

### 3. Configurar Variables de Entorno

#### Backend (`apps/api/.env`)

```bash
# Copiar el archivo de ejemplo
cp apps/api/.env apps/api/.env.backup
```

Edita `apps/api/.env` y agrega tus keys de Stripe:

```env
# Obtén estas keys en: https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY="sk_test_TU_KEY_AQUI"
STRIPE_PUBLISHABLE_KEY="pk_test_TU_KEY_AQUI"
STRIPE_WEBHOOK_SECRET="whsec_TU_SECRET_AQUI"
```

#### Frontend (`apps/web/.env.local`)

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_TU_KEY_AQUI"
```

### 4. Migrar Base de Datos

```bash
cd apps/api

# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate deploy

# Seed con datos de prueba (opcional)
npx prisma db seed

cd ../..
```

### 5. Iniciar Aplicación

```bash
# Desde la raíz del proyecto
npm run dev
```

Esto iniciará:
- 🔧 API en http://localhost:4000
- 🌐 Web en http://localhost:3000

## 🧪 Probar Pagos

### Tarjetas de Prueba Stripe

```
✅ Pago exitoso:
   4242 4242 4242 4242
   Exp: 12/34 | CVV: 123

❌ Pago rechazado:
   4000 0000 0000 0002
   Exp: 12/34 | CVV: 123

💰 Fondos insuficientes:
   4000 0000 0000 9995
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

## 🔐 Obtener API Keys GRATIS

### Stripe (Pagos)
1. Ve a https://dashboard.stripe.com/register
2. Completa el registro
3. Ve a **Developers > API Keys**
4. Copia las keys de **Test mode**
5. Pégalas en tu `.env`

### Mailtrap (Emails - Opcional)
1. Ve a https://mailtrap.io/register/signup
2. Crea un inbox
3. Copia las credenciales SMTP
4. Agrégalas a tu `.env`

### Twilio (SMS - Opcional)
1. Ve a https://www.twilio.com/try-twilio
2. Obtén $15 de crédito gratis
3. Copia Account SID y Auth Token
4. Agrégalos a tu `.env`

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
docker-compose restart
```

### Error: "Port 4000 already in use"
```bash
# Cambiar puerto en apps/api/.env
PORT=4001
```

### Error: "Prisma Client not generated"
```bash
cd apps/api
npx prisma generate
```

## 📚 Documentación Completa

- [Configuración de APIs](./CONFIGURACION_APIS_PRUEBA.md) - Guía detallada de todas las APIs
- [Plan de Negocio](./PLAN_NEGOCIO_PANAPAGOS.md) - Visión y estrategia
- [Estructura](./ESTRUCTURA_ORGANIZACIONAL_Y_FLUJOS.md) - Arquitectura del sistema

## 🎯 Próximos Pasos

1. ✅ Configurar Stripe
2. ✅ Probar pagos con tarjetas de prueba
3. ✅ Explorar el dashboard en http://localhost:3000
4. 📱 Probar generación de QR
5. 💸 Crear payment links
6. 🔒 Revisar logs de seguridad

## 💡 Tips

- Usa **Stripe CLI** para probar webhooks localmente:
  ```bash
  stripe listen --forward-to localhost:4000/api/webhooks/stripe
  ```

- Monitorea logs en tiempo real:
  ```bash
  docker-compose logs -f api
  ```

- Accede a la base de datos:
  ```bash
  cd apps/api
  npx prisma studio
  ```

## 🆘 Ayuda

¿Problemas? Revisa:
1. Logs de Docker: `docker-compose logs`
2. Logs de la API: En la terminal donde corre `npm run dev`
3. Variables de entorno: Verifica que estén todas configuradas
4. Documentación de Stripe: https://stripe.com/docs

---

**¡Listo para desarrollar! 🚀**
