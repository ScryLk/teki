import { getModelById } from '@teki/shared';

export interface CostResult {
  inputCost: number;
  outputCost: number;
  totalCost: number;
  currency: 'USD';
}

export function calculateCost(
  modelId: string,
  inputTokens: number,
  outputTokens: number
): CostResult {
  const model = getModelById(modelId);
  const inputPrice = model?.inputPricePerMtok ?? 0;
  const outputPrice = model?.outputPricePerMtok ?? 0;

  const inputCost = (inputTokens / 1_000_000) * inputPrice;
  const outputCost = (outputTokens / 1_000_000) * outputPrice;

  return {
    inputCost: Math.round(inputCost * 10000) / 10000,
    outputCost: Math.round(outputCost * 10000) / 10000,
    totalCost: Math.round((inputCost + outputCost) * 10000) / 10000,
    currency: 'USD',
  };
}
