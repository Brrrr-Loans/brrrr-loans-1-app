"use client";

import * as React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/forms/button";
import { Input } from "@/components/ui/forms/input";
import { Label } from "@/components/ui/forms/label";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/overlays/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/forms/select";
import {
  Plus,
  X,
  Table2,
  Columns3,
  LayoutGrid,
  Calendar,
  List,
  Clock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ViewDefinition {
  id: string;
  label: string;
  icon: LucideIcon;
}

export type CardSize = "small" | "medium" | "large";

interface ViewSettings {
  cardSize: CardSize;
  fitImage: boolean;
  wrapProperties: boolean;
  showPageIcon: boolean;
}

interface NotionViewTabsProps {
  views: ViewDefinition[];
  activeView: string;
  onViewChange: (viewId: string) => void;
  showAddButton?: boolean;
  onAddView?: (viewType: string, viewName: string) => void;
  className?: string;
  // Settings for gallery/board views
  viewSettings?: ViewSettings;
  onViewSettingsChange?: (settings: ViewSettings) => void;
}

const VIEW_TYPE_OPTIONS = [
  { id: "table", label: "Table", icon: Table2 },
  { id: "board", label: "Board", icon: Columns3 },
  { id: "timeline", label: "Timeline", icon: Clock },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "list", label: "List", icon: List },
  { id: "gallery", label: "Gallery", icon: LayoutGrid },
];

export function NotionViewTabs({
  views,
  activeView,
  onViewChange,
  showAddButton = false,
  onAddView,
  className,
  viewSettings,
  onViewSettingsChange,
}: NotionViewTabsProps) {
  const [isNewViewOpen, setIsNewViewOpen] = useState(false);
  const [newViewName, setNewViewName] = useState("");
  const [selectedViewType, setSelectedViewType] = useState("gallery");
  const [localSettings, setLocalSettings] = useState<ViewSettings>(
    viewSettings || {
      cardSize: "medium",
      fitImage: false,
      wrapProperties: false,
      showPageIcon: true,
    }
  );

  const handleCreateView = () => {
    if (onAddView && newViewName.trim()) {
      onAddView(selectedViewType, newViewName.trim());
      setNewViewName("");
      setIsNewViewOpen(false);
    }
  };

  const handleSettingChange = <K extends keyof ViewSettings>(
    key: K,
    value: ViewSettings[K]
  ) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onViewSettingsChange?.(newSettings);
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <nav className="flex items-center" role="tablist" aria-label="View options">
        {views.map((view) => {
          const isActive = activeView === view.id;
          const Icon = view.icon;

          return (
            <button
              key={view.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onViewChange(view.id)}
              className={cn(
                "relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md",
                "transition-colors duration-150",
                isActive
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{view.label}</span>
            </button>
          );
        })}
      </nav>

      {/* New View Dropdown */}
      {showAddButton && (
        <Popover open={isNewViewOpen} onOpenChange={setIsNewViewOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              aria-label="Add view"
              suppressHydrationWarning
            >
              <Plus className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <div className="p-4 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">New view</h4>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setIsNewViewOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* View name input */}
              <div className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="View name"
                  value={newViewName}
                  onChange={(e) => setNewViewName(e.target.value)}
                  className="h-8"
                />
              </div>

              {/* View type grid */}
              <div className="grid grid-cols-3 gap-2">
                {VIEW_TYPE_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isSelected = selectedViewType === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => setSelectedViewType(option.id)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-colors",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-transparent bg-muted/30 hover:bg-muted/50"
                      )}
                    >
                      <Icon className={cn("h-5 w-5", isSelected ? "text-primary" : "text-muted-foreground")} />
                      <span className={cn("text-xs", isSelected ? "text-primary font-medium" : "text-muted-foreground")}>
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Description */}
              <p className="text-xs text-muted-foreground">
                {selectedViewType === "gallery" && "Grid of cards, use for mood boards, index cards, and recipes"}
                {selectedViewType === "table" && "Traditional table layout with rows and columns"}
                {selectedViewType === "board" && "Kanban-style board for organizing items in columns"}
                {selectedViewType === "timeline" && "Visualize items on a timeline"}
                {selectedViewType === "calendar" && "Calendar view for date-based items"}
                {selectedViewType === "list" && "Simple list view for quick scanning"}
              </p>

              {/* Settings section for gallery/board */}
              {(selectedViewType === "gallery" || selectedViewType === "board") && (
                <div className="space-y-3 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Card size</Label>
                    <Select
                      value={localSettings.cardSize}
                      onValueChange={(value: CardSize) => handleSettingChange("cardSize", value)}
                    >
                      <SelectTrigger className="w-24 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Fit image</Label>
                    <Switch
                      checked={localSettings.fitImage}
                      onCheckedChange={(checked) => handleSettingChange("fitImage", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Wrap all properties</Label>
                    <Switch
                      checked={localSettings.wrapProperties}
                      onCheckedChange={(checked) => handleSettingChange("wrapProperties", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Show page icon</Label>
                    <Switch
                      checked={localSettings.showPageIcon}
                      onCheckedChange={(checked) => handleSettingChange("showPageIcon", checked)}
                    />
                  </div>
                </div>
              )}

              {/* Done button */}
              <Button
                className="w-full"
                onClick={handleCreateView}
                disabled={!newViewName.trim()}
              >
                Done
              </Button>

              {/* Learn more link */}
              <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mx-auto">
                <span className="w-4 h-4 rounded-full border flex items-center justify-center text-[10px]">?</span>
                Learn about views
              </button>
            </div>
          </PopoverContent>
        </Popover>
      )}

    </div>
  );
}
