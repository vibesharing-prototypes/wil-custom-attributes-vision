import type { RoleEditModel } from "./types.js";
import { getPersistedPrototypeRole } from "./prototypePersistedRolesStore.js";
import { getRoleEditModelForEditor } from "./sampleData.js";

/** Prefer session-persisted duplicates, then static / synthetic catalog models. */
export function resolveRoleEditModelForEditor(roleId: string): RoleEditModel | undefined {
  return getPersistedPrototypeRole(roleId) ?? getRoleEditModelForEditor(roleId);
}
