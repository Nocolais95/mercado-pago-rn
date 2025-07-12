import React, { useEffect } from 'react';
import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import {
  CardFormProps,
  CardData,
  MercadoPagoError,
} from '../types';

const { MercadoPagoModule } = NativeModules;
const mercadoPagoEmitter = new NativeEventEmitter(MercadoPagoModule);

export const NativeCardForm: React.FC<CardFormProps> = ({
  onCardDataChange,
  onCardValid,
  onSubmit,
  onCancel,
  theme = 'light',
  showSecurityCode = true,
  showCardholderName = true,
  showIdentification = false,
  allowedPaymentMethods = [],
  excludedPaymentMethods = [],
}) => {
  useEffect(() => {
    // Configurar listeners para eventos nativos del formulario de tarjeta
    const cardDataSubscription = mercadoPagoEmitter.addListener(
      'onCardDataChange',
      (cardData: CardData) => {
        onCardDataChange?.(cardData);
      }
    );

    const cardValidSubscription = mercadoPagoEmitter.addListener(
      'onCardValid',
      (isValid: boolean) => {
        onCardValid?.(isValid);
      }
    );

    const cardSubmitSubscription = mercadoPagoEmitter.addListener(
      'onCardSubmit',
      (cardData: CardData) => {
        onSubmit?.(cardData);
      }
    );

    const cardCancelSubscription = mercadoPagoEmitter.addListener(
      'onCardCancel',
      () => {
        onCancel?.();
      }
    );

    const cardErrorSubscription = mercadoPagoEmitter.addListener(
      'onCardError',
      (error: MercadoPagoError) => {
        console.error('Card form error:', error);
      }
    );

    // Iniciar el formulario nativo de tarjeta
    startNativeCardForm();

    // Cleanup listeners
    return () => {
      cardDataSubscription.remove();
      cardValidSubscription.remove();
      cardSubmitSubscription.remove();
      cardCancelSubscription.remove();
      cardErrorSubscription.remove();
    };
  }, []);

  const startNativeCardForm = async () => {
    try {
      if (Platform.OS === 'android') {
        await MercadoPagoModule.startCardForm();
      } else if (Platform.OS === 'ios') {
        // Para iOS se implementará después
        console.log('iOS native card form not implemented yet');
      }
    } catch (error) {
      const mercadoPagoError: MercadoPagoError = {
        message: 'Error al iniciar el formulario nativo de tarjeta',
        error: 'NATIVE_CARD_FORM_ERROR',
        status: 500,
      };
      console.error('Error starting native card form:', error);
    }
  };

  // Este componente no renderiza nada visual, solo maneja la lógica nativa
  return null;
}; 