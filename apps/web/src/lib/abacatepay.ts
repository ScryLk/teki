import AbacatePay from 'abacatepay-nodejs-sdk';

const ABACATEPAY_API_KEY = process.env.ABACATEPAY_API_KEY!;

const abacate = AbacatePay(ABACATEPAY_API_KEY);

const PLAN_PRICES: Record<string, number> = {
  starter: 2900,  // R$ 29,00 in cents
  pro: 7900,      // R$ 79,00 in cents
};

const PLAN_NAMES: Record<string, string> = {
  starter: 'Teki Starter',
  pro: 'Teki Pro',
};

interface CreateBillingParams {
  userEmail: string;
  userName: string;
  userTaxId?: string;
  planId: 'starter' | 'pro';
  backUrl: string;
  completionUrl: string;
}

export async function createBilling(params: CreateBillingParams) {
  const response = await abacate.billing.create({
    frequency: 'ONE_TIME',
    methods: ['PIX'],
    products: [
      {
        externalId: `teki-plan-${params.planId}`,
        name: PLAN_NAMES[params.planId],
        quantity: 1,
        price: PLAN_PRICES[params.planId],
      },
    ],
    returnUrl: params.backUrl,
    completionUrl: params.completionUrl,
    customer: {
      email: params.userEmail,
      name: params.userName || undefined,
      taxId: params.userTaxId || undefined,
    },
  });

  if (response.error) {
    throw new Error(`AbacatePay error: ${response.error}`);
  }

  return {
    billingId: response.data.id,
    checkoutUrl: response.data.url,
    amount: response.data.amount,
    status: response.data.status,
  };
}

export async function listBillings() {
  const response = await abacate.billing.list();
  if (response.error) {
    throw new Error(`AbacatePay error: ${response.error}`);
  }
  return response.data;
}

/**
 * Get the status of a specific billing by listing all and filtering.
 * AbacatePay SDK doesn't expose a get-by-id, so we filter from list.
 */
export async function getBillingStatus(billingId: string) {
  const billings = await listBillings();
  const billing = billings.find((b: { id: string }) => b.id === billingId);
  if (!billing) {
    return null;
  }
  return {
    id: billing.id,
    status: billing.status,
    amount: billing.amount,
    url: billing.url,
  };
}

export { PLAN_PRICES, PLAN_NAMES };
