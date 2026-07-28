# Batch Processing Patterns

Three approaches for processing multiple documents, from simplest to most
scalable. All patterns include per-document error handling so one failure
doesn't stop the batch.

> **API version:** These patterns use the ADE v2 APIs (`client.v2.*`),
> which require `landingai-ade` v1.13.0+. `save_to` works on
> `client.v2.parse()` and `client.v2.extract()` in directory mode and
> full-path mode, but not on the async job `create` methods.

---

## 1. Sync Parallel: ThreadPoolExecutor

Best for: moderate batches (10 to 200 docs), simple scripts, notebooks.

```python
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Any, List, Tuple, Type

from landingai_ade import LandingAIADE
from tqdm import tqdm


def parse_extract_save(
    doc_path: Path,
    client: LandingAIADE,
    schema_cls: Type[Any],
    output_dir: Path,
) -> Tuple[Any, Any]:
    """Parse one document, extract with schema, save both
    results as JSON via save_to.
    Returns (parse_result, extract_result)."""
    stem = doc_path.stem
    parse_result = client.v2.parse(
        document=doc_path,
        model="dpt-3-pro-latest",
        save_to=output_dir,
    )
    extract_result = client.v2.extract(
        schema=schema_cls,  # v2 accepts the Pydantic class directly
        markdown=parse_result.markdown,
        save_to=output_dir / f"{stem}_extract_output.json",
    )
    return parse_result, extract_result


def batch_parse_extract(
    file_paths: List[Path],
    schema_cls: Type[Any],
    output_dir: Path = Path("./ade_results"),
    max_workers: int = 4,
    api_key: str | None = None,
) -> List[Tuple[Path, Any, Any]]:
    """Process a list of documents in parallel.

    Returns list of (path, parse_result, extract_result)
    for successful documents. Failures are printed but
    do not stop the batch.
    """
    client = LandingAIADE(
        **({"apikey": api_key} if api_key else {})
    )
    results: List[Tuple[Path, Any, Any]] = []

    with ThreadPoolExecutor(max_workers=max_workers) as pool:
        futures = {
            pool.submit(
                parse_extract_save,
                fp, client, schema_cls, output_dir,
            ): fp
            for fp in file_paths
        }
        for future in tqdm(
            as_completed(futures),
            total=len(futures),
            desc="Processing",
        ):
            fp = futures[future]
            try:
                pr, er = future.result()
                results.append((fp, pr, er))
            except Exception as exc:
                print(f"FAILED {fp.name}: {exc}")

    return results
```

### Usage

```python
from pathlib import Path
from my_schema import InvoiceSchema  # or any Pydantic model

files = sorted(Path("invoices/").glob("*.pdf"))
results = batch_parse_extract(
    files,
    schema_cls=InvoiceSchema,
    output_dir=Path("./results"),
    max_workers=6,
)
print(f"Processed {len(results)}/{len(files)} documents")
```

---

## 2. Async Parallel: AsyncLandingAIADE

Best for: large batches (100+ docs), CLI tools, production pipelines.
Uses `asyncio` + `aiolimiter` for rate-limited concurrency.

```python
import asyncio
from pathlib import Path
from typing import Any, Dict, List, Optional

from aiolimiter import AsyncLimiter
from landingai_ade import AsyncLandingAIADE


SUPPORTED_EXTS = {".pdf", ".png", ".jpg", ".jpeg"}


def collect_files(input_dir: Path) -> List[Path]:
    return sorted(
        p for p in input_dir.glob("*")
        if p.is_file() and p.suffix.lower() in SUPPORTED_EXTS
    )


async def process_document(
    file_path: Path,
    client: AsyncLandingAIADE,
    output_dirs: Dict[str, Path],
    rate_limiter: AsyncLimiter,
) -> Optional[Dict[str, Any]]:
    """Parse one document async, save JSON + markdown."""
    try:
        async with rate_limiter:
            result = await client.v2.parse(
                document=file_path,
                model="dpt-3-pro-latest",
                save_to=output_dirs["json"],
            )

        (output_dirs["markdown"] / f"{file_path.stem}.md").write_text(
            result.markdown, encoding="utf-8"
        )
        return {"path": file_path, "result": result}
    except Exception as exc:
        print(f"FAILED {file_path.name}: {exc}")
        return None


async def batch_parse_async(
    input_dir: Path,
    output_dir: Path,
    max_concurrent: int = 10,
    rate_limit: int = 30,
    api_key: str | None = None,
) -> List[Dict[str, Any]]:
    """Parse all documents in input_dir concurrently.

    Args:
        input_dir: folder with documents
        output_dir: base output folder (json/, markdown/
                    subdirs created automatically)
        max_concurrent: max parallel requests
        rate_limit: max requests per minute
    """
    files = collect_files(input_dir)
    if not files:
        print(f"No documents found in {input_dir}")
        return []

    # Create output subdirectories
    dirs: Dict[str, Path] = {}
    for sub in ("json", "markdown"):
        d = output_dir / sub
        d.mkdir(parents=True, exist_ok=True)
        dirs[sub] = d

    client = AsyncLandingAIADE(
        **({"apikey": api_key} if api_key else {})
    )
    limiter = AsyncLimiter(rate_limit, 60)

    tasks = [
        process_document(fp, client, dirs, limiter)
        for fp in files
    ]
    raw = await asyncio.gather(*tasks)
    return [r for r in raw if r is not None]
```

### Usage

```python
import asyncio
from pathlib import Path

results = asyncio.run(
    batch_parse_async(
        input_dir=Path("documents/"),
        output_dir=Path("results/"),
        max_concurrent=10,
        rate_limit=30,
    )
)
print(f"Parsed {len(results)} documents")
```

### Adding Extraction to Async Pipeline

```python
import asyncio
from pathlib import Path
from typing import Any, Dict, Optional

from aiolimiter import AsyncLimiter
from landingai_ade import AsyncLandingAIADE


async def process_with_extraction(
    file_path: Path,
    client: AsyncLandingAIADE,
    schema_cls: type,
    rate_limiter: AsyncLimiter,
) -> Optional[Dict[str, Any]]:
    try:
        async with rate_limiter:
            parse_result = await client.v2.parse(
                document=file_path,
                model="dpt-3-pro-latest",
            )
        async with rate_limiter:
            extract_result = await client.v2.extract(
                schema=schema_cls,
                markdown=parse_result.markdown,
            )
        return {
            "path": file_path,
            "parse": parse_result,
            "extract": extract_result,
        }
    except Exception as exc:
        print(f"FAILED {file_path.name}: {exc}")
        return None
```

---

## 3. Large File Processing: Parse Jobs v2

Best for: files over the sync limits (50 MiB / 100 pages per PDF).
Parse Jobs accepts up to 1 GiB per PDF (50 MiB per image) and 6,000
pages. Jobs default to the `standard` service tier (half the credits of
`priority`, slower turnaround); pass `service_tier="priority"` for
time-sensitive jobs.

```python
from pathlib import Path
from typing import Any

from landingai_ade import LandingAIADE
from landingai_ade.lib.v2_errors import JobFailedError, JobWaitTimeoutError


def parse_large_file(
    file_path: Path,
    client: LandingAIADE,
    timeout: float = 900.0,
    service_tier: str = "standard",
) -> Any:
    """Submit a large file as a parse job and wait until it
    finishes.

    Returns the parse result (a full V2ParseResponse, same
    shape as client.v2.parse()).
    """
    job = client.v2.parse_jobs.create(
        document=file_path,
        model="dpt-3-pro-latest",
        service_tier=service_tier,
    )
    print(f"Job submitted: {job.job_id}")

    # wait() polls get() with backoff until the job is terminal
    done = client.v2.parse_jobs.wait(
        job.job_id,
        timeout=timeout,
        raise_on_failure=True,  # raises JobFailedError on failure
    )
    return done.result
```

### Batch Large Files

```python
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from typing import Any

from landingai_ade import LandingAIADE
from landingai_ade.lib.v2_errors import JobFailedError, JobWaitTimeoutError


def batch_parse_large(
    file_paths: list[Path],
    max_workers: int = 3,
) -> list[Any]:
    client = LandingAIADE()
    results = []
    with ThreadPoolExecutor(max_workers=max_workers) as pool:
        futures = {
            pool.submit(
                parse_large_file, fp, client
            ): fp
            for fp in file_paths
        }
        for fut in futures:
            fp = futures[fut]
            try:
                results.append(fut.result())
            except JobFailedError as exc:
                print(f"JOB FAILED {fp.name}: {exc}")
            except JobWaitTimeoutError:
                print(f"TIMEOUT {fp.name}: still running; poll later with parse_jobs.get()")
            except Exception as exc:
                print(f"FAILED {fp.name}: {exc}")
    return results
```

A cheaper fire-and-poll alternative for very large batches: create all
jobs first (collecting `job_id`s), then `wait()` on each in turn. Jobs
run server-side regardless of whether a client is waiting.

---

## Rate Limiting & Error Handling Tips

| Concern | Recommendation |
|---------|---------------|
| API rate limits | Use `aiolimiter.AsyncLimiter(30, 60)` for async; limit `max_workers` for sync |
| Transient failures | Wrap individual doc processing in try/except; log and continue |
| Large batches (1000+) | Use async pattern with `rate_limit=20`, or submit Parse Jobs at `service_tier="standard"` |
| Memory | Process results incrementally (save to disk per doc) rather than accumulating in memory |
| Retries | Add exponential backoff for 429/5xx errors: `tenacity.retry(wait=wait_exponential())` |
| Sync timeouts | `client.v2.parse()` raises `V2SyncTimeoutError` on HTTP 504; switch that document to Parse Jobs |

### Dependencies

```
# Sync parallel (ThreadPoolExecutor)
pip install landingai-ade tqdm

# Async parallel
pip install landingai-ade aiolimiter

# Large files (Parse Jobs): no extra deps beyond landingai-ade
```
