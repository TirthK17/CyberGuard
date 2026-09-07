import { localDb } from "./localDb";

// Re-export localDb as supabase for 100% offline, local execution across the codebase
export const supabase = localDb;
export { localDb };
