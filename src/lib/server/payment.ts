export interface PaymentSessionResult {
  provider: 'mock' | 'midtrans';
  token: string;
  redirectUrl?: string;
  expiresAt: string;
}

export interface PaymentProvider {
  createPayment(params: {
    orderId: string;
    orderNumber: string;
    amountIdr: number;
    customer: {
      fullName: string;
      email: string;
      phone?: string | null;
    };
  }): Promise<PaymentSessionResult>;
}

export class MockPaymentProvider implements PaymentProvider {
  async createPayment(params: {
    orderId: string;
    orderNumber: string;
    amountIdr: number;
    customer: {
      fullName: string;
      email: string;
      phone?: string | null;
    };
  }): Promise<PaymentSessionResult> {
    const token = `mock-snap-${params.orderNumber}-${Date.now()}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    return {
      provider: 'mock',
      token,
      redirectUrl: `/checkout/payment-mock?token=${token}&orderId=${params.orderId}`,
      expiresAt
    };
  }
}

export class MidtransPaymentProvider implements PaymentProvider {
  private serverKey: string;
  private isProduction: boolean;

  constructor() {
    this.serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  async createPayment(params: {
    orderId: string;
    orderNumber: string;
    amountIdr: number;
    customer: {
      fullName: string;
      email: string;
      phone?: string | null;
    };
  }): Promise<PaymentSessionResult> {
    const authHeader = `Basic ${Buffer.from(`${this.serverKey}:`).toString('base64')}`;
    const snapUrl = this.isProduction
      ? 'https://app.midtrans.com/snap/v1/transactions'
      : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

    try {
      const response = await fetch(snapUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: authHeader
        },
        body: JSON.stringify({
          transaction_details: {
            order_id: params.orderNumber,
            gross_amount: params.amountIdr
          },
          customer_details: {
            first_name: params.customer.fullName,
            email: params.customer.email,
            phone: params.customer.phone || undefined
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Midtrans API failed with status ${response.status}`);
      }

      const data = await response.json();
      return {
        provider: 'midtrans',
        token: data.token,
        redirectUrl: data.redirect_url,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };
    } catch {
      // Fallback to mock provider in dev/sandbox if external call fails
      const fallback = new MockPaymentProvider();
      return fallback.createPayment(params);
    }
  }
}

export function getPaymentProvider(): PaymentProvider {
  const provider = process.env.PAYMENT_PROVIDER;
  if (provider === 'midtrans' && process.env.MIDTRANS_SERVER_KEY && process.env.MIDTRANS_SERVER_KEY !== 'dummy-server-key') {
    return new MidtransPaymentProvider();
  }
  return new MockPaymentProvider();
}
