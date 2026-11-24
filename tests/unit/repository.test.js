import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { createRepository } from '../../server/database/repository.js';

function event(overrides = {}) {
  return {
    status: 'unchanged', sanitized_content: 'Welcome', removed_count: 0,
    removed_elements: 0, removed_attributes: 0, original_length: 7, sanitized_length: 7,
    action: 'Accepted', explanation: 'Allowed basic text.', ...overrides,
  };
}

describe('SQLite security event repository', () => {
  let repository;
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-24T12:00:00.000Z'));
    repository = createRepository(':memory:');
  });
  afterEach(() => {
    repository.close();
    vi.useRealTimers();
  });

  it('returns zero totals and an empty recent list before scans', () => {
    expect(repository.getSummary()).toMatchObject({
      total: 0, unchanged: 0, sanitized: 0, normalized: 0,
      removed_elements: 0, removed_attributes: 0, removed_count: 0, recent: [],
    });
    expect(repository.listEvents()).toEqual({ items: [], total: 0, page: 1, pageSize: 10, totalPages: 0 });
  });

  it('generates an event ID and UTC timestamp and retrieves the stored fields', () => {
    const saved = repository.addEvent(event());
    expect(saved).toMatchObject({ ...event(), id: 1, created_at: '2026-11-24T12:00:00.000Z' });
    expect(repository.getEvent(saved.id)).toEqual(saved);
    expect(repository.getEvent(999)).toBeUndefined();
  });

  it('computes truthful totals from known statuses and separate removal counts', () => {
    repository.addEvent(event());
    repository.addEvent(event({ status: 'normalized' }));
    repository.addEvent(event({ status: 'sanitized', removed_elements: 2, removed_attributes: 3, removed_count: 5 }));
    repository.addEvent(event({ status: 'sanitized', removed_elements: 1, removed_attributes: 0, removed_count: 1 }));
    expect(repository.getSummary()).toMatchObject({
      total: 4, unchanged: 1, normalized: 1, sanitized: 2,
      removed_elements: 3, removed_attributes: 3, removed_count: 6,
    });
  });

  it('zero-fills exactly seven UTC dates and excludes older events only from the trend', () => {
    vi.setSystemTime(new Date('2026-11-17T23:59:59.999Z'));
    repository.addEvent(event({ sanitized_content: 'older' }));
    vi.setSystemTime(new Date('2026-11-18T00:00:00.000Z'));
    repository.addEvent(event());
    vi.setSystemTime(new Date('2026-11-24T12:00:00.000Z'));
    repository.addEvent(event());
    repository.addEvent(event());
    expect(repository.getSummary().total).toBe(4);
    expect(repository.getSummary().daily).toEqual([
      { date: '2026-11-18', count: 1 }, { date: '2026-11-19', count: 0 },
      { date: '2026-11-20', count: 0 }, { date: '2026-11-21', count: 0 },
      { date: '2026-11-22', count: 0 }, { date: '2026-11-23', count: 0 },
      { date: '2026-11-24', count: 2 },
    ]);
  });

  it('returns recent events newest-first and limits the dashboard list to six', () => {
    for (let index = 0; index < 8; index += 1) repository.addEvent(event());
    expect(repository.getSummary().recent.map(row => row.id)).toEqual([8, 7, 6, 5, 4, 3]);
  });

  it.each(['%', '_', '\\'])('treats the LIKE metacharacter %j literally', character => {
    const match = repository.addEvent(event({ sanitized_content: `literal ${character} marker` }));
    repository.addEvent(event({ sanitized_content: 'unrelated text' }));
    const result = repository.listEvents({ search: character });
    expect(result.total).toBe(1);
    expect(result.items[0].id).toBe(match.id);
  });

  it('searches content, explanation, and ID without interpreting SQL fragments', () => {
    repository.addEvent(event({ sanitized_content: 'Engineering welcome' }));
    repository.addEvent(event({ explanation: 'A special policy explanation.' }));
    expect(repository.listEvents({ search: 'engineering' }).total).toBe(1);
    expect(repository.listEvents({ search: 'special policy' }).items[0].id).toBe(2);
    expect(repository.listEvents({ search: '2' }).items[0].id).toBe(2);
    expect(repository.listEvents({ search: "' OR 1=1 --" }).total).toBe(0);
    expect(repository.listEvents().total).toBe(2);
  });

  it('paginates newest-first while preserving filtered total counts', () => {
    for (let index = 0; index < 5; index += 1) repository.addEvent(event({ status: 'normalized' }));
    repository.addEvent(event());
    const result = repository.listEvents({ status: 'normalized', page: 2, pageSize: 2 });
    expect(result).toMatchObject({ total: 5, page: 2, pageSize: 2, totalPages: 3 });
    expect(result.items.map(row => row.id)).toEqual([3, 2]);
    expect(repository.listEvents({ page: 100, pageSize: 2 }).items).toEqual([]);
  });

  it('includes both UTC date boundaries and combines date, search, and status filters', () => {
    for (const [timestamp, status] of [
      ['2026-11-22T23:59:59.999Z', 'normalized'],
      ['2026-11-23T00:00:00.000Z', 'normalized'],
      ['2026-11-23T23:59:59.999Z', 'normalized'],
      ['2026-11-24T00:00:00.000Z', 'normalized'],
      ['2026-11-23T12:00:00.000Z', 'unchanged'],
    ]) {
      vi.setSystemTime(new Date(timestamp));
      repository.addEvent(event({ status }));
    }
    expect(repository.listEvents({ from: '2026-11-23', to: '2026-11-23' }).total).toBe(3);
    expect(repository.listEvents({ from: '2026-11-23', to: '2026-11-23', status: 'normalized', search: 'welcome' }).items.map(row => row.id)).toEqual([3, 2]);
    expect(repository.listEvents({ from: '2026-11-24' }).total).toBe(1);
    expect(repository.listEvents({ to: '2026-11-22' }).total).toBe(1);
  });

  it('stores only sanitized content and enforces count and status constraints', () => {
    const columns = repository.db.prepare('PRAGMA table_info(security_events)').all().map(row => row.name);
    expect(columns).toContain('sanitized_content');
    expect(columns).not.toContain('raw_html');
    expect(columns).not.toContain('original_content');
    expect(columns).not.toContain('html');
    expect(() => repository.addEvent(event({ status: 'confirmed_attack' }))).toThrow();
    expect(() => repository.addEvent(event({ removed_count: 1 }))).toThrow();
    expect(() => repository.addEvent(event({ removed_elements: -1, removed_count: -1 }))).toThrow();
    expect(repository.listEvents().total).toBe(0);
  });

  it('creates a nested database and retains records after closing and reopening it', () => {
    const temporary = mkdtempSync(join(tmpdir(), 'xss-shield-repository-'));
    if (dirname(resolve(temporary)) !== resolve(tmpdir())) throw new Error('Unexpected temporary test path');
    const dbPath = join(temporary, 'nested', 'events.sqlite');
    let diskRepository;
    try {
      diskRepository = createRepository(dbPath);
      const saved = diskRepository.addEvent(event({ sanitized_content: '<p>Persistent</p>' }));
      diskRepository.close();
      diskRepository = undefined;
      diskRepository = createRepository(dbPath);
      expect(diskRepository.getEvent(saved.id)).toEqual(saved);
      expect(diskRepository.getSummary().total).toBe(1);
      expect(diskRepository.db.prepare('PRAGMA index_list(security_events)').all().map(row => row.name)).toEqual(expect.arrayContaining(['idx_events_created_at', 'idx_events_status_created']));
    } finally {
      diskRepository?.close();
      // Remove only the unique test directory allocated above, never app data.
      rmSync(temporary, { recursive: true, force: true });
    }
  });
});
