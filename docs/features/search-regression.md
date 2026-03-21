# Search Regression

This workflow provides repeatable search-quality checks for local Context Hub content.

## Files

- `scripts/search_regression.py`: regression runner.
- `scripts/search_regression_cases.json`: query cases and expectations.
- `scripts/search_regression_baseline.json`: generated snapshot (current top results).

## Run

From repository root:

```bash
python3 scripts/search_regression.py --mode check
```

Generate a fresh snapshot/baseline:

```bash
python3 scripts/search_regression.py --mode snapshot
```

## Case Format

Each case in `search_regression_cases.json` supports:

- `id`: stable case identifier
- `query`: search query text
- `tags`: optional `--tags` value
- `lang`: optional `--lang` value
- `limit`: search result count
- `top_k`: range used for assertions
- `expect_top1`: expected id at rank 1
- `expect_all`: all expected ids must appear in top-k
- `expect_any`: at least one id must appear in top-k
- `expect_absent`: ids that must not appear in top-k

## CI Suggestion

- Run `python3 scripts/search_regression.py --mode check` after `chub build`.
- Store `scripts/search_regression_baseline.json` as an artifact to track ranking drift.
