import React, { useEffect } from 'react';
import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import {
  CheckoutProps,
  PaymentResult,
  MercadoPagoError,
} from '../types';

const { MercadoPagoModule } = NativeModules;
const mercadoPagoEmitter = new NativeEventEmitter(MercadoPagoModule);

export const NativeCheckout: React.FC<CheckoutProps> = ({
  preference,
  onSuccess,
  onError,
  onCancel,
  onPending,
}) => {
  useEffect(() => {
    // Configurar listeners para eventos nativos
    const successSubscription = mercadoPagoEmitter.addListener(
      'onPaymentSuccess',
      (result: PaymentResult) => {
        onSuccess?.(result);
      }
    );

    const errorSubscription = mercadoPagoEmitter.addListener(
      'onPaymentError',
      (error: MercadoPagoError) => {
        onError?.(error);
      }
    );

    const cancelSubscription = mercadoPagoEmitter.addListener(
      'onPaymentCancel',
      () => {
        onCancel?.();
      }
    );

    const pendingSubscription = mercadoPagoEmitter.addListener(
      'onPaymentPending',
      (result: PaymentResult) => {
        onPending?.(result);
      }
    );

    // Iniciar el checkout nativo
    startNativeCheckout();

    // Cleanup listeners
    return () => {
      successSubscription.remove();
      errorSubscription.remove();
      cancelSubscription.remove();
      pendingSubscription.remove();
    };
  }, []);

  const startNativeCheckout = async () => {
    try {
      if (Platform.OS === 'android') {
        await MercadoPagoModule.startCheckout(preference.id);
      } else if (Platform.OS === 'ios') {
        // Para iOS se implementará después
        console.log('iOS native checkout not implemented yet');
      }
    } catch (error) {
      const mercadoPagoError: MercadoPagoError = {
        message: 'Error al iniciar el checkout nativo',
        error: 'NATIVE_CHECKOUT_ERROR',
        status: 500,
      };
      onError?.(mercadoPagoError);
    }
  };

  // Este componente no renderiza nada visual, solo maneja la lógica nativa
  return null;
}; 