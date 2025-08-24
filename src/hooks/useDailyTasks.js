import { useState, useEffect } from "react";

// Custom React hook to fetch and expose today's tasks
export function useDailyTasks() {
  // tasks: the fetched array of strings, loading: boolean flag, error: any fetch error
  const [tasks,   setTasks]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;    // flag to ignore state updates after unmount

    fetch("https://dailykind-backend.vercel.app/api/daily-tasks")  // request the daily 10 tasks
      .then(r => r.ok ? r.json() : Promise.reject(r.status))      // parse JSON or forward HTTP error
      .then(data => { if (!cancelled) setTasks(data); })         // update tasks if still mounted
      .catch(e  => { if (!cancelled) setError(e);   })           // capture fetch/parsing errors
      .finally(() => { if (!cancelled) setLoading(false); });    // clear loading flag

    // cleanup: mark as cancelled when component unmounts
    return () => { cancelled = true; };
  }, []); // empty deps: run only once on mount

  // return the three pieces of state for consumer components
  return { tasks, loading, error };
}
