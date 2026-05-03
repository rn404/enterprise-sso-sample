<!--
Template for capture-learning: design-decision type.
Use when the discussion produced an implementation decision with concrete
trade-offs, constraints, and migration thresholds.
Placeholders in {curly braces} should be rendered in the project's documentation language.
-->

# {Title — name the decision and the angle (✓ "handwritten-schema-sql-policy", ✗ "db-decisions")}

## 1. {Background and scope}

{What is this about? Why was a decision needed? What constraints were
in play (project stage, team size, existing tooling)?}

## 2. {Adopted approach}

{The concrete configuration / implementation. Include code, DDL, or
config snippets where they carried the explanation.}

### 2.1 {Component / aspect A}

### 2.2 {Component / aspect B}

## 3. {Constraints / non-goals}

{Explicit list of what this approach does NOT do. A "won't support"
table is the most useful form.}

| {Operation} | {Supported?} | {Note} |
| ----------- | ------------ | ------ |
| {...}       | {...}        | {...}  |

## 4. {Why this approach}

{The reasoning. Include why alternatives were not chosen — those
discarded paths are often the most reusable knowledge.}

- **{Reason 1}** — {explanation}
- **{Reason 2}** — {explanation}

## 5. {Future options}

{Migration targets when scope grows. Order from cheapest to most
disruptive.}

### 5.1 {Option A}
### 5.2 {Option B}

## 6. {Migration thresholds}

{Concrete conditions for "when to leave this approach behind". Avoid
vague language like "if it gets too complex" — write measurable signals.}

- {Condition 1, e.g., "table count exceeds 5 with column changes"}
- {Condition 2, e.g., "shared deployment environment is added"}

## 7. {Conclusion}

### 7.1 {Concrete outcomes}

- {what is now in the repo as a result}
- {what was deliberately not added}
- {related files / commits / PRs}

### 7.2 {Surfaced values}

- **{Value 1 — imperative form}** — {brief reason}
- **{Value 2 — imperative form}** — {brief reason}
