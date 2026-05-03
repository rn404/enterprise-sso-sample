<!--
Template for capture-learning: troubleshoot type.
Use when the discussion solved a specific problem and the diagnostic
trail itself is the reusable artifact.
Placeholders in {curly braces} should be rendered in the project's documentation language.
-->

# {Title — name the symptom and the resolved cause (✓ "saml-login-fails-when-clock-skew-exceeds-5-min")}

## 1. {Symptom and discovery}

{What was observed? When? In what environment? Include exact error
messages or behavior so this report is grep-able later.}

## 2. {Reproduction steps}

{The minimal sequence that reliably reproduces the problem.}

```text
1. {step}
2. {step}
3. {observed behavior}
```

## 3. {Root cause}

{What was actually broken, and why the symptom looked the way it did.
Distinguish the proximate cause from the underlying cause.}

## 4. {Resolution}

{What was changed to fix it. Link to the commit, PR, or specific file
ranges (`src/foo.ts:42-58`). Do not transcribe the fix code unless the
fix is illustrative beyond the diff itself.}

## 5. {Investigation trail — discarded hypotheses}

{Optional but high-value: which hypotheses were investigated and
discarded, and why each trail was misleading. This is the part that
helps the next person who hits the same symptom.}

- **Hypothesis: {description}** — discarded because {reason}
- **Hypothesis: {description}** — discarded because {reason}

## 6. {Conclusion}

### 6.1 {Concrete outcomes}

- {the fix — commit / PR link}
- {regression test added, if any}
- {dependency or config change}
- {monitoring / alerting added, if any}

### 6.2 {Surfaced values}

{Reusable diagnostic principles surfaced by this debugging session.}

- **{Principle 1 — imperative form}** — {brief reason}
- **{Principle 2 — imperative form}** — {brief reason}
