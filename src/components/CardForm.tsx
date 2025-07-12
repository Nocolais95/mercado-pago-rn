import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {
  CardFormProps,
  CardData,
} from '../types';

export const CardForm: React.FC<CardFormProps> = ({
  onCardDataChange,
  onCardValid,
  onSubmit,
  style,
  theme = 'light',
  showSecurityCode = true,
  showCardholderName = true,
  showIdentification = false,
  allowedPaymentMethods = [],
  excludedPaymentMethods = [],
}) => {
  const [cardData, setCardData] = useState<CardData>({
    cardNumber: '',
    cardholderName: '',
    expirationMonth: '',
    expirationYear: '',
    securityCode: '',
    identificationType: '',
    identificationNumber: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isValid, setIsValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cardType, setCardType] = useState<string>('unknown');

  // Validar datos de tarjeta en tiempo real
  useEffect(() => {
    validateCardData();
  }, [cardData]);

  // Notificar cambios al componente padre
  useEffect(() => {
    onCardDataChange?.(cardData);
  }, [cardData, onCardDataChange]);

  // Notificar validez al componente padre
  useEffect(() => {
    onCardValid?.(isValid);
  }, [isValid, onCardValid]);

  const validateCardData = () => {
    const newErrors: { [key: string]: string } = {};

    // Validar número de tarjeta
    if (!cardData.cardNumber) {
      newErrors.cardNumber = 'Número de tarjeta es requerido';
    } else if (!isValidCardNumber(cardData.cardNumber)) {
      newErrors.cardNumber = 'Número de tarjeta inválido';
    }

    // Validar nombre del titular
    if (showCardholderName) {
      if (!cardData.cardholderName) {
        newErrors.cardholderName = 'Nombre del titular es requerido';
      } else if (cardData.cardholderName.trim().length < 3) {
        newErrors.cardholderName = 'Nombre debe tener al menos 3 caracteres';
      }
    }

    // Validar mes de expiración
    if (!cardData.expirationMonth) {
      newErrors.expirationMonth = 'Mes de expiración es requerido';
    } else {
      const month = parseInt(cardData.expirationMonth);
      if (isNaN(month) || month < 1 || month > 12) {
        newErrors.expirationMonth = 'Mes inválido';
      }
    }

    // Validar año de expiración
    if (!cardData.expirationYear) {
      newErrors.expirationYear = 'Año de expiración es requerido';
    } else {
      const year = parseInt(cardData.expirationYear);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < currentYear || year > currentYear + 20) {
        newErrors.expirationYear = 'Año inválido';
      }
    }

    // Validar código de seguridad
    if (showSecurityCode) {
      if (!cardData.securityCode) {
        newErrors.securityCode = 'Código de seguridad es requerido';
      } else if (cardData.securityCode.length < 3 || cardData.securityCode.length > 4) {
        newErrors.securityCode = 'Código debe tener 3 o 4 dígitos';
      }
    }

    // Validar identificación si es requerida
    if (showIdentification) {
      if (!cardData.identificationType) {
        newErrors.identificationType = 'Tipo de identificación es requerido';
      }
      if (!cardData.identificationNumber) {
        newErrors.identificationNumber = 'Número de identificación es requerido';
      }
    }

    setErrors(newErrors);
    setIsValid(Object.keys(newErrors).length === 0);
  };

  const isValidCardNumber = (cardNumber: string): boolean => {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    
    if (!/^\d{13,19}$/.test(cleanNumber)) {
      return false;
    }

    let sum = 0;
    let isEven = false;

    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  };

  const getCardType = (cardNumber: string): string => {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    
    const patterns = {
      visa: /^4/,
      mastercard: /^5[1-5]/,
      amex: /^3[47]/,
      discover: /^6(?:011|5)/,
      diners: /^3(?:0[0-5]|[68])/,
      jcb: /^(?:2131|1800|35\d{3})/,
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(cleanNumber)) {
        return type;
      }
    }

    return 'unknown';
  };

  const formatCardNumber = (text: string): string => {
    const cleanNumber = text.replace(/\s/g, '');
    let formatted = '';
    
    for (let i = 0; i < cleanNumber.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += ' ';
      }
      formatted += cleanNumber[i];
    }
    
    return formatted;
  };

  const handleCardNumberChange = (text: string) => {
    const formatted = formatCardNumber(text);
    const type = getCardType(text);
    
    setCardType(type);
    setCardData(prev => ({ ...prev, cardNumber: formatted }));
  };

  const handleExpirationMonthChange = (text: string) => {
    const month = text.replace(/\D/g, '');
    if (month.length <= 2) {
      setCardData(prev => ({ ...prev, expirationMonth: month }));
    }
  };

  const handleExpirationYearChange = (text: string) => {
    const year = text.replace(/\D/g, '');
    if (year.length <= 4) {
      setCardData(prev => ({ ...prev, expirationYear: year }));
    }
  };

  const handleSecurityCodeChange = (text: string) => {
    const code = text.replace(/\D/g, '');
    if (code.length <= 4) {
      setCardData(prev => ({ ...prev, securityCode: code }));
    }
  };

  const handleSubmit = async () => {
    if (!isValid) {
      Alert.alert('Error', 'Por favor corrige los errores en el formulario');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit?.(cardData);
    } catch (error) {
      Alert.alert('Error', 'Error al procesar la tarjeta');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCardIcon = () => {
    switch (cardType) {
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      case 'amex':
        return '💳';
      default:
        return '💳';
    }
  };

  const themeStyles = theme === 'dark' ? darkTheme : lightTheme;

  return (
    <ScrollView style={[styles.container, themeStyles.container, style]}>
      <View style={styles.form}>
        {/* Número de tarjeta */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, themeStyles.label]}>
            Número de tarjeta
          </Text>
          <View style={[styles.cardInputContainer, themeStyles.input]}>
            <Text style={styles.cardIcon}>{getCardIcon()}</Text>
            <TextInput
              style={[styles.cardInput, themeStyles.textInput]}
              value={cardData.cardNumber}
              onChangeText={handleCardNumberChange}
              placeholder="1234 5678 9012 3456"
              placeholderTextColor={themeStyles.placeholder.color}
              keyboardType="numeric"
              maxLength={19}
              autoComplete="cc-number"
            />
          </View>
          {errors.cardNumber && (
            <Text style={styles.errorText}>{errors.cardNumber}</Text>
          )}
        </View>

        {/* Nombre del titular */}
        {showCardholderName && (
          <View style={styles.inputContainer}>
            <Text style={[styles.label, themeStyles.label]}>
              Nombre del titular
            </Text>
            <TextInput
              style={[styles.input, themeStyles.input, themeStyles.textInput]}
              value={cardData.cardholderName}
              onChangeText={(text) => setCardData(prev => ({ ...prev, cardholderName: text }))}
              placeholder="Nombre como aparece en la tarjeta"
              placeholderTextColor={themeStyles.placeholder.color}
              autoComplete="cc-name"
              autoCapitalize="words"
            />
            {errors.cardholderName && (
              <Text style={styles.errorText}>{errors.cardholderName}</Text>
            )}
          </View>
        )}

        {/* Fecha de expiración */}
        <View style={styles.row}>
          <View style={[styles.inputContainer, styles.halfWidth]}>
            <Text style={[styles.label, themeStyles.label]}>
              Mes
            </Text>
            <TextInput
              style={[styles.input, themeStyles.input, themeStyles.textInput]}
              value={cardData.expirationMonth}
              onChangeText={handleExpirationMonthChange}
              placeholder="MM"
              placeholderTextColor={themeStyles.placeholder.color}
              keyboardType="numeric"
              maxLength={2}
              autoComplete="cc-exp-month"
            />
            {errors.expirationMonth && (
              <Text style={styles.errorText}>{errors.expirationMonth}</Text>
            )}
          </View>

          <View style={[styles.inputContainer, styles.halfWidth]}>
            <Text style={[styles.label, themeStyles.label]}>
              Año
            </Text>
            <TextInput
              style={[styles.input, themeStyles.input, themeStyles.textInput]}
              value={cardData.expirationYear}
              onChangeText={handleExpirationYearChange}
              placeholder="YYYY"
              placeholderTextColor={themeStyles.placeholder.color}
              keyboardType="numeric"
              maxLength={4}
              autoComplete="cc-exp-year"
            />
            {errors.expirationYear && (
              <Text style={styles.errorText}>{errors.expirationYear}</Text>
            )}
          </View>
        </View>

        {/* Código de seguridad */}
        {showSecurityCode && (
          <View style={styles.inputContainer}>
            <Text style={[styles.label, themeStyles.label]}>
              Código de seguridad
            </Text>
            <TextInput
              style={[styles.input, themeStyles.input, themeStyles.textInput]}
              value={cardData.securityCode}
              onChangeText={handleSecurityCodeChange}
              placeholder="123"
              placeholderTextColor={themeStyles.placeholder.color}
              keyboardType="numeric"
              maxLength={4}
              autoComplete="cc-csc"
              secureTextEntry
            />
            {errors.securityCode && (
              <Text style={styles.errorText}>{errors.securityCode}</Text>
            )}
          </View>
        )}

        {/* Identificación */}
        {showIdentification && (
          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={[styles.label, themeStyles.label]}>
                Tipo de documento
              </Text>
              <TextInput
                style={[styles.input, themeStyles.input, themeStyles.textInput]}
                value={cardData.identificationType}
                onChangeText={(text) => setCardData(prev => ({ ...prev, identificationType: text }))}
                placeholder="DNI"
                placeholderTextColor={themeStyles.placeholder.color}
                autoCapitalize="characters"
              />
              {errors.identificationType && (
                <Text style={styles.errorText}>{errors.identificationType}</Text>
              )}
            </View>

            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={[styles.label, themeStyles.label]}>
                Número de documento
              </Text>
              <TextInput
                style={[styles.input, themeStyles.input, themeStyles.textInput]}
                value={cardData.identificationNumber}
                onChangeText={(text) => setCardData(prev => ({ ...prev, identificationNumber: text }))}
                placeholder="12345678"
                placeholderTextColor={themeStyles.placeholder.color}
                keyboardType="numeric"
              />
              {errors.identificationNumber && (
                <Text style={styles.errorText}>{errors.identificationNumber}</Text>
              )}
            </View>
          </View>
        )}

        {/* Botón de envío */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            themeStyles.submitButton,
            !isValid && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitButtonText}>
              Agregar tarjeta
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  cardInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  cardIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  cardInput: {
    flex: 1,
    fontSize: 16,
  },
  errorText: {
    color: '#ff0000',
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

const lightTheme = {
  container: {
    backgroundColor: '#ffffff',
  },
  label: {
    color: '#333333',
  },
  input: {
    backgroundColor: '#ffffff',
    borderColor: '#dddddd',
  },
  textInput: {
    color: '#333333',
  },
  placeholder: {
    color: '#999999',
  },
  submitButton: {
    backgroundColor: '#009EE3',
  },
};

const darkTheme = {
  container: {
    backgroundColor: '#1a1a1a',
  },
  label: {
    color: '#ffffff',
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderColor: '#444444',
  },
  textInput: {
    color: '#ffffff',
  },
  placeholder: {
    color: '#666666',
  },
  submitButton: {
    backgroundColor: '#009EE3',
  },
}; 