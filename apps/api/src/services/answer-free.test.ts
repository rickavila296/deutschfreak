import { describe, expect, it } from 'vitest';
import { answerFreeItem } from './answer-free.ts';

// TRD-ARCH-03, TRD-BE-05, TRD-SEC-11, TRD-EX-05, Schema §8.23: the stored payload holds the accepted answers, the
// model answer and the checklist; only the prompt side may reach the browser. Written before answer-free.ts.

describe('answerFreeItem', () => {
  it('keeps the prompt, the options and the audio reference', () => {
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
    expect(
      answerFreeItem('ex:b:i01', { audio: 'phrase:hallo', options: ['Hello', 'Bye'], answers: ['Hello'] }),
    ).toEqual({
      code: 'ex:b:i01',
      audio: 'phrase:hallo',
      options: ['Hello', 'Bye'],
    });
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
