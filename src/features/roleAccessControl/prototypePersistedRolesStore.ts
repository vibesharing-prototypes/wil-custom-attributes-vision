import { useMemo, useSyncExternalStore } from "react";
import type { RoleApplicationSection, RoleEditModel, RoleListEntry } from "./types.js";

function deepClone<T>(v: T): T {
  try {
    return structuredClone(v);
  } catch {
    return JSON.parse(JSON.stringify(v)) as T;
  }
}

type Listener = () => void;
const listeners = new Set<Listener>();

/** In-memory “saved” roles for this prototype session (duplicate flow + edits). */
let catalog: Record<string, RoleEditModel> = {};

function emit() {
  listeners.forEach((l) => l());
}

export function subscribePrototypePersistedRoles(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getPrototypePersistedRolesSnapshot(): Record<string, RoleEditModel> {
  return catalog;
}

export function hasPersistedPrototypeRole(roleId: string): boolean {
  return Object.prototype.hasOwnProperty.call(catalog, roleId);
}

export function getPersistedPrototypeRole(roleId: string): RoleEditModel | undefined {
  const m = catalog[roleId];
  return m ? deepClone(m) : undefined;
}

/** Create or replace a persisted role (immediate save for duplicates). */
export function putPersistedPrototypeRole(model: RoleEditModel) {
  catalog = { ...catalog, [model.id]: deepClone(model) };
  emit();
}

function modelToListEntry(m: RoleEditModel): RoleListEntry {
  return {
    id: m.id,
    name: m.name,
    kind: m.kind,
    basedOnRoleName: m.kind === "custom" ? m.basedOnOotbRoleName : undefined,
  };
}

export function mergeRolesHomeSections(
  base: RoleApplicationSection[],
  persisted: RoleEditModel[],
): RoleApplicationSection[] {
  const byApp = new Map<string, RoleEditModel[]>();
  for (const m of persisted) {
    const list = byApp.get(m.applicationName) ?? [];
    list.push(m);
    byApp.set(m.applicationName, list);
  }
  return base.map((section) => {
    const extra = byApp.get(section.applicationName) ?? [];
    return {
      ...section,
      roles: [...section.roles, ...extra.map(modelToListEntry)],
    };
  });
}

export function useMergedRolesHomeSections(base: RoleApplicationSection[]): RoleApplicationSection[] {
  const snapshot = useSyncExternalStore(
    subscribePrototypePersistedRoles,
    getPrototypePersistedRolesSnapshot,
    () => ({}),
  );
  const persisted = useMemo(() => Object.values(snapshot), [snapshot]);
  return useMemo(() => mergeRolesHomeSections(base, persisted), [base, persisted]);
}
