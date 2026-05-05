/**
 * WorkflowGraphCanvas
 *
 * Full graph-based view of a WorkflowDraft using @xyflow/react.
 * Supports all FSM topologies: linear, circular, forks, and loops.
 *
 * Interactions:
 * - Click node → opens WorkflowStateSheet
 * - Click edge path or trigger chip → opens WorkflowTransitionSheet (chip mirrors linear canvas)
 * - Drag from a node handle → draws a new transition (onConnect)
 * - Drag a node to reposition → position persisted to draft via onUpdateStatePosition
 * - Delete key on selected edge → removes that transition
 * - Delete key on selected node → removes that state
 * - "+" on node when it has no outgoing transition → add connected next stage (opens state sheet)
 * - "Add next stage" outlined button for a free-standing state → page header beside view toggle (graph view).
 */
import type { FC } from "react";
import { useCallback, useEffect, useRef } from "react";
import type {
  Connection,
  Edge,
  EdgeChange,
  EdgeProps,
  EdgeTypes,
  Node,
  NodeChange,
  NodeDragHandler,
  NodeTypes,
} from "@xyflow/react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  MarkerType,
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Box, Chip, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import AddIcon from "@diligentcorp/atlas-react-bundle/icons/Add";
import LockedIcon from "@diligentcorp/atlas-react-bundle/icons/Locked";
import type { WorkflowDraft, WorkflowStateDraft } from "./draftTypes.js";
import { STATUS_INDICATOR_BG, STATUS_INDICATOR_RING } from "./draftTypes.js";
import type { CanvasItemSelection } from "./WorkflowTemplateCanvas.js";
import { STR } from "../../utils/i18n.js";

// ─── Node data type ───────────────────────────────────────────────────────────

/** On-canvas "+" after the node when there is no outgoing transition yet (right handle unused). */
type GraphAddNextMode = "always" | "none";

interface StateNodeData {
  state: WorkflowStateDraft;
  isInitial: boolean;
  isSelected: boolean;
  onSelect: (draftId: string) => void;
  addNextMode: GraphAddNextMode;
  onAddAfter: (sourceDraftId: string) => void;
}

// ─── Custom node component ────────────────────────────────────────────────────

const WorkflowStateNode: FC<{ data: StateNodeData }> = ({ data }) => {
  const { state, isInitial, isSelected, onSelect, addNextMode, onAddAfter } = data;
  const isEmpty = !state.name.trim();
  const hasGuardedTransitions = state.transitions.some((t) => t.guards.length > 0);
  const bg = STATUS_INDICATOR_BG[state.color];
  const ring = STATUS_INDICATOR_RING[state.color];
  const showAddControl = addNextMode !== "none";

  return (
    <Box
      className="wf-graph-state-root"
      sx={{
        position: "relative",
        width: 180,
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: ring, width: 10, height: 10 }}
      />

      <Box
        role="button"
        tabIndex={0}
        aria-pressed={isSelected}
        aria-label={
          isEmpty
            ? STR.workflowEditor.emptyStateAriaLabel
            : `${STR.workflowEditor.stateNodeAriaLabel}: ${state.name}`
        }
        onClick={() => onSelect(state.draftId)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect(state.draftId);
          }
        }}
        sx={{
          width: 180,
          minHeight: 90,
          borderRadius: 2,
          border: "2px solid",
          borderColor: isSelected ? "primary.main" : `${ring}99`,
          backgroundColor: isEmpty ? STATUS_INDICATOR_BG["subtle"] : bg,
          boxShadow: isSelected ? 4 : 1,
          p: 1.5,
          cursor: "pointer",
          outline: "none",
          transition: "box-shadow 150ms, border-color 150ms",
          "&:hover": { boxShadow: 3 },
          "&:focus-visible": {
            outline: "2px solid",
            outlineColor: "primary.main",
            outlineOffset: 2,
          },
        }}
      >
        <Stack gap={0.75} height="100%">
          {isInitial && (
            <Chip
              label={STR.workflowEditor.initialStateBadge}
              size="small"
              color="primary"
              variant="outlined"
              sx={{
                alignSelf: "flex-start",
                fontSize: "0.6rem",
                height: 16,
                "& .MuiChip-label": { px: 0.75 },
              }}
            />
          )}

          {isEmpty ? (
            <Typography
              variant="body2"
              color="text.disabled"
              sx={{ fontStyle: "italic", fontSize: "0.75rem" }}
            >
              {STR.workflowEditor.emptyStatePlaceholder}
            </Typography>
          ) : (
            <Typography
              variant="subtitle2"
              fontWeight={600}
              sx={{ lineHeight: 1.3, fontSize: "0.8rem" }}
            >
              {state.name}
            </Typography>
          )}

          {state.description && !isEmpty && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                lineHeight: 1.3,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                fontSize: "0.65rem",
              }}
            >
              {state.description}
            </Typography>
          )}

          {hasGuardedTransitions && (
            <Stack direction="row" alignItems="center" gap={0.5} sx={{ mt: "auto" }}>
              <LockedIcon sx={{ fontSize: 11, color: "text.disabled" }} />
              <Typography
                variant="caption"
                color="text.disabled"
                sx={{ fontStyle: "italic", fontSize: "0.6rem" }}
              >
                {STR.workflowManagement.protectedStep}
              </Typography>
            </Stack>
          )}
        </Stack>
      </Box>

      <Handle
        type="source"
        position={Position.Right}
        style={{ background: ring, width: 10, height: 10 }}
      />

      {showAddControl && (
        <Tooltip title={STR.workflowEditor.addNextStageTooltip} placement="top">
          <IconButton
            className="nodrag nopan wf-graph-add-next"
            size="small"
            aria-label={STR.workflowEditor.addNextStageAriaLabel}
            onClick={(e) => {
              e.stopPropagation();
              onAddAfter(state.draftId);
            }}
            sx={{
              position: "absolute",
              left: "100%",
              top: "50%",
              transform: "translate(8px, -50%)",
              border: "2px dashed",
              borderColor: "divider",
              borderRadius: 2,
              width: 36,
              height: 36,
              opacity: addNextMode === "always" ? 1 : 0,
              pointerEvents: addNextMode === "always" ? "auto" : "none",
              transition: "opacity 120ms ease, border-color 150ms, color 150ms",
              backgroundColor: "background.paper",
              boxShadow: 1,
              zIndex: 1,
              "&:hover": { borderColor: "primary.main", color: "primary.main" },
            }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

// ─── Custom transition edge (trigger chip, same i18n / styling as linear canvas) ─

type WorkflowTransitionEdgeData = {
  sourceStateDraftId: string;
  eventName: string;
  onSelectTransition: (sourceStateDraftId: string, transitionDraftId: string) => void;
};

type WorkflowGraphTransitionEdge = Edge<WorkflowTransitionEdgeData, "workflowTransitionEdge">;

const WorkflowTransitionEdge: FC<EdgeProps<WorkflowGraphTransitionEdge>> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  selected,
  data,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const eventName = data?.eventName ?? "";
  const isEmpty = !eventName.trim();
  const sourceStateDraftId = data?.sourceStateDraftId ?? "";

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={style} markerEnd={markerEnd} interactionWidth={22} />
      <EdgeLabelRenderer>
        <Box
          className="nodrag nopan"
          sx={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "all",
            zIndex: 1,
          }}
        >
          <Tooltip
            title={isEmpty ? STR.workflowEditor.connectionEmptyTooltip : STR.workflowEditor.connectionClickTooltip}
            placement="top"
          >
            <Chip
              label={isEmpty ? STR.workflowEditor.connectionEmptyLabel : eventName}
              size="small"
              variant={selected ? "filled" : "outlined"}
              color={selected ? "primary" : "default"}
              onClick={(e) => {
                e.stopPropagation();
                data?.onSelectTransition(sourceStateDraftId, id);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  data?.onSelectTransition(sourceStateDraftId, id);
                }
              }}
              aria-label={
                isEmpty
                  ? STR.workflowEditor.connectionEmptyAriaLabel
                  : `${STR.workflowEditor.connectionAriaLabel}: ${eventName}`
              }
              aria-pressed={selected}
              sx={{
                fontFamily: isEmpty ? "inherit" : "monospace",
                fontSize: isEmpty ? "0.65rem" : "0.7rem",
                cursor: "pointer",
                border: isEmpty ? "1px dashed" : undefined,
                borderColor: isEmpty ? "divider" : undefined,
                color: isEmpty ? "text.disabled" : undefined,
                height: 22,
                "& .MuiChip-label": { px: 0.75 },
              }}
            />
          </Tooltip>
        </Box>
      </EdgeLabelRenderer>
    </>
  );
};

// ─── Canvas props ─────────────────────────────────────────────────────────────

export interface WorkflowGraphCanvasProps {
  draft: WorkflowDraft;
  selectedItem: CanvasItemSelection | null;
  onSelectState: (stateDraftId: string) => void;
  onSelectTransition: (stateDraftId: string, transitionDraftId: string) => void;
  onAddTransition: (sourceStateId: string, targetStateId: string) => void;
  onRemoveTransition: (stateDraftId: string, transitionDraftId: string) => void;
  onRemoveState: (stateDraftId: string) => void;
  onUpdateStatePosition: (stateDraftId: string, position: { x: number; y: number }) => void;
  /** Same as linear canvas: append a new state connected from this source (opens state sheet). */
  onAddStateAfter: (sourceStateDraftId: string) => void;
}

// ─── Node types registry (stable reference — must be outside the component) ───

const NODE_TYPES: NodeTypes = {
  workflowStateNode: WorkflowStateNode as unknown as NodeTypes[string],
};

const EDGE_TYPES: EdgeTypes = {
  workflowTransitionEdge: WorkflowTransitionEdge as unknown as EdgeTypes[string],
};

// ─── Default position from array index ───────────────────────────────────────

function defaultPosition(index: number): { x: number; y: number } {
  return { x: index * 380, y: 200 };
}

/** Show "+" on the source (right) side when this state has no outgoing transition yet. */
function addNextControlMode(state: WorkflowStateDraft): GraphAddNextMode {
  return state.transitions.length === 0 ? "always" : "none";
}

// ─── Build helpers ────────────────────────────────────────────────────────────

function buildNodes(
  draft: WorkflowDraft,
  selectedItem: CanvasItemSelection | null,
  onSelectState: (id: string) => void,
  onAddAfter: (sourceDraftId: string) => void,
): Node[] {
  return draft.states.map((state, index) => ({
    id: state.draftId,
    type: "workflowStateNode" as const,
    // Use the persisted position if available, otherwise derive from index
    position: state.position ?? defaultPosition(index),
    data: {
      state,
      isInitial: index === 0,
      isSelected:
        selectedItem?.type === "state" && selectedItem.stateDraftId === state.draftId,
      onSelect: onSelectState,
      addNextMode: addNextControlMode(state),
      onAddAfter,
    } satisfies StateNodeData,
  }));
}

function buildEdges(
  draft: WorkflowDraft,
  selectedItem: CanvasItemSelection | null,
  onSelectTransition: (stateDraftId: string, transitionDraftId: string) => void,
): Edge[] {
  const edges: WorkflowGraphTransitionEdge[] = [];
  for (const state of draft.states) {
    for (const t of state.transitions) {
      const isSelected =
        selectedItem?.type === "transition" &&
        selectedItem.stateDraftId === state.draftId &&
        selectedItem.transitionDraftId === t.draftId;

      edges.push({
        id: t.draftId,
        type: "workflowTransitionEdge",
        source: state.draftId,
        target: t.targetDraftId,
        animated: t.actions.length > 0,
        selected: isSelected,
        style: {
          stroke: isSelected ? "var(--mui-palette-primary-main, #1976d2)" : "#9e9e9e",
          strokeWidth: isSelected ? 2.5 : 1.5,
          strokeDasharray: !t.eventName.trim() ? "5 4" : undefined,
        },
        markerEnd: { type: MarkerType.ArrowClosed },
        data: {
          sourceStateDraftId: state.draftId,
          eventName: t.eventName,
          onSelectTransition,
        },
      });
    }
  }
  return edges;
}

// ─── Canvas ───────────────────────────────────────────────────────────────────

const WorkflowGraphCanvas: FC<WorkflowGraphCanvasProps> = ({
  draft,
  selectedItem,
  onSelectState,
  onSelectTransition,
  onAddTransition,
  onRemoveTransition,
  onRemoveState,
  onUpdateStatePosition,
  onAddStateAfter,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(
    buildNodes(draft, selectedItem, onSelectState, onAddStateAfter),
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    buildEdges(draft, selectedItem, onSelectTransition),
  );

  // Sync nodes/edges whenever draft or selection changes
  const prevDraftRef = useRef(draft);
  useEffect(() => {
    prevDraftRef.current = draft;
    setNodes(buildNodes(draft, selectedItem, onSelectState, onAddStateAfter));
    setEdges(buildEdges(draft, selectedItem, onSelectTransition));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, selectedItem, onSelectState, onAddStateAfter, onSelectTransition]);

  // Handle node deletions via keyboard (Delete key)
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);
      for (const change of changes) {
        if (change.type === "remove") {
          onRemoveState(change.id);
        }
      }
    },
    [onNodesChange, onRemoveState],
  );

  // Handle edge deletions via keyboard (Delete key)
  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChange(changes);
      for (const change of changes) {
        if (change.type === "remove") {
          for (const state of draft.states) {
            const match = state.transitions.find((t) => t.draftId === change.id);
            if (match) {
              onRemoveTransition(state.draftId, match.draftId);
              break;
            }
          }
        }
      }
    },
    [onEdgesChange, draft.states, onRemoveTransition],
  );

  // Persist position to draft on drag end (fires once per drag, not per pixel)
  const handleNodeDragStop: NodeDragHandler = useCallback(
    (_event, node) => {
      onUpdateStatePosition(node.id, node.position);
    },
    [onUpdateStatePosition],
  );

  // New connection drawn by user → add transition + auto-open sheet
  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      const newTransitionId = onAddTransition(connection.source, connection.target);
      setEdges((eds) =>
        addEdge(
          {
            id: newTransitionId,
            type: "workflowTransitionEdge",
            source: connection.source!,
            target: connection.target!,
            animated: false,
            style: { stroke: "#9e9e9e", strokeWidth: 1.5, strokeDasharray: "5 4" },
            markerEnd: { type: MarkerType.ArrowClosed },
            data: {
              sourceStateDraftId: connection.source!,
              eventName: "",
              onSelectTransition,
            },
          },
          eds,
        ),
      );
    },
    [onAddTransition, onSelectTransition, setEdges],
  );

  // Click on edge → select that transition
  const handleEdgeClick = useCallback(
    (_: React.MouseEvent, edge: { id: string; source: string }) => {
      onSelectTransition(edge.source, edge.id);
    },
    [onSelectTransition],
  );

  return (
    <Box sx={{ position: "relative" }}>
      <Box
        sx={{
          height: 560,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          backgroundColor: "var(--lens-semantic-color-surface-subtle, #fafafa)",
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={NODE_TYPES}
          edgeTypes={EDGE_TYPES}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={handleConnect}
          onEdgeClick={handleEdgeClick}
          onNodeDragStop={handleNodeDragStop}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          deleteKeyCode="Delete"
          minZoom={0.3}
          maxZoom={2}
        >
          <Background gap={16} size={1} />
          <Controls showInteractive={false} />
          <MiniMap
            nodeColor={(n) => {
              const state = draft.states.find((s) => s.draftId === n.id);
              return state ? STATUS_INDICATOR_RING[state.color] : "#9e9e9e";
            }}
            maskColor="rgba(255,255,255,0.7)"
            style={{ borderRadius: 8 }}
          />
        </ReactFlow>
      </Box>
    </Box>
  );
};

export default WorkflowGraphCanvas;
