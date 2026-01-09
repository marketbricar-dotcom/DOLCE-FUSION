
export type PaymentMethod = 'CASH_USD' | 'CASH_VES' | 'PAGO_MOVIL' | 'CARD';

export interface Product {
  id: string;
  name: string;
  priceUSD: number;
  category: string;
  description?: string;
}

export interface SaleItem {
  productId: string;
  name: string;
  quantity: number;
  priceUSD: number;
  totalUSD: number;
}

export interface Sale {
  id: string;
  timestamp: number;
  items: SaleItem[];
  totalUSD: number;
  totalVES: number;
  exchangeRate: number;
  paymentMethod: PaymentMethod;
  reference?: string;
}

export enum View {
  POS = 'POS',
  INVENTORY = 'INVENTORY',
  SALES = 'SALES',
  CALCULATOR = 'CALCULATOR',
  DAILY_CLOSE = 'DAILY_CLOSE'
}
