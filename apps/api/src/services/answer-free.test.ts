import { describe, expect, it } from 'vitest';
import { answerFreeItem } from './answer-free.ts';

// TRD-ARCH-03, TRD-BE-05, TRD-SEC-11, TRD-EX-05, Schema §8.23: the stored payload holds the accepted answers, the
// model answer and the checklist; only the prompt side may reach the browser. Written before answer-free.ts.

describe('answerFreeItem', () => {
  it('keeps the prompt and the options', () => {
    expect(
      answerFreeItem('ex:a:i01', {
        prompt: '8 a.m. You meet a colleague at work.',
        options: ['Guten Morgen', 'Guten Abend', 'Gute Nacht'],
        answers: ['Guten Morgen'],
      }),
    ).toEqual({
      code: 'ex:a:i01',
      prompt: '8 a.m. You meet a colleague at work.',
      options: ['Guten Morgen', 'Guten Abend', 'Gute Nacht'],
    });
  });

  it('drops the stored audio reference, which names the very phrase being heard (review 3 finding 1)', () => {
    // A listening item stores the code of the phrase it plays, e.g. phrase:hallo; the lesson's phrase block links
    // that code to its meaning "Hello", the correct option. Audio is sent again only as an opaque reference (Phase 7).
    const item = answerFreeItem('ex:b:i01', { audio: 'phrase:hallo', options: ['Hello', 'Bye'], answers: ['Hello'] });
    expect(item).toEqual({ code: 'ex:b:i01', options: ['Hello', 'Bye'] });
    expect(JSON.stringify(item)).not.toContain('phrase:hallo');
  });

  it('drops accepted answers, the model answer and the checklist', () => {
    const item = answerFreeItem('ex:c:i01', {
      prompt: 'Greet your teacher in the morning.',
      answers: ['Guten Morgen'],
      model: 'Guten Morgen, Frau Weber!',
      checklist: ['Used a formal greeting'],
    });
    expect(item).toEqual({ code: 'ex:c:i01', prompt: 'Greet your teacher in the morning.' });
  });

  it('drops any key it does not know, so a new answer key added later cannot leak', () => {
    const item = answerFreeItem('ex:d:i01', {
      prompt: 'p',
      solution: 'x',
      correct: 1,
      accepted: ['y'],
      key: 'z',
      hint: 'h',
    });
    expect(Object.keys(item).sort()).toEqual(['code', 'prompt']);
  });

  it('drops prompt-side keys whose value has the wrong type', () => {
    const item = answerFreeItem('ex:e:i01', { prompt: { answers: ['x'] }, options: 'Guten Tag', audio: ['phrase:x'] });
    expect(item).toEqual({ code: 'ex:e:i01' });
  });

  it('copies option lists, never handing out the stored array', () => {
    const options = ['a', 'b'];
    const item = answerFreeItem('ex:f:i01', { options });
    expect(item.options).toEqual(['a', 'b']);
    expect(item.options).not.toBe(options);
  });
});
