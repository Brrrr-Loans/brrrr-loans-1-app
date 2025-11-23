"use client";

import { Table } from "@tanstack/react-table";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Label,
  Switch,
  Button,
  Separator,
  Checkbox,
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui";
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

interface TableSettingsSheetProps<TData> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table<TData>;
  columnOrder: string[];
  setColumnOrder: (order: string[]) => void;
  tableDensity: "compact" | "simple" | "detailed";
  setTableDensity: (density: "compact" | "simple" | "detailed") => void;
}

interface SortableColumnItemProps {
  column: {
    id: string;
    getIsVisible: () => boolean;
    toggleVisibility: (visible: boolean) => void;
    columnDef: {
      header?: any;
    };
  };
}

function SortableColumnItem({ column }: SortableColumnItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatColumnName = (columnId: string): string => {
    const columnNameMap: Record<string, string> = {
      transaction_date: "Date",
      from: "From",
      to: "To",
      transaction_type: "Transaction Type",
      status: "Status",
      amount: "Amount",
    };

    return (
      columnNameMap[columnId] ||
      columnId.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-2 rounded-md border bg-background"
    >
      <button
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>
      <Checkbox
        checked={column.getIsVisible()}
        onCheckedChange={(checked) => column.toggleVisibility(!!checked)}
        id={`col-${column.id}`}
      />
      <Label
        htmlFor={`col-${column.id}`}
        className="flex-1 cursor-pointer font-normal"
      >
        {formatColumnName(column.id)}
      </Label>
    </div>
  );
}

export function TransactionTableSettingsSheet<TData>({
  open,
  onOpenChange,
  table,
  columnOrder,
  setColumnOrder,
  tableDensity,
  setTableDensity,
}: TableSettingsSheetProps<TData>) {
  const [showDividers, setShowDividers] = useState(false);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active && over && active.id !== over.id) {
      const activeId = active.id as string;
      const overId = over.id as string;

      // Don't allow dragging fixed columns
      if (
        activeId === "expand" ||
        activeId === "actions" ||
        overId === "expand" ||
        overId === "actions"
      ) {
        return;
      }

      setColumnOrder((prev) => {
        const oldIndex = prev.indexOf(activeId);
        const newIndex = prev.indexOf(overId);
        const newOrder = arrayMove(prev, oldIndex, newIndex);

        // Ensure expand is first and actions is last
        const finalOrder = newOrder.filter(
          (id) => id !== "expand" && id !== "actions"
        );
        return ["expand", ...finalOrder, "actions"];
      });
    }
  };

  const resetColumns = () => {
    setColumnOrder([
      "expand",
      "transaction_date",
      "from",
      "to",
      "transaction_type",
      "status",
      "amount",
      "actions",
    ]);
    table.getAllColumns().forEach((col) => {
      if (col.getCanHide()) {
        col.toggleVisibility(true);
      }
    });
  };

  const draggableColumns = table
    .getAllColumns()
    .filter((col) => col.getCanHide() && col.id !== "expand" && col.id !== "actions");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[540px] sm:max-w-[540px]">
        <SheetHeader>
          <SheetTitle>Table settings</SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="columns" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="columns">Columns</TabsTrigger>
            <TabsTrigger value="display">Display options</TabsTrigger>
          </TabsList>

          {/* Tab 1: Columns */}
          <TabsContent value="columns" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Show/hide all</Label>
              <Switch
                checked={draggableColumns.every((c) => c.getIsVisible())}
                onCheckedChange={(checked) => {
                  draggableColumns.forEach((c) => {
                    c.toggleVisibility(checked);
                  });
                }}
              />
            </div>

            <Separator />

            {/* Pinned section */}
            <div>
              <Label className="text-xs text-muted-foreground uppercase">
                Pinned
              </Label>
              <p className="text-xs text-muted-foreground mt-2">
                Drag a column here to pin
              </p>
            </div>

            <Separator />

            {/* Unpinned columns - draggable */}
            <div>
              <Label className="text-xs text-muted-foreground uppercase mb-2">
                Unpinned
              </Label>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                modifiers={[restrictToVerticalAxis]}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={columnOrder.filter(
                    (id) => id !== "expand" && id !== "actions"
                  )}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {draggableColumns.map((column) => (
                      <SortableColumnItem key={column.id} column={column} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>

            <Separator className="mt-4" />

            <Button variant="outline" onClick={resetColumns} className="w-full">
              Reset to defaults
            </Button>
          </TabsContent>

          {/* Tab 2: Display Options */}
          <TabsContent value="display" className="space-y-6 mt-4">
            <div className="space-y-4">
              <Label className="text-sm font-medium">Table density</Label>
              <RadioGroup
                value={tableDensity}
                onValueChange={(value) =>
                  setTableDensity(value as "compact" | "simple" | "detailed")
                }
                className="space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="compact" id="compact" />
                  <Label htmlFor="compact" className="font-normal cursor-pointer">
                    Compact
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="simple" id="simple" />
                  <Label htmlFor="simple" className="font-normal cursor-pointer">
                    Simple
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="detailed" id="detailed" />
                  <Label htmlFor="detailed" className="font-normal cursor-pointer">
                    Detailed
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Column dividers</Label>
              <Switch
                checked={showDividers}
                onCheckedChange={setShowDividers}
              />
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

