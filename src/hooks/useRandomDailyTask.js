import { useState, useEffect } from "react";
import { useDailyTasks } from "../hooks/useDailyTasks";       
import { fetchDailyRandomTask } from "../utils/dailyRandom";

export function useRandomDailyTask() {
  const { tasks, loading: loadingTasks, error: errorTasks } = useDailyTasks();
  const [randomTask, setRandomTask] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function pick() {
      setLoading(true);
      setError(null);

      // if fetching the daily tasks errored, propagate that
      if (errorTasks) {
        if (!cancelled) setError(errorTasks);
        setLoading(false);
        return;
      }

      // once the daily tasks have loaded successfully
      if (!loadingTasks && tasks) {
        try {
          const dateIso = new Date().toISOString().slice(0, 10);  // today's date in YYYY-MM-DD
          const choice  = await fetchDailyRandomTask(tasks, dateIso);  // pick or retrieve the day's random task
          if (!cancelled) setRandomTask(choice);
        } catch (err) {
          if (!cancelled) setError(err);
        } finally {
          if (!cancelled) setLoading(false);
        }
      }
    }

    pick();   // invoke on mount and whenever dependencies change
    return () => { cancelled = true; };  // prevent state updates after unmount
  }, [loadingTasks, errorTasks, tasks]);  // re-run when fetch status changes

  return { randomTask, loading, error }; // expose the chosen task and status flags
}
