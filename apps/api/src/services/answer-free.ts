import type { AnswerFreeItem } from '@deutschfreak/validation';

// Answer stripping (TRD-ARCH-03, TRD-BE-05, TRD-SEC-11, TRD-EX-05). The stored payload holds the prompt, options,
// accepted answers, hint, model answer and checklist (Schema §8.23); its shape is designed in Phase 8 (decision
// 0010). This is an ALLOW-list: only the prompt and the options are copied, so an answer key added later can never
// leak. The stored `audio` value is NOT copied: it is the code of the phrase being heard (phrase:hallo), which the
// lesson's own phrase block links to its meaning, the correct option (review 3 finding 1, decision 0021). Audio
// returns in Phase 7 as an opaque reference.

const isText = (value: unknown): value is string => typeof value === 'string' && value.length > 0;
const isTextList = (value: unknown): value is string[] => Array.isArray(value) && value.every(isText);

/** The answer-free shape of one exercise item: its code, and its prompt and options if present. */
export function answerFreeItem(code: string, payload: unknown): AnswerFreeItem {
  const item: AnswerFreeItem = { code };
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) return item;
  const { prompt, options } = payload as Record<string, unknown>;
  if (isText(prompt)) item.prompt = prompt;
  if (isTextList(options)) item.options = [...options];
  return item;
}
