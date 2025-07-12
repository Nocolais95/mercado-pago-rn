import { MercadoPagoService } from './services/MercadoPagoService';

// Exportar tipos
export * from './types';

// Exportar servicios

// Exportar componentes
export { Checkout } from './components/Checkout';
export { CardForm } from './components/CardForm';

// Exportar componentes nativos (recomendados)
export { NativeCheckout } from './components/NativeCheckout';
export { NativeCardForm } from './components/NativeCardForm';

// Exportar configuración por defecto
export const DEFAULT_CONFIG = {
  environment: 'sandbox' as const,
};

// Función de inicialización
export const initializeMercadoPago = (config: {
  publicKey: string;
  accessToken?: string;
  environment?: 'sandbox' | 'production';
}) => {
  return new MercadoPagoService(config);
}; 