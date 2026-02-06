import { algoliasearch } from 'algoliasearch';

export const SOLUCOES_INDEX = 'solucoes';

let _client: ReturnType<typeof algoliasearch> | null = null;

export function getAdminClient() {
  if (!_client) {
    const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
    const adminKey = process.env.ALGOLIA_ADMIN_KEY;

    if (!appId || !adminKey) {
      throw new Error(
        'ALGOLIA_ADMIN_KEY nao configurada. Adicione ao .env.local.'
      );
    }

    _client = algoliasearch(appId, adminKey);
  }
  return _client;
}
