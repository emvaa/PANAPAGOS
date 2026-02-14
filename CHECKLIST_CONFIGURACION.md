# ✅ Checklist de Configuración - PanaPagos

Usa este checklist para asegurarte de que todo esté configurado correctamente.

## 📋 Pre-requisitos

- [ ] Node.js 18+ instalado
  ```bash
  node --version
  ```

- [ ] Docker instalado (opcional pero recomendado)
  ```bash
  docker --version
  ```

- [ ] Git instalado
  ```bash
  git --version
  ```

---

## 🔧 Instalación

- [ ] Repositorio clonado
  ```bash
  git clone <repository-url>
  cd panapagos
  ```

- [ ] Dependencias instaladas
  ```bash
  npm install
  ```

- [ ] Stripe SDK instalado
  ```bash
  cd apps/api
  npm install stripe
  cd ../..
  ```

---

## 🔐 APIs y Credenciales

### Stripe (OBLIGATORIO para pagos)

- [ ] Cuenta de Stripe creada
  - Ir a: https://dashboard.stripe.com/register

- [ ] API Keys obtenidas (modo test)
  - [ ] Secret Key (`sk_test_...`)
  - [ ] Publishable Key (`pk_test_...`)
  - Ubicación: Dashboard > Developers > API Keys

- [ ] Webhook Secret obtenido (opcional)
  - [ ] Webhook Secret (`whsec_...`)
  - Ubicación: Dashboard > Developers > Webhooks
  - Endpoint: `http://localhost:4000/api/webhooks/stripe`
  - Eventos: `payment_intent.succeeded`, `payment_intent.payment_failed`

### Mailtrap (Opcional - para emails)

- [ ] Cuenta de Mailtrap creada
  - Ir a: https://mailtrap.io/register/signup

- [ ] Credenciales SMTP obtenidas
  - [ ] Host: `sandbox.smtp.mailtrap.io`
  - [ ] Port: `2525`
  - [ ] Username
  - [ ] Password

### Twilio (Opcional - para SMS)

- [ ] Cuenta de Twilio creada
  - Ir a: https://www.twilio.com/try-twilio

- [ ] Credenciales obtenidas
  - [ ] Account SID
  - [ ] Auth Token
  - [ ] Phone Number

---

## 🗄️ Base de Datos

### Opción A: Docker (Recomendado)

- [ ] Docker Compose iniciado
  ```bash
  docker-compose up -d
  ```

- [ ] Contenedores corriendo
  ```bash
  docker ps
  # Deberías ver: postgres-panapagos y redis-panapagos
  ```

### Opción B: Servicios en la Nube

- [ ] PostgreSQL configurado
  - [ ] Supabase / Neon / otro
  - [ ] Connection string obtenida

- [ ] Redis configurado
  - [ ] Redis Cloud / otro
  - [ ] Host, Port, Password obtenidos

---

## ⚙️ Variables de Entorno

### Backend (`apps/api/.env`)

- [ ] Archivo creado
  ```bash
  # Debería existir apps/api/.env
  ```

- [ ] Database configurada
  - [ ] `DATABASE_URL` configurada

- [ ] Redis configurado
  - [ ] `REDIS_HOST` configurado
  - [ ] `REDIS_PORT` configurado
  - [ ] `REDIS_PASSWORD` configurado (si aplica)

- [ ] Keys de seguridad generadas
  - [ ] `ENCRYPTION_KEY` (64 caracteres hex)
  - [ ] `LEDGER_PRIVATE_KEY` (64 caracteres hex)
  - [ ] `WEBHOOK_SECRET` (64 caracteres hex)
  - [ ] `JWT_SECRET` (64 caracteres hex)
  
  Generar con:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

- [ ] Stripe configurado
  - [ ] `STRIPE_SECRET_KEY`
  - [ ] `STRIPE_PUBLISHABLE_KEY`
  - [ ] `STRIPE_WEBHOOK_SECRET` (opcional)

- [ ] Email configurado (opcional)
  - [ ] `SMTP_HOST`
  - [ ] `SMTP_PORT`
  - [ ] `SMTP_USER`
  - [ ] `SMTP_PASSWORD`

- [ ] SMS configurado (opcional)
  - [ ] `TWILIO_ACCOUNT_SID`
  - [ ] `TWILIO_AUTH_TOKEN`
  - [ ] `TWILIO_PHONE_NUMBER`

### Frontend (`apps/web/.env.local`)

- [ ] Archivo creado
  ```bash
  # Debería existir apps/web/.env.local
  ```

- [ ] API URL configurada
  - [ ] `NEXT_PUBLIC_API_URL=http://localhost:4000`

- [ ] Stripe configurado
  - [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

---

## 🔄 Migraciones de Base de Datos

- [ ] Cliente Prisma generado
  ```bash
  cd apps/api
  npx prisma generate
  ```

- [ ] Migraciones ejecutadas
  ```bash
  npx prisma migrate deploy
  ```

- [ ] Seed ejecutado (opcional)
  ```bash
  npx prisma db seed
  ```

- [ ] Prisma Studio funciona
  ```bash
  npx prisma studio
  # Debería abrir http://localhost:5555
  ```

---

## 🚀 Iniciar Aplicación

- [ ] API iniciada
  ```bash
  cd apps/api
  npm run dev
  # Debería estar en http://localhost:4000
  ```

- [ ] Frontend iniciado
  ```bash
  cd apps/web
  npm run dev
  # Debería estar en http://localhost:3000
  ```

- [ ] Health check funciona
  ```bash
  curl http://localhost:4000/health
  # Debería retornar: {"status":"ok"}
  ```

---

## 🧪 Pruebas

### Probar API

- [ ] Health check
  ```bash
  curl http://localhost:4000/health
  ```

- [ ] Crear payment link
  ```bash
  curl -X POST http://localhost:4000/api/checkout \
    -H "Content-Type: application/json" \
    -d '{
      "amount": 100000,
      "currency": "PYG",
      "description": "Test Payment"
    }'
  ```

### Probar Pagos con Stripe

- [ ] Abrir frontend: http://localhost:3000

- [ ] Crear un payment link desde el dashboard

- [ ] Probar pago exitoso
  - Tarjeta: `4242 4242 4242 4242`
  - Exp: `12/34`
  - CVV: `123`

- [ ] Probar pago rechazado
  - Tarjeta: `4000 0000 0000 0002`
  - Exp: `12/34`
  - CVV: `123`

- [ ] Verificar transacción en Prisma Studio
  ```bash
  cd apps/api
  npx prisma studio
  # Ver tabla "transactions"
  ```

### Probar Webhooks (Opcional)

- [ ] Stripe CLI instalado
  ```bash
  stripe --version
  ```

- [ ] Webhooks escuchando
  ```bash
  stripe listen --forward-to localhost:4000/api/webhooks/stripe
  ```

- [ ] Trigger evento de prueba
  ```bash
  stripe trigger payment_intent.succeeded
  ```

---

## 🔒 Seguridad

- [ ] Rate limiting activo
  - Verificar en logs: "Rate limit: 100 requests per minute"

- [ ] Encriptación funcionando
  - Verificar que los números de tarjeta en BD estén encriptados

- [ ] Logs de auditoría activos
  - Verificar tabla `audit_logs` en Prisma Studio

- [ ] CORS configurado
  - Solo permite `http://localhost:3000`

- [ ] Headers de seguridad
  - Verificar con: `curl -I http://localhost:4000/health`
  - Debería incluir: `X-Frame-Options`, `X-Content-Type-Options`, etc.

---

## 📊 Monitoreo

- [ ] Logs de API visibles
  ```bash
  docker-compose logs -f api
  ```

- [ ] Logs de base de datos visibles
  ```bash
  docker-compose logs -f postgres
  ```

- [ ] Redis funcionando
  ```bash
  docker-compose logs -f redis
  ```

---

## 🐛 Troubleshooting

### Si algo no funciona:

1. **Verificar logs**
   ```bash
   docker-compose logs -f
   ```

2. **Reiniciar servicios**
   ```bash
   docker-compose restart
   ```

3. **Limpiar y reiniciar**
   ```bash
   docker-compose down -v
   docker-compose up -d
   cd apps/api
   npx prisma migrate deploy
   ```

4. **Verificar variables de entorno**
   ```bash
   cat apps/api/.env
   cat apps/web/.env.local
   ```

5. **Reinstalar dependencias**
   ```bash
   rm -rf node_modules apps/*/node_modules
   npm install
   cd apps/api && npm install stripe && cd ../..
   ```

---

## ✅ Checklist Final

Antes de empezar a desarrollar, verifica que:

- [ ] ✅ API responde en http://localhost:4000
- [ ] ✅ Frontend carga en http://localhost:3000
- [ ] ✅ Puedes crear payment links
- [ ] ✅ Puedes procesar pagos de prueba
- [ ] ✅ Las transacciones se guardan en la BD
- [ ] ✅ Los logs muestran información útil
- [ ] ✅ Prisma Studio funciona
- [ ] ✅ No hay errores en la consola

---

## 🎯 Próximos Pasos

Una vez que todo esté funcionando:

1. [ ] Explorar el código en `apps/api/src`
2. [ ] Revisar los componentes en `apps/web/components`
3. [ ] Leer la documentación de seguridad
4. [ ] Probar diferentes escenarios de pago
5. [ ] Personalizar el diseño
6. [ ] Agregar nuevas funcionalidades

---

## 📚 Recursos

- [Setup Rápido](./SETUP_RAPIDO.md)
- [Configuración de APIs](./CONFIGURACION_APIS_PRUEBA.md)
- [Seguridad](./SEGURIDAD_CORREGIDA.md)
- [Stripe Docs](https://stripe.com/docs)
- [NestJS Docs](https://docs.nestjs.com)
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)

---

**¿Todo listo? ¡Empieza a desarrollar! 🚀**

Si tienes problemas, revisa la sección de [Troubleshooting](#-troubleshooting) o consulta la documentación completa.
