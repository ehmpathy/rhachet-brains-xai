import { BadRequestError, UnexpectedCodePathError } from 'helpful-errors';
import path from 'path';
import { genArtifactGitFile } from 'rhachet-artifact-git';
import { given, then, useThen, when } from 'test-fns';
import { z } from 'zod';

import { TEST_ASSETS_DIR } from '../../.test/assets/dir';
import { genBrainAtom } from './genBrainAtom';

const BRIEFS_DIR = path.join(TEST_ASSETS_DIR, '/example.briefs');

const outputSchema = z.object({ content: z.string() });

if (!process.env.XAI_API_KEY)
  throw new BadRequestError('XAI_API_KEY is required for integration tests');

describe('genBrainAtom.integration', () => {
  jest.setTimeout(30000);

  // use grok-code-fast-1 for fast integration tests
  const brainAtom = genBrainAtom({ slug: 'xai/grok/code-fast-1' });

  given('[case1] genBrainAtom({ slug: "xai/grok/code-fast-1" })', () => {
    when('[t0] atom is created', () => {
      then('repo is "xai"', () => {
        expect(brainAtom.repo).toEqual('xai');
      });

      then('slug is "xai/grok/code-fast-1"', () => {
        expect(brainAtom.slug).toEqual('xai/grok/code-fast-1');
      });

      then('description is defined', () => {
        expect(brainAtom.description).toBeDefined();
        expect(brainAtom.description.length).toBeGreaterThan(0);
      });
    });
  });

  given('[case2] ask is called', () => {
    when('[t0] with simple prompt', () => {
      // call the operation once and share result across assertions
      const result = useThen('it returns a response', async () =>
        brainAtom.ask({
          role: {},
          prompt: 'respond with exactly: hello world',
          schema: { output: outputSchema },
        }),
      );

      then('response contains "hello"', () => {
        expect(result.output.content).toBeDefined();
        expect(result.output.content.length).toBeGreaterThan(0);
        expect(result.output.content.toLowerCase()).toContain('hello');
      });

      then('metrics includes token counts', () => {
        expect(result.metrics.size.tokens.input).toBeGreaterThan(0);
        expect(result.metrics.size.tokens.output).toBeGreaterThan(0);
      });

      then('metrics includes cash costs', () => {
        expect(result.metrics.cost.cash.deets.input).toBeDefined();
        expect(result.metrics.cost.cash.deets.output).toBeDefined();
        expect(result.metrics.cost.cash.total).toBeDefined();
      });

      then('metrics includes time cost', () => {
        expect(result.metrics.cost.time).toBeDefined();
      });
    });

    when('[t1] with briefs', () => {
      then('response leverages knowledge from brief', async () => {
        const briefs = [
          genArtifactGitFile({
            uri: path.join(BRIEFS_DIR, 'secret-code.brief.md'),
          }),
        ];
        const result = await brainAtom.ask({
          role: { briefs },
          prompt: 'say hello',
          schema: { output: outputSchema },
        });
        expect(result.output.content).toBeDefined();
        expect(result.output.content).toContain('ZEBRA42');
      });
    });
  });

  given('[case3] episode continuation', () => {
    when('[t0] ask is called with initial prompt', () => {
      const resultFirst = useThen('it succeeds', async () =>
        brainAtom.ask({
          role: {},
          prompt:
            'remember this secret code: MANGO77. respond with "code received"',
          schema: { output: outputSchema },
        }),
      );

      then('it returns an episode', () => {
        expect(resultFirst.episode).toBeDefined();
        expect(resultFirst.episode.hash).toBeDefined();
        expect(resultFirst.episode.exchanges).toHaveLength(1);
      });

      then('series is null for atoms', () => {
        expect(resultFirst.series).toBeNull();
      });
    });

    when('[t1] ask is called with continuation via on.episode', () => {
      const resultFirst = useThen('first ask succeeds', async () =>
        brainAtom.ask({
          role: {},
          prompt:
            'remember this secret code: PAPAYA99. respond with "code stored"',
          schema: { output: outputSchema },
        }),
      );

      const resultSecond = useThen('second ask succeeds', async () =>
        brainAtom.ask({
          on: { episode: resultFirst.episode },
          role: {},
          prompt: 'what was the secret code i told you to remember?',
          schema: { output: outputSchema },
        }),
      );

      then('continuation remembers context from prior exchange', () => {
        expect(resultSecond.output.content).toContain('PAPAYA99');
      });

      then('episode accumulates exchanges', () => {
        expect(resultSecond.episode.exchanges).toHaveLength(2);
      });
    });
  });

  given('[case4] tool invocation with output schema', () => {
    // define a simple weather lookup tool
    const weatherTool = {
      slug: 'weather.lookup',
      name: 'Weather Lookup',
      description: 'Get the current weather for a city',
      schema: {
        input: z.object({ city: z.string() }),
        output: z.object({ temp: z.number(), conditions: z.string() }),
      },
    };

    when('[t0] ask is called with tools plugged', () => {
      const result = useThen('it requests tool invocation', async () =>
        brainAtom.ask({
          role: {},
          prompt: 'What is the current weather in Austin, Texas?',
          schema: { output: outputSchema },
          plugs: { tools: [weatherTool] },
        }),
      );

      then('calls.tools is populated', () => {
        expect(result.calls).not.toBeNull();
        expect(result.calls?.tools).toBeDefined();
        expect(result.calls?.tools.length).toBeGreaterThan(0);
      });

      then('invocation has slug', () => {
        expect(result.calls?.tools[0]?.slug).toEqual('weather.lookup');
      });

      then('invocation has input', () => {
        expect(result.calls?.tools[0]?.input).toBeDefined();
        expect(
          (result.calls?.tools[0]?.input as { city: string }).city,
        ).toBeDefined();
      });

      then('invocation has exid', () => {
        expect(result.calls?.tools[0]?.exid).toBeDefined();
        expect(result.calls?.tools[0]?.exid.length).toBeGreaterThan(0);
      });

      then('output is null when tools called', () => {
        expect(result.output).toBeNull();
      });

      then('metrics are tracked', () => {
        expect(result.metrics.size.tokens.input).toBeGreaterThan(0);
        expect(result.metrics.size.tokens.output).toBeGreaterThan(0);
        expect(result.metrics.cost.cash.total).toBeDefined();
        expect(result.metrics.cost.time).toBeDefined();
      });
    });
  });

  given('[case5] tool invocation with numeric computation', () => {
    // define a calculator tool
    const calculatorTool = {
      slug: 'calculator.add',
      name: 'Calculator Add',
      description: 'Add two numbers together',
      schema: {
        input: z.object({ a: z.number(), b: z.number() }),
        output: z.object({ result: z.number() }),
      },
    };

    when(
      '[t0] ask is called with tools and prompt requires calculation',
      () => {
        const result = useThen('it requests tool invocation', async () =>
          brainAtom.ask({
            role: {},
            prompt: 'What is 42 + 17?',
            schema: { output: outputSchema },
            plugs: { tools: [calculatorTool] },
          }),
        );

        then('calls.tools is populated', () => {
          expect(result.calls).not.toBeNull();
          expect(result.calls?.tools.length).toBeGreaterThan(0);
        });

        then('output is null', () => {
          expect(result.output).toBeNull();
        });
      },
    );
  });

  given('[case6] brain answers directly with tools plugged', () => {
    // define a tool that should NOT be needed for this prompt
    const unusedTool = {
      slug: 'database.query',
      name: 'Database Query',
      description: 'Query a database for records',
      schema: {
        input: z.object({ sql: z.string() }),
        output: z.object({ rows: z.array(z.unknown()) }),
      },
    };

    when('[t0] ask is called with answerable prompt', () => {
      const result = useThen('it answers directly', async () =>
        brainAtom.ask({
          role: {},
          prompt:
            'What is the capital of France? Answer with just the city name.',
          schema: { output: outputSchema },
          plugs: { tools: [unusedTool] },
        }),
      );

      then('calls is null', () => {
        expect(result.calls).toBeNull();
      });

      then('output is populated', () => {
        expect(result.output).not.toBeNull();
        expect(result.output?.content.toLowerCase()).toContain('paris');
      });
    });
  });

  given('[case7] metrics with tools', () => {
    const metricsTool = {
      slug: 'time.now',
      name: 'Current Time',
      description: 'Get the current time',
      schema: {
        input: z.object({}),
        output: z.object({ time: z.string() }),
      },
    };

    when('[t0] ask is called with tools', () => {
      const result = useThen('it completes', async () =>
        brainAtom.ask({
          role: {},
          prompt: 'What time is it right now?',
          schema: { output: outputSchema },
          plugs: { tools: [metricsTool] },
        }),
      );

      then('tokens input is tracked', () => {
        expect(result.metrics.size.tokens.input).toBeGreaterThan(0);
      });

      then('tokens output is tracked', () => {
        expect(result.metrics.size.tokens.output).toBeGreaterThan(0);
      });

      then('cost cash is tracked', () => {
        expect(result.metrics.cost.cash.total).toBeDefined();
      });

      then('cost time is tracked', () => {
        expect(result.metrics.cost.time).toBeDefined();
      });
    });
  });

  given('[case8] tool continuation', () => {
    jest.setTimeout(60000); // longer timeout for multi-turn

    const mathTool = {
      slug: 'math.multiply',
      name: 'Math Multiply',
      description: 'Multiply two numbers',
      schema: {
        input: z.object({ a: z.number(), b: z.number() }),
        output: z.object({ result: z.number() }),
      },
    };

    when('[t0] tool result is fed back', () => {
      // first call: get tool invocation
      const resultFirst = useThen('first ask gets tool call', async () =>
        brainAtom.ask({
          role: {},
          prompt: 'What is 7 multiplied by 6?',
          schema: { output: outputSchema },
          plugs: { tools: [mathTool] },
        }),
      );

      // second call: feed tool execution result
      const resultSecond = useThen('second ask with tool result', async () => {
        // simulate tool execution
        const execution = {
          exid: resultFirst.calls?.tools[0]?.exid ?? '',
          slug: 'math.multiply',
          input: resultFirst.calls?.tools[0]?.input ?? { a: 7, b: 6 },
          signal: 'success' as const,
          output: { result: 42 },
          metrics: { cost: { time: { milliseconds: 1 } } },
        };

        return brainAtom.ask({
          on: { episode: resultFirst.episode },
          role: {},
          prompt: [execution],
          schema: { output: outputSchema },
          plugs: { tools: [mathTool] },
        });
      });

      then('final output is populated', () => {
        expect(resultSecond.output).not.toBeNull();
        expect(resultSecond.output?.content).toContain('42');
      });

      then('calls is null after final answer', () => {
        expect(resultSecond.calls).toBeNull();
      });
    });
  });

  given('[case9] tool error:constraint signal', () => {
    jest.setTimeout(60000);

    const validatorTool = {
      slug: 'validator.check',
      name: 'Validator Check',
      description: 'Validate user input against rules',
      schema: {
        input: z.object({ value: z.string() }),
        output: z.object({ valid: z.boolean(), reason: z.string().optional() }),
      },
    };

    when('[t0] tool returns error:constraint signal', () => {
      const resultFirst = useThen('first ask gets tool call', async () =>
        brainAtom.ask({
          role: {},
          prompt: 'Check if "invalid-email" is a valid email address',
          schema: { output: outputSchema },
          plugs: { tools: [validatorTool] },
        }),
      );

      const resultSecond = useThen(
        'second ask with constraint error',
        async () => {
          const execution = {
            exid: resultFirst.calls?.tools[0]?.exid ?? '',
            slug: 'validator.check',
            input: resultFirst.calls?.tools[0]?.input ?? {
              value: 'invalid-email',
            },
            signal: 'error:constraint' as const,
            output: { error: new BadRequestError('Invalid email format') },
            metrics: { cost: { time: { milliseconds: 1 } } },
          };

          return brainAtom.ask({
            on: { episode: resultFirst.episode },
            role: {},
            prompt: [execution],
            schema: { output: outputSchema },
            plugs: { tools: [validatorTool] },
          });
        },
      );

      then('brain reasons about the constraint violation', () => {
        expect(resultSecond.output).not.toBeNull();
        // brain should acknowledge the validation failure
        expect(resultSecond.output?.content.toLowerCase()).toMatch(
          /invalid|error|not valid|fail/,
        );
      });
    });
  });

  given('[case10] tool error:malfunction signal', () => {
    jest.setTimeout(60000);

    const apiTool = {
      slug: 'api.fetch',
      name: 'API Fetch',
      description: 'Fetch data from external API',
      schema: {
        input: z.object({ endpoint: z.string() }),
        output: z.object({ data: z.unknown() }),
      },
    };

    when('[t0] tool returns error:malfunction signal', () => {
      const resultFirst = useThen('first ask gets tool call', async () =>
        brainAtom.ask({
          role: {},
          prompt: 'Fetch user data from /api/users/123',
          schema: { output: outputSchema },
          plugs: { tools: [apiTool] },
        }),
      );

      const resultSecond = useThen(
        'second ask with malfunction error',
        async () => {
          const execution = {
            exid: resultFirst.calls?.tools[0]?.exid ?? '',
            slug: 'api.fetch',
            input: resultFirst.calls?.tools[0]?.input ?? {
              endpoint: '/api/users/123',
            },
            signal: 'error:malfunction' as const,
            output: {
              error: new UnexpectedCodePathError(
                'Connection timeout after 30s',
              ),
            },
            metrics: { cost: { time: { milliseconds: 30000 } } },
          };

          return brainAtom.ask({
            on: { episode: resultFirst.episode },
            role: {},
            prompt: [execution],
            schema: { output: outputSchema },
            plugs: { tools: [apiTool] },
          });
        },
      );

      then('brain reasons about the malfunction', () => {
        expect(resultSecond.output).not.toBeNull();
        // brain should acknowledge the service failure
        expect(resultSecond.output?.content.toLowerCase()).toMatch(
          /error|fail|timeout|unavailable|unable|issue|problem/,
        );
      });
    });
  });
});
