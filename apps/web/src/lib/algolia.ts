import { liteClient as algoliasearch } from 'algoliasearch/lite';

export const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!;
export const ALGOLIA_SEARCH_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY!;
export const ALGOLIA_AGENT_ID = process.env.NEXT_PUBLIC_ALGOLIA_AGENT_ID!;

export const searchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY);
