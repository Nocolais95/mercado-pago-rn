import {
  MercadoPagoConfig,
  PaymentPreference,
  PaymentResult,
  MercadoPagoError,
  CardData,
  PaymentMethod
} from '../types';

export class MercadoPagoService {
  private config: MercadoPagoConfig;
  private baseUrl: string;

  constructor(config: MercadoPagoConfig) {
    this.config = config;
    this.baseUrl = config.environment === 'production' 
      ? 'https://api.mercadopago.com' 
      : 'https://api.mercadopago.com';
  }

  /**
   * Crea una preferencia de pago
   */
  async createPreference(preference: Omit<PaymentPreference, 'id' | 'initPoint' | 'sandboxInitPoint'>): Promise<PaymentPreference> {
    try {
      const response = await fetch(`${this.baseUrl}/checkout/preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.accessToken}`,
        },
        body: JSON.stringify(preference),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear preferencia');
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Error al crear preferencia: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Obtiene información de un pago
   */
  async getPayment(paymentId: string): Promise<PaymentResult> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al obtener pago');
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Error al obtener pago: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Obtiene métodos de pago disponibles
   */
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/payment_methods`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al obtener métodos de pago');
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Error al obtener métodos de pago: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Valida datos de tarjeta
   */
  validateCardData(cardData: CardData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar número de tarjeta (Luhn algorithm)
    if (!this.isValidCardNumber(cardData.cardNumber)) {
      errors.push('Número de tarjeta inválido');
    }

    // Validar nombre del titular
    if (!cardData.cardholderName || cardData.cardholderName.trim().length < 3) {
      errors.push('Nombre del titular es requerido (mínimo 3 caracteres)');
    }

    // Validar mes de expiración
    const month = parseInt(cardData.expirationMonth);
    if (isNaN(month) || month < 1 || month > 12) {
      errors.push('Mes de expiración inválido');
    }

    // Validar año de expiración
    const year = parseInt(cardData.expirationYear);
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < currentYear || year > currentYear + 20) {
      errors.push('Año de expiración inválido');
    }

    // Validar código de seguridad
    if (!cardData.securityCode || cardData.securityCode.length < 3 || cardData.securityCode.length > 4) {
      errors.push('Código de seguridad inválido');
    }

    // Validar identificación si es requerida
    if (cardData.identificationType && !cardData.identificationNumber) {
      errors.push('Número de identificación es requerido');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Algoritmo de Luhn para validar número de tarjeta
   */
  private isValidCardNumber(cardNumber: string): boolean {
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
  }

  /**
   * Obtiene el tipo de tarjeta basado en el número
   */
  getCardType(cardNumber: string): string {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    
    // Patrones de tarjetas
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
  }

  /**
   * Formatea el número de tarjeta para mostrar
   */
  formatCardNumber(cardNumber: string): string {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    const cardType = this.getCardType(cleanNumber);
    
    let formatted = '';
    for (let i = 0; i < cleanNumber.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += ' ';
      }
      formatted += cleanNumber[i];
    }
    
    return formatted;
  }

  /**
   * Obtiene la URL de checkout para una preferencia
   */
  getCheckoutUrl(preference: PaymentPreference): string {
    return this.config.environment === 'production' 
      ? preference.initPoint 
      : preference.sandboxInitPoint;
  }
} 