/**
 * Attach stdio lifecycle guards so chub-mcp exits cleanly when the parent
 * MCP host goes away (EOF / closed pipe).
 */
export function attachStdioShutdownHandlers({
  stdin = process.stdin,
  stdout = process.stdout,
  stderr = process.stderr,
  onShutdown = () => process.exit(0),
} = {}) {
  let shuttingDown = false;

  const shutdown = (reason) => {
    if (shuttingDown) return;
    shuttingDown = true;

    try {
      stderr.write(`[chub-mcp] ${reason}\n`);
    } catch {
      // ignore stderr write errors during shutdown
    }

    onShutdown(0);
  };

  const onStdinEnd = () => shutdown('Stdin closed; exiting.');
  const onStdinClose = () => shutdown('Stdin stream closed; exiting.');
  const onStdinError = (err) => {
    const detail = err?.code || err?.message || 'unknown';
    shutdown(`Stdin error (${detail}); exiting.`);
  };
  const onStdoutError = (err) => {
    if (err?.code === 'EPIPE') {
      shutdown('Stdout pipe closed (EPIPE); exiting.');
    }
  };

  stdin.on('end', onStdinEnd);
  stdin.on('close', onStdinClose);
  stdin.on('error', onStdinError);
  stdout.on('error', onStdoutError);

  // Keep stdin flowing so EOF/end is observed reliably across hosts.
  if (typeof stdin.resume === 'function') {
    stdin.resume();
  }

  return () => {
    stdin.off('end', onStdinEnd);
    stdin.off('close', onStdinClose);
    stdin.off('error', onStdinError);
    stdout.off('error', onStdoutError);
  };
}
