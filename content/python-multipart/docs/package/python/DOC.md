---
name: package
description: "Streaming parser for multipart form data, URL-encoded forms, and raw file uploads in Python"
metadata:
  languages: "python"
  versions: "0.0.22"
  revision: 1
  updated-on: "2026-03-12"
  source: maintainer
  tags: "python-multipart,multipart,form-data,uploads,python"
---

# python-multipart Python Guide

## Golden Rule

Use `python_multipart` in new code and let the package parse the request body for you.

The public entry points to reach for are:

- `parse_form(...)` when you already have a file-like request body stream
- `create_form_parser(...)` when the body arrives incrementally in chunks
- `FormParser(...)` only if you need direct control over parser construction

The package also exposes a compatibility `multipart` import, but that shim emits a `PendingDeprecationWarning` telling you to use `python_multipart` instead.

## Installation

`python-multipart` requires Python `>=3.10`.

```bash
pip install python-multipart==0.0.22
```

Environment variables: none.

Authentication or client initialization: none. This package is a low-level parser, not an HTTP client.

## Parse `multipart/form-data`

`parse_form()` is the fastest path if you already have the full request body as a stream. It reads chunks from the stream, dispatches parsed fields and files to callbacks, and finalizes the parser when the stream ends.

```python
from io import BytesIO

from python_multipart import parse_form


def text(value: bytes | None) -> str | None:
    return value.decode("utf-8") if value is not None else None


body = (
    b"--boundary123\r\n"
    b"Content-Disposition: form-data; name=\"title\"\r\n\r\n"
    b"hello\r\n"
    b"--boundary123\r\n"
    b"Content-Disposition: form-data; name=\"file\"; filename=\"hello.txt\"\r\n"
    b"Content-Type: text/plain\r\n\r\n"
    b"abc123\r\n"
    b"--boundary123--\r\n"
)

headers = {
    "Content-Type": b"multipart/form-data; boundary=boundary123",
    "Content-Length": str(len(body)).encode("ascii"),
}

fields: dict[str, str | None] = {}
files: list[dict[str, object]] = []


def on_field(field) -> None:
    fields[text(field.field_name) or ""] = text(field.value)


def on_file(file) -> None:
    file.file_object.seek(0)
    files.append(
        {
            "field_name": text(file.field_name),
            "file_name": text(file.file_name),
            "size": file.size,
            "in_memory": file.in_memory,
            "content": file.file_object.read(),
        }
    )


parse_form(headers, BytesIO(body), on_field, on_file)

print(fields["title"])
print(files[0]["file_name"])
print(files[0]["content"])
```

Use this shape when your framework exposes a readable body stream. `Content-Type` is required. `Content-Length` is optional, but when present `parse_form()` uses it to cap reads from the input stream. The default `chunk_size` is `1 MiB`.

## Parse Incrementally From Chunks

If the request body arrives in pieces, create the parser first and feed it with `write()` until the request is complete.

```python
from python_multipart import create_form_parser


def on_field(field) -> None:
    print(field.field_name, field.value)


def on_file(file) -> None:
    print(file.field_name, file.file_name, file.size)


headers = {
    "Content-Type": b"multipart/form-data; boundary=boundary123",
}

parser = create_form_parser(
    headers=headers,
    on_field=on_field,
    on_file=on_file,
    config={
        "MAX_BODY_SIZE": 20 * 1024 * 1024,
    },
)

for chunk in request_body_chunks:
    parser.write(chunk)

parser.finalize()
parser.close()
```

For `multipart/form-data`, the boundary must be present in the `Content-Type` header. If it is missing, `FormParser` raises `FormParserError`.

## Parse Raw `application/octet-stream`

`FormParser` also supports a raw file body with `application/octet-stream`. In that mode, there are no form fields, so the file callback receives a `File` object with `field_name=None`.

If you want the uploaded file to carry a name, pass it in `X-File-Name`.

```python
from io import BytesIO

from python_multipart import parse_form


body = b"raw-bytes"
headers = {
    "Content-Type": b"application/octet-stream",
    "Content-Length": str(len(body)).encode("ascii"),
    "X-File-Name": b"upload.bin",
}


def on_file(file) -> None:
    file.file_object.seek(0)
    print(file.field_name)
    print(file.file_name)
    print(file.file_object.read())


parse_form(headers, BytesIO(body), on_field=None, on_file=on_file)
```

## Control Memory And Temp Files

Uploaded files stay in memory until they cross `MAX_MEMORY_FILE_SIZE`, then the `File` object flushes them to a temporary file on disk.

Useful parser and file config keys:

- `MAX_BODY_SIZE`: maximum total request body size accepted by the parser
- `MAX_MEMORY_FILE_SIZE`: threshold before a file is moved from memory to disk
- `UPLOAD_DIR`: directory for temporary files
- `UPLOAD_DELETE_TMP`: whether auto-created temp files are deleted automatically
- `UPLOAD_KEEP_FILENAME`: keep the uploaded filename instead of generating a temp name
- `UPLOAD_KEEP_EXTENSIONS`: preserve the original file extension
- `UPLOAD_ERROR_ON_BAD_CTE`: raise on unknown `Content-Transfer-Encoding`

```python
from python_multipart import create_form_parser


def on_file(file) -> None:
    print(file.in_memory)
    print(file.actual_file_name)
    print(file.size)


parser = create_form_parser(
    headers={"Content-Type": b"multipart/form-data; boundary=boundary123"},
    on_field=None,
    on_file=on_file,
    config={
        "MAX_BODY_SIZE": 25 * 1024 * 1024,
        "MAX_MEMORY_FILE_SIZE": 256 * 1024,
        "UPLOAD_DIR": "/tmp/python-multipart",
        "UPLOAD_KEEP_EXTENSIONS": True,
        "UPLOAD_DELETE_TMP": True,
    },
)
```

For parsed files:

- `file.file_name` is the filename from the request
- `file.actual_file_name` is the on-disk name, or `None` if the file never left memory
- `file.file_object` is the current backing object, either `io.BytesIO` or a real file object
- `file.in_memory` tells you which storage mode is active
- `file.size` tracks bytes written

## URL-Encoded Forms

`FormParser` also handles `application/x-www-form-urlencoded` and `application/x-url-encoded`.

```python
from python_multipart import create_form_parser


def on_field(field) -> None:
    print(field.field_name, field.value)


parser = create_form_parser(
    headers={"Content-Type": b"application/x-www-form-urlencoded"},
    on_field=on_field,
    on_file=None,
)

parser.write(b"name=alice&empty=&flag")
parser.finalize()
```

Fields are surfaced as `Field` objects. `field.field_name` and `field.value` are bytes. A key with no value can produce `field.value is None`.

## Important Pitfalls

- Import `python_multipart`, not `multipart`, in new code.
- Pass `Content-Type` in the headers dictionary. `create_form_parser()` raises `ValueError` if it is missing.
- For `multipart/form-data`, include `boundary=...` in `Content-Type`.
- `field.field_name`, `field.value`, and `file.file_name` are bytes; decode them before mixing them with string-based application code.
- Call `parser.finalize()` after the last chunk when you use `create_form_parser()` or `FormParser()` directly.
- `File.close()` closes the backing file object. Copy or persist the data you need before closing it.
- `Content-Transfer-Encoding` handling recognizes `binary`, `8bit`, `7bit`, `base64`, and `quoted-printable`. Unknown encodings fall back to raw handling unless `UPLOAD_ERROR_ON_BAD_CTE` is set.

## Source URLs

- https://github.com/Kludex/python-multipart
- https://kludex.github.io/python-multipart/
- https://github.com/Kludex/python-multipart/blob/master/CHANGELOG.md
- https://pypi.org/project/python-multipart/
