import { access } from "fs/promises";
import { join } from "path";
import { cwd } from "process";

let backendFound = false;

export default async function findBackend() {
  if (backendFound) return backendFound;

  try {
    await access(join(cwd(), "app/backend/dist/index.js"));
    backendFound = true;
  } catch {
    // no-op
  }

  return backendFound;
}
