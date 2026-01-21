// =============================================================================
// UI Component Exports
// =============================================================================
// This file re-exports all UI components for convenient imports.
// Components are organized by source:
// - shadcn/   : Standard shadcn/ui primitives (CLI installs here)
// - custom/   : Custom components built for this project
// =============================================================================

// -----------------------------------------------------------------------------
// Shadcn Primitives
// -----------------------------------------------------------------------------
export * from "./shadcn/accordion";
export * from "./shadcn/alert";
export * from "./shadcn/alert-dialog";
export * from "./shadcn/avatar";
export * from "./shadcn/badge";
export * from "./shadcn/breadcrumb";
export * from "./shadcn/button";
export * from "./shadcn/button-group";
export * from "./shadcn/calendar";
export * from "./shadcn/card";
export * from "./shadcn/carousel";
export * from "./shadcn/chart";
export * from "./shadcn/checkbox";
export * from "./shadcn/collapsible";
export * from "./shadcn/command";
export * from "./shadcn/data-table";
export * from "./shadcn/date-picker";
export * from "./shadcn/dialog";
export * from "./shadcn/drawer";
export * from "./shadcn/dropdown-menu";
export * from "./shadcn/form";
export * from "./shadcn/hover-card";
export * from "./shadcn/input";
export * from "./shadcn/input-group";
export * from "./shadcn/label";
export * from "./shadcn/pagination";
export * from "./shadcn/popover";
export * from "./shadcn/progress";
export * from "./shadcn/radio-group";
export * from "./shadcn/scroll-area";
export * from "./shadcn/scroll-area-virtualized";
export * from "./shadcn/select";
export * from "./shadcn/separator";
export * from "./shadcn/sheet";
export * from "./shadcn/sidebar";
export * from "./shadcn/skeleton";
export { Toaster as SonnerToaster } from "./shadcn/sonner";
export * from "./shadcn/stepper";
export * from "./shadcn/switch";
export * from "./shadcn/table";
export * from "./shadcn/tabs";
export * from "./shadcn/textarea";
export * from "./shadcn/toast";
export * from "./shadcn/toaster";
export * from "./shadcn/toggle";
export * from "./shadcn/toggle-group";
export * from "./shadcn/tooltip";
export * from "./shadcn/virtualized";

// -----------------------------------------------------------------------------
// Custom Components
// -----------------------------------------------------------------------------
export * from "./custom/notion-view-tabs";
export * from "./custom/login-form";
// export * from "./custom/dropzone"; // Commented out due to naming conflict with supabase-dropzone
export * from "./custom/supabase-dropzone";
export * from "./custom/stacked-avatars";
export * from "./custom/page-header";
