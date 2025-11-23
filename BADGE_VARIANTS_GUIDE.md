# Badge Component - New Semantic Variants

## Overview
Added semantic color variants to the Badge component for better visual communication of status and information types.

## Available Variants

### Existing Variants
- `default` - Primary brand color (black/dark)
- `secondary` - Subtle gray background
- `destructive` - Red for errors/failures
- `outline` - Transparent with border

### New Semantic Variants ✨

#### Info (Blue)
Use for informational states, processing, or neutral notifications.

```tsx
<Badge variant="info">Processing</Badge>
<Badge variant="info">In Review</Badge>
<Badge variant="info">Scheduled</Badge>
```

**Colors:**
- Light mode: Blue `hsl(217 92% 61%)` with dark blue text `hsl(223 85% 47%)`
- Dark mode: Blue `hsl(217 92% 61%)` with light blue text `hsl(217 91% 72%)`

#### Success (Green)
Use for completed, approved, or positive states.

```tsx
<Badge variant="success">Completed</Badge>
<Badge variant="success">Approved</Badge>
<Badge variant="success">Active</Badge>
```

**Colors:**
- Light mode: Emerald `hsl(160 84% 39%)` with dark emerald text `hsl(162 87% 25%)`
- Dark mode: Emerald `hsl(160 84% 39%)` with light emerald text `hsl(158 64% 52%)`

#### Warning (Amber/Orange)
Use for pending, attention-needed, or cautionary states.

```tsx
<Badge variant="warning">Pending</Badge>
<Badge variant="warning">Attention Needed</Badge>
<Badge variant="warning">Expiring Soon</Badge>
```

**Colors:**
- Light mode: Amber `hsl(38 92% 50%)` with dark amber text `hsl(33 92% 36%)`
- Dark mode: Amber `hsl(38 92% 50%)` with light amber text `hsl(42 96% 56%)`

#### Danger (Red)
Use for failed, rejected, or error states. This is an alias for `destructive` for semantic clarity.

```tsx
<Badge variant="danger">Failed</Badge>
<Badge variant="danger">Rejected</Badge>
<Badge variant="danger">Error</Badge>
```

**Colors:**
- Uses existing `--destructive` and `--destructive-foreground` CSS variables

## Usage Examples

### Transaction Statuses
```tsx
// Map transaction status to badge variant
const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
    case "processed":
      return <Badge variant="success">{status}</Badge>;
    case "pending":
      return <Badge variant="warning">{status}</Badge>;
    case "processing":
      return <Badge variant="info">{status}</Badge>;
    case "failed":
      return <Badge variant="danger">{status}</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};
```

### Financial Amounts
```tsx
// Positive/negative indicators
{amount > 0 ? (
  <Badge variant="success">+${amount.toFixed(2)}</Badge>
) : (
  <Badge variant="danger">-${Math.abs(amount).toFixed(2)}</Badge>
)}
```

### Document States
```tsx
<Badge variant="success">Uploaded</Badge>
<Badge variant="warning">Pending Review</Badge>
<Badge variant="info">In Progress</Badge>
<Badge variant="danger">Missing</Badge>
```

## CSS Variables Added

### Light Mode (`:root`)
```css
--info: 217 92% 61%;
--info-foreground: 223 85% 47%;
--success: 160 84% 39%;
--success-foreground: 162 87% 25%;
--warning: 38 92% 50%;
--warning-foreground: 33 92% 36%;
```

### Dark Mode (`.dark`)
```css
--info: 217 92% 61%;
--info-foreground: 217 91% 72%;
--success: 160 84% 39%;
--success-foreground: 158 64% 52%;
--warning: 38 92% 50%;
--warning-foreground: 42 96% 56%;
```

## TypeScript Support

The Badge component uses `class-variance-authority` which automatically infers TypeScript types from the variant definitions. All new variants are fully typed:

```tsx
type BadgeVariant = 
  | "default" 
  | "secondary" 
  | "destructive" 
  | "outline" 
  | "info" 
  | "success" 
  | "warning" 
  | "danger";

// TypeScript will autocomplete and type-check
<Badge variant="success">Completed</Badge> // ✅
<Badge variant="invalid">Test</Badge>       // ❌ TypeScript error
```

## Accessibility

All badge variants maintain proper color contrast ratios:
- Light mode: Dark foreground on light background
- Dark mode: Light foreground on same background
- Hover states reduce opacity to 80% for visual feedback

## Best Practices

1. **Be consistent**: Use the same variant for the same meaning across your app
2. **Don't overuse**: Reserve colored badges for important information
3. **Consider context**: What's a "success" in one context might be neutral in another
4. **Pair with icons**: For added clarity (especially for accessibility)

```tsx
<Badge variant="success">
  <CheckCircle className="h-3 w-3 mr-1" />
  Approved
</Badge>
```

## Migration Notes

- Existing badge uses are unaffected (default variant still works)
- `danger` and `destructive` use the same colors (choose based on semantic preference)
- All new variants follow the same hover/focus patterns as existing variants

---

**Files Modified:**
- `src/app/globals.css` - Added semantic color CSS variables
- `src/components/ui/badge.tsx` - Added new badge variants

