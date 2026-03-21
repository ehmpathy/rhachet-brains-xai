import { BadRequestError } from 'helpful-errors';
import { getError, given, then, when } from 'test-fns';

import { getSdkXaiCreds } from './getSdkXaiCreds';

describe('getSdkXaiCreds', () => {
  // save original env
  const originalEnv = process.env.XAI_API_KEY;

  afterEach(() => {
    // restore original env
    if (originalEnv !== undefined) {
      process.env.XAI_API_KEY = originalEnv;
    } else {
      delete process.env.XAI_API_KEY;
    }
  });

  given('[case1] context with supplier', () => {
    when('[t0] getter is called', () => {
      then('getter is invoked and creds returned', async () => {
        const context = {
          'brain.supplier.xai': {
            creds: async () => ({ XAI_API_KEY: 'test-key-from-getter' }),
          },
        };
        const result = await getSdkXaiCreds({}, context);
        expect(result.XAI_API_KEY).toEqual('test-key-from-getter');
      });
    });
  });

  given('[case2] no context', () => {
    when('[t0] env var is set', () => {
      then('falls back to env var', async () => {
        process.env.XAI_API_KEY = 'test-key-from-env';
        const result = await getSdkXaiCreds({});
        expect(result.XAI_API_KEY).toEqual('test-key-from-env');
      });
    });
  });

  given('[case3] getter returns undefined', () => {
    when('[t0] getter is called', () => {
      then('throws BadRequestError', async () => {
        const context = {
          'brain.supplier.xai': {
            creds: async () => ({
              XAI_API_KEY: undefined as unknown as string,
            }),
          },
        };
        const error = await getError(getSdkXaiCreds({}, context));
        expect(error).toBeInstanceOf(BadRequestError);
        expect(error.message).toContain('creds getter returned undefined');
      });
    });
  });

  given('[case4] no supplier and no env var', () => {
    when('[t0] getSdkXaiCreds is called', () => {
      then('throws BadRequestError', async () => {
        delete process.env.XAI_API_KEY;
        const error = await getError(getSdkXaiCreds({}));
        expect(error).toBeInstanceOf(BadRequestError);
        expect(error.message).toContain('XAI_API_KEY required');
      });
    });
  });
});
