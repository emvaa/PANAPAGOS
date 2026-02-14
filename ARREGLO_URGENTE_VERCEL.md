# 🚨 ARREGLO URGENTE - CONFIGURAR VERCEL

## EL PROBLEMA
Vercel no tiene configuradas las variables de entorno, por eso el frontend no puede conectarse al backend.

## SOLUCIÓN (2 MINUTOS)

### PASO 1: Ir a Vercel
1. Abrí: https://vercel.com/dashboard
2. Buscá tu proyecto "panapagos-web" o similar
3. Click en el proyecto

### PASO 2: Configurar Root Directory
1. Click en "Settings" (arriba)
2. Click en "General" (menú izquierdo)
3. Buscá "Root Directory"
4. Cambiá de `.` a `apps/web`
5. Click "Save"

### PASO 3: Agregar Variables de Entorno
1. Click en "Environment Variables" (menú izquierdo)
2. Agregá estas 2 variables:

**Variable 1:**
- Key: `NEXT_PUBLIC_API_URL`
- Value: `https://panapagos.onrender.com`
- Environments: Production, Preview, Development (marcar todas)
- Click "Save"

**Variable 2:**
- Key: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Value: `pk_test_51T0nEIIiJEr1yOQ0aIFJl0fVSpGMhpTQERsgwVcBvGN4J0loa3LbzWTnHL7rnJgBoLP0GxkxJBPHjVh4GPJKgLtQ00vJ1BudIA`
- Environments: Production, Preview, Development (marcar todas)
- Click "Save"

### PASO 4: Forzar Redeploy
1. Click en "Deployments" (arriba)
2. Buscá el último deployment (el primero de la lista)
3. Click en los 3 puntitos "..." a la derecha
4. Click "Redeploy"
5. Marcar "Use existing Build Cache" (DESMARCAR esto)
6. Click "Redeploy"

### PASO 5: Esperar (1-2 minutos)
Vercel va a hacer el build y deploy. Vas a ver:
- Building... (30 segundos)
- Deploying... (30 segundos)
- Ready ✅

---

## ALTERNATIVA RÁPIDA (SI NO QUERÉS CONFIGURAR)

El código ya tiene fallback a la URL de producción, pero Vercel está usando una versión vieja.

**Opción A**: Esperá 2-3 minutos más a que Vercel detecte el nuevo commit y haga el redeploy automático.

**Opción B**: Hacé los pasos de arriba para forzarlo YA.

---

## VERIFICAR QUE FUNCIONA

Después del redeploy:
1. Abrí: https://panapagos-web.vercel.app/dashboard
2. Click "Crear Cobro"
3. Llenar formulario
4. Click "Generar Link y QR"
5. ✅ Debería funcionar

---

## SI SIGUE SIN FUNCIONAR

Abrí la consola del navegador (F12) y fijate qué URL está llamando:
- ❌ Si dice `http://localhost:4000` → Vercel no actualizó
- ✅ Si dice `https://panapagos.onrender.com` → Está bien

Si dice localhost, esperá 1 minuto más o forzá el redeploy desde Vercel.
