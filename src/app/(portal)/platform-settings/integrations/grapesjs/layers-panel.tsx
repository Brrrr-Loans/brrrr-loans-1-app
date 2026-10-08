"use client";

import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Layers,
  Lock,
  Unlock,
  X,
} from "lucide-react";
import type { Component } from "grapesjs";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import { useGrapesEditor } from "./grapesjs-editor";

interface LayersPanelProps {
  onClose: () => void;
}

interface LayerNode {
  id: string;
  name: string;
  tagName: string;
  isVisible: boolean;
  isLocked: boolean;
  isSelected: boolean;
  children: LayerNode[];
  level: number;
}

function getComponentName(component: {
  get: (key: string) => unknown;
  getName?: () => string;
}): string {
  // Try to get a custom name first
  const customName = component.get("custom-name") as string | undefined;
  if (customName) return customName;

  // Try getName method
  if (component.getName) {
    const name = component.getName();
    if (name) return name;
  }

  // Fall back to tag name or type
  const tagName = component.get("tagName") as string;
  const type = component.get("type") as string;

  if (type && type !== "default") {
    return type.charAt(0).toUpperCase() + type.slice(1);
  }

  return tagName || "Element";
}

function LayerItem({
  layer,
  onSelect,
  onToggleVisibility,
  onToggleLock,
  expandedIds,
  onToggleExpand,
}: {
  layer: LayerNode;
  onSelect: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
}) {
  const hasChildren = layer.children.length > 0;
  const isExpanded = expandedIds.has(layer.id);
  const indent = layer.level * 12;

  return (
    <>
      <div
        className={cn(
          "group flex items-center gap-1 py-1 pr-2 text-sm transition-colors cursor-pointer",
          "hover:bg-accent/50 rounded-md mx-1",
          layer.isSelected && "bg-accent text-accent-foreground"
        )}
        style={{ paddingLeft: `${indent + 4}px` }}
      >
        {/* Expand/Collapse button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) onToggleExpand(layer.id);
          }}
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded",
            hasChildren ? "hover:bg-accent" : "cursor-default"
          )}
          aria-label={isExpanded ? "Collapse" : "Expand"}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            )
          ) : (
            <span className="w-3" />
          )}
        </button>

        {/* Layer name - clicking selects */}
        <button
          type="button"
          onClick={() => onSelect(layer.id)}
          className="flex-1 truncate text-left"
        >
          <span className={cn(!layer.isVisible && "opacity-50")}>
            {layer.name}
          </span>
          <span className="ml-1 text-xs text-muted-foreground">
            {layer.tagName}
          </span>
        </button>

        {/* Action buttons - visible on hover */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility(layer.id);
            }}
            className="flex h-5 w-5 items-center justify-center rounded hover:bg-accent"
            aria-label={layer.isVisible ? "Hide" : "Show"}
          >
            {layer.isVisible ? (
              <Eye className="h-3 w-3 text-muted-foreground" />
            ) : (
              <EyeOff className="h-3 w-3 text-muted-foreground" />
            )}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleLock(layer.id);
            }}
            className="flex h-5 w-5 items-center justify-center rounded hover:bg-accent"
            aria-label={layer.isLocked ? "Unlock" : "Lock"}
          >
            {layer.isLocked ? (
              <Lock className="h-3 w-3 text-muted-foreground" />
            ) : (
              <Unlock className="h-3 w-3 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Render children if expanded */}
      {hasChildren && isExpanded && (
        <div>
          {layer.children.map((child) => (
            <LayerItem
              key={child.id}
              layer={child}
              onSelect={onSelect}
              onToggleVisibility={onToggleVisibility}
              onToggleLock={onToggleLock}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </>
  );
}

export function LayersPanel({ onClose }: LayersPanelProps) {
  const { editor } = useGrapesEditor();
  const [expandedOverride, setExpandedOverride] = useState<Set<string> | null>(
    null
  );

  // Subscribe to component changes; the snapshot is a change counter bumped per event
  const layersVersionRef = useRef(0);
  const layerListenersRef = useRef(new Set<() => void>());
  const refreshLayers = useCallback(() => {
    layersVersionRef.current += 1;
    for (const listener of layerListenersRef.current) listener();
  }, []);
  const subscribeToComponents = useCallback(
    (onChange: () => void) => {
      const listeners = layerListenersRef.current;
      listeners.add(onChange);
      if (!editor?.on) return () => listeners.delete(onChange);
      const handler = () => {
        layersVersionRef.current += 1;
        onChange();
      };
      const events = [
        "component:add",
        "component:remove",
        "component:update",
        "component:selected",
        "component:deselected",
      ];
      try {
        for (const event of events) {
          editor.on(event, handler);
        }
      } catch {
        // Editor may be in an invalid state
      }
      return () => {
        listeners.delete(onChange);
        try {
          for (const event of events) {
            editor.off(event, handler);
          }
        } catch {
          // Editor may already be destroyed
        }
      };
    },
    [editor]
  );
  const layersVersion = useSyncExternalStore(
    subscribeToComponents,
    () => layersVersionRef.current,
    () => 0
  );

  // Build layer tree from GrapesJS components
  const layers = useMemo<LayerNode[]>(() => {
    void layersVersion;
    if (!editor?.getWrapper) return [];

    try {
      const wrapper = editor.getWrapper();
      if (!wrapper) return [];

      const selectedComponents = editor.getSelectedAll();
      const selectedIds = new Set(selectedComponents.map((c) => c.getId()));

      const buildNode = (component: Component, level: number): LayerNode => {
        const children = component.components();
        const id = component.getId();
        const isHidden = component.getStyle().display === "none";

        // Get component name - special handling for wrapper (Body)
        let name = getComponentName(component);
        const tagName = component.get("tagName") || "div";

        // If this is the wrapper component, show it as "Body"
        if (component === wrapper || tagName.toLowerCase() === "body") {
          name = "Body";
        }

        return {
          id,
          name,
          tagName,
          isVisible: !isHidden,
          isLocked: !!component.get("locked"),
          isSelected: selectedIds.has(id),
          children: children.map((child: Component) =>
            buildNode(child, level + 1)
          ),
          level,
        };
      };

      // Include the wrapper (Body) as the root layer
      return [buildNode(wrapper, 0)];
    } catch (error) {
      console.error("Error building layer tree:", error);
      return [];
    }
  }, [editor, layersVersion]);

  // Until the user toggles a layer, expand Body and its first two levels
  const expandedIds = useMemo(() => {
    if (expandedOverride) return expandedOverride;
    const idsToExpand = new Set<string>();
    const wrapperNode = layers[0];
    if (!wrapperNode) return idsToExpand;
    idsToExpand.add(wrapperNode.id);
    const collectIds = (nodes: LayerNode[], maxLevel: number) => {
      for (const node of nodes) {
        if (node.level < maxLevel && node.children.length > 0) {
          idsToExpand.add(node.id);
          collectIds(node.children, maxLevel);
        }
      }
    };
    collectIds(wrapperNode.children, 2);
    return idsToExpand;
  }, [expandedOverride, layers]);

  // Helper to find component by ID (including the wrapper itself)
  const findComponentById = useCallback(
    (id: string) => {
      if (!editor?.getWrapper) return null;

      const wrapper = editor.getWrapper();
      if (!wrapper) return null;

      // Check if it's the wrapper itself
      if (wrapper.getId() === id) {
        return wrapper;
      }

      // Search within the wrapper's descendants
      const found = wrapper.find(`#${id}`)?.[0];
      return found || null;
    },
    [editor]
  );

  const handleSelect = useCallback(
    (id: string) => {
      if (!editor?.getWrapper) return;

      try {
        const component = findComponentById(id);
        if (component) {
          editor.select(component);
        }
      } catch {
        // Editor may be in an invalid state
      }
    },
    [editor, findComponentById]
  );

  const handleToggleVisibility = useCallback(
    (id: string) => {
      if (!editor?.getWrapper) return;

      try {
        const component = findComponentById(id);
        if (component) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- GrapesJS components have dynamic types
          const displayStyle = (component as any).getStyle("display");
          const isHidden =
            typeof displayStyle === "string"
              ? displayStyle === "none"
              : displayStyle?.display === "none";
          if (isHidden) {
            component.removeStyle("display");
          } else {
            component.addStyle({ display: "none" });
          }
          refreshLayers();
        }
      } catch {
        // Editor may be in an invalid state
      }
    },
    [editor, findComponentById, refreshLayers]
  );

  const handleToggleLock = useCallback(
    (id: string) => {
      if (!editor?.getWrapper) return;

      try {
        const component = findComponentById(id);
        if (component) {
          const isLocked = !!component.get("locked");
          component.set({ locked: !isLocked });
          refreshLayers();
        }
      } catch {
        // Editor may be in an invalid state
      }
    },
    [editor, findComponentById, refreshLayers]
  );

  const handleToggleExpand = useCallback(
    (id: string) => {
      const next = new Set(expandedIds);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      setExpandedOverride(next);
    },
    [expandedIds]
  );

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Layers</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 transition-colors hover:bg-accent"
          aria-label="Close panel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Layer Tree */}
      <div className="flex-1 overflow-y-auto py-2">
        {!editor ? (
          <div className="px-3 py-4 text-center text-sm text-muted-foreground">
            Waiting for editor...
          </div>
        ) : layers.length === 0 ? (
          <div className="px-3 py-4 text-center text-sm text-muted-foreground">
            No layers yet. Add components to the canvas.
          </div>
        ) : (
          layers.map((layer) => (
            <LayerItem
              key={layer.id}
              layer={layer}
              onSelect={handleSelect}
              onToggleVisibility={handleToggleVisibility}
              onToggleLock={handleToggleLock}
              expandedIds={expandedIds}
              onToggleExpand={handleToggleExpand}
            />
          ))
        )}
      </div>

      {/* Footer with layer count */}
      <div className="border-t border-border px-3 py-2">
        <span className="text-xs text-muted-foreground">
          {(() => {
            // Count total components including nested
            const countLayers = (nodes: LayerNode[]): number => {
              return nodes.reduce(
                (count, node) => count + 1 + countLayers(node.children),
                0
              );
            };
            const total = countLayers(layers);
            return `${total} ${total === 1 ? "component" : "components"}`;
          })()}
        </span>
      </div>
    </div>
  );
}
