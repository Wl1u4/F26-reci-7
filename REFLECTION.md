# Reflection

**Name / Andrew ID:**
Wliu4

**Recitation group members (Task 2):**

---

### 1. Valid but weak

Pick a property you wrote that passes on the correct implementation but
kills few or no mutants. Why is it still a *valid* property? Describe a
concrete bug (not one of our mutants) that it *would* catch.

My property "returns exactly 5 colors" did not kill any public mutants. It's still valid cause the specifcation requires one color for each 5 guessed ones. It would catch an off by one
bug where the function skips the last letter and returns only 4. 


### 2. A generator problem, not a property problem

Describe a mutant, from either task, that survived or was flaky because of
your **generator** rather than your property. What did the generator fail to
produce? How did you fix it? Paste the runner output from before and after.


The singlePass mutant was flaky with the "never credits a letter more times than the secret contains it" property. Generating words from all letters didn't produce enough repeated letter
cases to expose the bug relibaly so then I changed this proerpty's generator to use only ABC, making duplicates more freqeunt. 

Before:

~ singlePass     flaky: killed in 4/5 runs  by: never credits a letter more times than the secret contains it
    Counterexample: ["AAAAT","AATAT"]
    AssertionError: expected 2 to be less than or equal to 1


After:

✔ singlePass     killed  by: never credits a letter more times than the secret contains it
    Counterexample: ["AAAAC","AAACC"]
    AssertionError: expected 2 to be less than or equal to 1

After the change mutant was killed in all 5 runs.

### 3. Reading a counterexample

Paste one counterexample that the mutation runner printed for a killed
mutant. In 2–3 sentences, explain using the *specification* why that input
exposes the bug.

✔ touchingNotMerged     killed  by: merges touching intervals; gives the same result when the input order is reversed
    Counterexample: [0,1,1]
    AssertionError: expected [ [ +0, 1 ], [ 1, 2 ] ] to deeply equal [ [ +0, 2 ] ]

### 4. Your project

Name one function or module in your team's project that would benefit from
property-based testing. State two properties in English, name the pattern of
each, and describe the generator you'd need, including anything about its
inputs that a naive generator would get wrong.


The Permission.evaluate in `packages/opencode/src/permission`. It decides whether a tool is allowed asked about or denied on a given file after Permission.merge stacks the built in defaults, the agent's
settings and the user's settings into one list of rules. The last matching rule in that list would take over... win. 

Property 1 (differential): Write a tiny helper that reads the rule list backwards and returns the first rule that matches the file. evaluate should give same answer as helper every time. 
This locks in the rule that the last match wins. 

Property 2 (conditional): if rules include a deny everything entry for a tool, then every file is denied for that tool unless a rule placed after it also matches. 
This is the case that got me where a blanket deny "secretly" wiped out the .env protection I inherited from the defaults. 

Generator: It makes up a few layers of fake rules and one question to
ask, like "can this agent read packages/app/.env?" 

Three things a naive
generator can get wrong:

- If  file path and  rule patterns are made up separately, the path
  will almost never match any of them, so every run only tests the boring
  case where nothing matched. The path has to be built from one of the
  patterns on purpose, along with close calls like `.env.example`.
- Randomly made up patterns rarely cover the same file, so there is never a
  conflict between two rules and the last matchwins behavior is never
  tested. The patterns should come from a small pool that overlaps on
  purpose, like `*`, `*.env`, `*.env.*`, and `src/**`. Same thing that was done as
  shrinking the alphabet to ABC.
- Tool names have to be real ones like read or bash, and there have to be at
  least two layers of rules, since one layer alone never tests how the
  defaults, the agent settings, and the user settings stack together.