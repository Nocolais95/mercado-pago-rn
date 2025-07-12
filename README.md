# Mercado Pago React Native Library

Una librería completa para React Native con Expo que integra el Checkout API de Mercado Pago de forma **completamente nativa**, sin usar WebView.

## Características

- ✅ **Integración completamente nativa con Mercado Pago**
- ✅ **Sin WebView - experiencia nativa pura**
- ✅ **Formulario de tarjeta nativo del SDK oficial**
- ✅ **Checkout nativo con pantallas oficiales de Mercado Pago**
- ✅ **Validaciones nativas del SDK**
- ✅ **Soporte para TypeScript**
- ✅ **Bridges nativos en Kotlin para Android**
- ✅ **Compatible con Expo**
- ✅ **Mejor rendimiento y UX**
- ✅ **Manejo de errores robusto**

## Instalación

```bash
npm install mercadopago-react-native-lib
```

### Dependencias requeridas

```bash
# No se requieren dependencias adicionales - todo es nativo
```

## Configuración

### 1. Configurar Mercado Pago

Primero, necesitas obtener tus credenciales de Mercado Pago:

1. Ve a [Mercado Pago Developers](https://www.mercadopago.com/developers)
2. Crea una aplicación
3. Obtén tu `public_key` y `access_token`

### 2. Inicializar la librería

```typescript
import { initializeMercadoPago } from 'mercadopago-react-native-lib';

const mercadoPago = initializeMercadoPago({
  publicKey: 'TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  accessToken: 'TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  environment: 'sandbox', // o 'production'
});
```

## Uso

### Componente de Checkout Nativo

```typescript
import React from 'react';
import { NativeCheckout } from 'mercadopago-react-native-lib';

const CheckoutScreen = () => {
  const preference = {
    id: 'preference_id',
    initPoint: 'https://www.mercadopago.com/checkout/v1/redirect?pref_id=preference_id',
    sandboxInitPoint: 'https://www.mercadopago.com/checkout/v1/redirect?pref_id=preference_id',
    items: [
      {
        id: 'item-1',
        title: 'Producto de ejemplo',
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
  };

  const handleSuccess = (result) => {
    console.log('Pago exitoso:', result);
    // Navegar a pantalla de éxito
  };

  const handleError = (error) => {
    console.log('Error en el pago:', error);
    // Mostrar mensaje de error
  };

  const handleCancel = () => {
    console.log('Pago cancelado');
    // Navegar de vuelta
  };

  return (
    <NativeCheckout
      preference={preference}
      onSuccess={handleSuccess}
      onError={handleError}
      onCancel={handleCancel}
    />
  );
};
```

### Componente de Formulario de Tarjeta Nativo

```typescript
import React, { useState } from 'react';
import { NativeCardForm } from 'mercadopago-react-native-lib';

const CardFormScreen = () => {
  const [cardData, setCardData] = useState(null);
  const [isValid, setIsValid] = useState(false);

  const handleCardDataChange = (data) => {
    setCardData(data);
  };

  const handleCardValid = (valid) => {
    setIsValid(valid);
  };

  const handleSubmit = async (data) => {
    try {
      // Procesar la tarjeta con Mercado Pago
      const result = await mercadoPago.processCard(data);
      console.log('Tarjeta procesada:', result);
    } catch (error) {
      console.error('Error al procesar tarjeta:', error);
    }
  };

  return (
    <NativeCardForm
      onCardDataChange={handleCardDataChange}
      onCardValid={handleCardValid}
      onSubmit={handleSubmit}
      onCancel={() => console.log('Cancelado')}
      theme="light"
      showSecurityCode={true}
      showCardholderName={true}
      showIdentification={false}
    />
  );
};
```

### Crear Preferencia de Pago

```typescript
import { MercadoPagoService } from 'mercadopago-react-native-lib';

const createPaymentPreference = async () => {
  const preference = {
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
    expires: true,
    expirationDateFrom: new Date().toISOString(),
    expirationDateTo: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };

  try {
    const result = await mercadoPago.createPreference(preference);
    console.log('Preferencia creada:', result);
    return result;
  } catch (error) {
    console.error('Error al crear preferencia:', error);
  }
};
```

## Configuración de Android

### 1. Agregar el paquete al MainApplication.java

```java
// MainApplication.java
import com.mercadopago.reactnative.MercadoPagoPackage;

@Override
protected List<ReactPackage> getPackages() {
    List<ReactPackage> packages = new PackageList(this).getPackages();
    packages.add(new MercadoPagoPackage());
    return packages;
}
```

### 2. Configurar build.gradle

```gradle
// android/app/build.gradle
dependencies {
    implementation "com.mercadopago.android.px:checkout:4.0.0"
}
```

### 3. Configurar credenciales

```gradle
// android/app/build.gradle
android {
    defaultConfig {
        // Agregar tu public key de Mercado Pago
        manifestPlaceholders = [
            MERCADO_PAGO_PUBLIC_KEY: "TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
        ]
    }
}
```

## Tipos TypeScript

La librería incluye tipos completos para TypeScript:

```typescript
import {
  MercadoPagoConfig,
  PaymentPreference,
  PaymentResult,
  CardData,
  MercadoPagoError,
} from 'mercadopago-react-native-lib';
```

## Diferencias entre Componentes

### Componentes Nativos (Recomendados)
- **`NativeCheckout`**: Usa el SDK nativo de Mercado Pago
- **`NativeCardForm`**: Formulario nativo del SDK oficial
- **Ventajas**: Mejor rendimiento, UX nativa, validaciones oficiales
- **Desventajas**: Menos personalizable, usa pantallas oficiales

### Componentes Personalizados
- **`Checkout`**: Implementación con WebView
- **`CardForm`**: Formulario personalizado en React Native
- **Ventajas**: Totalmente personalizable
- **Desventajas**: Requiere WebView, más complejo de mantener

## Manejo de Errores

La librería proporciona manejo robusto de errores:

```typescript
const handleError = (error: MercadoPagoError) => {
  switch (error.error) {
    case 'PAYMENT_FAILED':
      // Manejar fallo de pago
      break;
    case 'INVALID_CARD':
      // Manejar tarjeta inválida
      break;
    case 'NETWORK_ERROR':
      // Manejar error de red
      break;
    default:
      // Manejar otros errores
      break;
  }
};
```

## Validaciones

El formulario de tarjeta incluye validaciones automáticas:

- ✅ Número de tarjeta (algoritmo de Luhn)
- ✅ Nombre del titular
- ✅ Fecha de expiración
- ✅ Código de seguridad
- ✅ Identificación (opcional)

## Ejemplos

### Ejemplo completo de integración

```typescript
import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import {
  initializeMercadoPago,
  Checkout,
  CardForm,
} from 'mercadopago-react-native-lib';

const App = () => {
  const [showCheckout, setShowCheckout] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);

  const mercadoPago = initializeMercadoPago({
    publicKey: 'TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    accessToken: 'TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    environment: 'sandbox',
  });

  const handlePaymentSuccess = (result) => {
    Alert.alert('Éxito', 'Pago procesado correctamente');
    setShowCheckout(false);
  };

  const handlePaymentError = (error) => {
    Alert.alert('Error', error.message);
  };

  const handleCardSubmit = async (cardData) => {
    try {
      // Procesar tarjeta
      Alert.alert('Éxito', 'Tarjeta agregada correctamente');
      setShowCardForm(false);
    } catch (error) {
      Alert.alert('Error', 'Error al procesar la tarjeta');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {showCheckout && (
        <Checkout
          preference={preference}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          onCancel={() => setShowCheckout(false)}
        />
      )}
      
      {showCardForm && (
        <CardForm
          onSubmit={handleCardSubmit}
          onCancel={() => setShowCardForm(false)}
        />
      )}
    </View>
  );
};
```

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Soporte

Si tienes alguna pregunta o necesitas ayuda, por favor abre un issue en GitHub. 