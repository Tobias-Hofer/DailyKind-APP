import { kv } from "@vercel/kv";
import generateTasks from "./generate-tasks";

// Run at the network edge
export const config = { runtime: "edge" };

// one day in milliseconds
const DAY_MS = 86_400_000;

export default async function handler(req) {
  if (req.method !== "GET") {
    return json({ error: "Only GET supported" }, 405);
  }

  // same static key used in generate-tasks
  const masterKey  = `tasks:50`;
  const createdKey = `${masterKey}:created`;

  // 1. Ensure we have a 50-item master
  let fifty = await kv.get(masterKey);
  if (!fifty) {
    const res = await generateTasks(new Request("", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ count: 50 })
    }));
    fifty = await res.json();
  }

  // 2. Compute how many whole days since creation
  const createdMs = Number(await kv.get(createdKey)) || Date.now();
  let dayIndex = Math.floor((Date.now() - createdMs) / DAY_MS);
  if (dayIndex < 0) dayIndex = 0;
  if (dayIndex > 4) dayIndex = 4;

  // 3. Slice out today’s 10 from the 50
  const start      = dayIndex * 10;
  const todayTasks = fifty.slice(start, start + 10);

  // 4. Cache that slice until next UTC midnight
  const now = new Date();
  const tomorrowUTC = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1
  );
  const ttlSeconds  = Math.floor((tomorrowUTC - now.getTime()) / 1000);
  const dateKey = now.toISOString().slice(0, 10); // "YYYY-MM-DD"
  const dailyKey = `daily:${dateKey}`;

  await kv.set(dailyKey, todayTasks, { ex: ttlSeconds });

  return json(todayTasks);
}

// tiny helper 
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
