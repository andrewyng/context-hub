import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rmSync } from 'node:fs';
import { join } from 'node:path';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import {
  computeHash,
  verifyHash,
  saveManifest,
  loadManifest,
  hasIntegrityVerification,
  verifyRegistry,
  verifyDoc,
  verifyBundle,
  generateManifestEntries
} from '../../src/lib/integrity.js';

describe('integrity', () => {
  let testDir;

  beforeEach(() => {
    testDir = mkdtemp(join(process.cwd(), 'test-integrity-'));
    process.env.CHUB_DIR = testDir;
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
    delete process.env.CHUB_DIR;
  });

  describe('computeHash', () => {
    it('should compute consistent SHA-256 hash', () => {
      const content = 'Hello, World!';
      const hash1 = computeHash(content);
      const hash2 = computeHash(content);
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA-256 produces 64 hex chars
    });

    it('should produce different hashes for different content', () => {
      const hash1 = computeHash('Hello');
      const hash2 = computeHash('World');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyHash', () => {
    it('should succeed when hash matches', () => {
      const content = 'test content';
      const hash = computeHash(content);
      expect(() => verifyHash(content, hash)).not.toThrow();
    });

    it('should throw when hash does not match', () => {
      const content = 'test content';
      const wrongHash = 'a'.repeat(64);
      expect(() => verifyHash(content, wrongHash))
        .toThrow('Content integrity check failed');
    });
  });

  describe('manifest operations', () => {
    it('should save and load manifest', () => {
      const manifest = {
        version: 1,
        source: 'test-source',
        updated_at: '2024-03-17T00:00:00Z',
        files: {
          'registry.json': computeHash('{"test": true}'),
          'docs/test.md': computeHash('# Test'),
        },
      };

      saveManifest('test-source', manifest);
      const loaded = loadManifest('test-source');
      expect(loaded).toEqual(manifest);
    });

    it('should return null for non-existent manifest', () => {
      const loaded = loadManifest('non-existent');
      expect(loaded).toBeNull();
    });

    it('should detect if source has integrity verification', () => {
      expect(hasIntegrityVerification('test-source')).toBe(false);

      saveManifest('test-source', { files: {} });
      expect(hasIntegrityVerification('test-source')).toBe(true);
    });
  });

  describe('verifyRegistry', () => {
    it('should verify registry against manifest', () => {
      const content = '{"name": "test"}';
      const hash = computeHash(content);
      saveManifest('test-source', {
        files: { 'registry.json': hash }
      });

      const result = verifyRegistry('test-source', content);
      expect(result.verified).toBe(true);
      expect(result.method).toBe('SHA-256');
    });

    it('should skip verification if no manifest', () => {
      const content = '{"name": "test"}';
      const result = verifyRegistry('no-manifest', content);
      expect(result.verified).toBe(false);
      expect(result.reason).toBe('No manifest available');
    });
  });

  describe('verifyDoc', () => {
    it('should verify doc file against manifest', () => {
      const content = '# Test Document';
      const hash = computeHash(content);
      saveManifest('test-source', {
        files: { 'docs/test.md': hash }
      });

      const result = verifyDoc('test-source', 'docs/test.md', content);
      expect(result.verified).toBe(true);
    });

    it('should skip verification if no manifest', () => {
      const content = '# Test';
      const result = verifyDoc('no-manifest', 'docs/test.md', content);
      expect(result.verified).toBe(false);
    });
  });

  describe('verifyBundle', () => {
    it('should verify bundle content against manifest', () => {
      const content = Buffer.from('fake tar.gz content');
      const hash = computeHash(content);
      saveManifest('test-source', {
        files: { 'bundle.tar.gz': hash }
      });

      const result = verifyBundle('test-source', content);
      expect(result.verified).toBe(true);
    });
  });

  describe('generateManifestEntries', () => {
    it('should generate manifest entries for content', () => {
      const files = {
        'registry.json': { test: true },
        'docs/test.md': '# Test',
      };

      const entries = generateManifestEntries(files);
      expect(entries['registry.json']).toBeDefined();
      expect(entries['docs/test.md']).toBeDefined();
      expect(typeof entries['registry.json']).toBe('string');
      expect(typeof entries['docs/test.md']).toBe('string');
    });
  });
});
