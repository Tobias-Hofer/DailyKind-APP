import AsyncStorage from "@react-native-async-storage/async-storage";

const PREFIX = "randomTask:";  // we’ll append YYYY-MM-DD


export async function fetchDailyRandomTask(tasks, dateIso) {
  if (!tasks || tasks.length === 0) return null;

  const key = PREFIX + dateIso;
  // 1) check if we already have one for today
  const stored = await AsyncStorage.getItem(key);
  if (stored) return stored;

  // 2) pick a random index
  const idx = Math.floor(Math.random() * tasks.length);
  const choice = tasks[idx];

  // 3) persist it so it’s stable for the rest of the day
  await AsyncStorage.setItem(key, choice);

  return choice;
}
