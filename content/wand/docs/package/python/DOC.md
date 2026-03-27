---
name: package
description: "Wand Python bindings for ImageMagick image loading, transforms, format conversion, metadata inspection, and multi-frame image processing"
metadata:
  languages: "python"
  versions: "0.6.13"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "wand,imagemagick,image-processing,python,graphics"
---

# Wand Python Package Guide

## Golden Rule

`Wand` is a Python binding around a locally installed ImageMagick stack. Install the native image library first, then install the Python package, and treat the linked native library as part of your runtime contract.

As of March 13, 2026, PyPI publishes `Wand 0.6.13`, while `https://docs.wand-py.org/en/latest/` is the development docs for `0.7.0`. This guide targets the published `0.6.13` package and calls out the version drift where it matters.

## Install

Create a virtual environment and install the pinned package version:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install "Wand==0.6.13"
```

Install ImageMagick development libraries first. The maintainer docs show these common package names:

```bash
# Debian / Ubuntu
sudo apt-get install libmagickwand-dev

# macOS with Homebrew
brew install imagemagick
```

If Wand cannot find your ImageMagick install, set `MAGICK_HOME` before importing `wand`. If your system uses nonstandard shared-library suffixes, the install guide also documents `WAND_MAGICK_LIBRARY_SUFFIX`.

```bash
export MAGICK_HOME=/opt/local
export WAND_MAGICK_LIBRARY_SUFFIX="-7.Q32;-7.Q32HDRI;.Q32HDRI;.Q32"
```

## Verify The Linked Image Library

The Python package version does not tell you which codecs, delegates, or resource policies are available. Check the linked native library in the environment where your app will run:

```bash
python -m wand.version
python -m wand.version --verbose
```

You can also inspect it in code:

```python
from wand.version import VERSION, MAGICK_VERSION, formats

print("Wand:", VERSION)
print("ImageMagick:", MAGICK_VERSION)
print("JPEG available:", "JPEG" in formats("*"))
```

## Open Images And Read Metadata

Use `Image.ping()` when you only need metadata such as dimensions or format. It avoids decoding the full image payload.

```python
from wand.image import Image

with Image.ping(filename="input.jpg") as img:
    print(img.format)
    print(img.width, img.height)
```

Use `Image(...)` when you need to decode and modify pixels:

```python
from wand.image import Image

with Image(filename="input.jpg") as img:
    print(img.format)
    print(img.size)
```

## Transform And Save An Image

`Image` objects are context managers. Keep operations inside the `with` block so file handles and native resources are released promptly.

```python
from wand.image import Image

with Image(filename="input.jpg") as img:
    img.auto_orient()
    img.resize(width=1200)
    img.strip()
    img.format = "jpeg"
    img.save(filename="output.jpg")
```

Useful details:

- `auto_orient()` applies EXIF orientation before you write the image back out.
- `resize()` changes pixel dimensions.
- `strip()` removes profiles and comments from the image payload before saving.

## Convert Bytes In Memory

When you are working with uploads or blobs from another API, open the image from bytes and emit bytes again. Pass `format=` when the blob header is ambiguous or you want to force a coder.

```python
from wand.image import Image

def png_bytes_to_jpeg(data: bytes) -> bytes:
    with Image(blob=data, format="png") as img:
        img.format = "jpeg"
        return img.make_blob()
```

The constructor also accepts `resolution=` for formats such as PDF or SVG where rasterization density matters.

## Work With Multi-Frame Images

Animated GIFs, TIFFs, and PDFs can contain multiple frames. Modify frames through the sequence API and use a context manager for the frame object so the changes are written back.

```python
from wand.image import Image

with Image(filename="animation.gif") as img:
    print("frames:", len(img.sequence))

    with img.sequence[0] as frame:
        frame.negate()

    img.save(filename="animation-out.gif")
```

Do not call mutating methods directly on `img.sequence[index]` without the nested `with` block. The maintainer docs note that sequence items must be synced back to the parent image.

## Handle Untrusted Input Carefully

Wand exposes the underlying ImageMagick coders, delegates, and resource limits. For user-supplied files, set explicit limits in your process and narrow the allowed coder when possible.

```python
from wand.exceptions import PolicyError, ResourceLimitError
from wand.image import Image
from wand.resource import limits

limits["memory"] = 256 * 1024 * 1024
limits["map"] = 512 * 1024 * 1024
limits["width"] = 8000
limits["height"] = 8000

def read_user_png(path: str) -> tuple[int, int]:
    try:
        with Image(filename=f"png:{path}") as img:
            return img.width, img.height
    except (PolicyError, ResourceLimitError) as exc:
        raise ValueError("Rejected image") from exc
```

Also review the system ImageMagick `policy.xml` on hosts that process user uploads. The security guide explicitly recommends limiting memory, disk, width, height, and execution time for untrusted input.

## Common Pitfalls

- Installing `Wand` without ImageMagick headers and libraries is the most common setup failure.
- The codecs you can read and write depend on the linked ImageMagick build, not just the Python wheel. Verify formats in the target runtime.
- `Image.ping()` is for metadata only. Use `Image(...)` for pixel edits.
- Sequence frames need the nested context-manager pattern shown above or your edits may not propagate back to the parent image.
- Avoid processing untrusted images inline in a public request path. Isolate the work, set resource limits, and restrict allowed coders where possible.

## Version-Sensitive Notes

- `docs.wand-py.org/en/latest/` currently documents the unreleased `0.7.0` line. PyPI still publishes `0.6.13`.
- The `0.7.0` "What's New" page documents changes such as `evaluate_images()` and dropped Python 2 support. Do not assume those changes exist in an environment pinned to `0.6.13`.
- Newer image operations can depend on the linked ImageMagick major version. Check `python -m wand.version --verbose` before relying on methods documented only for newer native builds.

## Official Sources

- Maintainer docs root: https://docs.wand-py.org/en/latest/
- Stable docs index for `0.6.13`: https://docs.wand-py.org/en/0.6.13/
- Stable install guide: https://docs.wand-py.org/en/0.6.13/guide/install.html
- Stable image guide: https://docs.wand-py.org/en/0.6.13/wand/image.html
- Security guide: https://docs.wand-py.org/en/0.6.13/guide/security.html
- 0.7.0 what's new: https://docs.wand-py.org/en/latest/wand/version.html#what-s-new-in-wand-0-7-0
- PyPI package page: https://pypi.org/project/wand/
