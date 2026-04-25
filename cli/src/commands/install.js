import chalk from 'chalk';
import { existsSync } from 'node:fs';
import { cp, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createInterface } from 'node:readline';
import { output, error } from '../lib/output.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SKILL_NAME = 'get-api-docs';

// ---------------------------------------------------------------------------
// Agent registry — add new agents here, no code changes needed
// ---------------------------------------------------------------------------

const AGENTS = [
  {
    name: 'claude',
    displayName: 'Claude Code',
    repoMarkers: ['.claude/settings.json', '.claude/'],
    envVars: ['CLAUDE_CODE', 'CLAUDE_SESSION_ID'],
    binaries: [
      { name: 'claude', verifyArgs: ['--version'], matchAny: ['claude'] },
    ],
    skillsDir: '.claude/skills',
  },
  {
    name: 'cursor',
    displayName: 'Cursor Agent',
    repoMarkers: ['.cursor/rules/', '.cursor/'],
    envVars: ['CURSOR_SESSION_ID', 'CURSOR_TRACE_ID'],
    binaries: [
      { name: 'cursor-agent', verifyArgs: ['--version'], matchAny: ['cursor'] },
      { name: 'agent', verifyArgs: ['--version'], matchAny: ['cursor'] },
    ],
    skillsDir: '.cursor/skills',
  },
  {
    name: 'codex',
    displayName: 'Codex CLI',
    repoMarkers: ['.codex/'],
    envVars: ['CODEX_HOME', 'CODEX_SESSION'],
    binaries: [
      { name: 'codex', verifyArgs: ['--version'], matchAny: ['openai', 'codex'] },
    ],
    skillsDir: '.codex/skills',
  },
  {
    name: 'gemini',
    displayName: 'Gemini CLI',
    repoMarkers: ['.gemini/'],
    envVars: ['GEMINI_CLI'],
    binaries: [
      { name: 'gemini', verifyArgs: ['--version'], matchAny: ['gemini', 'google'] },
    ],
    skillsDir: '.gemini/skills',
  },
  {
    name: 'augment',
    displayName: 'Augment (Auggie)',
    repoMarkers: ['.augment/'],
    envVars: ['AUGMENT_AGENT'],
    binaries: [
      { name: 'auggie', verifyArgs: ['--version'], matchAny: ['augment'] },
    ],
    skillsDir: '.augment/skills',
  },
  {
    name: 'amp',
    displayName: 'Amp',
    repoMarkers: [],
    envVars: [],
    binaries: [
      { name: 'amp', verifyArgs: ['--version'], matchAny: ['sourcegraph'] },
    ],
    skillsDir: '.agents/skills',
  },
];

const GENERIC_AGENT = {
  name: 'generic',
  displayName: 'Generic',
  skillsDir: '.agents/skills',
};

// ---------------------------------------------------------------------------
// Detection
// ---------------------------------------------------------------------------

/**
 * Verify a binary exists on PATH and its --version output matches expected
 * strings. Runs with a 3-second timeout to avoid hangs from interactive tools.
 */
function verifyBinary(binary) {
  try {
    const stdout = execFileSync(binary.name, binary.verifyArgs, {
      timeout: 3000,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return binary.matchAny.some(m => (stdout || '').toLowerCase().includes(m));
  } catch (err) {
    // Binary not found (ENOENT), timed out, or exited non-zero.
    // Some tools print version to stderr or exit non-zero for --version.
    const out = [err.stdout, err.stderr]
      .filter(s => s != null)
      .map(s => String(s))
      .join('\n')
      .toLowerCase();
    return out.length > 0 && binary.matchAny.some(m => out.includes(m));
  }
}

/**
 * Detect installed AI coding agents using a 3-tier approach:
 *   Tier 1: repo-level config directories (most reliable)
 *   Tier 2: environment variables set by running agents
 *   Tier 3: binary scan on PATH with version verification
 */
function detectAgents(repoPath) {
  const detected = [];

  for (const agent of AGENTS) {
    let found = false;

    // Tier 1: repo markers
    for (const marker of agent.repoMarkers) {
      if (existsSync(join(repoPath, marker))) {
        detected.push({ agent, tier: 'repo', source: marker });
        found = true;
        break;
      }
    }
    if (found) continue;

    // Tier 2: environment variables
    for (const envVar of agent.envVars) {
      if (process.env[envVar]) {
        detected.push({ agent, tier: 'env', source: envVar });
        found = true;
        break;
      }
    }
    if (found) continue;

    // Tier 3: binary scan with verification
    for (const binary of agent.binaries) {
      if (verifyBinary(binary)) {
        detected.push({ agent, tier: 'binary', source: binary.name });
        break;
      }
    }
  }

  return detected;
}

// ---------------------------------------------------------------------------
// Interactive prompt
// ---------------------------------------------------------------------------

function askQuestion(text) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stderr });
    rl.question(text, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function promptForAgents(detections) {
  const choices = [];

  if (detections.length > 0) {
    for (const d of detections) {
      process.stderr.write(
        chalk.dim(`Detected: ${d.agent.displayName} (found ${d.source})\n`),
      );
    }
    process.stderr.write('\n');

    for (const d of detections) {
      choices.push({
        label: `${d.agent.displayName}  (${d.agent.skillsDir}/${SKILL_NAME}/)`,
        agents: [d.agent],
      });
    }
    if (detections.length > 1) {
      choices.push({ label: 'All detected', agents: detections.map(d => d.agent) });
    }
  } else {
    process.stderr.write(chalk.yellow('No AI coding agent detected.\n\n'));

    for (const agent of AGENTS) {
      choices.push({
        label: `${agent.displayName}  (${agent.skillsDir}/${SKILL_NAME}/)`,
        agents: [agent],
      });
    }
  }

  choices.push({
    label: `Generic  (.agents/skills/${SKILL_NAME}/)`,
    agents: [GENERIC_AGENT],
  });

  process.stderr.write(`Install ${SKILL_NAME} skill for:\n`);
  for (let i = 0; i < choices.length; i++) {
    process.stderr.write(`  [${i + 1}] ${choices[i].label}\n`);
  }

  const answer = await askQuestion('> ');
  const index = parseInt(answer, 10) - 1;

  if (isNaN(index) || index < 0 || index >= choices.length) {
    return null;
  }

  return choices[index].agents;
}

// ---------------------------------------------------------------------------
// Install logic
// ---------------------------------------------------------------------------

async function installSkillTo(skillSource, agent, repoPath, opts) {
  const destDir = join(repoPath, agent.skillsDir, SKILL_NAME);
  const relPath = `${agent.skillsDir}/${SKILL_NAME}`;

  if (existsSync(join(destDir, 'SKILL.md')) && !opts.force) {
    return { agent: agent.name, path: relPath, skipped: true, reason: 'already installed (use --force to overwrite)' };
  }

  if (opts.dryRun) {
    return { agent: agent.name, path: relPath, dryRun: true };
  }

  await mkdir(join(repoPath, agent.skillsDir), { recursive: true });
  await cp(skillSource, destDir, { recursive: true });

  return { agent: agent.name, path: relPath };
}

// ---------------------------------------------------------------------------
// Exported handler
// ---------------------------------------------------------------------------

export async function handleInstallSkills(opts, globalOpts) {
  // Resolve skill source from installed package
  const skillSource = join(__dirname, '..', '..', 'skills', SKILL_NAME);
  if (!existsSync(skillSource)) {
    error('Skills source directory not found. Your chub installation may be corrupted.', globalOpts);
  }

  const repoPath = process.cwd();
  let targets;

  if (opts.runtime) {
    // Explicit agent selection — skip detection
    const name = opts.runtime.toLowerCase();
    if (name === 'generic') {
      targets = [GENERIC_AGENT];
    } else {
      const agent = AGENTS.find(a => a.name === name);
      if (!agent) {
        const valid = AGENTS.map(a => a.name).concat('generic').join(', ');
        error(`Unknown agent: "${opts.runtime}". Valid options: ${valid}`, globalOpts);
      }
      targets = [agent];
    }
  } else {
    // Auto-detect
    const detections = detectAgents(repoPath);

    if (detections.length === 1) {
      const d = detections[0];
      process.stderr.write(`Detected: ${d.agent.displayName} (found ${d.source})\n`);
      targets = [d.agent];
    } else {
      // Multiple or none — need user input
      if (globalOpts.json || !process.stdin.isTTY) {
        if (detections.length > 1) {
          error(
            'Multiple agents detected: ' +
            detections.map(d => d.agent.name).join(', ') +
            '. Use --runtime to specify which agent to install for.',
            globalOpts,
          );
        } else {
          error(
            'No agent detected. Use --runtime to specify target (e.g., --runtime claude).',
            globalOpts,
          );
        }
      }

      targets = await promptForAgents(detections);
      if (!targets) {
        error('Invalid selection.', globalOpts);
      }
    }
  }

  // Install to each target
  const results = [];
  for (const agent of targets) {
    try {
      const result = await installSkillTo(skillSource, agent, repoPath, opts);
      results.push(result);
    } catch (err) {
      error(`Failed to install to ${agent.displayName}: ${err.message}`, globalOpts);
    }
  }

  output(
    { status: 'ok', installed: results },
    () => {
      for (const r of results) {
        if (r.skipped) {
          console.log(chalk.yellow(`Skipped ${r.path} (${r.reason})`));
        } else if (r.dryRun) {
          console.log(chalk.dim(`Would install to ${r.path}`));
        } else {
          console.log(chalk.green(`Skill installed to ${r.path}`));
        }
      }
    },
    globalOpts,
  );
}
