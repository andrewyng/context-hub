import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('update-check', () => {
  let checkForUpdates;

  beforeEach(async () => {
    vi.resetModules();
    ({ checkForUpdates } = await import('../../src/lib/update-check.js'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.CHUB_UPDATE_CHECK;
  });

  it('calls updateNotifier().notify() in normal mode', async () => {
    const notify = vi.fn();
    const mockNotifier = vi.fn(() => ({ notify }));
    const mockImport = vi.fn(async () => ({ default: mockNotifier }));

    await checkForUpdates({ _importNotifier: mockImport });

    expect(mockImport).toHaveBeenCalled();
    expect(mockNotifier).toHaveBeenCalledWith(
      expect.objectContaining({ pkg: expect.objectContaining({ name: '@aisuite/chub' }) })
    );
    expect(notify).toHaveBeenCalled();
  });

  it('skips when --json flag is set', async () => {
    const mockImport = vi.fn();

    await checkForUpdates({ json: true, _importNotifier: mockImport });

    expect(mockImport).not.toHaveBeenCalled();
  });

  it('skips when CHUB_UPDATE_CHECK=0', async () => {
    process.env.CHUB_UPDATE_CHECK = '0';
    const mockImport = vi.fn();

    await checkForUpdates({ _importNotifier: mockImport });

    expect(mockImport).not.toHaveBeenCalled();
  });

  it('skips when CHUB_UPDATE_CHECK=false', async () => {
    process.env.CHUB_UPDATE_CHECK = 'false';
    const mockImport = vi.fn();

    await checkForUpdates({ _importNotifier: mockImport });

    expect(mockImport).not.toHaveBeenCalled();
  });

  it('does not throw when update-notifier import fails', async () => {
    const mockImport = vi.fn(async () => { throw new Error('module not found'); });

    await expect(checkForUpdates({ _importNotifier: mockImport })).resolves.not.toThrow();
  });

  it('does not throw when notify() throws', async () => {
    const notify = vi.fn(() => { throw new Error('notify failed'); });
    const mockNotifier = vi.fn(() => ({ notify }));
    const mockImport = vi.fn(async () => ({ default: mockNotifier }));

    await expect(checkForUpdates({ _importNotifier: mockImport })).resolves.not.toThrow();
  });
});
