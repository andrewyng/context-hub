export const LARK_SOURCE_URL = 'https://lf3-static.bytednsdoc.com/obj/eden-cn/oaleh7nupthpqbe/larkopenapidoc.json';

export const LARK_ENTRY_DEFINITIONS = [
  {
    match: ['服务端 API', '云文档'],
    slug: 'server-api-docs',
    title: 'Lark 服务端 API / 云文档',
    description: 'Curated Lark server-side 云文档 API references and usage notes.',
    tags: ['lark', 'server-api', 'docs'],
    maxPages: 120,
  },
  {
    match: ['服务端 API', '通讯录'],
    slug: 'server-api-directory',
    title: 'Lark 服务端 API / 通讯录',
    description: 'Curated Lark directory API references for users, departments, and identity flows.',
    tags: ['lark', 'server-api', 'directory'],
    maxPages: 80,
  },
  {
    match: ['服务端 API', '审批'],
    slug: 'server-api-approval',
    title: 'Lark 服务端 API / 审批',
    description: 'Curated Lark approval API references for approval definitions, instances, and tasks.',
    tags: ['lark', 'server-api', 'approval'],
    maxPages: 48,
  },
  {
    match: ['客户端 API', '网页应用/小程序 API'],
    slug: 'client-api-h5',
    title: 'Lark 客户端 API / 网页应用与小程序',
    description: 'Curated Lark H5 and mini-app client API references and JSAPI guides.',
    tags: ['lark', 'client-api', 'h5'],
    maxPages: 160,
  },
  {
    match: ['开发指南', '平台简介'],
    slug: 'dev-guide-platform',
    title: 'Lark 开发指南 / 平台简介',
    description: 'Core Lark platform concepts, app models, authorization, and identity guides.',
    tags: ['lark', 'dev-guide', 'platform'],
  },
  {
    match: ['开发指南', '飞书卡片'],
    slug: 'dev-guide-cards',
    title: 'Lark 开发指南 / 飞书卡片',
    description: 'Curated Lark card development guides and companion references.',
    tags: ['lark', 'dev-guide', 'cards'],
    maxPages: 60,
  },
  {
    match: ['MCP'],
    slug: 'dev-guide-mcp',
    title: 'Lark MCP',
    description: 'Curated Lark MCP guides and references.',
    tags: ['lark', 'mcp'],
  },
];

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'page';
}

function formatDate(epochMs) {
  return new Date(epochMs).toISOString().slice(0, 10);
}

function cleanValue(value) {
  return String(value || '')
    .replace(/^文档链接：.*$/m, '')
    .replace(/^文档层级：.*$/m, '')
    .trim();
}

function classifyRecord(record) {
  const [top = '', second = ''] = record.directory || [];
  for (const entry of LARK_ENTRY_DEFINITIONS) {
    const [expectedTop, expectedSecond] = entry.match;
    if (top !== expectedTop) continue;
    if (expectedSecond !== undefined && second !== expectedSecond) continue;
    return {
      slug: entry.slug,
      title: entry.title,
      description: entry.description,
      tags: entry.tags,
    };
  }

  return {
    slug: 'misc',
    title: `Lark ${top}${second ? ` / ${second}` : ''}`.trim(),
    description: 'Curated Lark developer documentation references.',
    tags: ['lark'],
  };
}

function buildReferencePath(record) {
  const parts = (record.pathnames || [])
    .filter(Boolean)
    .slice(-2)
    .map(slugify)
    .filter(Boolean);
  const stemBase = parts.length > 0 ? parts.join('-') : slugify(record.originId || record.id);
  const stem = `${stemBase}-${slugify(record.originId || record.id)}`;
  return `references/${stem}.md`;
}

export function groupLarkRecords(records) {
  const grouped = new Map();

  for (const record of records) {
    const meta = classifyRecord(record);
    if (meta.slug === 'misc') continue;
    const existing = grouped.get(meta.slug) || { ...meta, records: [] };
    existing.records.push(record);
    grouped.set(meta.slug, existing);
  }

  return [...grouped.values()]
    .map((group) => {
      const definition = LARK_ENTRY_DEFINITIONS.find((entry) => entry.slug === group.slug);
      const sortedRecords = group.records.sort((a, b) => {
        const depthDiff = (a.directory?.length || 0) - (b.directory?.length || 0);
        if (depthDiff !== 0) return depthDiff;
        return String(a.url).localeCompare(String(b.url));
      });

      return {
        ...group,
        records: sortedRecords.slice(0, definition?.maxPages ?? sortedRecords.length),
      };
    })
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

export function buildEntryDoc(group) {
  const latest = group.records.reduce((max, record) => Math.max(max, record.updateTime || 0), 0);
  const lines = [
    '---',
    `name: ${group.slug}`,
    `description: "${group.description}"`,
    'metadata:',
    '  languages: "zh-CN"',
    '  versions: "source-export"',
    '  revision: 1',
    `  updated-on: "${formatDate(latest || Date.now())}"`,
    '  source: community',
    `  tags: "${group.tags.join(',')}"`,
    '---',
    '',
    `# ${group.title}`,
    '',
    'This entry is generated from the public Lark developer documentation export.',
    '',
    '## Included pages',
    '',
  ];

  for (const record of group.records) {
    const refPath = buildReferencePath(record);
    const title = (record.directory || []).slice(2).join(' / ') || record.url;
    lines.push(`- [${title}](${refPath})`);
  }

  lines.push('', '## Source coverage', '', `- Pages: ${group.records.length}`);
  lines.push(`- Latest upstream update: ${formatDate(latest || Date.now())}`);

  return `${lines.join('\n')}\n`;
}

export function buildReferenceDoc(record) {
  const path = buildReferencePath(record);
  const content = [
    `# ${(record.directory || []).slice(-1)[0] || record.url}`,
    '',
    `Source URL: ${record.url}`,
    `Updated: ${formatDate(record.updateTime || Date.now())}`,
    '',
    cleanValue(record.value),
    '',
  ].join('\n');

  return { path, content };
}
