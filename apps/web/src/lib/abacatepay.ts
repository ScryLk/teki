import AbacatePay from 'abacatepay-nodejs-sdk';
import { PLANS } from './plans';
import type { PlanTier } from '@prisma/client';

const ABACATEPAY_API_KEY = process.env.ABACATEPAY_API_KEY!;

const abacate = AbacatePay(ABACATEPAY_API_KEY);

interface CreateBillingParams {
  userEmail: string;
  userName: string;
  userTaxId?: string;
  planId: PlanTier;
  backUrl: string;
  completionUrl: string;
}

export async function createBilling(params: CreateBillingParams) {
  const plan = PLANS[params.planId];
  if (!plan || plan.price <= 0) {
    throw new Error(`Plano "${params.planId}" nao disponivel para cobranca.`);
  }

  const response = await abacate.billing.create({
    frequency: 'ONE_TIME',
    methods: ['PIX'],
    products: [
      {
        externalId: `teki-plan-${params.planId.toLowerCase()}`,
        name: `Teki ${plan.name}`,
        quantity: 1,
        price: plan.price * 100, // R$ to cents
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
