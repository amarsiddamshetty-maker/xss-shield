import { useCallback, useEffect, useState } from 'react';

export async function api(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  let body;
  try { body = await response.json(); }
  catch { throw new Error('The server returned an unreadable response. Please try again.'); }
  if (!response.ok) throw new Error(body.error?.message || 'The request could not be completed.');
  return body.data;
}

export function useResource(path) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const reload = useCallback(() => setRevision((value) => value + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    api(path, { signal: controller.signal }).then((value) => {
      if (!controller.signal.aborted) setData(value);
    }).catch((cause) => {
      if (!controller.signal.aborted) setError(cause.message);
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [path, revision]);
  return { data, error, loading, reload };
}
