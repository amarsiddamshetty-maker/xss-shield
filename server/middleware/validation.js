import { HttpError } from './errors.js';

export function positiveInteger(value, name, fallback, max = Number.MAX_SAFE_INTEGER) {
  if (value === undefined) return fallback;
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value)) || Number(value) > max) {
    throw new HttpError(400, 'INVALID_QUERY', `${name} must be a positive integer no greater than ${max}.`);
  }
  return Number(value);
}

function dateValue(value, name) {
  if (value === undefined || value === '') return undefined;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new HttpError(400, 'INVALID_QUERY', `${name} must be a date in YYYY-MM-DD format (UTC).`);
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) throw new HttpError(400, 'INVALID_QUERY', `${name} is not a valid calendar date.`);
  return value;
}

export function parseEventQuery(query) {
  const status = query.status || undefined;
  if (status && !['unchanged', 'sanitized', 'normalized'].includes(status)) throw new HttpError(400, 'INVALID_QUERY', 'Choose unchanged, sanitized, or normalized status.');
  const search = query.search ?? '';
  if (typeof search !== 'string' || search.length > 200) throw new HttpError(400, 'INVALID_QUERY', 'Search must be text with at most 200 characters.');
  const from = dateValue(query.from, 'from');
  const to = dateValue(query.to, 'to');
  if (from && to && from > to) throw new HttpError(400, 'INVALID_QUERY', 'The start date must not be later than the end date.');
  return { search, status, from, to, page: positiveInteger(query.page, 'page', 1, 1000000), pageSize: positiveInteger(query.pageSize, 'pageSize', 10, 100) };
}
