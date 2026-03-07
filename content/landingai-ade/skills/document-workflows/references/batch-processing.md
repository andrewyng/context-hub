# Batch Processing Patterns

Three approaches for processing multiple documents, from simplest to most
scalable. All patterns include per-document error handling so one failure
doesn't stop the batch.

---

## 1. Sync Parallel — ThreadPoolExecutor

Best for: moderate batches (10–200 docs), simple scripts, notebooks.

```python
import io
import json
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Any, List, Tuple, Type

from landingai_ade import LandingAIADE
from landingai_ade.lib import pydantic_to_json_schema
from tqdm import tqdm


def parse_extract_save(
    doc_path: Path,
    client: LandingAIADE,
    schema_cls: Type[Any],
    output_dir: Path,
) -> Tuple[Any, Any]:
    """Parse one document, extract with schema, save both
    results as JSON. Returns (parse_result, extract_result)."""
    output_dir.mkdir(parents=True, exist_ok=True)
    stem = doc_path.stem

    # Step 1 — Parse
    parse_result = client.parse(document=doc_path)
    _save_json(
        parse_result, output_dir / f"parse_{stem}.json"
    )

    # Step 2 — Extract
    json_schema = pydantic_to_json_schema(schema_cls)
    extract_result = client.extract(
        schema=json_schema,
        markdown=io.BytesIO(
            parse_result.markdown.encode("utf-8")
        ),
    )
    _save_json(
        extract_result, output_dir / f"extract_{stem}.json"
    )
    return parse_result, extract_result


def _save_json(obj: Any, path: Path) -> None:
    data = (
        obj.model_dump()
        if hasattr(obj, "model_dump")
        else obj
    )
    path.write_text(
        json.dumps(data, indent=2, default=str),
        encoding="utf-8",
    )


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

## 2. Async Parallel — AsyncLandingAIADE

Best for: large batches (100+ docs), CLI tools, production pipelines.
Uses `asyncio` + `aiolimiter` for rate-limited concurrency.

```python
import asyncio
import json
from pathlib import Path
from typing import Any, Dict, List, Optional

import pandas as pd
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
            result = await client.parse(document=file_path)

        stem = file_path.stem
        # Save JSON
        (output_dirs["json"] / f"{stem}.json").write_text(
            json.dumps(
                result.model_dump(), indent=2, default=str
            ),
            encoding="utf-8",
        )
        # Save markdown
        (output_dirs["markdown"] / f"{stem}.md").write_text(
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
import io
from landingai_ade.lib import pydantic_to_json_schema


async def process_with_extraction(
    file_path: Path,
    client: AsyncLandingAIADE,
    schema_cls: type,
    output_dirs: Dict[str, Path],
    rate_limiter: AsyncLimiter,
) -> Optional[Dict[str, Any]]:
    try:
        async with rate_limiter:
            parse_result = await client.parse(
                document=file_path
            )
        async with rate_limiter:
            extract_result = await client.extract(
                schema=pydantic_to_json_schema(schema_cls),
                markdown=io.BytesIO(
                    parse_result.markdown.encode("utf-8")
                ),
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

## 3. Large File Processing — Parse Jobs API

Best for: files > 50 MB (up to ~1 GB). Uses async job submission +
polling instead of synchronous upload.

```python
import time
from pathlib import Path
from typing import Any

from landingai_ade import LandingAIADE


def parse_large_file(
    file_path: Path,
    client: LandingAIADE,
    poll_interval: int = 10,
    max_wait: int = 600,
) -> Any:
    """Submit a large file as a parse job and poll until
    complete.

    Returns the parse result (same shape as client.parse()).
    """
    # Step 1 — Submit job
    job = client.parse(
        document=file_path, is_async=True
    )
    job_id = job.request_id
    print(f"Job submitted: {job_id}")

    # Step 2 — Poll for completion
    elapsed = 0
    while elapsed < max_wait:
        status = client.get_parse_job(job_id)
        if status.status == "complete":
            print(f"Job complete after {elapsed}s")
            return status.data
        if status.status == "failed":
            raise RuntimeError(
                f"Parse job {job_id} failed: {status}"
            )
        time.sleep(poll_interval)
        elapsed += poll_interval

    raise TimeoutError(
        f"Job {job_id} not complete after {max_wait}s"
    )
```

### Batch Large Files

```python
from concurrent.futures import ThreadPoolExecutor

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
            try:
                results.append(fut.result())
            except Exception as exc:
                fp = futures[fut]
                print(f"FAILED {fp.name}: {exc}")
    return results
```

---

## Rate Limiting & Error Handling Tips

| Concern | Recommendation |
|---------|---------------|
| API rate limits | Use `aiolimiter.AsyncLimiter(30, 60)` for async; limit `max_workers` for sync |
| Transient failures | Wrap individual doc processing in try/except; log and continue |
| Large batches (1000+) | Use async pattern with `rate_limit=20`; monitor API response times |
| Memory | Process results incrementally (save to disk per doc) rather than accumulating in memory |
| Retries | Add exponential backoff for 429/5xx errors: `tenacity.retry(wait=wait_exponential())` |

### Dependencies

```
# Sync parallel (ThreadPoolExecutor)
pip install landingai-ade tqdm

# Async parallel
pip install landingai-ade aiolimiter pandas

# Large files — no extra deps beyond landingai-ade
```
