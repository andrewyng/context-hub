---
name: bun-sea-packaging
description: "How to package Bun SEA (Single Executable Application) binaries on NixOS without breaking them. autoPatchelfHook truncates appended bytecode — use patchelf --set-interpreter instead."
metadata:
  languages: "nix"
  versions: "24.11"
  updated-on: "2026-03-21"
  source: community
  tags: "nixos,nix,bun,packaging,patchelf,autoPatchelfHook,sea"
---

# Packaging Bun SEA Binaries on NixOS

## The Problem

[Bun SEA](https://bun.sh/docs/bundler/executables) (Single Executable Application) binaries — produced by `bun build --compile` — break on NixOS when processed by `autoPatchelfHook`.

**Symptoms:** The packaged binary shows Bun's own `--help` output instead of the application's CLI. Subcommands like `app scan` return `error: Script not found "scan"`. The binary acts as a bare Bun runtime.

## Root Cause

Bun SEA binaries embed compiled JavaScript bytecode **appended after the ELF section table**. The bytecode region is terminated by a sentinel marker in the last 32 bytes:

```
---- Bun! ----
```

Followed by an 8-byte little-endian offset pointing to where the bytecode begins.

When Bun starts, it reads `/proc/self/exe`, seeks to the end, checks for the sentinel, and if found, loads the embedded bytecode. If the sentinel is missing, Bun falls back to its default runtime behavior.

### Why autoPatchelfHook Breaks It

NixOS's `autoPatchelfHook` (and `patchelf` with certain rewrite operations) reconstructs the ELF file, which **truncates all data after the section table**. This destroys both the bytecode and the sentinel.

Typical size difference:
- Raw binary: ~103 MB
- After `autoPatchelfHook`: ~99 MB ← 4 MB of bytecode lost
- After `patchelf --set-interpreter` only: ~103 MB ← preserved

### Why ld-linux Wrapper Doesn't Work

Using `makeWrapper` with the NixOS dynamic linker as the program:

```nix
# DON'T DO THIS — Bun reads /proc/self/exe which points to ld-linux, not your binary
makeWrapper "${pkgs.glibc}/lib/ld-linux-x86-64.so.2" $out/bin/app \
  --add-flags "$out/lib/app/app"
```

This fails because Bun reads `/proc/self/exe` to find the sentinel. When invoked via the dynamic linker, `/proc/self/exe` points to `ld-linux-x86-64.so.2`, not the app binary.

## The Fix

Use `patchelf --set-interpreter` directly. This modifies **only** the `.interp` section (and may shift headers to accommodate the longer Nix store path), but preserves all appended data.

```nix
{ pkgs, ... }:

pkgs.stdenv.mkDerivation {
  pname = "my-bun-app";
  version = "1.0.0";

  src = pkgs.fetchurl {
    url = "https://example.com/my-bun-app-linux-x64.tar.gz";
    hash = "sha256-...";
  };

  sourceRoot = ".";

  nativeBuildInputs = [ pkgs.patchelf ];

  # CRITICAL: Disable ALL automatic ELF patching
  dontPatchELF = true;
  dontAutoPatchelf = true;
  dontStrip = true;
  dontFixup = true;

  installPhase = ''
    mkdir -p $out/bin
    cp my-bun-app $out/bin/my-bun-app
    chmod +x $out/bin/my-bun-app

    # Patch ONLY the interpreter — preserves appended bytecode
    patchelf --set-interpreter \
      "${pkgs.glibc}/lib/ld-linux-x86-64.so.2" \
      $out/bin/my-bun-app

    # VERIFY the Bun SEA sentinel survived patching
    if ! tail -c 32 $out/bin/my-bun-app | grep -q "Bun!"; then
      echo "ERROR: Bun SEA sentinel not found — binary is broken!"
      exit 1
    fi
  '';
}
```

### For aarch64-linux

Use a different interpreter path:

```nix
patchelf --set-interpreter \
  "${pkgs.glibc}/lib/ld-linux-aarch64.so.1" \
  $out/bin/my-bun-app
```

## Checklist

| Operation | Safe? | Notes |
|-----------|-------|-------|
| `patchelf --set-interpreter` | ✅ Yes | Only modifies `.interp` section |
| `autoPatchelfHook` | ❌ No | Rewrites ELF, truncates appended data |
| `patchelf --set-rpath` | ⚠️ Test | Usually safe, but verify sentinel |
| `strip` | ❌ No | Removes non-section data |
| `dontFixup = true` | ✅ Required | Prevents implicit patchelf/strip in fixup phase |

## Verification

Always include a build-time sentinel check:

```bash
tail -c 32 $out/bin/binary | grep -q "Bun!"
```

The string `---- Bun! ----` must appear in the last 32 bytes of the file.

## Applies To

- Any tool distributed as a Bun SEA binary (`bun build --compile` output)
- Examples: [varlock](https://varlock.dev), and any npm package compiled with Bun
- Node.js SEA binaries use a similar appended-data approach and likely have the same issue

## Real-World Example

The [varlock Nix flake](https://github.com/heath-hunnicutt-ruach-tov/varlock-nix) demonstrates this pattern for packaging varlock 0.6.2 on NixOS.

## Discovery

Found while packaging varlock for NixOS (March 2026). The `autoPatchelfHook` approach produced a binary that was 4 MB smaller than the original and showed Bun's `--help` instead of varlock's CLI. Root cause identified by comparing `tail -c 32` output and file sizes before/after patching.
