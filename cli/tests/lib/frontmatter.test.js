import { describe, it, expect } from 'vitest';
import { parseFrontmatter, FrontmatterParseError } from '../../src/lib/frontmatter.js';

describe('parseFrontmatter', () => {
  it('parses valid frontmatter with attributes and body', () => {
    const content = `---
name: my-doc
description: A test document
metadata:
  languages: "python,javascript"
  versions: "1.0.0"
  tags: "ai,llm"
---

# Hello World

This is the body.`;

    const result = parseFrontmatter(content);

    expect(result.attributes.name).toBe('my-doc');
    expect(result.attributes.description).toBe('A test document');
    expect(result.attributes.metadata.languages).toBe('python,javascript');
    expect(result.attributes.metadata.versions).toBe('1.0.0');
    expect(result.attributes.metadata.tags).toBe('ai,llm');
    expect(result.body).toContain('# Hello World');
    expect(result.body).toContain('This is the body.');
  });

  it('returns empty attributes when no frontmatter', () => {
    const content = `# Just a heading

No frontmatter here.`;

    const result = parseFrontmatter(content);

    expect(result.attributes).toEqual({});
    expect(result.body).toBe(content);
  });

  it('handles empty metadata in frontmatter', () => {
    const content = `---
name: empty-meta
---

Body content.`;

    const result = parseFrontmatter(content);

    expect(result.attributes.name).toBe('empty-meta');
    expect(result.body).toContain('Body content.');
  });

  it('handles frontmatter with only whitespace values', () => {
    const content = `---
name: test
description: ""
---

Body.`;

    const result = parseFrontmatter(content);

    expect(result.attributes.name).toBe('test');
    expect(result.attributes.description).toBe('');
    expect(result.body).toContain('Body.');
  });

  it('handles content with no trailing newline after closing ---', () => {
    const content = `---
name: test
---
Immediate body.`;

    const result = parseFrontmatter(content);

    expect(result.attributes.name).toBe('test');
    expect(result.body).toBe('Immediate body.');
  });

  it('throws FrontmatterParseError with file-relative line/col on malformed YAML', () => {
    // Reproduces issue #238: an unquoted colon inside a value is parsed as a
    // nested mapping and the underlying yaml package throws.
    const content = `---
name: bad
description: Unquoted colon: breaks parsing
---
body`;

    let caught;
    try {
      parseFrontmatter(content);
    } catch (err) {
      caught = err;
    }

    expect(caught).toBeInstanceOf(FrontmatterParseError);
    // `description:` is line 3 of the file (line 1 is `---`, line 2 is `name:`).
    expect(caught.line).toBe(3);
    expect(caught.col).toBeGreaterThan(0);
    expect(caught.message).toMatch(/mapping/i);
    expect(caught.cause).toBeDefined();
  });

  it('does not throw on YAML edge cases that are valid', () => {
    // Sanity check: a quoted value containing a colon parses cleanly.
    const content = `---
name: good
description: "Quoted colon: works"
---
body`;

    expect(() => parseFrontmatter(content)).not.toThrow();
  });
});
