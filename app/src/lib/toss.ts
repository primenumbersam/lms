export class TossClient {
  private secretKey: string;

  constructor(secretKey: string) {
    this.secretKey = secretKey;
  }

  private get authHeader() {
    // Toss Payments API uses secret key as username and no password.
    // Base64 encode "secretKey:"
    return `Basic ${btoa(this.secretKey + ':')}`;
  }

  async confirmPayment(payload: { paymentKey: string; orderId: string; amount: number }) {
    const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        Authorization: this.authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return response.json();
  }

  async cancelPayment(paymentKey: string, payload: { cancelReason: string; cancelAmount?: number }) {
    const response = await fetch(`https://api.tosspayments.com/v1/payments/${paymentKey}/cancel`, {
      method: 'POST',
      headers: {
        Authorization: this.authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return response.json();
  }
}
