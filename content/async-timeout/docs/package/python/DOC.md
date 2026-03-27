---
name: package
description: "async-timeout compatibility timeout context manager for asyncio code on Python 3.8+"
metadata:
  languages: "python"
  versions: "5.0.1"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "python,asyncio,timeout,async,compatibility"
---

# async-timeout Python Package Guide

## Golden Rule

Use `async-timeout` only when you need one timeout API that still works on Python versions before 3.11, or when a dependency still expects it. The project is deprecated because Python 3.11+ includes `asyncio.timeout()` and `asyncio.timeout_at()` in the standard library, and the maintainers recommend using the stdlib APIs directly when you can.

## Install

`async-timeout` 5.0.1 requires Python 3.8 or newer.

```bash
python -m pip install "async-timeout==5.0.1"
```

Important naming detail:

- PyPI package: `async-timeout`
- Import path: `async_timeout`

## Imports And Setup

This package has no client object, credentials, or environment variables. You import the timeout helpers directly and use them inside async code.

If you need one import path that works on Python 3.8 through 3.13, import from `async_timeout`:

```python
from async_timeout import timeout, timeout_at
```

If your code runs on Python 3.11+ and you only need the basic timeout context manager APIs, the maintainer docs recommend preferring the stdlib and falling back only on older Python:

```python
import sys

if sys.version_info >= (3, 11):
    from asyncio import timeout, timeout_at
else:
    from async_timeout import timeout, timeout_at
```

## Time-Limit An Async Block

Use `async with timeout(seconds):` around the specific block you want to cancel if it runs too long.

```python
import asyncio
from async_timeout import timeout


async def main() -> None:
    try:
        async with timeout(1.5):
            await asyncio.sleep(2)
    except TimeoutError:
        print("operation timed out")


asyncio.run(main())
```

The timeout exception is raised outside the `async with` block, not inside it.

`None` disables the timeout:

```python
import asyncio
from async_timeout import timeout


async def main() -> None:
    async with timeout(None):
        await asyncio.sleep(0.2)
```

## Use An Absolute Deadline

Use `timeout_at()` when you already have a deadline in the event loop's monotonic clock.

```python
import asyncio
from async_timeout import timeout_at


async def main() -> None:
    loop = asyncio.get_running_loop()
    deadline = loop.time() + 5

    try:
        async with timeout_at(deadline):
            await asyncio.sleep(6)
    except TimeoutError:
        print("deadline exceeded")


asyncio.run(main())
```

Pass `loop.time()` based deadlines, not `time.time()`. `timeout_at()` does not use wall-clock or POSIX time.

## Inspect And Reschedule A Timeout

The context manager exposes both the newer stdlib-compatible API and the older compatibility API.

```python
import asyncio
from async_timeout import timeout


async def main() -> None:
    async with timeout(1.0) as cm:
        await asyncio.sleep(0.4)

        # Stdlib-compatible API
        cm.reschedule(cm.when() + 1.0)

        await asyncio.sleep(0.2)

    print(cm.expired())


asyncio.run(main())
```

If you are maintaining older code that still uses the pre-5.x compatibility API, the same context object also exposes `shift()`, `update()`, `reject()`, and the `deadline` property.

To disable a timeout after entering the block:

```python
import asyncio
from async_timeout import timeout


async def main() -> None:
    async with timeout(10) as cm:
        cm.reschedule(None)
        await asyncio.sleep(0.2)
```

Rescheduling is only allowed before the timeout expires and before the `async with` block exits.

## When To Use This Instead Of `asyncio.wait_for()`

The maintainer docs call out one main reason to use this style of timeout context manager: it wraps a block directly and does not create a new task the way `asyncio.wait_for()` does.

This is useful when you want timeout behavior around several awaited operations inside one block instead of around one awaitable.

## Common Pitfalls

- Use `async with`, not plain `with`. Sync context manager support was dropped in the 5.0.0 release.
- Catch `TimeoutError` outside the context manager scope.
- Install name and import name differ: `pip install async-timeout`, then `import async_timeout`.
- Prefer `asyncio.timeout()` on Python 3.11+ when you do not need this compatibility dependency.
- Use `loop.time()` with `timeout_at()`. Passing wall-clock timestamps will produce the wrong deadline.
- Use `cm.expired()` with the stdlib-compatible API. Older compatibility code may still use the `cm.expired` property instead.
- `expired` tells you whether this timeout context caused the cancellation. If the wrapped code raises its own timeout exception, it stays false.

## Version Notes For 5.0.1

- PyPI lists `5.0.1` as the latest release as of March 13, 2026.
- The project README and PyPI page both mark the package as deprecated and no longer actively supported.
- The major behavioral change in the 5.x line happened in `5.0.0`: the package became compatible with `asyncio.Timeout` on Python 3.11+, while deprecated sync context manager support was removed.
- `5.0.1` is a small follow-up release; the GitHub release notes list it as a misc-only update.

## Official Sources

- Maintainer README: https://github.com/aio-libs/async-timeout
- GitHub releases: https://github.com/aio-libs/async-timeout/releases
- PyPI project page: https://pypi.org/project/async-timeout/
