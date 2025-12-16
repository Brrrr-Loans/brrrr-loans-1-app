"use client";

import { useState, useCallback, useEffect } from "react";
import { useOrgTheme } from "@/contexts/theme-context";
import { Palette, Save, Check, Plus, Star, Trash2, X } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/feedback/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/forms/select";
import { 
  EDITABLE_THEME_TOKENS,
  DEFAULT_LIGHT_TOKENS,
  DEFAULT_DARK_TOKENS,
  DEFAULT_RADIUS,
} from "@/lib/theme/constants";
import { toast } from "sonner";

interface ThemeEditorWrapperProps {
  /**
   * Controlled open state for external triggers (e.g., from settings popover)
   */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Wrapper component that provides theme save/load functionality 
 * integrated with Supabase auth_clerk_orgs_themes table.
 * 
 * This component works alongside TinteEditor:
 * - TinteEditor: Provides visual editing & preview
 * - ThemeEditorWrapper: Provides save/load/manage functionality
 */
export function ThemeEditorWrapper({ open, onOpenChange }: ThemeEditorWrapperProps) {
  const {
    currentTheme,
    availableThemes,
    isLoading,
    isOrgAdmin,
    internalOrgId,
    saveNewTheme,
    updateExistingTheme,
    deleteTheme,
    setAsDefaultTheme,
    applyThemeById,
    loadThemes,
  } = useOrgTheme();

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showManageDialog, setShowManageDialog] = useState(false);
  const [themeName, setThemeName] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedThemeId, setSelectedThemeId] = useState<string>("");

  // Controlled/uncontrolled pattern
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : showManageDialog;
  const setIsOpen = isControlled 
    ? onOpenChange || (() => {}) 
    : setShowManageDialog;

  // Sync selected theme with current theme
  useEffect(() => {
    if (currentTheme) {
      setSelectedThemeId(String(currentTheme.id));
    }
  }, [currentTheme]);

  /**
   * Captures current CSS variable values from the DOM.
   * Used to save what TinteEditor has applied.
   */
  const captureCurrentTheme = useCallback(() => {
    const root = document.documentElement;
    const computedLight = getComputedStyle(root);
    
    // Capture light mode
    const lightTokens: Record<string, string> = {};
    for (const token of EDITABLE_THEME_TOKENS) {
      const value = computedLight.getPropertyValue(`--${token}`).trim();
      if (value) {
        lightTokens[token] = value;
      } else {
        // Fall back to default
        lightTokens[token] = DEFAULT_LIGHT_TOKENS[token] || "";
      }
    }

    // Switch to dark mode temporarily to capture
    const wasDark = root.classList.contains("dark");
    if (!wasDark) {
      root.classList.add("dark");
    }

    // Small delay to let styles apply
    const darkComputedStyle = getComputedStyle(root);
    const darkTokens: Record<string, string> = {};
    for (const token of EDITABLE_THEME_TOKENS) {
      const value = darkComputedStyle.getPropertyValue(`--${token}`).trim();
      if (value) {
        darkTokens[token] = value;
      } else {
        darkTokens[token] = DEFAULT_DARK_TOKENS[token] || "";
      }
    }

    // Restore mode
    if (!wasDark) {
      root.classList.remove("dark");
    }

    // Capture radius values
    const radius: Record<string, string> = {
      radius: computedLight.getPropertyValue("--radius").trim() || DEFAULT_RADIUS.radius,
      "radius-sm": computedLight.getPropertyValue("--radius-sm").trim() || DEFAULT_RADIUS["radius-sm"],
      "radius-md": computedLight.getPropertyValue("--radius-md").trim() || DEFAULT_RADIUS["radius-md"],
      "radius-lg": computedLight.getPropertyValue("--radius-lg").trim() || DEFAULT_RADIUS["radius-lg"],
    };

    return { lightTokens, darkTokens, radius };
  }, []);

  /**
   * Opens the save dialog to save the current theme state
   */
  const handleOpenSaveDialog = useCallback(() => {
    setThemeName("");
    setIsDefault(false);
    setShowSaveDialog(true);
  }, []);

  /**
   * Saves the current theme to Supabase
   */
  const handleSaveTheme = useCallback(async () => {
    if (!themeName.trim()) {
      toast.error("Please enter a theme name");
      return;
    }

    if (!internalOrgId) {
      toast.error("Organization not found");
      return;
    }

    setIsSaving(true);

    try {
      const { lightTokens, darkTokens, radius } = captureCurrentTheme();
      
      const newTheme = await saveNewTheme(
        themeName.trim(),
        lightTokens,
        darkTokens,
        radius,
        isDefault
      );

      if (newTheme) {
        toast.success(`Theme "${themeName}" saved successfully!`);
        setShowSaveDialog(false);
        setThemeName("");
        setIsDefault(false);
      } else {
        toast.error("Failed to save theme");
      }
    } catch (error) {
      console.error("Error saving theme:", error);
      toast.error("An error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  }, [themeName, isDefault, internalOrgId, captureCurrentTheme, saveNewTheme]);

  /**
   * Switches to a different saved theme
   */
  const handleSwitchTheme = useCallback((themeIdStr: string) => {
    const themeId = parseInt(themeIdStr, 10);
    if (!isNaN(themeId)) {
      applyThemeById(themeId);
      setSelectedThemeId(themeIdStr);
      toast.success("Theme applied!");
    }
  }, [applyThemeById]);

  /**
   * Sets a theme as the organization default
   */
  const handleSetDefault = useCallback(async (themeId: number) => {
    const success = await setAsDefaultTheme(themeId);
    if (success) {
      toast.success("Default theme updated!");
    } else {
      toast.error("Failed to set default theme");
    }
  }, [setAsDefaultTheme]);

  /**
   * Deletes a theme
   */
  const handleDeleteTheme = useCallback(async (themeId: number, themeName: string) => {
    if (!confirm(`Are you sure you want to delete "${themeName}"?`)) {
      return;
    }

    const success = await deleteTheme(themeId);
    if (success) {
      toast.success(`Theme "${themeName}" deleted`);
    } else {
      toast.error("Failed to delete theme");
    }
  }, [deleteTheme]);

  if (!internalOrgId) {
    return null; // Don't render if not in an org context
  }

  return (
    <>
      {/* Theme Manager Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Theme Manager
            </DialogTitle>
            <DialogDescription>
              Manage your organization&apos;s custom themes. Use the Theme Editor to create or modify themes, then save them here.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Current Theme Selector */}
            <div className="space-y-2">
              <Label>Active Theme</Label>
              <Select 
                value={selectedThemeId} 
                onValueChange={handleSwitchTheme}
                disabled={availableThemes.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a theme..." />
                </SelectTrigger>
                <SelectContent>
                  {availableThemes.map((theme) => (
                    <SelectItem key={theme.id} value={String(theme.id)}>
                      <div className="flex items-center gap-2">
                        {theme.name}
                        {theme.is_default && (
                          <Badge variant="secondary" className="text-xs">
                            Default
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Saved Themes List */}
            <div className="space-y-2">
              <Label>Saved Themes ({availableThemes.length})</Label>
              <div className="max-h-[200px] overflow-y-auto space-y-2 rounded-md border p-2">
                {availableThemes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No themes saved yet. Use the Theme Editor to create one!
                  </p>
                ) : (
                  availableThemes.map((theme) => (
                    <div 
                      key={theme.id} 
                      className={`flex items-center justify-between p-2 rounded-md border ${
                        currentTheme?.id === theme.id ? "bg-accent" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{theme.name}</span>
                        {theme.is_default && (
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                      
                      {isOrgAdmin && (
                        <div className="flex items-center gap-1">
                          {!theme.is_default && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleSetDefault(theme.id)}
                              title="Set as default"
                            >
                              <Star className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteTheme(theme.id, theme.name)}
                            title="Delete theme"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
            {isOrgAdmin && (
              <Button onClick={handleOpenSaveDialog}>
                <Save className="h-4 w-4 mr-2" />
                Save Current Theme
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Theme Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Save Theme</DialogTitle>
            <DialogDescription>
              Save your current theme settings to your organization.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="theme-name">Theme Name</Label>
              <Input
                id="theme-name"
                placeholder="e.g., Dark Professional"
                value={themeName}
                onChange={(e) => setThemeName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveTheme()}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is-default"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="is-default" className="text-sm font-normal">
                Set as organization default
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowSaveDialog(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveTheme} 
              disabled={isSaving || !themeName.trim()}
            >
              {isSaving ? (
                <>Saving...</>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Save Theme
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

