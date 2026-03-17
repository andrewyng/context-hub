import { describe, expect, it } from 'vitest';
import {
  buildEntryDoc,
  buildReferenceDoc,
  groupLarkRecords,
} from '../../src/lib/lark-content.js';

const sampleRecords = [
  {
    id: 'developer_alpha',
    originId: 'alpha',
    type: 'developer',
    directory: ['服务端 API', '云文档', '电子表格', '读取表格'],
    pathnames: ['document', 'server-docs', 'docs', 'sheets', 'read'],
    url: 'https://open.feishu.cn/document/server-docs/docs/sheets/read',
    value: '文档链接：https://open.feishu.cn/document/server-docs/docs/sheets/read\n# 读取电子表格\n使用 access token 读取电子表格内容。',
    updateTime: 1741392000000,
  },
  {
    id: 'developer_beta',
    originId: 'beta',
    type: 'developer',
    directory: ['服务端 API', '云文档', '电子表格', '写入表格'],
    pathnames: ['document', 'server-docs', 'docs', 'sheets', 'write'],
    url: 'https://open.feishu.cn/document/server-docs/docs/sheets/write',
    value: '文档链接：https://open.feishu.cn/document/server-docs/docs/sheets/write\n# 写入电子表格\n使用 access token 写入电子表格内容。',
    updateTime: 1741478400000,
  },
  {
    id: 'developer_gamma',
    originId: 'gamma',
    type: 'developer',
    directory: ['开发指南', '飞书卡片', '卡片搭建概览'],
    pathnames: ['document', 'guides', 'cards', 'overview'],
    url: 'https://open.feishu.cn/document/guides/cards/overview',
    value: '文档链接：https://open.feishu.cn/document/guides/cards/overview\n# 飞书卡片概览\n介绍卡片 JSON 和交互能力。',
    updateTime: 1741564800000,
  },
];

describe('lark-content', () => {
  it('groups Lark records into stable Context Hub entries', () => {
    const groups = groupLarkRecords(sampleRecords);

    expect(groups.map((group) => group.slug)).toEqual([
      'dev-guide-cards',
      'server-api-docs',
    ]);

    const serverApiDocs = groups.find((group) => group.slug === 'server-api-docs');
    expect(serverApiDocs.records).toHaveLength(2);
    expect(serverApiDocs.tags).toContain('lark');
    expect(serverApiDocs.tags).toContain('server-api');
    expect(serverApiDocs.tags).toContain('docs');
  });

  it('renders entry docs with frontmatter, source summary, and references', () => {
    const [cardsGroup] = groupLarkRecords(sampleRecords);
    const doc = buildEntryDoc(cardsGroup);

    expect(doc).toContain('name: dev-guide-cards');
    expect(doc).toContain('source: community');
    expect(doc).toContain('# Lark 开发指南 / 飞书卡片');
    expect(doc).toContain('## Included pages');
    expect(doc).toContain('references/cards-overview-gamma.md');
  });

  it('renders reference docs with upstream metadata and cleaned content', () => {
    const reference = buildReferenceDoc(sampleRecords[0]);

    expect(reference.path).toBe('references/sheets-read-alpha.md');
    expect(reference.content).toContain('# 读取电子表格');
    expect(reference.content).toContain('Source URL: https://open.feishu.cn/document/server-docs/docs/sheets/read');
    expect(reference.content).toContain('Updated: 2025-03-08');
    expect(reference.content).not.toContain('文档链接：');
  });
});
