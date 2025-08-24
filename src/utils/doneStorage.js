import AsyncStorage from "@react-native-async-storage/async-storage";  // AsyncStorage for local key–value storage
import User from '../context/User';                                    


// Utilities for reading/writing the "done tasks" map per user.

const PREFIX = "doneTasksByDate:"; // Prefix for all storage keys, followed by username

// Build the full storage key for a given username
async function getKey(username) {
  if (!username) throw new Error("Username is required for getKey()");
  return PREFIX + username;            // e.g. "doneTasksByDate:Emma"
}

// Read the entire map of done tasks for a user
// Returns an object: { "YYYY-MM-DD": [task1, task2, ...], ... }
export async function readMap(username) {
  const KEY = await getKey(username);
  const raw = await AsyncStorage.getItem(KEY); // raw JSON string or null
  return raw ? JSON.parse(raw) : {};            // parse to object or return empty map
}

// Overwrite the done-tasks map for a user
// "map" should be an object mapping dates to arrays of tasks
export async function writeMap(map, username) {
  const KEY = await getKey(username);
  await AsyncStorage.setItem(KEY, JSON.stringify(map)); // serialize and save
}

// Mark a single task as done for a given user and date
// task: string, username: string, dateIso: "YYYY-MM-DD" (defaults to today)
export async function addDone(task, username, dateIso) {
  const map  = await readMap(username);                     // load existing map
  const day  = dateIso || new Date().toISOString().slice(0, 10); // default to UTC today
  // Combine existing tasks and the new one, removing duplicates
  map[day]   = Array.from(new Set([...(map[day] || []), task]));
  await writeMap(map, username);                             // save updated map
}

// List all tasks marked done for a specific date and user
// dateIso: "YYYY-MM-DD", username: string
export async function listDone(dateIso, username) {
  const map = await readMap(username);                       // load existing map
  return map[dateIso] || [];                                 // return array or empty
}
