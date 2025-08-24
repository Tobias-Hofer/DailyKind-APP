import { kv } from "@vercel/kv";
import OpenAI from "openai";

// Run at the network edge
export const config = { runtime: "edge" };

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Normalise a sentence
const canon = (s) => s.trim().toLowerCase();

// sanity-check helper 
function validateTasks(arr, expected) {
  if (!Array.isArray(arr)) {
    throw new Error("Tasks result is not an array");
  }
  if (expected !== undefined && arr.length !== expected) {
    throw new Error(`Expected ${expected} items, got ${arr.length}`);
  }
  const seen = new Set();
  arr.forEach((t) => {
    if (typeof t !== "string") throw new Error("Item is not a string");
    if (t.split(/\s+/).length > 15) throw new Error("Item exceeds 15 words");
    const c = canon(t);
    if (seen.has(c)) throw new Error("Duplicate or near-duplicate found");
    seen.add(c);
  });
  return arr;
}

// Ask OpenAI for N candidate tasks (JSON array of strings)
async function fetchCandidates(n) {
  // retry up to 3 times with exponential back-off (0.5s → 1s → 2s)
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const chat = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        temperature: 0.8,
        max_tokens: 8000,
        seed: 42,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `
You are DailyKind, a generator of concise, real-world kindness acts.

Return an object whose single key is "tasks" and whose value is a JSON
array that obeys ALL of these rules:

• Exactly ${n} DIFFERENT items – nothing more, nothing less.
• Each item ≤ 15 words.
• Doable by anyone (no money, no special skills).
• No duplicates or near-duplicates (case-insensitive).
• Plain sentences only (no numbering, no bullets).

Output ONLY the JSON object – no markdown, no additional keys.
`.trim()
          },
          { role: "user", content: "Generate the list now." }
        ]
      });

      const tasks = JSON.parse(chat.choices[0].message.content).tasks;
      return validateTasks(tasks);          // length not enforced here
    } catch (err) {
      if (attempt === 2) throw err;         // out of tries – bubble up
      await new Promise(r => setTimeout(r, 500 * 2 ** attempt));
    }
  }
}

export default async function handler(req) {
  if (req.method !== "POST") {
    return json({ error: "Only POST requests are supported" }, 405);
  }

  let count = 50;
  try {
    const body = await req.json();
    count = Math.min(Math.max(Number(body?.count) || 50, 1), 50);
  } catch {
    /* ignore malformed JSON – default stays 50 */
  }

  // static master key per count
  const masterKey  = `tasks:${count}`;
  const createdKey = `${masterKey}:created`;
  const SIX_DAYS   = 6 * 24 * 60 * 60;          // seconds
  const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000; // milliseconds

  // 1. Fetch existing master + creation timestamp
  let master = await kv.get(masterKey);
  const created = Number(await kv.get(createdKey));

  // 2. If missing or ≥5 days old, rebuild
  if (!master || !created || (Date.now() - created >= FIVE_DAYS_MS)) {
    const historyKey = "task-history"; // global set of canonical tasks
    master = [];
    let safety = 0;

    while (master.length < count && safety < 5) {
      safety++;
      const pullQty = Math.ceil((count - master.length) * 1.4);
      const raw     = await fetchCandidates(pullQty);

      for (const idea of raw) {
        if (master.length === count) break;
        const c = canon(idea);
        if (master.find((t) => canon(t) === c)) continue;
        if (await kv.sismember(historyKey, c)) continue;
        master.push(idea);
        await kv.sadd(historyKey, c);
      }
    }

    if (master.length < count) {
      return json({ error: "Could not generate enough unique tasks" }, 500);
    }
    validateTasks(master, count); // final guarantee

    // 3. Cache master + timestamp
    await kv.set(masterKey,   master,    { ex: SIX_DAYS });
    await kv.set(createdKey,  Date.now(),{ ex: SIX_DAYS });
  }

  // 4. Return the full 50-item master list
  return json(master);
}

// tiny helper 
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
