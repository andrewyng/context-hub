---
name: parallax-api
description: "Parallax API by Chicago Global — portfolio analysis, performance attribution, and equity research report generation via async REST jobs"
metadata:
  languages: "python"
  versions: "1.1.0"
  revision: 1
  updated-on: "2026-08-06"
  source: official
  tags: "parallax,chicago-global,finance,portfolio,investing,equity-research,rest-api"
---

# Parallax API (Python)

You are a Parallax API coding expert. Help write Python that calls the Parallax REST API
by Chicago Global for portfolio analysis and equity research report generation.

Official documentation: https://docs.chicago.global

## Golden Rule: Every Substantive Endpoint Is Asynchronous

Parallax's analysis endpoints do **not** return results directly. They return a `job_id`
and a `check_url`, and you poll `GET /v1/jobs/{job_id}` until the status is `completed`.

Writing code that expects analysis results in the POST response is the single most
common mistake. The POST response contains a job handle, never the analysis.

- **Correct:** POST → read `job_id` → poll `/v1/jobs/{job_id}` → read `result`
- **Incorrect:** POST → read `result` from the POST response (it is not there)

## Base URL and Authentication

- **Base URL:** `https://api.chicago.global`
- **Auth:** every endpoint requires a bearer token.

```
Authorization: Bearer YOUR_API_KEY
```

Load the key from the environment. Never hard-code it, never commit it, and never send
it from client-side code — this is a server-side API.

```python
import os
import requests

BASE_URL = "https://api.chicago.global"
API_KEY = os.environ["PARALLAX_API_KEY"]

HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
}
```

## Critical Constraint: Jobs Expire After 30 Minutes

Completed job results are retained for **30 minutes**, then discarded. Fetch and persist
results as soon as a job completes. Do not submit a batch of jobs and collect them an
hour later — the early ones will be gone.

This matters most for `/v1/stock-report`, which itself takes 5–10 minutes, leaving a
comparatively narrow window to collect the output.

## Symbol Format

Symbols use an exchange-suffixed form. The official examples use `AAPL.O` for Apple and
`MSFT.O` for Microsoft, where `.O` denotes the listing venue. Suffixes differ by
exchange, so do not assume a bare ticker will resolve.

If a symbol is rejected, correct the format and retry once before failing — do not
silently drop the holding.

## Endpoints

### POST /v1/portfolio/analyze

Analyzes a portfolio over a date range and returns performance, attribution, and holdings
data. Asynchronous. Typically completes in **60–120 seconds**.

**Request body**

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `portfolio` | array | Yes | — | Holdings; see below |
| `start_date` | string | No | first rebalance date | `YYYY-MM-DD` |
| `end_date` | string | No | yesterday | `YYYY-MM-DD` |
| `base_currency` | string | No | `USD` | e.g. `USD`, `SGD`, `EUR` |
| `benchmark` | string | No | `ACWI.OQ` | Uses the same exchange-suffixed symbol format |
| `initial_value` | number | No | `10000` | Starting portfolio value |
| `include_transaction_costs` | boolean | No | `false` | Apply market-specific costs |
| `transaction_cost_config` | object | No | default rates | Custom rates by market |
| `fields` | array | No | all fields | Restrict the response sections |

**Each holding in `portfolio`**

| Field | Type | Required | Description |
|---|---|---|---|
| `date` | string | Yes | Rebalance date, `YYYY-MM-DD` |
| `symbol` | string | Yes | e.g. `AAPL.O` |
| `weight` | number | Yes | Decimal, `0.25` = 25% |

Weights should sum to `1.0` per rebalance date. They are normalized if they do not, so an
unintended sum will silently rescale the portfolio rather than error — validate before
sending if exact weights matter.

**Response (job handle)**

```json
{
  "job_id": "port-a3522a92-87ed-4be0-a912-ad56ed6a8806",
  "status": "pending",
  "check_url": "/v1/jobs/port-a3522a92-87ed-4be0-a912-ad56ed6a8806",
  "estimated_duration_seconds": 90,
  "message": "Portfolio analysis job created",
  "portfolio_summary": { "positions": 4, "start_date": "2024-01-01", "end_date": "2024-11-01" }
}
```

Note that `portfolio_summary` here is an echo of what was submitted, not analysis output.

**Completed `result` sections** include `portfolio_summary` (final value, total return,
P&L breakdown, transaction costs), `turnover_analysis`, `performance_metrics`, and
`latest_holdings`. Use `fields` to request a subset when you do not need everything.

### POST /v1/stock-report

Generates an equity research report for one symbol. Asynchronous. Typically takes
**5–10 minutes**.

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `symbol` | string | Yes | — | e.g. `AAPL.O` |
| `force` | boolean | No | `false` | Regenerate even if a recent report exists |
| `lang` | string | No | `en` | Report output language |

Returns `202 Accepted` with `job_id`, `status`, `symbol`, `force`, `check_url`,
`estimated_duration_seconds`, and `message`.

The completed `result` contains `success`, `symbol`, and `pdf_url`, `html_url`,
`json_url`. Leave `force` at `false` unless you specifically need to bypass a cached
report — regeneration is slow and consumes quota.

### GET /v1/jobs/{job_id}

Polls any job. The response shape depends on the state.

| Status | Fields |
|---|---|
| `pending` | `job_id`, `status` |
| `processing` | `job_id`, `status`, `progress` (`step`, `percent`, `message`) |
| `completed` | `job_id`, `status`, `result` (shape varies by job type) |
| `failed` | `job_id`, `status`, `error` |

Always handle `failed`. A naive loop that only checks for `completed` will spin until
timeout on a failed job.

## Response Codes

| Code | Meaning |
|---|---|
| 200 | Success — returned by `/v1/portfolio/analyze` and `/v1/jobs/{job_id}` |
| 202 | Accepted — returned by `/v1/stock-report` on job creation |
| 400 | Bad request — `/v1/stock-report` only |
| 401 | Unauthorized — invalid or missing API key |
| 404 | Not found — often an expired or incorrect `job_id` |
| 422 | Validation error — inspect `detail` for the offending field |
| 500 | Server error |

A `422` returns `detail` as a list of objects with `loc`, `msg`, and `type` identifying
the field at fault. A `401` returns `detail` as a plain string.

## Complete Working Example

```python
import os
import time
import requests

BASE_URL = "https://api.chicago.global"
HEADERS = {
    "Authorization": f"Bearer {os.environ['PARALLAX_API_KEY']}",
    "Content-Type": "application/json",
}


def wait_for_job(job_id: str, timeout: int = 600, interval: int = 5) -> dict:
    """Poll a Parallax job until it completes. Raises on failure or timeout."""
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        resp = requests.get(f"{BASE_URL}/v1/jobs/{job_id}", headers=HEADERS, timeout=30)
        resp.raise_for_status()
        body = resp.json()
        status = body["status"]

        if status == "completed":
            return body["result"]
        if status == "failed":
            raise RuntimeError(f"Parallax job {job_id} failed: {body.get('error')}")

        time.sleep(interval)

    raise TimeoutError(f"Parallax job {job_id} did not complete within {timeout}s")


def analyze_portfolio(holdings: list[dict], **options) -> dict:
    payload = {"portfolio": holdings, **options}
    resp = requests.post(
        f"{BASE_URL}/v1/portfolio/analyze", json=payload, headers=HEADERS, timeout=30
    )
    resp.raise_for_status()
    return wait_for_job(resp.json()["job_id"])


if __name__ == "__main__":
    holdings = [
        {"date": "2024-01-01", "symbol": "AAPL.O", "weight": 0.25},
        {"date": "2024-01-01", "symbol": "MSFT.O", "weight": 0.25},
        {"date": "2024-01-01", "symbol": "GOOGL.O", "weight": 0.25},
        {"date": "2024-01-01", "symbol": "AMZN.O", "weight": 0.25},
    ]

    result = analyze_portfolio(
        holdings,
        start_date="2024-01-01",
        end_date="2024-11-01",
        base_currency="USD",
        benchmark="ACWI.OQ",
        initial_value=10000,
    )
    print(result["portfolio_summary"])
```

## Guidance for Agents

- Poll on an interval of a few seconds. `estimated_duration_seconds` in the POST response
  is a reasonable basis for a first sleep; there is no published minimum interval.
- Set a timeout that exceeds the endpoint's stated duration. Ten minutes is too short for
  `/v1/stock-report`.
- Persist results immediately on completion, because of the 30-minute expiry.
- Request only the `fields` you need on portfolio analysis; responses are large.
- Rate limits vary by plan and are not published. Contact Chicago Global for the limits
  that apply to a given key, and back off on errors rather than retrying tightly.
