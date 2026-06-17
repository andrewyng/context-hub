#!/usr/bin/env python3
"""Run search regression checks for Context Hub."""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any


@dataclass
class CaseResult:
    case_id: str
    query: str
    passed: bool
    message: str
    top_ids: list[str]
    raw_results: list[dict[str, Any]]


def _load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def _run_search(
    chub: str, query: str, tags: str | None, lang: str | None, limit: int
) -> list[dict[str, Any]]:
    cmd = [chub, "search", query, "--limit", str(limit), "--json"]
    if tags:
        cmd.extend(["--tags", tags])
    if lang:
        cmd.extend(["--lang", lang])

    proc = subprocess.run(cmd, capture_output=True, text=True, check=False)
    if proc.returncode != 0:
        raise RuntimeError(
            f"command failed ({proc.returncode}): {' '.join(cmd)}\n{proc.stderr.strip()}"
        )

    text = proc.stdout.strip()
    if not text:
        raise RuntimeError(f"empty output for query: {query}")

    try:
        payload = json.loads(text)
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"invalid JSON output for query: {query}\n{text}") from exc

    results = payload.get("results")
    if not isinstance(results, list):
        raise RuntimeError(f"missing `results` in output for query: {query}")
    return results


def _evaluate_case(case: dict[str, Any], results: list[dict[str, Any]]) -> CaseResult:
    case_id = str(case["id"])
    query = str(case["query"])
    top_k = int(case.get("top_k", len(results)))
    top_ids = [str(r.get("id", "")) for r in results[:top_k]]

    expect_top1 = case.get("expect_top1")
    expect_all = [str(x) for x in case.get("expect_all", [])]
    expect_any = [str(x) for x in case.get("expect_any", [])]
    expect_absent = [str(x) for x in case.get("expect_absent", [])]

    failures: list[str] = []
    if expect_top1 and (not top_ids or top_ids[0] != expect_top1):
        got = top_ids[0] if top_ids else "<none>"
        failures.append(f"top1 expected `{expect_top1}`, got `{got}`")

    missing_all = [x for x in expect_all if x not in top_ids]
    if missing_all:
        failures.append(f"missing expected ids in top-{top_k}: {missing_all}")

    if expect_any and not any(x in top_ids for x in expect_any):
        failures.append(f"none of expect_any found in top-{top_k}: {expect_any}")

    present_absent = [x for x in expect_absent if x in top_ids]
    if present_absent:
        failures.append(f"unexpected ids found in top-{top_k}: {present_absent}")

    if failures:
        return CaseResult(
            case_id=case_id,
            query=query,
            passed=False,
            message="; ".join(failures),
            top_ids=top_ids,
            raw_results=results,
        )
    return CaseResult(
        case_id=case_id,
        query=query,
        passed=True,
        message="ok",
        top_ids=top_ids,
        raw_results=results,
    )


def _snapshot_payload(run_results: list[CaseResult]) -> dict[str, Any]:
    cases: list[dict[str, Any]] = []
    for r in run_results:
        top_items = []
        for item in r.raw_results[:10]:
            top_items.append(
                {
                    "id": item.get("id"),
                    "name": item.get("name"),
                    "score": item.get("_score"),
                }
            )
        cases.append(
            {
                "id": r.case_id,
                "query": r.query,
                "passed": r.passed,
                "top_ids": r.top_ids,
                "top_items": top_items,
            }
        )
    return {"cases": cases}


def main() -> int:
    parser = argparse.ArgumentParser(description="Run Context Hub search regressions.")
    parser.add_argument(
        "--cases",
        default="scripts/search_regression_cases.json",
        help="Path to regression case JSON file.",
    )
    parser.add_argument(
        "--chub",
        default="./cli/bin/chub",
        help="Path to chub executable.",
    )
    parser.add_argument(
        "--mode",
        choices=["check", "snapshot"],
        default="check",
        help="check: assert expectations; snapshot: emit current top results",
    )
    parser.add_argument(
        "--snapshot-out",
        default="scripts/search_regression_baseline.json",
        help="Where to write snapshot/baseline JSON.",
    )
    args = parser.parse_args()

    cases = _load_json(Path(args.cases))
    if not isinstance(cases, list) or not cases:
        print("error: cases file must be a non-empty JSON array", file=sys.stderr)
        return 2

    run_results: list[CaseResult] = []
    hard_failures = 0

    for case in cases:
        try:
            query = str(case["query"])
            limit = int(case.get("limit", 5))
            tags = case.get("tags")
            lang = case.get("lang")
            results = _run_search(args.chub, query, tags, lang, limit)
            result = _evaluate_case(case, results)
        except Exception as exc:  # pragma: no cover
            hard_failures += 1
            case_id = str(case.get("id", "<unknown>"))
            query = str(case.get("query", "<unknown>"))
            result = CaseResult(
                case_id=case_id,
                query=query,
                passed=False,
                message=str(exc),
                top_ids=[],
                raw_results=[],
            )
        run_results.append(result)

    pass_count = sum(1 for r in run_results if r.passed)
    fail_count = len(run_results) - pass_count

    for r in run_results:
        status = "PASS" if r.passed else "FAIL"
        print(f"[{status}] {r.case_id}: {r.message}")
        if not r.passed:
            print(f"       query={r.query}")
            if r.top_ids:
                print(f"       top_ids={r.top_ids}")

    snapshot = _snapshot_payload(run_results)
    out_path = Path(args.snapshot_out)
    if args.mode == "snapshot" or fail_count:
        out_path.write_text(json.dumps(snapshot, indent=2), encoding="utf-8")
        print(f"wrote snapshot: {out_path}")

    print(
        f"summary: total={len(run_results)} pass={pass_count} fail={fail_count} hard_failures={hard_failures}"
    )
    if args.mode == "snapshot":
        return 0
    return 0 if fail_count == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
