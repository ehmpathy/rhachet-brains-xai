import { BrainAtom } from 'rhachet';
import { given, then, when } from 'test-fns';

import { genBrainAtom } from '../../domain.operations/atom/genBrainAtom';
import { getBrainAtomsByXAI } from './index';

describe('rhachet-brains-xai.unit', () => {
  given('[case1] getBrainAtomsByXAI', () => {
    when('[t0] called', () => {
      then('returns array with 8 atoms', () => {
        const atoms = getBrainAtomsByXAI();
        expect(atoms).toHaveLength(8);
      });

      then('returns BrainAtom instances', () => {
        const atoms = getBrainAtomsByXAI();
        for (const atom of atoms) {
          expect(atom).toBeInstanceOf(BrainAtom);
        }
      });

      then('includes grok/code-fast-1', () => {
        const atoms = getBrainAtomsByXAI();
        const slugs = atoms.map((a) => a.slug);
        expect(slugs).toContain('xai/grok/code-fast-1');
      });
    });
  });

  given('[case2] genBrainAtom factory', () => {
    when('[t0] called with xai/grok/code-fast-1 slug', () => {
      const atom = genBrainAtom({ slug: 'xai/grok/code-fast-1' });

      then('returns BrainAtom instance', () => {
        expect(atom).toBeInstanceOf(BrainAtom);
      });

      then('has correct slug', () => {
        expect(atom.slug).toEqual('xai/grok/code-fast-1');
      });

      then('has correct repo', () => {
        expect(atom.repo).toEqual('xai');
      });
    });
  });
});
