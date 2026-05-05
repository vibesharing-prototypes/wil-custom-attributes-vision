import { useCallback, useReducer } from "react";
import type { Guard, Action, WorkflowTemplate, WorkflowTemplateDefinition } from "./types.js";
import type {
  WorkflowDraft,
  WorkflowStateDraft,
  TransitionDraft,
  StatusIndicatorColor,
} from "./draftTypes.js";
import { newDraftId, createPlaceholderState, createNextStatePair } from "./draftTypes.js";

// ─── State ────────────────────────────────────────────────────────────────────

interface EditorState {
  draft: WorkflowDraft;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

type EditorAction =
  | { type: "SET_DRAFT"; payload: WorkflowDraft }
  | { type: "UPDATE_TEMPLATE_META"; payload: Partial<Pick<WorkflowDraft, "name" | "version" | "service">> }
  | { type: "ADD_STATE"; payload: { newState: WorkflowStateDraft; newTransition: TransitionDraft; sourceStateId: string } }
  | { type: "ADD_ISOLATED_STATE"; payload: { newState: WorkflowStateDraft } }
  | { type: "UPDATE_STATE"; payload: { draftId: string; updates: Partial<Pick<WorkflowStateDraft, "name" | "description" | "color">> } }
  | { type: "ADD_TRANSITION"; payload: { sourceStateId: string; newTransition: TransitionDraft } }
  | { type: "REMOVE_TRANSITION"; payload: { stateDraftId: string; transitionDraftId: string } }
  | { type: "REMOVE_STATE"; payload: { draftId: string } }
  | { type: "UPDATE_STATE_POSITION"; payload: { draftId: string; position: { x: number; y: number } } }
  | { type: "UPDATE_TRANSITION"; payload: { stateDraftId: string; transitionDraftId: string; updates: Partial<Pick<TransitionDraft, "eventName" | "targetDraftId">> } }
  | { type: "ADD_GUARD"; payload: { stateDraftId: string; transitionDraftId: string; guard: Guard } }
  | { type: "REMOVE_GUARD"; payload: { stateDraftId: string; transitionDraftId: string; guardName: string } }
  | { type: "ADD_ACTION"; payload: { stateDraftId: string; transitionDraftId: string; action: Action } }
  | { type: "REMOVE_ACTION"; payload: { stateDraftId: string; transitionDraftId: string; actionName: string } };

function reducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "SET_DRAFT":
      return { draft: action.payload };

    case "UPDATE_TEMPLATE_META":
      return { draft: { ...state.draft, ...action.payload } };

    case "ADD_STATE": {
      const { newState, newTransition, sourceStateId } = action.payload;
      const updatedStates = state.draft.states.map((s) => {
        if (s.draftId !== sourceStateId) return s;
        return { ...s, transitions: [...s.transitions, newTransition] };
      });
      return {
        draft: { ...state.draft, states: [...updatedStates, newState] },
      };
    }

    case "ADD_ISOLATED_STATE":
      return {
        draft: {
          ...state.draft,
          states: [...state.draft.states, action.payload.newState],
        },
      };

    case "ADD_TRANSITION":
      return {
        draft: {
          ...state.draft,
          states: state.draft.states.map((s) =>
            s.draftId === action.payload.sourceStateId
              ? { ...s, transitions: [...s.transitions, action.payload.newTransition] }
              : s,
          ),
        },
      };

    case "REMOVE_TRANSITION":
      return {
        draft: {
          ...state.draft,
          states: state.draft.states.map((s) =>
            s.draftId === action.payload.stateDraftId
              ? {
                  ...s,
                  transitions: s.transitions.filter(
                    (t) => t.draftId !== action.payload.transitionDraftId,
                  ),
                }
              : s,
          ),
        },
      };

    case "REMOVE_STATE":
      return {
        draft: {
          ...state.draft,
          // Remove the state and any transitions from other states that target it
          states: state.draft.states
            .filter((s) => s.draftId !== action.payload.draftId)
            .map((s) => ({
              ...s,
              transitions: s.transitions.filter(
                (t) => t.targetDraftId !== action.payload.draftId,
              ),
            })),
        },
      };

    case "UPDATE_STATE_POSITION":
      return {
        draft: {
          ...state.draft,
          states: state.draft.states.map((s) =>
            s.draftId === action.payload.draftId
              ? { ...s, position: action.payload.position }
              : s,
          ),
        },
      };

    case "UPDATE_STATE":
      return {
        draft: {
          ...state.draft,
          states: state.draft.states.map((s) =>
            s.draftId === action.payload.draftId
              ? { ...s, ...action.payload.updates }
              : s,
          ),
        },
      };

    case "UPDATE_TRANSITION":
      return {
        draft: {
          ...state.draft,
          states: state.draft.states.map((s) => {
            if (s.draftId !== action.payload.stateDraftId) return s;
            return {
              ...s,
              transitions: s.transitions.map((t) =>
                t.draftId === action.payload.transitionDraftId
                  ? { ...t, ...action.payload.updates }
                  : t,
              ),
            };
          }),
        },
      };

    case "ADD_GUARD":
      return {
        draft: {
          ...state.draft,
          states: state.draft.states.map((s) => {
            if (s.draftId !== action.payload.stateDraftId) return s;
            return {
              ...s,
              transitions: s.transitions.map((t) => {
                if (t.draftId !== action.payload.transitionDraftId) return t;
                return { ...t, guards: [...t.guards, action.payload.guard] };
              }),
            };
          }),
        },
      };

    case "REMOVE_GUARD":
      return {
        draft: {
          ...state.draft,
          states: state.draft.states.map((s) => {
            if (s.draftId !== action.payload.stateDraftId) return s;
            return {
              ...s,
              transitions: s.transitions.map((t) => {
                if (t.draftId !== action.payload.transitionDraftId) return t;
                return {
                  ...t,
                  guards: t.guards.filter((g) => g.name !== action.payload.guardName),
                };
              }),
            };
          }),
        },
      };

    case "ADD_ACTION":
      return {
        draft: {
          ...state.draft,
          states: state.draft.states.map((s) => {
            if (s.draftId !== action.payload.stateDraftId) return s;
            return {
              ...s,
              transitions: s.transitions.map((t) => {
                if (t.draftId !== action.payload.transitionDraftId) return t;
                return { ...t, actions: [...t.actions, action.payload.action] };
              }),
            };
          }),
        },
      };

    case "REMOVE_ACTION":
      return {
        draft: {
          ...state.draft,
          states: state.draft.states.map((s) => {
            if (s.draftId !== action.payload.stateDraftId) return s;
            return {
              ...s,
              transitions: s.transitions.map((t) => {
                if (t.draftId !== action.payload.transitionDraftId) return t;
                return {
                  ...t,
                  actions: t.actions.filter((a) => a.name !== action.payload.actionName),
                };
              }),
            };
          }),
        },
      };

    default:
      return state;
  }
}

// ─── Initializers ─────────────────────────────────────────────────────────────

function emptyDraft(): WorkflowDraft {
  return {
    name: "",
    version: 1,
    service: "",
    states: [createPlaceholderState()],
  };
}

/**
 * Hydrate a WorkflowDraft from an existing WorkflowTemplate.
 * Converts the Record<string, WorkflowState> into an ordered WorkflowStateDraft array.
 */
function hydrateFromTemplate(template: WorkflowTemplate): WorkflowDraft {
  const { definition } = template;

  // Build an ordered list starting from the initial state, following transitions.
  const visited = new Set<string>();
  const ordered: string[] = [];

  const traverse = (stateName: string) => {
    if (visited.has(stateName)) return;
    visited.add(stateName);
    ordered.push(stateName);
    const state = definition.states[stateName];
    if (state?.on) {
      for (const event of Object.values(state.on)) {
        traverse(event.target);
      }
    }
  };
  traverse(definition.initial);

  // Any states not reachable from initial (shouldn't happen in valid templates)
  for (const name of Object.keys(definition.states)) {
    if (!visited.has(name)) ordered.push(name);
  }

  // Map ordered names to draft IDs
  const nameToId = new Map<string, string>(
    ordered.map((name) => [name, newDraftId("state")]),
  );

  /**
   * Auto-assign semantic colors by position:
   * - first state  → "subtle"   (initial / draft)
   * - last state   → "success"  (terminal / done)
   * - middle states cycle through "information" → "warning"
   *
   * These are UI-only defaults; the user can override them in the state sheet.
   */
  const MIDDLE_COLORS: StatusIndicatorColor[] = ["information", "warning"];
  const autoColor = (index: number, total: number): StatusIndicatorColor => {
    if (index === 0) return "subtle";
    if (index === total - 1) return "success";
    return MIDDLE_COLORS[(index - 1) % MIDDLE_COLORS.length];
  };

  const states: WorkflowStateDraft[] = ordered.map((stateName, index) => {
    const state = definition.states[stateName] ?? {};
    const transitions: TransitionDraft[] = Object.entries(state.on ?? {}).map(
      ([eventName, event]) => ({
        draftId: newDraftId("trans"),
        eventName,
        targetDraftId: nameToId.get(event.target) ?? newDraftId("state"),
        guards: event.guards ?? [],
        actions: event.actions ?? [],
      }),
    );
    return {
      draftId: nameToId.get(stateName) ?? newDraftId("state"),
      name: stateName,
      description: "",
      color: autoColor(index, ordered.length),
      transitions,
    };
  });

  return {
    name: template.name,
    version: template.version,
    service: template.service,
    states,
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseWorkflowTemplateEditorReturn {
  draft: WorkflowDraft;

  /** Initialize for a brand-new template. */
  initEmpty: () => void;
  /** Initialize from an existing template (e.g. loaded from the overview page). */
  initFromTemplate: (template: WorkflowTemplate) => void;
  /** Restore a previously captured draft snapshot (used by undo). */
  restoreDraft: (draft: WorkflowDraft) => void;

  updateTemplateMeta: (updates: Partial<Pick<WorkflowDraft, "name" | "version" | "service">>) => void;

  /** Append a new state after `sourceStateId`, connected by a new transition. Returns the new state's draftId. */
  addStateAfter: (sourceStateId: string) => string;
  /** Add a free-standing state with no connections. Returns the new state's draftId. */
  addIsolatedState: () => string;
  updateState: (draftId: string, updates: Partial<Pick<WorkflowStateDraft, "name" | "description" | "color">>) => void;

  /** Add a new transition between two existing states. Returns the new transition's draftId. */
  addTransition: (sourceStateId: string, targetStateId: string) => string;
  /** Remove a transition from a state. */
  removeTransition: (stateDraftId: string, transitionDraftId: string) => void;
  /**
   * Remove a state entirely.
   * Also removes all transitions from other states that target the removed state.
   */
  removeState: (draftId: string) => void;
  /** Persist the graph canvas position for a state after the user drags it. */
  updateStatePosition: (draftId: string, position: { x: number; y: number }) => void;

  updateTransition: (stateDraftId: string, transitionDraftId: string, updates: Partial<Pick<TransitionDraft, "eventName" | "targetDraftId">>) => void;

  addGuard: (stateDraftId: string, transitionDraftId: string, guard: Guard) => void;
  removeGuard: (stateDraftId: string, transitionDraftId: string, guardName: string) => void;

  addAction: (stateDraftId: string, transitionDraftId: string, action: Action) => void;
  removeAction: (stateDraftId: string, transitionDraftId: string, actionName: string) => void;

  /**
   * Derive the API-shaped WorkflowTemplateDefinition from the current draft.
   * Used for display and future save operations.
   */
  toDraftPreview: () => WorkflowTemplateDefinition;
}

export function useWorkflowTemplateEditor(): UseWorkflowTemplateEditorReturn {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    draft: emptyDraft(),
  }));

  const initEmpty = useCallback(() => {
    dispatch({ type: "SET_DRAFT", payload: emptyDraft() });
  }, []);

  const initFromTemplate = useCallback((template: WorkflowTemplate) => {
    dispatch({ type: "SET_DRAFT", payload: hydrateFromTemplate(template) });
  }, []);

  const restoreDraft = useCallback((draft: WorkflowDraft) => {
    dispatch({ type: "SET_DRAFT", payload: draft });
  }, []);

  const updateTemplateMeta = useCallback(
    (updates: Partial<Pick<WorkflowDraft, "name" | "version" | "service">>) => {
      dispatch({ type: "UPDATE_TEMPLATE_META", payload: updates });
    },
    [],
  );

  const addStateAfter = useCallback((sourceStateId: string): string => {
    const { newState, newTransition } = createNextStatePair(sourceStateId);
    dispatch({
      type: "ADD_STATE",
      payload: { newState, newTransition, sourceStateId },
    });
    return newState.draftId;
  }, []);

  const addIsolatedState = useCallback((): string => {
    const newState = createPlaceholderState();
    dispatch({ type: "ADD_ISOLATED_STATE", payload: { newState } });
    return newState.draftId;
  }, []);

  const addTransition = useCallback((sourceStateId: string, targetStateId: string): string => {
    const newTransition: TransitionDraft = {
      draftId: newDraftId("trans"),
      eventName: "",
      targetDraftId: targetStateId,
      guards: [],
      actions: [],
    };
    dispatch({ type: "ADD_TRANSITION", payload: { sourceStateId, newTransition } });
    return newTransition.draftId;
  }, []);

  const removeTransition = useCallback((stateDraftId: string, transitionDraftId: string) => {
    dispatch({ type: "REMOVE_TRANSITION", payload: { stateDraftId, transitionDraftId } });
  }, []);

  const removeState = useCallback((draftId: string) => {
    dispatch({ type: "REMOVE_STATE", payload: { draftId } });
  }, []);

  const updateStatePosition = useCallback(
    (draftId: string, position: { x: number; y: number }) => {
      dispatch({ type: "UPDATE_STATE_POSITION", payload: { draftId, position } });
    },
    [],
  );

  const updateState = useCallback(
    (draftId: string, updates: Partial<Pick<WorkflowStateDraft, "name" | "description" | "color">>) => {
      dispatch({ type: "UPDATE_STATE", payload: { draftId, updates } });
    },
    [],
  );

  const updateTransition = useCallback(
    (stateDraftId: string, transitionDraftId: string, updates: Partial<Pick<TransitionDraft, "eventName" | "targetDraftId">>) => {
      dispatch({ type: "UPDATE_TRANSITION", payload: { stateDraftId, transitionDraftId, updates } });
    },
    [],
  );

  const addGuard = useCallback(
    (stateDraftId: string, transitionDraftId: string, guard: Guard) => {
      dispatch({ type: "ADD_GUARD", payload: { stateDraftId, transitionDraftId, guard } });
    },
    [],
  );

  const removeGuard = useCallback(
    (stateDraftId: string, transitionDraftId: string, guardName: string) => {
      dispatch({ type: "REMOVE_GUARD", payload: { stateDraftId, transitionDraftId, guardName } });
    },
    [],
  );

  const addAction = useCallback(
    (stateDraftId: string, transitionDraftId: string, action: Action) => {
      dispatch({ type: "ADD_ACTION", payload: { stateDraftId, transitionDraftId, action } });
    },
    [],
  );

  const removeAction = useCallback(
    (stateDraftId: string, transitionDraftId: string, actionName: string) => {
      dispatch({ type: "REMOVE_ACTION", payload: { stateDraftId, transitionDraftId, actionName } });
    },
    [],
  );

  const toDraftPreview = useCallback((): WorkflowTemplateDefinition => {
    const { draft } = state;
    const initial = draft.states[0]?.name || "state_1";
    const states: WorkflowTemplateDefinition["states"] = {};
    for (const s of draft.states) {
      const key = s.name.trim() || s.draftId;
      states[key] = {
        on: s.transitions.length > 0
          ? Object.fromEntries(
              s.transitions.map((t) => {
                const targetState = draft.states.find((st) => st.draftId === t.targetDraftId);
                const targetKey = targetState?.name.trim() || t.targetDraftId;
                return [
                  t.eventName || t.draftId,
                  {
                    target: targetKey,
                    guards: t.guards,
                    actions: t.actions,
                  },
                ];
              }),
            )
          : undefined,
      };
    }
    return { initial, states };
  }, [state]);

  return {
    draft: state.draft,
    initEmpty,
    initFromTemplate,
    restoreDraft,
    updateTemplateMeta,
    addStateAfter,
    addIsolatedState,
    updateState,
    addTransition,
    removeTransition,
    removeState,
    updateStatePosition,
    updateTransition,
    addGuard,
    removeGuard,
    addAction,
    removeAction,
    toDraftPreview,
  };
}
