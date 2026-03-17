import type OpenAI from 'openai';
import type { BrainPlugToolInvocation } from 'rhachet/brains';

/**
 * .what = cast xai tool_call to rhachet tool invocation
 * .why = explicit boundary between provider SDK and rhachet domain
 *
 * .note = xai returns tool_calls in response.choices[0].message.tool_calls
 */
export const castFromXaiToolCall = (input: {
  call: OpenAI.ChatCompletionMessageToolCall;
}): BrainPlugToolInvocation => ({
  exid: input.call.id,
  slug: input.call.function.name,
  input: JSON.parse(input.call.function.arguments),
});
