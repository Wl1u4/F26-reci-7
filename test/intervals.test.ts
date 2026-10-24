import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { mergeIntervals, type Interval } from '../src/intervals';

// Recitation Part 2 (groups) and problem set Task 2.
// Read the spec in src/intervals/mergeIntervals.ts, then check your progress
// with `npm run mutants:intervals`.
//
// Label every property with its pattern, on the line above its `it(`:
//   // Pattern: invariant. The output is sorted.
// (invariant, algebraic, metamorphic, differential, or conditional)

// A first attempt at a generator. It has a problem: run the tests and read
// the counterexample.

 // Generate two numbers, then put the smaller one first.
// This guarantees a valid interval: start <= end.
const interval: fc.Arbitrary<Interval> = fc
  .tuple(
    fc.integer({ min: -20, max: 20 }),
    fc.integer({ min: -20, max: 20 }),
  )
  .map(([first, second]): Interval => {
    const start = Math.min(first, second);
    const end = Math.max(first, second);
    return [start, end];
  });

const intervalList = fc.array(interval);

describe('mergeIntervals', () => {
  // Pattern: invariant. Every input interval lies inside some output interval.
  it('every input interval lies inside some output interval', () => {
    fc.assert(
      fc.property(intervalList, xs => {
        const out = mergeIntervals(xs);
        const uncovered = xs.filter(([s, e]) => !out.some(([a, b]) => a <= s && e <= b));
        expect(uncovered).toEqual([]);
      }),
    );
  });



  // Construct sorted intervals with a gap of 1 between them.
  const disjointIntervals = fc
  .array(fc.integer({ min: 0, max: 5 }), {
    minLength: 2,
    maxLength: 8,
  })
  .map(lengths => {
    const intervals: Interval[] = [];
    let start = 0;

    for (const length of lengths) {
      const end = start + length;
      intervals.push([start, end]);
      start = end + 1;
    }

    return intervals;
  });

  // Add your properties here. Aim for at least one of each pattern:
  // invariant, algebraic, metamorphic, differential, conditional.


  // Pattern: differential. Input and output cover exactly the same points.
  it('preserves which points are covered', () => {
    fc.assert(
      fc.property(intervalList, intervals => {
        const merged = mergeIntervals(intervals);

        for (let point = -21; point <= 21; point += 0.5) {
          const coveredBefore = intervals.some(
            ([start, end]) => start <= point && point <= end,
          );

          const coveredAfter = merged.some(
            ([start, end]) => start <= point && point <= end,
          );

          expect(coveredAfter).toBe(coveredBefore);
        }
      }),
    );
  });


  // Pattern: metamorphic. Reversing the input order does not change the result.
  it('gives the same result when the input order is reversed', () => {
    fc.assert(
      fc.property(intervalList, intervals => {
        const reversed = [...intervals].reverse();

        const originalResult = mergeIntervals(intervals);
        const reversedResult = mergeIntervals(reversed);

        expect(reversedResult).toEqual(originalResult);
      }),
    );
  });

  // Pattern: algebraic. Merging twice gives the same result as merging once.
  it('merging an already-merged result changes nothing', () => {
    fc.assert(
      fc.property(intervalList, intervals => {
        const mergedOnce = mergeIntervals(intervals);
        const mergedTwice = mergeIntervals(mergedOnce);

        expect(mergedTwice).toEqual(mergedOnce);
      }),
    );
  });


  // Pattern: conditional. Sorted, disjoint, non-touching intervals stay unchanged.
  it('leaves already-disjoint intervals unchanged', () => {
    fc.assert(
      fc.property(disjointIntervals, intervals => {
        const result = mergeIntervals(intervals);

        expect(result).toEqual(intervals);
      }),
    );
  });


    // Pattern: conditional. Two intervals sharing an endpoint merge into one.
  it('merges touching intervals', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -20, max: 20 }),
        fc.integer({ min: 1, max: 10 }),
        fc.integer({ min: 1, max: 10 }),
        (start, firstLength, secondLength) => {
          const middle = start + firstLength;
          const end = middle + secondLength;

          const intervals: Interval[] = [
            [start, middle],
            [middle, end],
          ];

          expect(mergeIntervals(intervals)).toEqual([[start, end]]);
        },
      ),
    );
  });


  // Pattern: invariant. Merging does not modify the input or its intervals.
  it('does not change the input', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -20, max: 20 }),
        fc.integer({ min: 1, max: 10 }),
        (start, length) => {
          const intervals: Interval[] = [
            [start, start + length],
            [start + length, start + length + 1],
          ];

          const original = intervals.map(
            ([start, end]): Interval => [start, end],
          );

          mergeIntervals(intervals);

          expect(intervals).toEqual(original);
        },
      ),
    );
  });


});
