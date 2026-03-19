---
name: rust
description: "Rust language guide covering ownership, error handling, traits, and idiomatic patterns where AI agents frequently write incorrect code"
metadata:
  languages: "rust"
  versions: "1.94.0"
  revision: 1
  updated-on: "2026-03-18"
  source: community
  tags: "rust,language,ownership,error-handling,traits,pattern-matching"
---

# Rust Language Guidelines

Rust compiler 1.94.0, edition 2024 (latest stable). This guide covers patterns that are frequently written incorrectly. Read it before writing Rust code.

## Golden Rule

**Always use `edition = "2024"`.** Propagate errors with `?` — never `.unwrap()` in library or application code. Accept `&str` not `String`, `&[T]` not `&Vec<T>` in parameters. Use `usize` for indexing.

## Common Bad Habits

### Pattern match instead of `.is_some()` + `.unwrap()`

```rust
// BAD
if opt.is_some() { let v = opt.unwrap(); }

// GOOD
if let Some(v) = opt { /* use v */ }
if let [first, ..] = list.as_slice() { /* use first */ }
```

### Use `try_from` not `as` for narrowing conversions

```rust
// BAD — silently truncates
let y: i8 = x as i8;

// GOOD — returns error on overflow
let y = i8::try_from(x)?;
```

### Use checked arithmetic

```rust
// BAD — wraps silently in release, panics in debug
let total = price * quantity;

// GOOD
let total = price.checked_mul(quantity).ok_or("overflow")?;
```

### Use `.get()` not `[]` for indexing

```rust
// BAD — panics if out of bounds
let v = items[i];

// GOOD — returns Option
let v = items.get(i).ok_or("out of bounds")?;
```

### Prefer iterators over manual indexing

```rust
// BAD
for i in 0..items.len() { process(items[i]); }

// GOOD
for item in &items { process(item); }
for window in points.windows(2) { /* pairs */ }
```

### `Path::join` drops base on absolute paths

```rust
// BAD — returns "/etc/passwd", base silently dropped!
let path = Path::new("/home/user").join("/etc/passwd");

// GOOD — strip leading slash
let path = base.join(input.trim_start_matches('/'));
```

### Redact sensitive fields in `Debug`

```rust
// BAD — password in logs
#[derive(Debug)]
struct Creds { user: String, password: String }

// GOOD
struct Password(String);
impl std::fmt::Debug for Password {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str("[REDACTED]")
    }
}
```

### Construct fully or fail — no init-after-new

```rust
// BAD — invalid state between new() and load()
let mut d = Dictionary::new();
d.load("words.txt")?;

// GOOD
let d = Dictionary::from_file("words.txt")?;
```

### Avoid `Rc<RefCell<T>>` — pass callbacks instead

```rust
// BAD — shared mutability, runtime borrow panics
let c = Rc::new(RefCell::new(0));
do_thing(move || { *c.borrow_mut() += 1; });

// GOOD — pass state through parameters
fn do_thing(on_hit: impl FnOnce(u32)) { on_hit(10); }
```

### Don't accept unbounded input

```rust
// BAD — allocates whatever the caller sends
fn process(data: &[u8]) -> Result<(), Error> {
    let decoded = parse(data)?;
    Ok(())
}

// GOOD — enforce limits
const MAX_SIZE: usize = 1024 * 1024;
fn process(data: &[u8]) -> Result<(), Error> {
    if data.len() > MAX_SIZE { return Err(Error::TooLarge); }
    let decoded = parse(data)?;
    Ok(())
}
```

### Don't blindly derive `Default`

```rust
// BAD — port 0 is invalid, but compiles fine
#[derive(Default)]
struct ServerConfig { port: u16 }

// GOOD — require explicit construction
struct ServerConfig { port: u16 }
impl ServerConfig {
    fn new(port: u16) -> Result<Self, &'static str> {
        if port == 0 { return Err("port must be > 0"); }
        Ok(Self { port })
    }
}
```

### Use constant-time comparison for secrets

```rust
// BAD — timing attack: early exit leaks password length
fn verify(stored: &[u8], input: &[u8]) -> bool {
    stored == input
}

// GOOD — constant-time, no information leakage
fn verify(stored: &[u8], input: &[u8]) -> bool {
    if stored.len() != input.len() { return false; }
    let mut diff = 0u8;
    for (a, b) in stored.iter().zip(input.iter()) {
        diff |= a ^ b;
    }
    diff == 0
}
```

### Avoid TOCTOU — check and use atomically

```rust
// BAD — path could change between check and use
if path.is_file() {
    std::fs::remove_file(path)?;  // might not be a file anymore
}

// GOOD — just do it, handle the error
match std::fs::remove_file(path) {
    Ok(()) => { /* success */ }
    Err(e) if e.kind() == std::io::ErrorKind::NotFound => { /* ok */ }
    Err(e) => return Err(e),
}
```

### Use `split_at_checked` instead of `split_at`

```rust
// BAD — panics if mid > len
let (left, right) = data.split_at(mid);

// GOOD — returns None if out of bounds
let (left, right) = data.split_at_checked(mid).ok_or("out of bounds")?;
```

### Don't use `unsafe` as an escape hatch

```rust
// BAD — data race
static mut COUNTER: i32 = 0;
unsafe { COUNTER += 1; }

// GOOD — atomics are safe and lock-free
use std::sync::atomic::{AtomicI32, Ordering};
static COUNTER: AtomicI32 = AtomicI32::new(0);
COUNTER.fetch_add(1, Ordering::SeqCst);
```

## Error Handling

### Custom error type

```rust
#[derive(Debug)]
pub enum AppError {
    NotFound(String),
    Io(std::io::Error),
}

impl std::fmt::Display for AppError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::NotFound(id) => write!(f, "not found: {id}"),
            Self::Io(e) => write!(f, "io: {e}"),
        }
    }
}

impl std::error::Error for AppError {}

impl From<std::io::Error> for AppError {
    fn from(e: std::io::Error) -> Self { Self::Io(e) }
}
```

### Propagating with `?`

```rust
fn read_config(path: &str) -> Result<String, std::io::Error> {
    let content = std::fs::read_to_string(path)?;
    Ok(content)
}
```

### Option to Result

```rust
fn require(name: Option<String>) -> Result<String, &'static str> {
    name.ok_or("name is required")
}
```

**Pitfall:** Every function returning `Result` must end with `Ok(value)`.

## Ownership and Borrowing

Accept the most general borrowed type:

| Parameter | Accepts | Coercion |
|-----------|---------|----------|
| `&str` | `&str`, `&String` | `String → &str` |
| `&[T]` | `&[T]`, `&Vec<T>` | `Vec<T> → &[T]` |
| `&Path` | `&Path`, `&PathBuf` | `PathBuf → &Path` |

```rust
fn greet(name: &str) { println!("{name}"); }

let s = String::from("hello");
greet(&s);  // String coerces to &str
```

**Pitfall:** `fn bad(name: String)` forces callers to clone. Use `&str`.

### Clone vs Copy

`Copy` (integers, `bool`, `&T`) duplicates implicitly. `Clone` (`String`, `Vec`) requires `.clone()` — without it, a move occurs.

```rust
let s = String::from("hi");
let t = s.clone();  // s still valid
let u = s;          // s moved, no longer usable
```

## Enums for Domain Logic

Make invalid states unrepresentable:

```rust
// BAD — ssl=true but cert=None is valid
struct Config { ssl: bool, cert: Option<String> }

// GOOD — invalid combo is impossible
enum Security {
    Plain,
    Ssl { cert: String },
}
```

Exhaustive matching — adding a variant breaks all `match` sites at compile time:

```rust
fn describe(s: &Security) -> &str {
    match s {
        Security::Plain => "plain",
        Security::Ssl { .. } => "encrypted",
    }
}
```

## Traits and Return Types

`impl Trait` in return position requires a single concrete type:

```rust
// Works — one type
fn make() -> impl std::fmt::Display { 42 }

// FAILS — two types
// fn pick(b: bool) -> impl Display { if b { 42 } else { "hi" } }

// Works — Box<dyn Trait>
fn pick(b: bool) -> Box<dyn std::fmt::Display> {
    if b { Box::new(42) } else { Box::new("hi") }
}
```

## Concurrency (std library)

### Threads with shared state

```rust
use std::sync::{Arc, Mutex};

let state = Arc::new(Mutex::new(Vec::<i32>::new()));
let s = Arc::clone(&state);
std::thread::spawn(move || {
    if let Ok(mut v) = s.lock() { v.push(1); }
});
```

**Pitfall:** `.lock().unwrap()` panics on poisoned mutex. Use `if let Ok(guard)`.

### Channels

```rust
use std::sync::mpsc;

let (tx, rx) = mpsc::channel();
std::thread::spawn(move || { tx.send(42).unwrap(); });
let val = rx.recv().unwrap();
```

## Edition 2024 Changes

| Change | Impact |
|--------|--------|
| `unsafe extern "C"` required | Old `extern "C"` blocks won't compile |
| `unsafe_op_in_unsafe_fn` warns | Wrap unsafe ops in `unsafe {}` inside `unsafe fn` |
| `gen` keyword reserved | Can't use as identifier |
| `Future` in prelude | No import needed |
| `static mut` denied | Use atomics or `Mutex` |

## Common Compiler Errors

**"borrowed value does not live long enough"** — Returning reference to local. Return owned value or clone.

**"use of moved value"** — Value was moved and used again. Clone before the move, or use a reference.

**"cannot borrow as mutable more than once"** — Two `&mut` to the same data. Restructure to hold one mutable reference at a time.

## Check For Unsafe Code In Dependencies

```bash
cargo install cargo-geiger
cargo geiger
```

Audits your dependency tree for `unsafe` usage. Your safe code is only as safe as its dependencies.

## Links

- **Pitfalls of Safe Rust:** https://corrode.dev/blog/pitfalls-of-safe-rust/

- **The Book:** https://doc.rust-lang.org/book/
- **Std Library:** https://doc.rust-lang.org/std/
- **By Example:** https://doc.rust-lang.org/rust-by-example/
- **API Guidelines:** https://rust-lang.github.io/api-guidelines/
