import type { BrainAtom } from 'rhachet';

import { genBrainAtom } from '../../domain.operations/atom/genBrainAtom';

/**
 * .what = returns all brain atoms provided by xai
 * .why = enables consumers to register xai atoms with genContextBrain
 */
export const getBrainAtomsByXAI = (): BrainAtom[] => {
  return [
    genBrainAtom({ slug: 'xai/grok-code-fast-1' }),
    genBrainAtom({ slug: 'xai/grok-3' }),
    genBrainAtom({ slug: 'xai/grok-3-mini' }),
    genBrainAtom({ slug: 'xai/grok-4' }),
    genBrainAtom({ slug: 'xai/grok-4-fast' }),
  ];
};

// re-export factory for direct access
export { genBrainAtom } from '../../domain.operations/atom/genBrainAtom';
