export function isSimulationMode(): boolean {
  return process.env.BILLING_MODE !== 'mercadopago';
}
