import { describe, it, expect, afterEach } from 'vitest';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { mkdtempSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';

const CLI_BIN = join(import.meta.dirname, '..', '..', 'bin', 'chub');

describe('chub --install-skills', () => {
  let tempDir;

  afterEach(() => {
    if (tempDir) {
      rmSync(tempDir, { recursive: true, force: true });
      tempDir = null;
    }
  });

  it('shows --install-skills in default usage output', () => {
    tempDir = mkdtempSync(join(tmpdir(), 'chub-install-'));
    const result = execFileSync(
      process.execPath,
      [CLI_BIN],
      { encoding: 'utf8', cwd: tempDir },
    );

    expect(result).toContain('--install-skills');
  });

  it('installs skill for --runtime claude', () => {
    tempDir = mkdtempSync(join(tmpdir(), 'chub-install-'));
    const result = execFileSync(
      process.execPath,
      [CLI_BIN, '--install-skills', '--runtime', 'claude', '--json'],
      { encoding: 'utf8', cwd: tempDir },
    );

    const parsed = JSON.parse(result.trim());
    expect(parsed.status).toBe('ok');
    expect(parsed.installed).toHaveLength(1);
    expect(parsed.installed[0].agent).toBe('claude');
    expect(parsed.installed[0].path).toBe('.claude/skills/get-api-docs');

    const skillPath = join(tempDir, '.claude', 'skills', 'get-api-docs', 'SKILL.md');
    expect(existsSync(skillPath)).toBe(true);
    expect(readFileSync(skillPath, 'utf8')).toContain('get-api-docs');
  });

  it('installs skill for --runtime cursor', () => {
    tempDir = mkdtempSync(join(tmpdir(), 'chub-install-'));
    const result = execFileSync(
      process.execPath,
      [CLI_BIN, '--install-skills', '--runtime', 'cursor', '--json'],
      { encoding: 'utf8', cwd: tempDir },
    );

    const parsed = JSON.parse(result.trim());
    expect(parsed.installed[0].agent).toBe('cursor');
    expect(parsed.installed[0].path).toBe('.cursor/skills/get-api-docs');
    expect(existsSync(join(tempDir, '.cursor', 'skills', 'get-api-docs', 'SKILL.md'))).toBe(true);
  });

  it('installs skill for --runtime codex', () => {
    tempDir = mkdtempSync(join(tmpdir(), 'chub-install-'));
    const result = execFileSync(
      process.execPath,
      [CLI_BIN, '--install-skills', '--runtime', 'codex', '--json'],
      { encoding: 'utf8', cwd: tempDir },
    );

    const parsed = JSON.parse(result.trim());
    expect(parsed.installed[0].agent).toBe('codex');
    expect(parsed.installed[0].path).toBe('.codex/skills/get-api-docs');
    expect(existsSync(join(tempDir, '.codex', 'skills', 'get-api-docs', 'SKILL.md'))).toBe(true);
  });

  it('installs to .agents/skills/ for --runtime generic', () => {
    tempDir = mkdtempSync(join(tmpdir(), 'chub-install-'));
    const result = execFileSync(
      process.execPath,
      [CLI_BIN, '--install-skills', '--runtime', 'generic', '--json'],
      { encoding: 'utf8', cwd: tempDir },
    );

    const parsed = JSON.parse(result.trim());
    expect(parsed.installed[0].agent).toBe('generic');
    expect(parsed.installed[0].path).toBe('.agents/skills/get-api-docs');
    expect(existsSync(join(tempDir, '.agents', 'skills', 'get-api-docs', 'SKILL.md'))).toBe(true);
  });

  it('skips when already installed without --force', () => {
    tempDir = mkdtempSync(join(tmpdir(), 'chub-install-'));

    execFileSync(process.execPath,
      [CLI_BIN, '--install-skills', '--runtime', 'claude'],
      { encoding: 'utf8', cwd: tempDir },
    );

    const result = execFileSync(process.execPath,
      [CLI_BIN, '--install-skills', '--runtime', 'claude', '--json'],
      { encoding: 'utf8', cwd: tempDir },
    );

    const parsed = JSON.parse(result.trim());
    expect(parsed.installed[0].skipped).toBe(true);
    expect(parsed.installed[0].reason).toContain('--force');
  });

  it('overwrites with --force', () => {
    tempDir = mkdtempSync(join(tmpdir(), 'chub-install-'));

    execFileSync(process.execPath,
      [CLI_BIN, '--install-skills', '--runtime', 'claude'],
      { encoding: 'utf8', cwd: tempDir },
    );

    const result = execFileSync(process.execPath,
      [CLI_BIN, '--install-skills', '--runtime', 'claude', '--force', '--json'],
      { encoding: 'utf8', cwd: tempDir },
    );

    const parsed = JSON.parse(result.trim());
    expect(parsed.installed[0].skipped).toBeUndefined();
    expect(parsed.installed[0].path).toBe('.claude/skills/get-api-docs');
  });

  it('does not write files with --dry-run', () => {
    tempDir = mkdtempSync(join(tmpdir(), 'chub-install-'));
    const result = execFileSync(process.execPath,
      [CLI_BIN, '--install-skills', '--runtime', 'claude', '--dry-run', '--json'],
      { encoding: 'utf8', cwd: tempDir },
    );

    const parsed = JSON.parse(result.trim());
    expect(parsed.installed[0].dryRun).toBe(true);
    expect(existsSync(join(tempDir, '.claude', 'skills', 'get-api-docs'))).toBe(false);
  });

  it('errors on invalid --runtime', () => {
    tempDir = mkdtempSync(join(tmpdir(), 'chub-install-'));
    let threw = false;
    try {
      execFileSync(process.execPath,
        [CLI_BIN, '--install-skills', '--runtime', 'invalid', '--json'],
        { encoding: 'utf8', cwd: tempDir, stdio: 'pipe' },
      );
    } catch (err) {
      threw = true;
      expect(err.status).not.toBe(0);
      const parsed = JSON.parse(err.stdout.toString().trim());
      expect(parsed.error).toContain('Unknown agent');
    }
    expect(threw).toBe(true);
  });
});
