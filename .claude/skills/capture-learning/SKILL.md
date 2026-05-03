---
name: capture-learning
description: Save a discussion's reusable insight as a dated report — when it won't survive elsewhere (code, commits, CLAUDE.md, memory).
allowed-tools: Read Grep Bash(date *) Bash(ls *) Bash(mkdir -p *) Bash(find *)
---

# capture-learning

Crystallize insight that emerged from conversation into a portable, searchable report. The deliverable is a markdown file that outlives the session.

## When to use

When a discussion has produced something worth keeping that won't naturally land elsewhere:

- A non-obvious explanation given in response to a user question
- Discarded options and the reasoning behind not picking them
- A conceptual model or mental framework worked out together
- A judgment call whose rationale won't fit in a commit message

**Propose proactively when:**

- A multi-turn Q&A has just closed with the user signaling agreement
- A conclusion was reached that won't be reflected in code
- The user mentions the insight applies beyond the current task

Confirm with one short question ("この議論を capture-learning として残しますか?") before generating.

## When NOT to use

If the content fits one of these buckets, write it there instead:

| Belongs in     | What goes there                                |
| -------------- | ---------------------------------------------- |
| commit message | What this commit changed and why               |
| PR description | What the PR does, test plan                    |
| CLAUDE.md      | Stable conventions future sessions must follow |
| memory         | Cross-project preferences, durable facts       |
| code comment   | Why a specific line surprises a reader         |

`capture-learning` is the bucket for **reusable insight with no other home**.

## How to write

1. **Extract an outline** from the discussion's perspectives — do not transcribe chronologically.
2. **Restructure** into sections; refine the outline if clarity improves.
3. **Quote verbatim**: code snippets and metaphors used during the discussion as explanation devices. They are the carriers of the insight.
4. **Link-reference, do not duplicate**: code that exists in the repo (e.g., `src/foo.ts:42-58`).
5. **Conclude with two subsections**:
   - **Concrete outcomes** — what tangibly remains (decisions, code, deps, PRs).
   - **Surfaced values** — judgment principles made explicit. The rarest and most reusable artifact.

## Templates

Read only the one that fits.

- `templates/discussion.md` — **default**; insights from Q&A or conceptual discussion
- `templates/design-decision.md` — when the discussion produced an implementation decision
- `templates/troubleshoot.md` — when the discussion solved a specific problem

## File location and naming

```text
{reports-dir}/YYYY-MM-DD_{kebab-case-slug}.md
```

- **Date**: today's local date. Run `date +%Y-%m-%d` if not already in context.
- **Slug**: English kebab-case. Include the viewpoint or conclusion (✗ `xml-parser-discussion`, ✓ `xmldom-vulnerability-survey-and-keep-decision`).
- **Directory**, in priority order:
  1. Convention noted in the project's `CLAUDE.md`
  2. Existing reports directory (e.g., `docs/reports/`, `docs/learning/`, `notes/`)
  3. Ask the user

## Operating principles

- **Body language**: write in the project's documentation language. Match existing reports in the same directory.
- **No header metadata**: filename carries the date, directory carries the project. Do not duplicate as `日付:` / `対象プロジェクト:` / `関連ファイル:` lines.
- **One topic per file**: split if the discussion spans distinct topics; cross-link.
- **Idempotency**: if a report on this topic already exists, ask the user: (a) update in place if the new content augments without contradicting, (b) write a new file with `supersedes: <previous-file>` if the conclusion changed, or (c) use a different slug if the topic differs.
- **No transcript dumps**: do not write "the user said X, I replied Y". Reorganize as crystallized knowledge.
- **No intermediate artifacts**: produce only the final report. No drafts, no scratch notes.
- **Do not retrofit existing reports** when conventions change. Apply new conventions to new reports only — historical drift is part of the record.

## Workflow

1. Identify the report type (discussion / design-decision / troubleshoot)
2. Read the corresponding template file
3. Determine the output directory (per "File location and naming")
4. Check for existing reports on the same topic (idempotency)
5. Propose a title and outline to the user; get agreement
6. Write the report
7. Optionally commit it (the report is part of the project's documentation)
