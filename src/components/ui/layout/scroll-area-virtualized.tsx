"use client";

import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import * as React from "react";

import { ScrollBar } from "./scroll-area";
import { Separator } from "./separator";
import { Virtualized, VirtualizedVirtualizer } from "./virtualized";

const tags = Array.from({ length: 10_000 }).map(
  (_, index, array) => `v1.2.0-beta.${array.length - index}`
);

export function ScrollAreaVirtualized() {
  return (
    <ScrollAreaPrimitive.Root className="relative h-72 w-48 overflow-hidden rounded-md border">
      <Virtualized asChild>
        <ScrollAreaPrimitive.Viewport className="size-full rounded-[inherit]">
          <div className="p-4">
            <h4 className="mb-4 text-sm font-medium leading-none">Tags</h4>
            <VirtualizedVirtualizer startMargin={30}>
              {tags.map((tag) => (
                <React.Fragment key={tag}>
                  <div className="text-sm">{tag}</div>
                  <Separator className="my-2" />
                </React.Fragment>
              ))}
            </VirtualizedVirtualizer>
          </div>
        </ScrollAreaPrimitive.Viewport>
      </Virtualized>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}
