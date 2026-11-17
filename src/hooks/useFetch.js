import { useCallback, useEffect, useState } from 'react';

// Runs `loader` on mount; `reload()` runs it again (e.g. after an action).
export default function useFetch(loader) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setData(await loader());
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [loader]);

  useEffect(() => { reload(); }, [reload]);

  return { data, error, loading, reload };
}
