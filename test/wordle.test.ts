import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { matchGuess } from '../src/wordle';

// Recitation Part 1: follow along with your TA, filling in the todos below.
// Problem set Task 1: keep adding properties until `npm run mutants:wordle`
// kills every mutant. Read the spec in src/wordle/matchGuess.ts.
//
// Label every property with its pattern, on the line above its `it(`:
//   // Pattern: invariant. The result always has exactly five colors.
// (invariant, algebraic, metamorphic, differential, or conditional)

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Step 1: a generator for five-letter uppercase words.
// const word = ...


const wordFrom = (letters: string) =>
  fc.array(fc.constantFrom(...letters), { minLength: 5, maxLength: 5}).map(cs => cs.join(''));
const word = wordFrom(ALPHABET);


// Pattern: invariant. result always have exactly five colors. 

it('returns exactly five colors', () => {
  fc.assert(
    fc.property(word,word, (secret, guess) => {
      expect(matchGuess(secret, guess)).toHaveLength(5);
    }),
  )

})

//PAttern: Invariant. every color is g y or b 
it('only uses the colors G, Y, B', () => {
  fc.assert(
    fc.property(word,word, (secret, guess) => {
      for (const c of matchGuess(secret, guess)) expect ( ['G','Y','B']).toContain(c);
    }),
  )

})


//Pattern: conditional. If guess is secret, every color is green.
it('Guessing the secret gives all greens', () => {
  fc.assert(
    fc.property(word, w => {
      expect(matchGuess(w, w)).toEqual(['G', 'G', 'G', 'G', 'G', ]);
    }),
  )

})


//Pattern: invariant. No letter is credited (g or y) more times than the secret contains it.
it('never credits a letter more times than the secret contains it', () => {
  fc.assert(
    fc.property(wordFrom('ABC'), wordFrom('ABC'), (secret, guess) => {
      const result = matchGuess(secret, guess);

      for (const letter of new Set(guess)) {
        const credited = [...guess].filter(
          (c, i) => c === letter && result[i] !== 'B'
        ).length;

        const inSecret = [...secret].filter(
          c => c === letter
        ).length;

        expect(credited).toBeLessThanOrEqual(inSecret);
      }
    }),
  );
});

// Pattern: metamorphic. Renaming letters consistently preserves the colors.
it('gives the same colors when letters are renamed', () => {
  function rename(word: string): string {
    return [...word].map(letter => {
      const index = ALPHABET.indexOf(letter);
      const nextIndex = (index + 1) % ALPHABET.length;
      return ALPHABET[nextIndex];
    }).join('');
  }

  fc.assert(
    fc.property(word, word, (secret, guess) => {
      const originalResult = matchGuess(secret, guess);
      const renamedResult = matchGuess(rename(secret), rename(guess));

      expect(renamedResult).toEqual(originalResult);
    }),
  );
});

// Pattern: conditional. Moving five distinct letters out of position gives all yellows.
it('gives all yellows when distinct letters are rotated', () => {
  const distinctLetters = fc.shuffledSubarray([...ALPHABET], {
    minLength: 5,
    maxLength: 5,
  });

  fc.assert(
    fc.property(distinctLetters, letters => {
      const secret = letters.join('');
      const guess = letters.slice(1).join('') + letters[0];

      expect(matchGuess(secret, guess)).toEqual([
        'Y', 'Y', 'Y', 'Y', 'Y',
      ]);
    }),
  );
});



describe('matchGuess', () => {
  it.todo('returns exactly five colors');
  it.todo('only uses the colors G, Y, B');
  it.todo('guessing the secret gives all greens');
  it.todo('never credits a letter more times than the secret contains it');
});
