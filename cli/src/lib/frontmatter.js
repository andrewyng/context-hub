import { parse as parseYaml, YAMLParseError } from 'yaml';

/**
 * Thrown when YAML inside a frontmatter block fails to parse.
 * `line` and `col` are 1-indexed relative to the full frontmatter document
 * (including the opening `---` fence), so callers can report file-accurate
 * locations without further adjustment.
 */
export class FrontmatterParseError extends Error {
  constructor(message, line, col, cause) {
    super(message);
    this.name = 'FrontmatterParseError';
    this.line = line;
    this.col = col;
    this.cause = cause;
  }
}

/**
 * Parse YAML frontmatter from markdown content.
 * Returns { attributes, body } where attributes is the parsed YAML object.
 * Throws FrontmatterParseError if the frontmatter block contains invalid YAML.
 */
export function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { attributes: {}, body: content };

  let attributes;
  try {
    attributes = parseYaml(match[1]) || {};
  } catch (err) {
    if (err instanceof YAMLParseError) {
      const start = err.linePos?.[0];
      // +1 to account for the opening `---` line above the YAML block.
      const line = start ? start.line + 1 : null;
      const col = start ? start.col : null;
      throw new FrontmatterParseError(err.message, line, col, err);
    }
    throw err;
  }

  return { attributes, body: match[2] };
}
