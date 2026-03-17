import type OpenAI from 'openai';
import type { BrainPlugToolExecution } from 'rhachet/brains';

/**
 * .what = cast rhachet tool executions to xai tool messages
 * .why = explicit boundary between rhachet domain and provider SDK
 *
 * .note = produces two message types:
 *   1. assistant message with tool_calls (required before tool messages)
 *   2. tool messages with execution results (role: 'tool')
 */
export const castIntoXaiToolMessages = (input: {
  executions: BrainPlugToolExecution[];
}): OpenAI.ChatCompletionMessageParam[] => {
  const messages: OpenAI.ChatCompletionMessageParam[] = [];

  // add assistant message with tool_calls (required before tool messages)
  messages.push({
    role: 'assistant' as const,
    content: null,
    tool_calls: input.executions.map((exec) => ({
      id: exec.exid,
      type: 'function' as const,
      function: {
        name: exec.slug,
        arguments: JSON.stringify(exec.input),
      },
    })),
  });

  // add tool execution results as tool messages
  for (const execution of input.executions) {
    messages.push({
      role: 'tool' as const,
      tool_call_id: execution.exid,
      content: JSON.stringify(execution.output),
    });
  }

  return messages;
};
