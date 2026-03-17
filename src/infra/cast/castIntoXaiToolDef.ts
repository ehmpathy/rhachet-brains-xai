import type OpenAI from 'openai';
import type { BrainPlugToolDefinition } from 'rhachet/brains';
import { z } from 'zod';

/**
 * .what = cast rhachet tool definition to xai tool format
 * .why = explicit boundary between rhachet domain and provider SDK
 *
 * .note = xai uses openai-compatible "tools" parameter with type "function"
 */
export const castIntoXaiToolDef = (input: {
  tool: BrainPlugToolDefinition;
}): OpenAI.ChatCompletionTool => ({
  type: 'function' as const,
  function: {
    name: input.tool.slug,
    description: input.tool.description,
    parameters: z.toJSONSchema(input.tool.schema.input),
  },
});
