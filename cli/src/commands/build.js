import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync, cpSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import chalk from 'chalk';
import { parseFrontmatter } from '../lib/frontmatter.js';
import { info } from '../lib/output.js';
import { trackEvent } from '../lib/analytics.js';
import { buildIndex } from '../lib/bm25.js';

/**
 * Recursively find all DOC.md and SKILL.md files under a directory.
 */
function findEntryFiles(dir, base = dir) {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findEntryFiles(full, base));
    } else if (entry.name === 'DOC.md' || entry.name === 'SKILL.md') {
      results.push({ path: full, relPath: relative(base, full), type: entry.name === 'SKILL.md' ? 'skill' : 'doc' });
    }
  }
  return results;
}

/**
 * Get all files in a directory (relative to that directory).
 */
function listDirFiles(dir) {
  const results = [];
  const walk = (d) => {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const full = join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else results.push(relative(dir, full));
    }
  };
  walk(dir);
  return results;
}

/**
 * Compute total size of all files in a directory.
 */
function dirSize(dir) {
  let total = 0;
  const walk = (d) => {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const full = join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else total += statSync(full).size;
    }
  };
  walk(dir);
  return total;
}

/**
 * Process an author directory with auto-discovery.
 */
function discoverAuthor(authorDir, authorName, contentDir) {
  const entryFiles = findEntryFiles(authorDir);
  const docs = new Map(); // name → { description, source, tags, languages: Map<lang, versions[]> }
  const skills = new Map(); // name → skill entry
  const warnings = [];
  const errors = [];

  for (const ef of entryFiles) {
    const content = readFileSync(ef.path, 'utf8');
    const { attributes } = parseFrontmatter(content);

    if (!attributes.name) {
      errors.push(`${ef.relPath}: missing 'name' in frontmatter`);
      continue;
    }
    if (!attributes.description) {
      warnings.push(`${ef.relPath}: missing 'description' in frontmatter`);
    }

    const meta = attributes.metadata || {};
    const name = attributes.name;
    const description = attributes.description || '';
    const source = meta.source || 'community';
    const tags = meta.tags ? meta.tags.split(',').map((t) => t.trim()) : [];
    const updatedOn = meta['updated-on'] || new Date().toISOString().split('T')[0];
    const entryDir = dirname(ef.path);
    const entryPath = relative(contentDir, entryDir);
    const files = listDirFiles(entryDir);
    const size = dirSize(entryDir);

    if (!meta.source) {
      warnings.push(`${ef.relPath}: missing 'metadata.source', defaulting to 'community'`);
    }

    if (ef.type === 'skill') {
      // Skills are flat — no language/version
      if (skills.has(name)) {
        errors.push(`${ef.relPath}: duplicate skill name '${name}'`);
        continue;
      }
      skills.set(name, {
        id: `${authorName}/${name}`,
        name,
        description,
        source,
        tags,
        path: entryPath,
        files,
        size,
        lastUpdated: updatedOn,
      });
    } else {
      // Docs need language and version
      const languages = meta.languages
        ? meta.languages.split(',').map((l) => l.trim().toLowerCase())
        : null;
      const versions = meta.versions
        ? meta.versions.split(',').map((v) => v.trim())
        : null;

      if (!languages || languages.length === 0) {
        errors.push(`${ef.relPath}: missing 'metadata.languages' in frontmatter`);
        continue;
      }
      if (!versions || versions.length === 0) {
        errors.push(`${ef.relPath}: missing 'metadata.versions' in frontmatter`);
        continue;
      }

      if (!docs.has(name)) {
        docs.set(name, { description, source, tags, languages: new Map() });
      }

      const doc = docs.get(name);

      for (const lang of languages) {
        if (!doc.languages.has(lang)) {
          doc.languages.set(lang, []);
        }
        for (const ver of versions) {
          doc.languages.get(lang).push({
            version: ver,
            path: entryPath,
            files,
            size,
            lastUpdated: updatedOn,
          });
        }
      }
    }
  }

  // Convert docs map to array format
  const docsArray = [];
  for (const [name, doc] of docs) {
    const languages = [];
    for (const [lang, versions] of doc.languages) {
      // Sort versions descending (simple string sort, good enough for semver)
      versions.sort((a, b) => b.version.localeCompare(a.version, undefined, { numeric: true }));
      languages.push({
        language: lang,
        versions,
        recommendedVersion: versions[0].version,
      });
    }
    docsArray.push({
      id: `${authorName}/${name}`,
      name,
      description: doc.description,
      source: doc.source,
      tags: doc.tags,
      languages,
    });
  }

  return {
    docs: docsArray,
    skills: [...skills.values()],
    warnings,
    errors,
  };
}

export function registerBuildCommand(program) {
  program
    .command('build <content-dir>')
    .description('Build registry.json from a content directory')
    .option('-o, --output <dir>', 'Output directory')
    .option('--base-url <url>', 'Base URL for CDN deployment')
    .option('--validate-only', 'Validate without writing output')
    .action((contentDir, opts) => {
      const globalOpts = program.optsWithGlobals();

      if (!existsSync(contentDir)) {
        process.stderr.write(`Error: Content directory not found: ${contentDir}\n`);
        process.exit(1);
      }

      const outputDir = opts.output || join(contentDir, 'dist');
      const allDocs = [];
      const allSkills = [];
      const allWarnings = [];
      const allErrors = [];

      // List top-level directories (author directories)
      const topLevel = readdirSync(contentDir, { withFileTypes: true })
        .filter((e) => e.isDirectory() && e.name !== 'dist' && !e.name.startsWith('.'));

      for (const authorEntry of topLevel) {
        const authorDir = join(contentDir, authorEntry.name);
        const authorRegistry = join(authorDir, 'registry.json');

        if (existsSync(authorRegistry)) {
          // Author provides registry.json — use it directly
          try {
            const reg = JSON.parse(readFileSync(authorRegistry, 'utf8'));
            // Prefix paths with author dir name
            if (reg.docs) {
              for (const doc of reg.docs) {
                if (!doc.id) doc.id = `${authorEntry.name}/${doc.name}`;
                else if (!doc.id.includes('/')) doc.id = `${authorEntry.name}/${doc.id}`;
                for (const lang of doc.languages || []) {
                  for (const ver of lang.versions || []) {
                    ver.path = `${authorEntry.name}/${ver.path}`;
                  }
                }
                allDocs.push(doc);
              }
            }
            if (reg.skills) {
              for (const skill of reg.skills) {
                if (!skill.id) skill.id = `${authorEntry.name}/${skill.name}`;
                else if (!skill.id.includes('/')) skill.id = `${authorEntry.name}/${skill.id}`;
                skill.path = `${authorEntry.name}/${skill.path}`;
                allSkills.push(skill);
              }
            }
            info(`${authorEntry.name}: loaded registry.json`);
          } catch (err) {
            allErrors.push(`${authorEntry.name}/registry.json: ${err.message}`);
          }
        } else {
          // Auto-discover
          const result = discoverAuthor(authorDir, authorEntry.name, contentDir);
          allDocs.push(...result.docs);
          allSkills.push(...result.skills);
          allWarnings.push(...result.warnings);
          allErrors.push(...result.errors);
        }
      }

      // Check for id collisions (should be rare since ids are author/name)
      const docIds = new Map();
      for (const doc of allDocs) {
        if (docIds.has(doc.id)) {
          allErrors.push(`Duplicate doc id '${doc.id}'`);
        }
        docIds.set(doc.id, true);
      }
      const skillIds = new Map();
      for (const skill of allSkills) {
        if (skillIds.has(skill.id)) {
          allErrors.push(`Duplicate skill id '${skill.id}'`);
        }
        skillIds.set(skill.id, true);
      }

      // Print warnings
      for (const w of allWarnings) {
        process.stderr.write(chalk.yellow(`Warning: ${w}\n`));
      }

      // Print errors
      if (allErrors.length > 0) {
        for (const e of allErrors) {
          process.stderr.write(chalk.red(`Error: ${e}\n`));
        }
        process.exit(1);
      }

      const registry = {
        version: '1.0.0',
        generated: new Date().toISOString(),
        docs: allDocs,
        skills: allSkills,
      };

      if (opts.baseUrl) {
        registry.base_url = opts.baseUrl;
      }

      if (opts.validateOnly) {
        const summary = { docs: allDocs.length, skills: allSkills.length, warnings: allWarnings.length };
        if (globalOpts.json) {
          console.log(JSON.stringify(summary));
        } else {
          console.log(chalk.green(`Valid: ${summary.docs} docs, ${summary.skills} skills, ${summary.warnings} warnings`));
        }
        return;
      }

      // Write output
      mkdirSync(outputDir, { recursive: true });
      writeFileSync(join(outputDir, 'registry.json'), JSON.stringify(registry, null, 2));

      // Build and write BM25 search index
      const allEntries = [
        ...allDocs.map((d) => ({ ...d, _type: 'doc' })),
        ...allSkills.map((s) => ({ ...s, _type: 'skill' })),
      ];
      const searchIndex = buildIndex(allEntries);
      writeFileSync(join(outputDir, 'search-index.json'), JSON.stringify(searchIndex));

      // Copy content tree
      for (const authorEntry of topLevel) {
        const src = join(contentDir, authorEntry.name);
        const dest = join(outputDir, authorEntry.name);
        // Skip registry.json in author dirs
        cpSync(src, dest, {
          recursive: true,
          filter: (s) => !s.endsWith('/registry.json'),
        });
      }

      const summary = { docs: allDocs.length, skills: allSkills.length, warnings: allWarnings.length };
      trackEvent('build', { doc_count: allDocs.length, skill_count: allSkills.length }).catch(() => {});
      if (globalOpts.json) {
        console.log(JSON.stringify({ ...summary, output: outputDir }));
      } else {
        console.log(chalk.green(`Built: ${summary.docs} docs, ${summary.skills} skills → ${outputDir}`));
      }
    });
}
