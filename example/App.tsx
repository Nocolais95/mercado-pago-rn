import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import {
  initializeMercadoPago,
  Checkout,
  CardForm,
  MercadoPagoService,
  PaymentPreference,
} from '../src';

const App = () => {
  const [showCheckout, setShowCheckout] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Inicializar Mercado Pago (reemplaza con tus credenciales reales)
  const mercadoPago = initializeMercadoPago({
    publicKey: 'TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    accessToken: 'TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    environment: 'sandbox',
  });

  // Ejemplo de preferencia de pago
  const preference: PaymentPreference = {
    id: 'preference_id',
    initPoint: 'https://www.mercadopago.com/checkout/v1/redirect?pref_id=preference_id',
    sandboxInitPoint: 'https://www.mercadopago.com/checkout/v1/redirect?pref_id=preference_id',
    items: [
      {
        id: 'item-1',
        title: 'Producto de ejemplo',
        description: 'Descripción del producto',
        quantity: 1,
        unitPrice: 100,
        currencyId: 'ARS',
      },
    ],
    payer: {
      name: 'Juan',
      surname: 'Pérez',
      email: 'juan.perez@example.com',
      phone: {
        areaCode: '11',
        number: '12345678',
      },
      identification: {
        type: 'DNI',
        number: '12345678',
      },
    },
    backUrls: {
      success: 'https://tu-app.com/success',
      failure: 'https://tu-app.com/failure',
      pending: 'https://tu-app.com/pending',
    },
    autoReturn: 'approved',
    externalReference: 'order-123',
  };

  const handlePaymentSuccess = (result: any) => {
    Alert.alert(
      '¡Pago Exitoso!',
      `Pago procesado correctamente.\nID: ${result.id}\nEstado: ${result.status}`,
      [{ text: 'OK', onPress: () => setShowCheckout(false) }]
    );
  };

  const handlePaymentError = (error: any) => {
    Alert.alert(
      'Error en el Pago',
      error.message || 'Ocurrió un error durante el pago',
      [{ text: 'OK', onPress: () => setShowCheckout(false) }]
    );
  };

  const handlePaymentCancel = () => {
    Alert.alert(
      'Pago Cancelado',
      'El usuario canceló el proceso de pago',
      [{ text: 'OK', onPress: () => setShowCheckout(false) }]
    );
  };

  const handleCardSubmit = async (cardData: any) => {
    setIsLoading(true);
    try {
      // Aquí procesarías la tarjeta con Mercado Pago
      console.log('Datos de tarjeta:', cardData);
      
      // Simular procesamiento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        '¡Tarjeta Agregada!',
        'La tarjeta se agregó correctamente a tu cuenta',
        [{ text: 'OK', onPress: () => setShowCardForm(false) }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Error al procesar la tarjeta. Por favor intenta nuevamente.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const createPreference = async () => {
    setIsLoading(true);
    try {
      const newPreference = await mercadoPago.createPreference({
        items: [
          {
            id: 'item-1',
            title: 'Producto de ejemplo',
            description: 'Descripción del producto',
            quantity: 1,
            unitPrice: 100,
            currencyId: 'ARS',
          },
        ],
        payer: {
          name: 'Juan',
          surname: 'Pérez',
          email: 'juan.perez@example.com',
        },
        backUrls: {
          success: 'https://tu-app.com/success',
          failure: 'https://tu-app.com/failure',
          pending: 'https://tu-app.com/pending',
        },
      });
      
      console.log('Preferencia creada:', newPreference);
      Alert.alert('Éxito', 'Preferencia de pago creada correctamente');
    } catch (error) {
      Alert.alert('Error', 'Error al crear la preferencia de pago');
    } finally {
      setIsLoading(false);
    }
  };

  if (showCheckout) {
    return (
      <Checkout
        preference={preference}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
        onCancel={handlePaymentCancel}
      />
    );
  }

  if (showCardForm) {
    return (
      <SafeAreaView style={styles.container}>
        <CardForm
          onCardDataChange={(data) => console.log('Datos de tarjeta:', data)}
          onCardValid={(valid) => console.log('Tarjeta válida:', valid)}
          onSubmit={handleCardSubmit}
          theme="light"
          showSecurityCode={true}
          showCardholderName={true}
          showIdentification={false}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Mercado Pago React Native</Text>
        <Text style={styles.subtitle}>Ejemplo de integración</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => setShowCheckout(true)}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Iniciar Checkout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => setShowCardForm(true)}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Agregar Tarjeta</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.tertiaryButton]}
            onPress={createPreference}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Crear Preferencia</Text>
          </TouchableOpacity>
        </View>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Procesando...</Text>
          </View>
        )}

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Características:</Text>
          <Text style={styles.infoText}>• Checkout integrado en la app</Text>
          <Text style={styles.infoText}>• Formulario de tarjeta personalizable</Text>
          <Text style={styles.infoText}>• Validaciones en tiempo real</Text>
          <Text style={styles.infoText}>• Manejo de errores robusto</Text>
          <Text style={styles.infoText}>• Soporte para TypeScript</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 40,
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: '#009EE3',
  },
  secondaryButton: {
    backgroundColor: '#00A650',
  },
  tertiaryButton: {
    backgroundColor: '#FF6B00',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  infoContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 8,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});

export default App; 