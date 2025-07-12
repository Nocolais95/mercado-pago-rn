# Guía de Instalación

## 1. Instalar la librería

```bash
npm install mercadopago-react-native-lib
```

## 2. Configurar Android

### 2.1 Agregar dependencias

En `android/app/build.gradle`:

```gradle
dependencies {
    // ... otras dependencias
    implementation "com.mercadopago.android.px:checkout:4.0.0"
}
```

### 2.2 Configurar credenciales

En `android/app/build.gradle`:

```gradle
android {
    defaultConfig {
        // ... otras configuraciones
        manifestPlaceholders = [
            MERCADO_PAGO_PUBLIC_KEY: "TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
        ]
    }
}
```

### 2.3 Agregar el paquete nativo

En `android/app/src/main/java/com/tuapp/MainApplication.java`:

```java
import com.mercadopago.reactnative.MercadoPagoPackage;

@Override
protected List<ReactPackage> getPackages() {
    List<ReactPackage> packages = new PackageList(this).getPackages();
    packages.add(new MercadoPagoPackage()); // Agregar esta línea
    return packages;
}
```

## 3. Configurar iOS (Próximamente)

Los bridges nativos para iOS se implementarán en una versión futura.

## 4. Usar en tu app

```typescript
import React, { useState } from 'react';
import { View, Button, Alert } from 'react-native';
import {
  initializeMercadoPago,
  NativeCheckout,
  NativeCardForm,
} from 'mercadopago-react-native-lib';

const App = () => {
  const [showCheckout, setShowCheckout] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);

  // Inicializar Mercado Pago
  const mercadoPago = initializeMercadoPago({
    publicKey: 'TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    accessToken: 'TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    environment: 'sandbox',
  });

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

  const handlePaymentSuccess = (result) => {
    Alert.alert('¡Éxito!', 'Pago procesado correctamente');
    setShowCheckout(false);
  };

  const handlePaymentError = (error) => {
    Alert.alert('Error', error.message);
    setShowCheckout(false);
  };

  const handleCardSubmit = (cardData) => {
    Alert.alert('¡Éxito!', 'Tarjeta agregada correctamente');
    setShowCardForm(false);
  };

  if (showCheckout) {
    return (
      <NativeCheckout
        preference={preference}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
        onCancel={() => setShowCheckout(false)}
      />
    );
  }

  if (showCardForm) {
    return (
      <NativeCardForm
        onSubmit={handleCardSubmit}
        onCancel={() => setShowCardForm(false)}
      />
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Button
        title="Iniciar Checkout"
        onPress={() => setShowCheckout(true)}
      />
      <Button
        title="Agregar Tarjeta"
        onPress={() => setShowCardForm(true)}
      />
    </View>
  );
};

export default App;
```

## 5. Solución de problemas

### Error: "Module not found"
- Asegúrate de haber ejecutado `npx react-native link` (si usas React Native CLI)
- Reinicia el bundler: `npx react-native start --reset-cache`

### Error: "MercadoPagoModule not found"
- Verifica que hayas agregado el paquete en MainApplication.java
- Limpia y reconstruye el proyecto: `cd android && ./gradlew clean`

### Error: "Public key not found"
- Verifica que hayas configurado la public key en build.gradle
- Asegúrate de usar la key correcta para sandbox/production 