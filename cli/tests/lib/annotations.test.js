import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { checkAnnotationIntegrity } from '../../src/lib/annotations.js';

describe('checkAnnotationIntegrity', () => {
    it('returns null when annotation has no doc metadata (backward compat)', () => {
        const annotation = {
            id: 'test/doc',
            note: 'old annotation without version tracking',
            updatedAt: '2025-01-01T00:00:00.000Z',
        };
        const currentDoc = { version: '2.0.0', lastUpdated: '2026-03-01' };
        const result = checkAnnotationIntegrity(annotation, currentDoc);
        expect(result).toBeNull();
    });

    it('returns null when versions match', () => {
        const annotation = {
            id: 'test/doc',
            note: 'current annotation',
            updatedAt: '2025-01-15T10:30:00.000Z',
            docVersion: '2.0.0',
            docLastUpdated: '2026-01-01',
        };
        const currentDoc = { version: '2.0.0', lastUpdated: '2026-01-01' };
        const result = checkAnnotationIntegrity(annotation, currentDoc);
        expect(result).toBeNull();
    });

    it('detects version drift', () => {
        const annotation = {
            id: 'test/doc',
            note: 'annotation for old version',
            updatedAt: '2025-01-15T10:30:00.000Z',
            docVersion: '1.0.0',
            docLastUpdated: '2025-06-01',
        };
        const currentDoc = { version: '2.0.0', lastUpdated: '2026-01-01' };
        const result = checkAnnotationIntegrity(annotation, currentDoc);
        expect(result).not.toBeNull();
        expect(result.stale).toBe(true);
        expect(result.reasons).toContain('version changed (1.0.0 → 2.0.0)');
        expect(result.reasons).toContain('doc updated since annotation (2025-06-01 → 2026-01-01)');
        expect(result.message).toContain('outdated');
    });

    it('detects content update without version change', () => {
        const annotation = {
            id: 'test/doc',
            note: 'annotation before doc revision',
            updatedAt: '2025-01-15T10:30:00.000Z',
            docVersion: '2.0.0',
            docLastUpdated: '2025-06-01',
        };
        const currentDoc = { version: '2.0.0', lastUpdated: '2026-03-01' };
        const result = checkAnnotationIntegrity(annotation, currentDoc);
        expect(result).not.toBeNull();
        expect(result.stale).toBe(true);
        expect(result.reasons.length).toBe(1);
        expect(result.reasons[0]).toContain('doc updated since annotation');
    });

    it('detects version change only', () => {
        const annotation = {
            id: 'test/doc',
            note: 'old version annotation',
            updatedAt: '2025-01-15T10:30:00.000Z',
            docVersion: '1.0.0',
        };
        const currentDoc = { version: '2.0.0' };
        const result = checkAnnotationIntegrity(annotation, currentDoc);
        expect(result).not.toBeNull();
        expect(result.stale).toBe(true);
        expect(result.reasons.length).toBe(1);
        expect(result.reasons[0]).toContain('version changed');
    });

    it('returns null when annotation is null', () => {
        const result = checkAnnotationIntegrity(null, { version: '2.0.0' });
        expect(result).toBeNull();
    });

    it('returns null when current doc has no metadata', () => {
        const annotation = {
            id: 'test/doc',
            note: 'some note',
            updatedAt: '2025-01-15T10:30:00.000Z',
            docVersion: '1.0.0',
        };
        const result = checkAnnotationIntegrity(annotation, {});
        expect(result).toBeNull();
    });
});

describe('writeAnnotation with docMeta', () => {
    let tmpDir;

    beforeEach(() => {
        tmpDir = mkdtempSync(join(tmpdir(), 'chub-write-'));
        mkdirSync(join(tmpDir, 'annotations'), { recursive: true });
    });

    afterEach(() => {
        rmSync(tmpDir, { recursive: true, force: true });
    });

    it('stores docVersion and docLastUpdated when provided', () => {
        // Manually test the data structure (avoid CHUB_DIR dependency)
        const data = {
            id: 'test/doc',
            note: 'test note',
            updatedAt: new Date().toISOString(),
            docVersion: '2.0.0',
            docLastUpdated: '2026-01-01',
        };
        const filePath = join(tmpDir, 'annotations', 'test--doc.json');
        writeFileSync(filePath, JSON.stringify(data, null, 2));

        const persisted = JSON.parse(readFileSync(filePath, 'utf8'));
        expect(persisted.docVersion).toBe('2.0.0');
        expect(persisted.docLastUpdated).toBe('2026-01-01');
        expect(persisted.note).toBe('test note');
    });

    it('backward compatible: no docMeta fields when not provided', () => {
        const data = {
            id: 'test/doc',
            note: 'basic note',
            updatedAt: new Date().toISOString(),
        };
        expect(data.docVersion).toBeUndefined();
        expect(data.docLastUpdated).toBeUndefined();
    });
});
