import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

export function createRepository(dbPath, { maxEvents } = {}) {
  if (maxEvents !== undefined && (!Number.isInteger(maxEvents) || maxEvents < 1)) throw new Error('maxEvents must be a positive integer.');
  if (dbPath !== ':memory:') mkdirSync(dirname(resolve(dbPath)), { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS security_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('unchanged','sanitized','normalized')),
      sanitized_content TEXT NOT NULL,
      removed_count INTEGER NOT NULL CHECK(removed_count >= 0),
      removed_elements INTEGER NOT NULL CHECK(removed_elements >= 0),
      removed_attributes INTEGER NOT NULL CHECK(removed_attributes >= 0),
      original_length INTEGER NOT NULL CHECK(original_length >= 0),
      sanitized_length INTEGER NOT NULL CHECK(sanitized_length >= 0),
      action TEXT NOT NULL,
      explanation TEXT NOT NULL,
      CHECK(removed_count = removed_elements + removed_attributes)
    );
    CREATE INDEX IF NOT EXISTS idx_events_created_at ON security_events(created_at);
    CREATE INDEX IF NOT EXISTS idx_events_status_created ON security_events(status, created_at);
  `);
  const insert = db.prepare(`INSERT INTO security_events
    (created_at,status,sanitized_content,removed_count,removed_elements,removed_attributes,original_length,sanitized_length,action,explanation)
    VALUES (?,?,?,?,?,?,?,?,?,?)`);
  const find = db.prepare('SELECT * FROM security_events WHERE id = ?');
  const prune = maxEvents ? db.prepare('DELETE FROM security_events WHERE id NOT IN (SELECT id FROM security_events ORDER BY id DESC LIMIT ?)') : null;

  function addEvent(result) {
    const created_at = new Date().toISOString();
    const record = insert.run(created_at, result.status, result.sanitized_content, result.removed_count,
      result.removed_elements, result.removed_attributes, result.original_length, result.sanitized_length,
      result.action, result.explanation);
    // Hosted demonstrations retain a bounded shared history. Local mode keeps all events.
    if (prune) prune.run(maxEvents);
    return find.get(record.lastInsertRowid);
  }

  function listEvents({ search = '', status, from, to, page = 1, pageSize = 10 } = {}) {
    const conditions = [];
    const params = [];
    if (search) {
      // Escape LIKE metacharacters so searches are literal; all values remain bound.
      const pattern = `%${search.replace(/[\\%_]/g, '\\$&')}%`;
      conditions.push("(sanitized_content LIKE ? ESCAPE '\\' OR explanation LIKE ? ESCAPE '\\' OR CAST(id AS TEXT) LIKE ? ESCAPE '\\')");
      params.push(pattern, pattern, pattern);
    }
    if (status) { conditions.push('status = ?'); params.push(status); }
    if (from) { conditions.push('created_at >= ?'); params.push(`${from}T00:00:00.000Z`); }
    if (to) { conditions.push('created_at <= ?'); params.push(`${to}T23:59:59.999Z`); }
    const where = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '';
    const { total } = db.prepare(`SELECT COUNT(*) AS total FROM security_events${where}`).get(...params);
    const items = db.prepare(`SELECT * FROM security_events${where} ORDER BY id DESC LIMIT ? OFFSET ?`).all(...params, pageSize, (page - 1) * pageSize);
    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  function getSummary() {
    const totals = db.prepare(`SELECT COUNT(*) AS total,
      COALESCE(SUM(status = 'unchanged'),0) AS unchanged,
      COALESCE(SUM(status = 'sanitized'),0) AS sanitized,
      COALESCE(SUM(status = 'normalized'),0) AS normalized,
      COALESCE(SUM(removed_elements),0) AS removed_elements,
      COALESCE(SUM(removed_attributes),0) AS removed_attributes,
      COALESCE(SUM(removed_count),0) AS removed_count FROM security_events`).get();
    const dates = Array.from({ length: 7 }, (_, index) => {
      const day = new Date();
      day.setUTCDate(day.getUTCDate() - 6 + index);
      return day.toISOString().slice(0, 10);
    });
    const trend = db.prepare(`SELECT substr(created_at,1,10) AS date, COUNT(*) AS count
      FROM security_events WHERE created_at >= ? GROUP BY substr(created_at,1,10)`).all(`${dates[0]}T00:00:00.000Z`);
    return { ...totals, daily: dates.map(date => ({ date, count: trend.find(row => row.date === date)?.count ?? 0 })), recent: listEvents({ pageSize: 6 }).items };
  }

  return { db, addEvent, getEvent: id => find.get(id), listEvents, getSummary, close: () => db.close() };
}
