const CONFIDENCE_VALUES = new Set(['installed', 'locked', 'declared', 'unknown']);

function parseNumericVersion(version) {
  if (!version || typeof version !== 'string') return null;
  const cleaned = version.trim().replace(/^v/i, '');
  const match = cleaned.match(/^(\d+)(?:\.(\d+))?(?:\.(\d+))?/);
  if (!match) return null;
  return {
    major: Number(match[1]),
    minor: match[2] !== undefined ? Number(match[2]) : null,
    patch: match[3] !== undefined ? Number(match[3]) : null,
  };
}

function sortVersionsDesc(versions) {
  return [...versions].sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
}

export function isValidEnvConfidence(confidence) {
  return CONFIDENCE_VALUES.has(confidence);
}

/**
 * Match a hinted version to the available doc versions.
 *
 * Returns:
 * - status: exact|compatible|mismatch|undetermined
 * - selectedVersion: best matched or fallback version (or null)
 * - requestedVersion: hinted version (or null)
 * - warnings: machine-readable warning strings
 */
export function matchEnvVersion({ availableVersions, detectedVersion, policy = 'warn' }) {
  const sorted = sortVersionsDesc((availableVersions || []).filter(Boolean));
  const requested = detectedVersion || null;

  if (!requested || sorted.length === 0) {
    return {
      status: 'undetermined',
      selectedVersion: null,
      requestedVersion: requested,
      policy,
      warnings: ['No usable environment version hint was provided.'],
    };
  }

  if (sorted.includes(requested)) {
    return {
      status: 'exact',
      selectedVersion: requested,
      requestedVersion: requested,
      policy,
      warnings: [],
    };
  }

  const requestedParsed = parseNumericVersion(requested);
  const compatible = requestedParsed
    ? sorted.find((v) => {
      const parsed = parseNumericVersion(v);
      return parsed && parsed.major === requestedParsed.major;
    })
    : null;

  if (compatible) {
    return {
      status: 'compatible',
      selectedVersion: compatible,
      requestedVersion: requested,
      policy,
      warnings: [
        `No exact match for requested version ${requested}; using compatible version ${compatible}.`,
      ],
    };
  }

  const fallback = sorted[0] || null;
  return {
    status: 'mismatch',
    selectedVersion: policy === 'warn' ? fallback : null,
    requestedVersion: requested,
    policy,
    warnings: [
      `Requested version ${requested} does not match available versions: ${sorted.join(', ')}.`,
      ...(policy === 'warn' && fallback
        ? [`Falling back to ${fallback} because mismatch policy is warn.`]
        : []),
    ],
  };
}
