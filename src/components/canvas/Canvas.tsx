import { useCallback, useEffect, useMemo } from "react";
import {
  Background,
  BackgroundVariant,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useReactFlow,
  type NodeChange,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useSectionStore } from "../../stores/sectionStore";
import { CategoryNode, type CategoryNodeType } from "./CategoryNode";
import { ModalLayer } from "./ModalLayer";
import { ZoomIndicator } from "./ZoomIndicator";
import { EngramEmptyState } from "../engram/EngramEmptyState";
import { EngramLoadingState } from "../engram/EngramLoadingState";
import { EngramErrorState } from "../engram/EngramErrorState";
import { PersonalEmptyState } from "./PersonalEmptyState";
import { SearchNoResults } from "./SearchNoResults";
import { categoryMatches } from "../../lib/search";

const nodeTypes: NodeTypes = { category: CategoryNode };

function CanvasInner() {
  const categories = useSectionStore((s) =>
    s.getCategoriesForActiveSection(),
  );
  const updateCategoryPosition = useSectionStore(
    (s) => s.updateCategoryPosition,
  );
  const activeSectionId = useSectionStore((s) => s.activeSectionId);
  const engramLoading = useSectionStore((s) => s.engramLoading);
  const engramError = useSectionStore((s) => s.engramError);
  const searchQuery = useSectionStore((s) =>
    s.searchQuery.trim().toLowerCase(),
  );
  const activeSectionReadOnly = useSectionStore(
    (s) => s.getActiveSection()?.readOnly ?? false,
  );

  const initialNodes = useMemo<CategoryNodeType[]>(
    () =>
      categories.map((category) => ({
        id: category.id,
        type: "category",
        position: category.position,
        data: { category },
      })),
    [categories],
  );

  const [nodes, setNodes, onNodesChange] =
    useNodesState<CategoryNodeType>(initialNodes);

  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  const { zoomIn, zoomOut, setViewport } = useReactFlow();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      if (e.key === "0") {
        e.preventDefault();
        setViewport({ x: 0, y: 0, zoom: 1 });
      } else if (e.key === "=" || e.key === "+") {
        e.preventDefault();
        zoomIn();
      } else if (e.key === "-") {
        e.preventDefault();
        zoomOut();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [zoomIn, zoomOut, setViewport]);

  const handleNodesChange = useCallback(
    (changes: NodeChange<CategoryNodeType>[]) => {
      onNodesChange(changes);
      for (const change of changes) {
        if (
          change.type === "position" &&
          change.dragging === false &&
          change.position
        ) {
          updateCategoryPosition(change.id, change.position);
        }
      }
    },
    [onNodesChange, updateCategoryPosition],
  );

  const isEngram = activeSectionId === "engram";
  const engramOverlay = isEngram
    ? engramError
      ? "error"
      : engramLoading
        ? "loading"
        : categories.length === 0
          ? "empty"
          : null
    : null;

  const showPersonalEmpty =
    !isEngram && !activeSectionReadOnly && categories.length === 0;

  const anyMatches = searchQuery
    ? categories.some((c) => categoryMatches(c, searchQuery))
    : true;
  const showSearchNoResults =
    !engramOverlay && !showPersonalEmpty && searchQuery && !anyMatches;

  return (
    <div className="relative h-full w-full bg-bg-canvas">
      <ReactFlow<CategoryNodeType>
        nodes={nodes}
        onNodesChange={handleNodesChange}
        nodeTypes={nodeTypes}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={0.3}
        maxZoom={2}
        panOnDrag
        zoomOnScroll
        selectNodesOnDrag={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="#292e42"
        />
        <MiniMap
          style={{ background: "#1e2030" }}
          nodeColor={(node) =>
            (node as CategoryNodeType).data.category.accentColor
          }
          maskColor="rgba(19, 19, 31, 0.6)"
          pannable
          zoomable
        />
      </ReactFlow>
      <ZoomIndicator />
      <ModalLayer />

      {engramOverlay && (
        <div className="absolute inset-0 bg-bg-canvas z-20">
          {engramOverlay === "error" && <EngramErrorState />}
          {engramOverlay === "loading" && <EngramLoadingState />}
          {engramOverlay === "empty" && <EngramEmptyState />}
        </div>
      )}
      {showPersonalEmpty && (
        <div className="absolute inset-0 bg-bg-canvas z-20">
          <PersonalEmptyState />
        </div>
      )}
      {showSearchNoResults && <SearchNoResults />}
    </div>
  );
}

export function Canvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
