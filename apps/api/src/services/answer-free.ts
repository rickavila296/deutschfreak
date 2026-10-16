import type { AnswerFreeItem } from '@deutschfreak/validation';

// Answer stripping (TRD-ARCH-03, TRD-BE-05, TRD-SEC-11, TRD-EX-05). The stored payload holds the prompt, options,
// accepted answers, hint, model answer and checklist (Schema §8.23); its shape is designed in Phase 8 (decision
// 0010). This is an ALLOW-list: only the prompt side is copied, so an answer key added later can never leak.

const isText = (value: unknown): value is string => typeof value === 'string' && value.length > 0;
const isTextList = (value: unknown): value is string[] => Array.isArray(value) && value.every(isText);

/** The answer-free shape of one exercise item: its code, and its prompt, options and audio reference if present. */
export function answerFreeItem(code: string, payload: unknown): AnswerFreeItem {
  const item: AnswerFreeItem = { code };
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) return item;
  const { prompt, options, audio } = payload as Record<string, unknown>;
  if (isText(prompt)) item.prompt = prompt;
  if (isTextList(options)) item.options = [...options];
  if (isText(audio)) item.audio = audio;
  return item;
}
