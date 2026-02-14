# 🚀 Bienvenido a PanaPagos

## ¿Qué es PanaPagos?

PanaPagos es una plataforma de pagos completa para Paraguay que integra:
- 💳 Pagos con tarjeta (Stripe)
- 🇵🇾 Pagos locales (Bancard)
- 💱 Conversión de monedas en tiempo real
- 🔒 Seguridad bancaria de nivel empresarial
- 📊 Detección de fraude
- 🎨 Diseño premium

---

## ⚡ Inicio en 3 Pasos

### 1. Ejecutar Setup Automático

```bash
node setup.js
```

Este script te guiará para:
- Instalar dependencias
- Configurar Stripe (gratis)
- Generar keys de seguridad
- Iniciar base de datos
- Ejecutar migraciones

### 2. Iniciar Aplicación

```bash
npm run dev
```

### 3. Abrir en el Navegador

- Frontend: http://localhost:3000
- API: http://localhost:4000

---

## 📖 Documentación

### Para Empezar
- 📄 [README.md](./README.md) - Documentación completa
- ⚡ [SETUP_RAPIDO.md](./SETUP_RAPIDO.md) - Guía de 5 minutos
- ✅ [CHECKLIST_CONFIGURACION.md](./CHECKLIST_CONFIGURACION.md) - Checklist paso a paso

### Configuración
- 🔧 [CONFIGURACION_APIS_PRUEBA.md](./CONFIGURACION_APIS_PRUEBA.md) - Todas las APIs gratuitas
- 📝 [RESUMEN_CONFIGURACION.md](./RESUMEN_CONFIGURACION.md) - Resumen de lo configurado

### Seguridad
- 🔒 [SEGURIDAD_CORREGIDA.md](./SEGURIDAD_CORREGIDA.md) - Vulnerabilidades corregidas

### Negocio
- 💼 [PLAN_NEGOCIO_PANAPAGOS.md](./PLAN_NEGOCIO_PANAPAGOS.md) - Plan de negocio
- 🏗️ [ESTRUCTURA_ORGANIZACIONAL_Y_FLUJOS.md](./ESTRUCTURA_ORGANIZACIONAL_Y_FLUJOS.md) - Arquitectura

---

## 🔑 APIs Necesarias (Todas GRATIS)

### 1. Stripe - Pagos con Tarjeta
- **Registro**: https://dashboard.stripe.com/register
- **Plan**: Test Mode (gratis ilimitado)
- **Tiempo**: 2 minutos

### 2. Mailtrap - Emails de Prueba (Opcional)
- **Registro**: https://mailtrap.io/register/signup
- **Plan**: 500 emails/mes gratis
- **Tiempo**: 1 minuto

### 3. Twilio - SMS (Opcional)
- **Registro**: https://www.twilio.com/try-twilio
- **Plan**: $15 crédito gratis
- **Tiempo**: 3 minutos

---

## 🧪 Probar Pagos

### Tarjetas de Prueba Stripe

```
✅ Pago exitoso:
   4242 4242 4242 4242
   Exp: 12/34 | CVV: 123

❌ Pago rechazado:
   4000 0000 0000 0002
   Exp: 12/34 | CVV: 123
```

### Flujo de Prueba

1. Abre http://localhost:3000
2. Crea un payment link
3. Ingresa la tarjeta de prueba
4. Verifica la transacción en Prisma Studio

---

## 🛠️ Comandos Útiles

```bash
# Setup inicial
npm run setup

# Desarrollo
npm run dev

# Base de datos
npm run db:studio      # Abrir Prisma Studio
npm run db:migrate     # Crear migración
npm run db:seed        # Datos de prueba

# Docker
npm run docker:up      # Iniciar servicios
npm run docker:down    # Detener servicios
npm run docker:logs    #