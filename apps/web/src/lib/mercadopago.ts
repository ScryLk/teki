const MP_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN!;
const MP_BASE_URL = 'https://api.mercadopago.com';

interface CreateSubscriptionParams {
  userEmail: string;
  planId: 'starter' | 'pro';
  backUrl: string;
}

const PLAN_PRICES: Record<string, number> = {
  starter: 29,
  pro: 79,
};

const PLAN_REASON: Record<string, string> = {
  starter: 'Teki Starter',
  pro: 'Teki Pro',
};

export async function createSubscription(params: CreateSubscriptionParams) {
  const response = await fetch(`${MP_BASE_URL}/preapproval`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      reason: PLAN_REASON[params.planId],
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: PLAN_PRICES[params.planId],
        currency_id: 'BRL',
      },
      payer_email: params.userEmail,
      back_url: params.backUrl,
      status: 'pending',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Mercado Pago error: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  return {
    preapprovalId: data.id as string,
    initPoint: data.init_point as string,
  };
}

export async function cancelSubscription(preapprovalId: string) {
  await fetch(`${MP_BASE_URL}/preapproval/${preapprovalId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ status: 'cancelled' }),
  });
}

export async function getSubscriptionStatus(preapprovalId: string) {
  const response = await fetch(
    `${MP_BASE_URL}/preapproval/${preapprovalId}`,
    {
      headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
    }
  );

  if (!response.ok) throw new Error(`MP status error: ${response.status}`);
  return response.json();
}
