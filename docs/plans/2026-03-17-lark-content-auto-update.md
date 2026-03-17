# Lark Content Auto-Update Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a self-updating Lark content pipeline in this fork that converts the large upstream JSON export into curated Context Hub content and refreshes it on a schedule.

**Architecture:** Add a small, testable Node library that groups and renders the upstream Lark JSON into Context Hub `DOC.md` and `references/*.md` files. Wrap that library in a repository-level script that fetches the JSON, regenerates `content/lark/`, and pair it with a GitHub Actions workflow that runs on schedule and commits updates back to the fork when content changes.

**Tech Stack:** Node.js 18+/22, Vitest, GitHub Actions, existing `chub build` validation pipeline.

### Task 1: Add failing tests for Lark grouping and rendering

**Files:**
- Create: `cli/tests/lib/lark-content.test.js`
- Create: `cli/src/lib/lark-content.js`

**Step 1: Write the failing test**

Create tests that define:
- grouping by top-level Lark directory into stable Context Hub entries
- entry frontmatter and `DOC.md` summary rendering
- per-page reference file rendering that preserves source URL and update date

**Step 2: Run test to verify it fails**

Run:

```bash
cd cli && npm test -- tests/lib/lark-content.test.js
```

Expected: FAIL because `cli/src/lib/lark-content.js` does not exist yet.

**Step 3: Write minimal implementation**

Add a focused library that:
- maps Lark directory prefixes to stable entry slugs
- groups records into entries
- generates frontmatter-backed `DOC.md`
- generates `references/*.md` output for each record

**Step 4: Run test to verify it passes**

Run:

```bash
cd cli && npm test -- tests/lib/lark-content.test.js
```

Expected: PASS

### Task 2: Add a repository script that regenerates `content/lark`

**Files:**
- Create: `scripts/update-lark-content.mjs`
- Modify: `package.json`

**Step 1: Write the failing test**

Prefer a small unit-style test in `cli/tests/lib/lark-content.test.js` that covers the library behavior the script relies on instead of testing filesystem-heavy script execution directly.

**Step 2: Run test to verify it fails**

Reuse the Task 1 test run until the library API is stable.

**Step 3: Write minimal implementation**

Implement a script that:
- fetches `https://lf3-static.bytednsdoc.com/obj/eden-cn/oaleh7nupthpqbe/larkopenapidoc.json`
- filters and groups entries through the new library
- rewrites `content/lark/docs/...`
- emits deterministic files so scheduled commits stay clean

Add a root npm script for convenience, for example:

```bash
npm run update:lark-content
```

**Step 4: Run script locally**

Run:

```bash
npm run update:lark-content
```

Expected: generated `content/lark/` tree with stable `DOC.md` and `references/*.md` files.

### Task 3: Document local usage and maintenance

**Files:**
- Create: `docs/lark-content.md`

**Step 1: Write the documentation**

Cover:
- what the upstream JSON is
- how the generator maps records into Context Hub entries
- how to run regeneration locally
- how scheduled updates work in the fork

**Step 2: Validate wording against implementation**

Run:

```bash
node cli/bin/chub build content --validate-only
```

Expected: PASS, and the documented commands align with reality.

### Task 4: Add scheduled GitHub Actions update workflow

**Files:**
- Create: `.github/workflows/update-lark-content.yml`

**Step 1: Write the workflow**

Implement a workflow that:
- runs on `workflow_dispatch`
- runs on a weekly schedule
- installs dependencies
- runs `npm run update:lark-content`
- runs `node cli/bin/chub build content --validate-only`
- commits and pushes changes back to `main` only when generated content changed

**Step 2: Sanity-check workflow syntax**

Review the workflow against existing patterns in:
- `.github/workflows/ci.yml`
- `.github/workflows/deploy-content.yml`

**Step 3: Verify generated repo stays valid**

Run:

```bash
node cli/bin/chub build content --validate-only
```

Expected: PASS after local generation.

### Task 5: Final verification

**Files:**
- Test: `cli/tests/lib/lark-content.test.js`
- Validate: generated `content/lark/**`

**Step 1: Run focused tests**

```bash
cd cli && npm test -- tests/lib/lark-content.test.js
```

Expected: PASS

**Step 2: Run broader validation**

```bash
cd cli && npm test
node cli/bin/chub build content --validate-only
```

Expected: PASS

**Step 3: Commit**

```bash
git add docs/plans/2026-03-17-lark-content-auto-update.md \
        cli/tests/lib/lark-content.test.js \
        cli/src/lib/lark-content.js \
        scripts/update-lark-content.mjs \
        docs/lark-content.md \
        .github/workflows/update-lark-content.yml \
        package.json \
        content/lark
git commit -m "feat: add self-updating lark content pipeline"
```
