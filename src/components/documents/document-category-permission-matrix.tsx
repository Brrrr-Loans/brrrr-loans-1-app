"use client";

import * as React from "react";
import {
  Eye,
  Upload,
  Plus,
  Trash2,
  RotateCcw,
  Save,
  Lock,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Shield,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/shadcn/button";
import { Checkbox } from "@/components/ui/shadcn/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/shadcn/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/shadcn/alert-dialog";
import { Badge } from "@/components/ui/shadcn/badge";
import { cn } from "@/lib/utils";

// Types
type ActionKey = "can_view" | "can_insert" | "can_upload" | "can_delete";
type DocPermission = Record<ActionKey, boolean>;
export type PermissionState = Record<string, Record<string, DocPermission>>; // roleId -> categoryId -> perms

export interface Role {
  id: string;
  name: string;
  description: string;
  isSystem?: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  group: string;
}

interface DocumentCategoryPermissionMatrixProps {
  roles: Role[];
  categories: Category[];
  value: PermissionState;
  onChange: (value: PermissionState) => void;
  onSave: () => void;
  onReset: () => void;
  saving: boolean;
}

const actionConfig: {
  key: ActionKey;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  activeClass: string;
  bgClass: string;
}[] = [
  {
    key: "can_view",
    label: "View documents",
    shortLabel: "View",
    icon: Eye,
    activeClass: "text-sky-600 dark:text-sky-400",
    bgClass: "bg-sky-500/10 border-sky-500/30",
  },
  {
    key: "can_insert",
    label: "Create documents",
    shortLabel: "Create",
    icon: Plus,
    activeClass: "text-emerald-600 dark:text-emerald-400",
    bgClass: "bg-emerald-500/10 border-emerald-500/30",
  },
  {
    key: "can_upload",
    label: "Upload documents",
    shortLabel: "Upload",
    icon: Upload,
    activeClass: "text-amber-600 dark:text-amber-400",
    bgClass: "bg-amber-500/10 border-amber-500/30",
  },
  {
    key: "can_delete",
    label: "Delete documents",
    shortLabel: "Delete",
    icon: Trash2,
    activeClass: "text-rose-600 dark:text-rose-400",
    bgClass: "bg-rose-500/10 border-rose-500/30",
  },
];

// Permission cell component for cleaner code
function PermissionCell({
  action,
  checked,
  disabled,
  categoryName,
  onToggle,
}: {
  action: (typeof actionConfig)[0];
  checked: boolean;
  disabled?: boolean;
  categoryName: string;
  onToggle: () => void;
}) {
  const Icon = action.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          className={cn(
            "group relative flex size-8 items-center justify-center rounded-md border transition-all duration-150",
            disabled && "cursor-not-allowed opacity-40",
            checked
              ? cn(action.bgClass, "border-current")
              : "border-transparent bg-muted/40 hover:bg-muted"
          )}
        >
          <Icon
            className={cn(
              "size-4 transition-colors",
              checked ? action.activeClass : "text-muted-foreground/50"
            )}
          />
          {checked && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -right-0.5 -top-0.5"
            >
              <div
                className={cn(
                  "flex size-3 items-center justify-center rounded-full",
                  action.activeClass.includes("sky") && "bg-sky-500",
                  action.activeClass.includes("emerald") && "bg-emerald-500",
                  action.activeClass.includes("amber") && "bg-amber-500",
                  action.activeClass.includes("rose") && "bg-rose-500"
                )}
              >
                <Check className="size-2 text-white" />
              </div>
            </motion.div>
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        <span className="font-medium">{action.shortLabel}</span>
        <span className="text-muted-foreground"> • {categoryName}</span>
      </TooltipContent>
    </Tooltip>
  );
}

// Group row component
function GroupRow({
  group,
  categories,
  roles,
  value,
  isExpanded,
  onToggle,
  onTogglePermission,
  onToggleEntireRow,
}: {
  group: string;
  categories: Category[];
  roles: Role[];
  value: PermissionState;
  isExpanded: boolean;
  onToggle: () => void;
  onTogglePermission: (
    roleId: string,
    categoryId: string,
    action: ActionKey
  ) => void;
  onToggleEntireRow: (categoryId: string) => void;
}) {
  // Calculate group stats
  const totalPermissions = categories.length * roles.length * 4;
  const activePermissions = categories.reduce((acc, cat) => {
    return (
      acc +
      roles.reduce((roleAcc, role) => {
        const perms = value[role.id]?.[cat.id];
        return (
          roleAcc +
          (perms?.can_view ? 1 : 0) +
          (perms?.can_insert ? 1 : 0) +
          (perms?.can_upload ? 1 : 0) +
          (perms?.can_delete ? 1 : 0)
        );
      }, 0)
    );
  }, 0);

  const percentage = Math.round((activePermissions / totalPermissions) * 100);

  return (
    <>
      {/* Group Header Row */}
      <tr className="group cursor-pointer" onClick={onToggle}>
        <td
          colSpan={roles.length + 1}
          className="border-b bg-muted/50 px-4 py-2.5 transition-colors hover:bg-muted/70"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-7 items-center justify-center rounded-md bg-background shadow-sm">
                {isExpanded ? (
                  <ChevronDown className="size-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="size-4 text-muted-foreground" />
                )}
              </div>
              <FolderOpen className="size-4 text-muted-foreground" />
              <span className="text-sm font-semibold">{group}</span>
              <Badge variant="secondary" className="text-xs font-normal">
                {categories.length} {categories.length === 1 ? "type" : "types"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full bg-primary/60"
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className="min-w-[3ch] text-right text-xs text-muted-foreground">
                {percentage}%
              </span>
            </div>
          </div>
        </td>
      </tr>

      {/* Category Rows */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.tr
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ display: "table-row" }}
          >
            <td colSpan={roles.length + 1} className="p-0">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <table className="w-full">
                  <tbody>
                    {categories.map((category, idx) => (
                      <tr
                        key={category.id}
                        className={cn(
                          "group/row transition-colors hover:bg-muted/30",
                          idx !== categories.length - 1 && "border-b"
                        )}
                      >
                        <td className="w-64 py-3 pl-14 pr-4">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                onClick={() => onToggleEntireRow(category.id)}
                                className="group/btn flex items-center gap-2 text-left text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
                              >
                                <span>{category.name}</span>
                                <span className="text-xs text-muted-foreground opacity-0 transition-opacity group-hover/btn:opacity-100">
                                  Toggle all
                                </span>
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-xs">
                              <p className="text-xs">
                                {category.description ||
                                  "Click to toggle all roles for this category"}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </td>
                        {roles.map((role) => {
                          const perms = value[role.id]?.[category.id];
                          return (
                            <td
                              key={role.id}
                              className="px-2 py-3 text-center"
                            >
                              <div className="flex items-center justify-center gap-1.5">
                                {actionConfig.map((action) => (
                                  <PermissionCell
                                    key={action.key}
                                    action={action}
                                    checked={perms?.[action.key] ?? false}
                                    disabled={role.isSystem}
                                    categoryName={category.name}
                                    onToggle={() =>
                                      onTogglePermission(
                                        role.id,
                                        category.id,
                                        action.key
                                      )
                                    }
                                  />
                                ))}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  );
}

export function DocumentCategoryPermissionMatrix({
  roles,
  categories,
  value,
  onChange,
  onSave,
  onReset,
  saving,
}: DocumentCategoryPermissionMatrixProps) {
  // Group categories
  const categoryGroups = React.useMemo(() => {
    const groups: Record<string, Category[]> = {};
    for (const cat of categories) {
      const group = cat.group || "Other";
      if (!groups[group]) groups[group] = [];
      groups[group].push(cat);
    }
    return groups;
  }, [categories]);

  // Track expanded groups - default all expanded
  const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(
    () => new Set(Object.keys(categoryGroups))
  );

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  };

  const expandAll = () => setExpandedGroups(new Set(Object.keys(categoryGroups)));
  const collapseAll = () => setExpandedGroups(new Set());

  // Toggle a single permission
  const togglePermission = (
    roleId: string,
    categoryId: string,
    action: ActionKey
  ) => {
    const role = roles.find((r) => r.id === roleId);
    if (role?.isSystem) return;

    const newState = { ...value };
    if (!newState[roleId]) newState[roleId] = {};
    if (!newState[roleId][categoryId]) {
      newState[roleId][categoryId] = {
        can_view: false,
        can_insert: false,
        can_upload: false,
        can_delete: false,
      };
    }
    newState[roleId][categoryId] = {
      ...newState[roleId][categoryId],
      [action]: !newState[roleId][categoryId][action],
    };
    onChange(newState);
  };

  // Toggle all permissions for an entire row (category)
  const toggleEntireRow = (categoryId: string) => {
    const allChecked = roles
      .filter((r) => !r.isSystem)
      .every((role) => {
        const perms = value[role.id]?.[categoryId];
        return (
          perms?.can_view &&
          perms?.can_insert &&
          perms?.can_upload &&
          perms?.can_delete
        );
      });

    const newState = { ...value };
    for (const role of roles) {
      if (role.isSystem) continue;
      if (!newState[role.id]) newState[role.id] = {};
      newState[role.id][categoryId] = {
        can_view: !allChecked,
        can_insert: !allChecked,
        can_upload: !allChecked,
        can_delete: !allChecked,
      };
    }
    onChange(newState);
  };

  // Toggle all permissions for an entire column (role)
  const toggleEntireColumn = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId);
    if (role?.isSystem) return;

    const allChecked = categories.every((cat) => {
      const perms = value[roleId]?.[cat.id];
      return (
        perms?.can_view &&
        perms?.can_insert &&
        perms?.can_upload &&
        perms?.can_delete
      );
    });

    const newState = { ...value };
    if (!newState[roleId]) newState[roleId] = {};
    for (const cat of categories) {
      newState[roleId][cat.id] = {
        can_view: !allChecked,
        can_insert: !allChecked,
        can_upload: !allChecked,
        can_delete: !allChecked,
      };
    }
    onChange(newState);
  };

  return (
    <TooltipProvider delayDuration={300}>
      <Card className="overflow-hidden border-0 shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-muted/50 to-transparent pb-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="size-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  Document Access Permissions
                </CardTitle>
                <CardDescription className="mt-1">
                  Configure which roles can view, create, upload, and delete
                  documents by category
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={saving}
                    className="gap-2"
                  >
                    <RotateCcw className="size-4" />
                    Reset
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset Permissions?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will reset all document permissions for this
                      organization to the default template. This action cannot
                      be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onReset}>
                      Reset Permissions
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button
                onClick={onSave}
                disabled={saving}
                size="sm"
                className="gap-2"
              >
                <Save className="size-4" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg bg-background/50 px-4 py-3">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Permissions
            </span>
            {actionConfig.map((action) => (
              <div key={action.key} className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex size-6 items-center justify-center rounded border",
                    action.bgClass
                  )}
                >
                  <action.icon className={cn("size-3.5", action.activeClass)} />
                </div>
                <span className="text-sm">{action.shortLabel}</span>
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={expandAll}
                className="h-7 text-xs"
              >
                Expand All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={collapseAll}
                className="h-7 text-xs"
              >
                Collapse All
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              {Object.keys(categoryGroups).length} groups •{" "}
              {categories.length} categories
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="w-64 px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                    Document Category
                  </th>
                  {roles.map((role) => (
                    <th
                      key={role.id}
                      className="min-w-[160px] px-2 py-3 text-center"
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => toggleEntireColumn(role.id)}
                            disabled={role.isSystem}
                            className={cn(
                              "inline-flex items-center gap-1.5 text-sm font-semibold transition-colors",
                              role.isSystem
                                ? "cursor-not-allowed text-muted-foreground"
                                : "text-foreground hover:text-primary"
                            )}
                          >
                            {role.name}
                            {role.isSystem && (
                              <Lock className="size-3 text-muted-foreground" />
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {role.isSystem
                            ? "System role - permissions locked"
                            : `Click to toggle all permissions for ${role.name}`}
                        </TooltipContent>
                      </Tooltip>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(categoryGroups).map(([group, cats]) => (
                  <GroupRow
                    key={group}
                    group={group}
                    categories={cats}
                    roles={roles}
                    value={value}
                    isExpanded={expandedGroups.has(group)}
                    onToggle={() => toggleGroup(group)}
                    onTogglePermission={togglePermission}
                    onToggleEntireRow={toggleEntireRow}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
