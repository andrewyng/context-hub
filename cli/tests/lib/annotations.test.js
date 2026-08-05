import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { mkdtempSync, rmSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const originalChubDir = process.env.CHUB_DIR;
let tempChubDir;

beforeAll(() => {
  tempChubDir = mkdtempSync(join(tmpdir(), 'chub-annotations-test-'));
  process.env.CHUB_DIR = tempChubDir;
});

afterAll(() => {
  if (originalChubDir === undefined) delete process.env.CHUB_DIR;
  else process.env.CHUB_DIR = originalChubDir;
  if (tempChubDir) rmSync(tempChubDir, { recursive: true, force: true });
});

// Import after env is set so getChubDir() picks up the temp path.
const { readAnnotation, writeAnnotation, clearAnnotation, listAnnotations } =
  await import('../../src/lib/annotations.js');

function cleanAnnotationsDir() {
  const dir = join(tempChubDir, 'annotations');
  try { rmSync(dir, { recursive: true, force: true }); } catch {}
}

describe('annotations lib', () => {
  beforeEach(() => {
    cleanAnnotationsDir();
  });

  describe('readAnnotation', () => {
    it('returns null when no annotation exists', () => {
      expect(readAnnotation('acme/widgets')).toBeNull();
    });

    it('returns null when the annotations dir does not exist', () => {
      // First read with no dir at all — should not throw.
      expect(readAnnotation('does/not/exist')).toBeNull();
    });

    it('returns null on malformed JSON without throwing', () => {
      mkdirSync(join(tempChubDir, 'annotations'), { recursive: true });
      writeFileSync(join(tempChubDir, 'annotations', 'acme--widgets.json'), 'not-json');
      expect(readAnnotation('acme/widgets')).toBeNull();
    });
  });

  describe('writeAnnotation', () => {
    it('creates the annotations dir if missing', () => {
      writeAnnotation('acme/widgets', 'a note');
      // Reading it back should succeed.
      expect(readAnnotation('acme/widgets').note).toBe('a note');
    });

    it('returns the annotation object with id, note, updatedAt', () => {
      const result = writeAnnotation('acme/widgets', 'hello');
      expect(result.id).toBe('acme/widgets');
      expect(result.note).toBe('hello');
      expect(result.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('overwrites an existing annotation with the new note', () => {
      writeAnnotation('acme/widgets', 'first');
      writeAnnotation('acme/widgets', 'second');
      expect(readAnnotation('acme/widgets').note).toBe('second');
    });

    it('escapes slashes in the entry id to a safe filename', () => {
      writeAnnotation('foo/bar/baz', 'note');
      const files = readdirSync(join(tempChubDir, 'annotations'));
      // Slashes become `--` so all annotations live in a flat directory.
      expect(files).toContain('foo--bar--baz.json');
    });
  });

  describe('clearAnnotation', () => {
    it('returns false when no annotation exists', () => {
      expect(clearAnnotation('acme/widgets')).toBe(false);
    });

    it('returns true and removes the file when annotation exists', () => {
      writeAnnotation('acme/widgets', 'gone soon');
      expect(clearAnnotation('acme/widgets')).toBe(true);
      expect(readAnnotation('acme/widgets')).toBeNull();
    });

    it('does not throw when the annotations dir does not exist', () => {
      expect(() => clearAnnotation('does/not/exist')).not.toThrow();
    });
  });

  describe('listAnnotations', () => {
    it('returns an empty array when the dir does not exist', () => {
      expect(listAnnotations()).toEqual([]);
    });

    it('returns all annotations in the dir', () => {
      writeAnnotation('acme/widgets', 'one');
      writeAnnotation('openai/chat', 'two');
      const all = listAnnotations();
      expect(all).toHaveLength(2);
      const notes = all.map((a) => a.note).sort();
      expect(notes).toEqual(['one', 'two']);
    });

    it('skips malformed JSON files without throwing', () => {
      mkdirSync(join(tempChubDir, 'annotations'), { recursive: true });
      writeAnnotation('acme/widgets', 'valid');
      writeFileSync(join(tempChubDir, 'annotations', 'broken.json'), 'not-json');
      const all = listAnnotations();
      expect(all).toHaveLength(1);
      expect(all[0].note).toBe('valid');
    });

    it('ignores non-.json files', () => {
      mkdirSync(join(tempChubDir, 'annotations'), { recursive: true });
      writeFileSync(join(tempChubDir, 'annotations', 'readme.md'), 'not an annotation');
      writeAnnotation('acme/widgets', 'real');
      const all = listAnnotations();
      expect(all).toHaveLength(1);
      expect(all[0].note).toBe('real');
    });
  });
});
