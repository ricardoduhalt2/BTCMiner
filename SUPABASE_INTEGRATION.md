# BTCMiner - Supabase Integration Guide

## Overview

Este proyecto ha sido completamente integrado con Supabase como base de datos principal. Supabase proporciona una base de datos PostgreSQL en tiempo real con autenticación, APIs automáticas y subscripciones en tiempo real.

## Configuración Completada

### 1. Credenciales de Supabase
Las credenciales ya están configuradas en el archivo `.env`:

```env
VITE_SUPABASE_URL=https://tvnmsaqpyrsbauodpfrh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Estructura de Base de Datos

#### Tablas Principales:
- **users**: Perfiles de usuario con preferencias y configuraciones
- **connected_wallets**: Wallets conectadas por usuario
- **transactions**: Historial de transacciones cross-chain
- **price_data**: Datos de precios en tiempo real
- **price_alerts**: Alertas de precio configuradas por usuarios
- **liquidity_positions**: Posiciones de liquidez de usuarios
- **liquidity_pools**: Pools de liquidez disponibles
- **notifications**: Sistema de notificaciones
- **portfolio_snapshots**: Snapshots del portfolio para análisis histórico
- **trading_history**: Historial de trading
- **bridge_transfers**: Transferencias cross-chain
- **analytics_events**: Eventos de analytics

### 3. Servicios Implementados

#### Servicios de Supabase (`frontend/src/services/supabaseService.ts`):
- `UserService`: Gestión de usuarios
- `ConnectedWalletsService`: Gestión de wallets
- `TransactionsService`: Gestión de transacciones
- `PriceDataService`: Datos de precios
- `PriceAlertsService`: Alertas de precio
- `LiquidityPositionsService`: Posiciones de liquidez
- `LiquidityPoolsService`: Pools de liquidez
- `NotificationsService`: Notificaciones
- `PortfolioSnapshotsService`: Snapshots de portfolio
- `TradingHistoryService`: Historial de trading
- `BridgeTransfersService`: Transferencias bridge
- `AnalyticsEventsService`: Eventos de analytics

#### API Integration (`frontend/src/services/api.ts`):
- RTK Query endpoints integrados con Supabase
- Caché automático y invalidación de tags
- Manejo de errores centralizado

### 4. Hooks Personalizados

#### `useSupabaseAuth` (`frontend/src/hooks/useSupabaseAuth.ts`):
- Autenticación con wallets
- Gestión de sesiones
- Creación automática de perfiles de usuario
- Actualización de perfiles

### 5. Tipos TypeScript

#### Tipos de Supabase (`frontend/src/types/supabase.ts`):
- Tipos generados automáticamente para todas las tablas
- Interfaces para Insert, Update y Select operations
- Enums para valores constantes

## Instalación y Configuración

### 1. Instalar Dependencias de Supabase

```bash
cd frontend
npm install @supabase/supabase-js
```

### 2. Ejecutar Migraciones SQL

1. Ve a tu proyecto en [supabase.com](https://supabase.com)
2. Navega a SQL Editor
3. Copia y pega el contenido completo de `supabase_migrations.sql`
4. Ejecuta el script

### 3. Configurar Row Level Security (RLS)

El script SQL ya incluye políticas de RLS que:
- Permiten a los usuarios acceder solo a sus propios datos
- Proporcionan acceso público a datos de precios y pools de liquidez
- Permiten al service role gestionar datos del sistema

## Funcionalidades Implementadas

### 1. Autenticación con Wallets
```typescript
const { signInWithWalletAddress, user, userProfile } = useSupabaseAuth();

// Autenticar con wallet
await signInWithWalletAddress(walletAddress, signature, message);
```

### 2. Gestión de Wallets
```typescript
// Agregar wallet
const wallet = await ConnectedWalletsService.addWallet({
  user_id: userId,
  wallet_type: 'metamask',
  address: '0x...',
  chain_id: 1,
  chain_name: 'Ethereum'
});

// Obtener wallets del usuario
const wallets = await ConnectedWalletsService.getUserWallets(userId);
```

### 3. Transacciones
```typescript
// Crear transacción
const transaction = await TransactionsService.createTransaction({
  user_id: userId,
  hash: '0x...',
  type: 'bridge',
  status: 'pending',
  from_chain: 'ethereum',
  to_chain: 'bsc',
  amount: '100',
  token_symbol: 'BTM'
});

// Actualizar estado
await TransactionsService.updateTransactionStatus(transactionId, 'completed');
```

### 4. Notificaciones en Tiempo Real
```typescript
// El servicio se suscribe automáticamente a notificaciones
// Las notificaciones aparecen automáticamente en la UI
```

### 5. Datos de Precios
```typescript
// Obtener precios actuales
const prices = await PriceDataService.getLatestPrices(['BTM']);

// Obtener historial de precios
const history = await PriceDataService.getPriceHistory('BTM', '24H');
```

### 6. Alertas de Precio
```typescript
// Crear alerta
const alert = await PriceAlertsService.createAlert({
  user_id: userId,
  symbol: 'BTM',
  condition: 'above',
  target_price: 0.003
});
```

## Subscripciones en Tiempo Real

### 1. Notificaciones
```typescript
NotificationsService.subscribeToNotifications(userId, (payload) => {
  // Manejar nueva notificación
});
```

### 2. Transacciones
```typescript
TransactionsService.subscribeToTransactionUpdates(userId, (payload) => {
  // Manejar actualización de transacción
});
```

### 3. Wallets
```typescript
ConnectedWalletsService.subscribeToWalletChanges(userId, (payload) => {
  // Manejar cambios en wallets
});
```

## Seguridad

### 1. Row Level Security (RLS)
- Todos los datos de usuario están protegidos por RLS
- Los usuarios solo pueden acceder a sus propios datos
- Políticas específicas para cada tabla

### 2. Autenticación
- Autenticación basada en firmas de wallet
- Sesiones seguras con JWT
- Renovación automática de tokens

### 3. Validación de Datos
- Validación en el cliente y servidor
- Tipos TypeScript estrictos
- Manejo de errores centralizado

## Monitoreo y Analytics

### 1. Eventos de Analytics
```typescript
// Trackear evento
await AnalyticsEventsService.trackEvent({
  user_id: userId,
  event_type: 'wallet_connected',
  event_data: { wallet_type: 'metamask', chain_id: 1 }
});
```

### 2. Snapshots de Portfolio
```typescript
// Crear snapshot
await PortfolioSnapshotsService.createSnapshot({
  user_id: userId,
  total_value: 1000,
  total_tokens: 500,
  active_chains: 3,
  connected_wallets: 2
});
```

## Mantenimiento

### 1. Limpieza Automática
La función `cleanup_old_data()` elimina automáticamente:
- Datos de precios > 1 año
- Eventos de analytics > 6 meses  
- Notificaciones leídas > 3 meses
- Snapshots antiguos (mantiene mensuales)

### 2. Índices de Performance
Todos los índices necesarios están creados para:
- Consultas por usuario
- Búsquedas por fecha
- Filtros por estado
- Joins entre tablas

## Próximos Pasos

1. **Ejecutar las migraciones SQL** en Supabase
2. **Instalar dependencias** de Supabase
3. **Configurar autenticación** en la aplicación
4. **Probar funcionalidades** en desarrollo
5. **Configurar backups** automáticos en Supabase
6. **Monitorear performance** y optimizar consultas

## Soporte

Para cualquier problema con la integración de Supabase:
1. Revisar logs en Supabase Dashboard
2. Verificar políticas de RLS
3. Comprobar configuración de variables de entorno
4. Revisar documentación de Supabase: https://supabase.com/docs