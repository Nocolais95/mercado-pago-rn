export interface MercadoPagoConfig {
  publicKey: string;
  accessToken?: string;
  environment?: 'sandbox' | 'production';
}

export interface CardData {
  cardNumber: string;
  cardholderName: string;
  expirationMonth: string;
  expirationYear: string;
  securityCode: string;
  identificationType?: string;
  identificationNumber?: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  paymentTypeId: string;
  thumbnail: string;
  secureThumbnail: string;
}

export interface PaymentPreference {
  id: string;
  initPoint: string;
  sandboxInitPoint: string;
  items: PaymentItem[];
  payer: Payer;
  backUrls: BackUrls;
  autoReturn?: 'approved' | 'all';
  externalReference?: string;
  expires?: boolean;
  expirationDateFrom?: string;
  expirationDateTo?: string;
  collectorId?: number;
  clientId?: number;
  marketplace?: string;
  marketplaceFee?: number;
  differentialPricing?: DifferentialPricing;
  applicationFee?: number;
  capture?: boolean;
  binaryMode?: boolean;
  statementDescriptor?: string;
  callbacks?: Callbacks;
  additionalInfo?: string;
  expiresIn?: number;
  dateOfExpiration?: string;
  paymentMethods?: PaymentMethods;
  excludedPaymentMethods?: ExcludedPaymentMethod[];
  excludedPaymentTypes?: ExcludedPaymentType[];
  installments?: number;
  defaultInstallments?: number;
  defaultPaymentMethodId?: string;
  installmentsCost?: InstallmentsCost[];
  defaultPaymentTypeId?: string;
  processingModes?: string[];
  cardTokenId?: string;
  notificationUrl?: string;
  token?: string;
  transactionAmount?: number;
  transactionAmountRefunded?: number;
  couponAmount?: number;
  campaignId?: number;
  couponCode?: string;
  siteId?: string;
  onApproved?: string;
  onPending?: string;
  onInProcess?: string;
  onAuthorized?: string;
  onRejected?: string;
  onCancelled?: string;
  onRefund?: string;
  onChargedBack?: string;
}

export interface PaymentItem {
  id: string;
  title: string;
  description?: string;
  pictureUrl?: string;
  categoryId?: string;
  quantity: number;
  unitPrice: number;
  currencyId: string;
}

export interface Payer {
  name: string;
  surname: string;
  email: string;
  phone?: Phone;
  identification?: Identification;
  address?: Address;
  dateCreated?: string;
  lastPurchase?: string;
}

export interface Phone {
  areaCode: string;
  number: string;
}

export interface Identification {
  type: string;
  number: string;
}

export interface Address {
  zipCode: string;
  streetName: string;
  streetNumber?: number;
  neighborhood?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface BackUrls {
  success: string;
  failure: string;
  pending: string;
}

export interface DifferentialPricing {
  id: number;
}

export interface Callbacks {
  success?: string;
  failure?: string;
  pending?: string;
}

export interface PaymentMethods {
  installments: number;
  defaultInstallments?: number;
  defaultPaymentMethodId?: string;
  installmentsCost?: InstallmentsCost[];
  defaultPaymentTypeId?: string;
  excludedPaymentMethods?: ExcludedPaymentMethod[];
  excludedPaymentTypes?: ExcludedPaymentType[];
}

export interface ExcludedPaymentMethod {
  id: string;
}

export interface ExcludedPaymentType {
  id: string;
}

export interface InstallmentsCost {
  installments: number;
  installmentRate: number;
  discountRate: number;
  reimbursementRate?: number;
  labels: string[];
  installmentsCost: number;
  minAllowedAmount: number;
  maxAllowedAmount: number;
  recommendedMessage?: string;
  installmentAmount: number;
  totalAmount: number;
}

export interface PaymentResult {
  id: string;
  status: string;
  statusDetail: string;
  paymentMethodId: string;
  paymentTypeId: string;
  transactionAmount: number;
  transactionAmountRefunded: number;
  currencyId: string;
  description: string;
  externalReference?: string;
  dateApproved?: string;
  dateCreated: string;
  lastModified: string;
  authorizationCode?: string;
  moneyReleaseDate?: string;
  collectorId: number;
  counterCurrency?: string;
  couponAmount?: number;
  campaignId?: number;
  couponCode?: string;
  installments: number;
  transactionDetails: TransactionDetails;
  feeDetails: FeeDetail[];
  chargesDetails: ChargeDetail[];
  captured: boolean;
  binaryMode: boolean;
  callForAuthorizeId?: string;
  statementDescriptor?: string;
  card: Card;
  notificationUrl?: string;
  refunds: any[];
  operationType: string;
  order: Order;
  additionalInfo?: string;
  applicationFee?: number;
  moneyReleaseSchema?: string;
  processingMode?: string;
  merchantAccountId?: string;
  merchantNumber?: string;
  acquirerReconciliation?: AcquirerReconciliation[];
  merchantOrderId?: number;
}

export interface TransactionDetails {
  financialInstitution?: string;
  paymentMethodReferenceId?: string;
  acquirerReference?: string;
  externalResourceUrl?: string;
  installmentAmount?: number;
  netReceivedAmount: number;
  overpaidAmount?: number;
  totalPaidAmount: number;
}

export interface FeeDetail {
  type: string;
  amount: number;
  feePayer: string;
}

export interface ChargeDetail {
  id: string;
  name: string;
  type: string;
  amount: number;
}

export interface Card {
  id?: string;
  lastFourDigits: string;
  firstSixDigits: string;
  expirationYear: number;
  expirationMonth: number;
  dateCreated: string;
  dateLastUpdated: string;
  cardholder: Cardholder;
}

export interface Cardholder {
  name: string;
  identification: Identification;
}

export interface Order {
  id: number;
  type: string;
}

export interface AcquirerReconciliation {
  acquirerReference: string;
}

export interface MercadoPagoError {
  message: string;
  error: string;
  status: number;
  cause?: any[];
}

export interface CheckoutProps {
  preference: PaymentPreference;
  onSuccess?: (result: PaymentResult) => void;
  onError?: (error: MercadoPagoError) => void;
  onCancel?: () => void;
  onPending?: (result: PaymentResult) => void;
  style?: any;
  className?: string;
}

export interface CardFormProps {
  onCardDataChange?: (cardData: CardData) => void;
  onCardValid?: (isValid: boolean) => void;
  onSubmit?: (cardData: CardData) => void;
  style?: any;
  className?: string;
  theme?: 'light' | 'dark';
  showSecurityCode?: boolean;
  showCardholderName?: boolean;
  showIdentification?: boolean;
  allowedPaymentMethods?: string[];
  excludedPaymentMethods?: string[];
} 