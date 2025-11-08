"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { useVirtualizer } from "@tanstack/react-virtual";

type HTMLElementRef = HTMLElement | null;

type VirtualizedContextValue = React.MutableRefObject<HTMLElementRef> | null;

const VirtualizedContext = React.createContext<VirtualizedContextValue>(null);

type VirtualizedProps = React.ComponentPropsWithoutRef<"div"> & {
  asChild?: boolean;
};

function assignRef<T>(ref: React.ForwardedRef<T>, value: T) {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(value);
  } else {
    (ref as React.MutableRefObject<T>).current = value;
  }
}

const Virtualized = React.forwardRef<HTMLDivElement, VirtualizedProps>(
  ({ asChild = false, children, ...props }, forwardedRef) => {
    const localRef = React.useRef<HTMLElementRef>(null);

    const setRef = React.useCallback(
      (node: HTMLElementRef) => {
        localRef.current = node;
        assignRef(forwardedRef, node as HTMLDivElement | null);
      },
      [forwardedRef]
    );

    const Comp = asChild ? Slot : "div";

    return (
      <VirtualizedContext.Provider value={localRef}>
        <Comp ref={setRef} {...props}>
          {children}
        </Comp>
      </VirtualizedContext.Provider>
    );
  }
);
Virtualized.displayName = "Virtualized";

type VirtualizedVirtualizerProps = React.HTMLAttributes<HTMLDivElement> & {
  asChild?: boolean;
  overscan?: number;
  estimateSize?: number | ((index: number) => number);
  startMargin?: number;
  endMargin?: number;
};

const VirtualizedVirtualizer = React.forwardRef<
  HTMLDivElement,
  VirtualizedVirtualizerProps
>(
  (
    {
      asChild = false,
      children,
      className,
      style,
      overscan = 8,
      estimateSize = 40,
      startMargin = 0,
      endMargin = 0,
      ...props
    },
    ref
  ) => {
    const contextRef = React.useContext(VirtualizedContext);

    if (!contextRef) {
      throw new Error(
        "VirtualizedVirtualizer must be used within a <Virtualized> parent."
      );
    }

    const Comp = asChild ? Slot : "div";

    const nodes = React.useMemo(
      () => React.Children.toArray(children),
      [children]
    );

    const virtualizer = useVirtualizer({
      getScrollElement: () => contextRef.current,
      count: nodes.length,
      overscan,
      estimateSize:
        typeof estimateSize === "function" ? estimateSize : () => estimateSize,
      paddingStart: startMargin,
      paddingEnd: endMargin,
    });

    const items = virtualizer.getVirtualItems();

    const measureElement = React.useCallback(
      (node: Element | null) => {
        if (node) {
          virtualizer.measureElement(node);
        }
      },
      [virtualizer]
    );

    return (
      <Comp
        ref={ref}
        className={className}
        style={{
          position: "relative",
          height: virtualizer.getTotalSize(),
          width: "100%",
          maxWidth: "100%",
          ...style,
        }}
        {...props}
      >
        {items.map((item) => (
          <div
            key={item.key}
            ref={measureElement}
            data-index={item.index}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${item.start}px)`,
              willChange: "transform",
            }}
          >
            {nodes[item.index]}
          </div>
        ))}
      </Comp>
    );
  }
);
VirtualizedVirtualizer.displayName = "VirtualizedVirtualizer";

export { Virtualized, VirtualizedVirtualizer };
