import { BadRequestError } from 'helpful-errors';
import type { Empty } from 'type-fns';

import type { ContextBrainSupplierXai } from '../atom/genBrainAtom';

/**
 * .what = get xai sdk credentials
 * .why = single source of truth for xai credential resolution with fallback
 */
export const getSdkXaiCreds = async (
  input: Empty,
  context?: ContextBrainSupplierXai,
): Promise<{ XAI_API_KEY: string }> => {
  // extract supplier from context
  const supplier = context?.['brain.supplier.xai'];

  // supplier provided: call getter
  if (supplier?.creds) {
    const creds = await supplier.creds();
    return {
      XAI_API_KEY:
        creds?.XAI_API_KEY ??
        BadRequestError.throw('creds getter returned undefined XAI_API_KEY'),
    };
  }

  // fallback to env var
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    throw new BadRequestError(
      'XAI_API_KEY required — provide via context or env',
    );
  }
  return { XAI_API_KEY: apiKey };
};
