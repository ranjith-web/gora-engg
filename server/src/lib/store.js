import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";

// Minimal JSON-file collection store. Swap this module for MongoDB / Postgres
// later without touching the route modules (keep the same method names).
const dataDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../data");

export function collection(name) {
  const file = path.join(dataDir, `${name}.json`);
  const read = async () => {
    try { return JSON.parse(await fs.readFile(file, "utf8")); }
    catch (e) { if (e.code === "ENOENT") return []; throw e; }
  };
  const write = async (rows) => {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(file, JSON.stringify(rows, null, 2));
  };
  return {
    list: async () => (await read()).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    get: async (id) => (await read()).find((r) => r.id === id) ?? null,
    create: async (data) => {
      const rows = await read();
      const row = { id: randomUUID(), createdAt: new Date().toISOString(), ...data };
      rows.push(row);
      await write(rows);
      return row;
    },
  };
}
