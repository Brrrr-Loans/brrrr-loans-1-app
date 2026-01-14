# LyteNyte Grid - Quick Reference Card

## 🎯 Import Statements (Always Use These)

```tsx
// For components
import { LyteNyte } from "@/components/lytenyte-pro";

// For hooks (import only what you need)
import { useLyteNyte, useClientRowDataSource } from "@/hooks/use-lytenyte-pro";
// or
import { useLyteNyte, useServerDataSource } from "@/hooks/use-lytenyte-pro";
// or
import {
  useLyteNyte,
  useClientRowDataSourcePaginated,
} from "@/hooks/use-lytenyte-pro";
// or
import { useLyteNyte, useClientTreeDataSource } from "@/hooks/use-lytenyte-pro";

// For types
import type { Column } from "@1771technologies/lytenyte-pro/types";
```

## ⚡ Bundling Best Practices

| ✅ DO                                                    | ❌ DON'T                                                |
| -------------------------------------------------------- | ------------------------------------------------------- |
| `import { useLyteNyte } from "@/hooks/use-lytenyte-pro"` | `import * as All from "@1771technologies/lytenyte-pro"` |
| Use specific imports                                     | Use wildcard imports                                    |
| Import only what you need                                | Import entire packages                                  |
| Use ES modules (`import`/`export`)                       | Use CommonJS (`require`)                                |

## 📦 Data Source Types

### Client-Side (Static Data)

```tsx
const dataSource = useClientRowDataSource({
  data: myArray,
  rowIdLeaf: (d, i) => d.data?.id ?? String(i), // Not getRowId!
});
```

### Client-Side Paginated

```tsx
const dataSource = useClientRowDataSourcePaginated({
  data: largeArray,
  rowIdLeaf: (d, i) => d.data?.id ?? String(i),
  pageSize: 50,
});
```

### Server-Side (Dynamic)

```tsx
// Note: Server data source uses dataFetcher (more complex API)
// For simpler use cases, fetch data with useEffect/useSWR
// and use client data source
```

### Tree Data

```tsx
const dataSource = useClientTreeDataSource({
  data: treeArray,
  rowIdLeaf: (d, i) => d.data?.id ?? String(i),
  getChildren: (d) => d.data?.children, // Access via d.data, same as rowIdLeaf
});
```

## 🎨 Basic Grid Setup

```tsx
"use client";

import { useId } from "react";
import { LyteNyte } from "@/components/lytenyte-pro";
import { useLyteNyte, useClientRowDataSource } from "@/hooks/use-lytenyte-pro";
import type { Column } from "@1771technologies/lytenyte-pro/types";

interface MyData {
  id: string;
  name: string;
  amount: number;
}

export function MyGrid({ data }: { data: MyData[] }) {
  const gridId = useId();

  const columns: Column<MyData>[] = [
    { id: "name", name: "Name", width: 200 },
    { id: "amount", name: "Amount", width: 150, type: "number" },
  ];

  const dataSource = useClientRowDataSource({
    data: data,
    rowIdLeaf: (d, i) => d.data?.id ?? String(i),
  });

  const grid = useLyteNyte<MyData>({
    gridId, // Required!
    columns,
    rowDataSource: dataSource, // Not "dataSource"!
    columnBase: {
      uiHints: {
        resizable: true,
        sortable: true,
      },
    },
  });

  return (
    <div className="h-[600px] w-full">
      <LyteNyte grid={grid} />
    </div>
  );
}
```

## 📊 Column Configuration

```tsx
const columns: Column<T>[] = [
  {
    id: "column-id", // Required: unique identifier
    name: "Column Title", // Display name (NOT "title"!)
    width: 150, // Default width in pixels
    widthMin: 100, // Minimum width (NOT "minWidth"!)
    widthMax: 300, // Maximum width (NOT "maxWidth"!)
    type: "number", // "string" | "number" | "date" | "datetime"

    // Custom cell rendering (no valueFormatter - use cellRenderer!)
    cellRenderer: ({ row, grid, column }) => {
      const value = grid.api.columnField(column, row);
      return <div className="px-2">{formatValue(value)}</div>;
    },
  },
];
```

## 🎯 Common Patterns

### Currency Formatting (via cellRenderer)

```tsx
cellRenderer: ({ row, grid, column }) => {
  const value = grid.api.columnField(column, row) as number | null;
  if (value == null) return null;

  return (
    <div className="flex h-full w-full items-center px-2">
      {new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value)}
    </div>
  );
};
```

### Date Formatting

```tsx
cellRenderer: ({ row, grid, column }) => {
  const dateStr = grid.api.columnField(column, row) as string | null;
  if (!dateStr) return null;

  const date = new Date(dateStr);
  return (
    <div className="flex h-full w-full items-center px-2">
      {date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })}
    </div>
  );
};
```

### Custom Cell with Badge

```tsx
cellRenderer: ({ row, grid, column }) => {
  const status = grid.api.columnField(column, row) as string | null;
  if (!status) return null;

  const variant = status === "Active" ? "default" : "secondary";
  return (
    <div className="flex h-full w-full items-center px-2">
      <Badge variant={variant}>{status}</Badge>
    </div>
  );
};
```

## ⚠️ API Gotchas

| ❌ Wrong                      | ✅ Correct                                     |
| ----------------------------- | ---------------------------------------------- |
| `title: "Name"`               | `name: "Name"`                                 |
| `minWidth: 100`               | `widthMin: 100`                                |
| `maxWidth: 300`               | `widthMax: 300`                                |
| `dataSource: dataSource`      | `rowDataSource: dataSource`                    |
| `getRowId: (row) => row.id`   | `rowIdLeaf: (d, i) => d.data?.id ?? String(i)` |
| `params.value`                | `grid.api.columnField(column, row)`            |
| `valueFormatter: (p) => ...`  | `cellRenderer: ({ row, grid, column }) => ...` |
| `resizable: true` (on column) | `columnBase: { uiHints: { resizable: true } }` |
| `sortable: true` (on column)  | `columnBase: { uiHints: { sortable: true } }`  |
| Missing `gridId`              | `const gridId = useId();` (required!)          |

## 🔑 License Activation

The license is automatically activated when you start your app.

**To add your license key:**

1. Add to `.env.local`:

   ```bash
   NEXT_PUBLIC_LYTENYTE_LICENSE_KEY=your-license-key-here
   ```

2. Restart dev server:
   ```bash
   npm run dev
   ```

The `LyteNyteLicenseActivator` component in your root layout handles activation automatically.

## 📁 Files Created

- ✅ `/src/components/lytenyte-pro.tsx` - Main grid component
- ✅ `/src/hooks/use-lytenyte-pro.tsx` - Grid hooks
- ✅ `/src/components/lytenyte-license-activator.tsx` - Auto license activation
- ✅ `/src/components/deals/deals-lytenyte-grid-example.tsx` - Client-side example
- ✅ `/src/components/deals/deals-lytenyte-server-example.tsx` - Server-side example

## 📚 Documentation

- Full Guide: `LYTENYTE_USAGE_GUIDE.md`
- Official Docs: https://www.1771technologies.com/docs
- Support: https://www.1771technologies.com/support

## 🚀 Next Steps

1. Add license key to `.env.local`
2. Copy an example component
3. Customize columns for your data
4. Add to your page
5. Test and iterate!
