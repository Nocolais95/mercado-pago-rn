import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
} from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import {
  CheckoutProps,
  PaymentResult,
  MercadoPagoError,
} from '../types';

export const Checkout: React.FC<CheckoutProps> = ({
  preference,
  onSuccess,
  onError,
  onCancel,
  onPending,
  style,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [webViewKey, setWebViewKey] = useState(0);
  const webViewRef = useRef<WebView>(null);

  // URL de checkout basada en el ambiente
  const checkoutUrl = preference.initPoint || preference.sandboxInitPoint;

  useEffect(() => {
    if (!checkoutUrl) {
      const error: MercadoPagoError = {
        message: 'URL de checkout no disponible',
        error: 'INVALID_CHECKOUT_URL',
        status: 400,
      };
      onError?.(error);
    }
  }, [checkoutUrl, onError]);

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    const { url } = navState;

    // Manejar URLs de retorno de Mercado Pago
    if (url.includes('success')) {
      handleSuccess(url);
    } else if (url.includes('failure')) {
      handleFailure(url);
    } else if (url.includes('pending')) {
      handlePending(url);
    } else if (url.includes('cancel')) {
      handleCancel();
    }

    // Ocultar loading cuando la página esté cargada
    if (navState.loading === false) {
      setIsLoading(false);
    }
  };

  const handleSuccess = (url: string) => {
    try {
      // Extraer parámetros de la URL
      const urlParams = new URLSearchParams(url.split('?')[1]);
      const paymentId = urlParams.get('payment_id');
      const status = urlParams.get('status');
      const externalReference = urlParams.get('external_reference');

      if (paymentId) {
        const result: PaymentResult = {
          id: paymentId,
          status: status || 'approved',
          statusDetail: 'approved',
          paymentMethodId: '',
          paymentTypeId: '',
          transactionAmount: 0,
          transactionAmountRefunded: 0,
          currencyId: '',
          description: '',
          dateCreated: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          collectorId: 0,
          installments: 1,
          transactionDetails: {
            netReceivedAmount: 0,
            totalPaidAmount: 0,
          },
          feeDetails: [],
          chargesDetails: [],
          captured: true,
          binaryMode: false,
          refunds: [],
          operationType: 'regular_payment',
          order: {
            id: 0,
            type: 'mercadopago',
          },
          card: {
            lastFourDigits: '',
            firstSixDigits: '',
            expirationYear: 0,
            expirationMonth: 0,
            dateCreated: new Date().toISOString(),
            dateLastUpdated: new Date().toISOString(),
            cardholder: {
              name: '',
              identification: {
                type: '',
                number: '',
              },
            },
          },
          externalReference: externalReference || undefined,
        };

        onSuccess?.(result);
      }
    } catch (error) {
      const mercadoPagoError: MercadoPagoError = {
        message: 'Error al procesar el pago exitoso',
        error: 'SUCCESS_PROCESSING_ERROR',
        status: 500,
      };
      onError?.(mercadoPagoError);
    }
  };

  const handleFailure = (url: string) => {
    try {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      const error = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');

      const mercadoPagoError: MercadoPagoError = {
        message: errorDescription || 'Error en el pago',
        error: error || 'PAYMENT_FAILED',
        status: 400,
      };

      onError?.(mercadoPagoError);
    } catch (error) {
      const mercadoPagoError: MercadoPagoError = {
        message: 'Error al procesar el fallo del pago',
        error: 'FAILURE_PROCESSING_ERROR',
        status: 500,
      };
      onError?.(mercadoPagoError);
    }
  };

  const handlePending = (url: string) => {
    try {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      const paymentId = urlParams.get('payment_id');
      const externalReference = urlParams.get('external_reference');

      if (paymentId) {
        const result: PaymentResult = {
          id: paymentId,
          status: 'pending',
          statusDetail: 'pending_waiting_payment',
          paymentMethodId: '',
          paymentTypeId: '',
          transactionAmount: 0,
          transactionAmountRefunded: 0,
          currencyId: '',
          description: '',
          dateCreated: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          collectorId: 0,
          installments: 1,
          transactionDetails: {
            netReceivedAmount: 0,
            totalPaidAmount: 0,
          },
          feeDetails: [],
          chargesDetails: [],
          captured: false,
          binaryMode: false,
          refunds: [],
          operationType: 'regular_payment',
          order: {
            id: 0,
            type: 'mercadopago',
          },
          card: {
            lastFourDigits: '',
            firstSixDigits: '',
            expirationYear: 0,
            expirationMonth: 0,
            dateCreated: new Date().toISOString(),
            dateLastUpdated: new Date().toISOString(),
            cardholder: {
              name: '',
              identification: {
                type: '',
                number: '',
              },
            },
          },
          externalReference: externalReference || undefined,
        };

        onPending?.(result);
      }
    } catch (error) {
      const mercadoPagoError: MercadoPagoError = {
        message: 'Error al procesar el pago pendiente',
        error: 'PENDING_PROCESSING_ERROR',
        status: 500,
      };
      onError?.(mercadoPagoError);
    }
  };

  const handleCancel = () => {
    onCancel?.();
  };

  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.warn('WebView error: ', nativeEvent);

    const mercadoPagoError: MercadoPagoError = {
      message: 'Error al cargar el checkout',
      error: 'WEBVIEW_ERROR',
      status: 500,
    };

    onError?.(mercadoPagoError);
  };

  const handleLoadStart = () => {
    setIsLoading(true);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const injectedJavaScript = `
    // Inyectar JavaScript para manejar eventos de Mercado Pago
    (function() {
      // Interceptar clicks en botones de cancelar
      document.addEventListener('click', function(e) {
        if (e.target && e.target.textContent && e.target.textContent.toLowerCase().includes('cancelar')) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'cancel'
          }));
        }
      });

      // Interceptar formularios de pago
      document.addEventListener('submit', function(e) {
        if (e.target && e.target.tagName === 'FORM') {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'form_submit',
            formData: new FormData(e.target)
          }));
        }
      });

      // Notificar cuando la página esté lista
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'page_ready'
      }));
    })();
  `;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      switch (data.type) {
        case 'cancel':
          handleCancel();
          break;
        case 'form_submit':
          // Manejar envío de formulario si es necesario
          break;
        case 'page_ready':
          setIsLoading(false);
          break;
      }
    } catch (error) {
      console.warn('Error parsing WebView message:', error);
    }
  };

  if (!checkoutUrl) {
    return (
      <View style={[styles.container, style]}>
        <ActivityIndicator size="large" color="#009EE3" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, style]}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#009EE3" />
        </View>
      )}
      
      <WebView
        ref={webViewRef}
        key={webViewKey}
        source={{ uri: checkoutUrl }}
        style={styles.webview}
        onNavigationStateChange={handleNavigationStateChange}
        onError={handleError}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onMessage={handleMessage}
        injectedJavaScript={injectedJavaScript}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        mixedContentMode="compatibility"
        userAgent="MercadoPagoReactNative/1.0"
        onShouldStartLoadWithRequest={(request) => {
          // Permitir solo URLs de Mercado Pago
          const allowedDomains = [
            'mercadopago.com',
            'mercadopago.com.ar',
            'mercadopago.com.br',
            'mercadopago.com.mx',
            'mercadopago.com.co',
            'mercadopago.com.pe',
            'mercadopago.com.uy',
            'mercadopago.com.ve',
            'mercadopago.com.cl',
            'mercadopago.com.ec',
            'mercadopago.com.gt',
            'mercadopago.com.hn',
            'mercadopago.com.ni',
            'mercadopago.com.py',
            'mercadopago.com.sv',
            'mercadopago.com.bo',
            'mercadopago.com.cr',
            'mercadopago.com.do',
            'mercadopago.com.pa',
          ];

          const url = request.url.toLowerCase();
          const isAllowed = allowedDomains.some(domain => url.includes(domain));
          
          if (!isAllowed) {
            console.warn('URL no permitida:', request.url);
            return false;
          }

          return true;
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1000,
  },
}); 