---
name: crypto-js
description: "TypeScript guidance for `crypto-js`, including installation of `@types/crypto-js`, CommonJS-friendly imports, and practical hashing, AES, and PBKDF2 workflows."
metadata:
  languages: "typescript"
  versions: "4.2.2"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "typescript,crypto-js,crypto,hashing,aes,pbkdf2,types,definitelytyped,npm"
---

# crypto-js TypeScript Guide

## Golden Rule

Install `crypto-js` for runtime behavior and `@types/crypto-js` for TypeScript declarations.

Import from `"crypto-js"` in application code. Do not import from `"@types/crypto-js"` directly.

There is no client object, authentication flow, or package-specific initialization step.

## Install

Install the runtime package first, then add TypeScript and the declaration package:

```bash
npm install crypto-js
npm install -D typescript @types/crypto-js@4.2.2
```

If your project already uses TypeScript, add just the declarations:

```bash
npm install -D @types/crypto-js@4.2.2
```

If you read encryption material from `process.env` in a Node.js app, add Node's type declarations too:

```bash
npm install -D @types/node
```

`@types/crypto-js` does not define any environment variables. In real applications, you usually provide your own passphrase or key material through your app configuration:

```bash
export CRYPTO_SECRET_PASSPHRASE="replace-me"
export CRYPTO_KEY_HEX="00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff"
export CRYPTO_IV_HEX="0102030405060708090a0b0c0d0e0f10"
```

## Import Style And `tsconfig.json`

`crypto-js` is published in a CommonJS/UMD style. The configuration-independent TypeScript import form is:

```typescript
import CryptoJS = require("crypto-js");
```

If your project already enables default-import interop, this also works:

```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true
  }
}
```

```typescript
import CryptoJS from "crypto-js";
```

Pick one import style and use it consistently.

## Common Workflows

### Hash text and serialize the digest explicitly

The hash helpers return a `WordArray`. Convert it to a string in the encoding your application expects.

```typescript
import CryptoJS = require("crypto-js");

export function sha256Hex(value: string): string {
  return CryptoJS.SHA256(value).toString(CryptoJS.enc.Hex);
}

export function sha256Base64(value: string): string {
  return CryptoJS.SHA256(value).toString(CryptoJS.enc.Base64);
}

export function hmacSha256Hex(value: string, secret: string): string {
  return CryptoJS.HmacSHA256(value, secret).toString(CryptoJS.enc.Hex);
}
```

This is the practical TypeScript boundary: application code usually wants a plain `string`, while `crypto-js` works internally with `WordArray` values.

### Encrypt and decrypt text with a passphrase

Passphrase-based encryption is the shortest path when your app already manages a shared secret string.

```typescript
import CryptoJS = require("crypto-js");

function loadPassphrase(): string {
  const passphrase = process.env.CRYPTO_SECRET_PASSPHRASE;

  if (!passphrase) {
    throw new Error("CRYPTO_SECRET_PASSPHRASE is required");
  }

  return passphrase;
}

export function encryptText(plaintext: string): string {
  const passphrase = loadPassphrase();
  return CryptoJS.AES.encrypt(plaintext, passphrase).toString();
}

export function decryptText(ciphertext: string): string {
  const passphrase = loadPassphrase();
  const bytes = CryptoJS.AES.decrypt(ciphertext, passphrase);
  return bytes.toString(CryptoJS.enc.Utf8);
}
```

`AES.decrypt()` returns bytes, not a JavaScript string. Use `CryptoJS.enc.Utf8` when you expect UTF-8 plaintext.

### Encrypt structured data with an explicit key and IV

When your application already manages raw key material, parse it into `WordArray` values and pass the same options to both `encrypt()` and `decrypt()`.

```typescript
import CryptoJS = require("crypto-js");

type SessionToken = {
  sub: string;
  scope: string[];
};

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

function loadKeyMaterial() {
  return {
    key: CryptoJS.enc.Hex.parse(requireEnv("CRYPTO_KEY_HEX")),
    iv: CryptoJS.enc.Hex.parse(requireEnv("CRYPTO_IV_HEX")),
  };
}

export function encryptToken(token: SessionToken): string {
  const { key, iv } = loadKeyMaterial();
  const plaintext = JSON.stringify(token);

  return CryptoJS.AES.encrypt(plaintext, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  }).toString();
}

export function decryptToken(ciphertext: string): SessionToken {
  const { key, iv } = loadKeyMaterial();
  const bytes = CryptoJS.AES.decrypt(ciphertext, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8)) as SessionToken;
}
```

This pattern keeps the key and IV parsing in one place and returns normal TypeScript values at your application boundary.

### Derive a key with PBKDF2

Use `PBKDF2()` when your input is a passphrase but the rest of your application expects a fixed-length symmetric key.

```typescript
import CryptoJS = require("crypto-js");

type DerivedKey = {
  saltHex: string;
  keyHex: string;
};

export function deriveAes256Key(passphrase: string): DerivedKey {
  const salt = CryptoJS.lib.WordArray.random(16);
  const key = CryptoJS.PBKDF2(passphrase, salt, {
    keySize: 256 / 32,
    iterations: 100000,
    hasher: CryptoJS.algo.SHA256,
  });

  return {
    saltHex: salt.toString(CryptoJS.enc.Hex),
    keyHex: key.toString(CryptoJS.enc.Hex),
  };
}
```

`PBKDF2()` also returns a `WordArray`, so serialize the result before storing it in configuration, a database record, or a transport payload.

## Important Pitfalls

- `@types/crypto-js` is a declaration package only. Keep `crypto-js` installed as a normal runtime dependency.
- Import from `crypto-js`, not from `@types/crypto-js`.
- `SHA256()`, `HmacSHA256()`, `PBKDF2()`, and `AES.decrypt()` produce `WordArray` values. Convert them explicitly with `CryptoJS.enc.Hex`, `CryptoJS.enc.Base64`, or `CryptoJS.enc.Utf8`.
- `WordArray.random(16)` uses a byte count. For a 16-byte IV or salt, pass `16`, not `128`.
- Passphrase-based `AES.encrypt(plaintext, passphrase)` and key-based `AES.encrypt(plaintext, key, { iv })` are different call patterns. Decrypt with the matching form and the same options.
- If you rely on `process.env` in TypeScript, include `@types/node` or another runtime-specific source of environment typings.

## Version-Sensitive Notes

- This guide targets `@types/crypto-js==4.2.2`.
- The declarations are for the `crypto-js` runtime package, so application imports stay `crypto-js`.
- If your project uses a default import such as `import CryptoJS from "crypto-js"`, enable `esModuleInterop` or use `import CryptoJS = require("crypto-js")` instead.

## Official Sources

- npm package page for `@types/crypto-js`: https://www.npmjs.com/package/@types/crypto-js
- DefinitelyTyped source for `@types/crypto-js`: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/crypto-js
- `@types/crypto-js` declaration entrypoint: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/crypto-js/index.d.ts
- npm package page for `crypto-js`: https://www.npmjs.com/package/crypto-js
- `crypto-js` upstream repository and README: https://github.com/brix/crypto-js
