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
import { useLyteNyte, useClientRowDataSourcePaginated } from "@/hooks/use-lytenyte-pro";
// or
import { useLyteNyte, useClientTreeDataSource } from "@/hooks/use-lytenyte-pro";
```

## ⚡ Bundling Best Practices

| ✅ DO | ❌ DON'T |
|-------|----------|
| `import { useLyteNyte } from "@/hooks/use-lytenyte-pro"` | `import * as All from "@1771technologies/lytenyte-pro"` |
| Use specific imports | Use wildcard imports |
| Import only what you need | Import entire packages |
| Use ES modules (`import`/`export`) | Use CommonJS (`require`) |

## 📦 Data Source Types

### Client-Side (Static Data)
```tsx
const dataSource = useClientRowDataSource({
  data: myArray,
  getRowId: (row) => row.id,
});
```

### Client-Side Paginated
```tsx
const dataSource = useClientRowDataSourcePaginated({
  data: largeArray,
  getRowId: (row) => row.id,
  pageSize: 50,
});
```

### Server-Side (Dynamic)
```tsx
const dataSource = useServerDataSource({
  getRows: async (params) => {
    const res = await fetch(`/api/data?page=${params.startRow}`);
    const data = await res.json();
    return { rows: data.items, totalCount: data.total };
  },
  getRowId: (row) => row.id,
});
```

### Tree Data
```tsx
const dataSource = useClientTreeDataSource({
  data: treeArray,
  getRowId: (row) => row.id,
  getChildren: (row) => row.children,
});
```

## 🎨 Basic Grid Setup

```tsx
"use client";

import { LyteNyte } from "@/components/lytenyte-pro";
import { useLyteNyte, useClientRowDataSource } from "@/hooks/use-lytenyte-pro";

export function MyGrid({ data }) {
  const grid = useLyteNyte({
    columns: [
      { id: "name", title: "Name", width: 200 },
      { id: "amount", title: "Amount", width: 150 },
    ],
    dataSource: useClientRowDataSource({
      data: data,
      getRowId: (row) => row.id,
    }),
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
{
  id: "column-id",              // Required: unique identifier
  title: "Column Title",        // Required: display name
  width: 150,                   // Default width in pixels
  minWidth: 100,                // Minimum width
  maxWidth: 300,                // Maximum width
  resizable: true,              // Allow column resizing
  sortable: true,               // Enable sorting
  filterable: true,             // Enable filtering
  editable: true,               // Allow cell editing
  
  // Format displayed value
  valueFormatter: (params) => {
    return `$${params.value}`;
  },
  
  // Custom cell rendering
  cellRenderer: (params) => {
    return <CustomComponent value={params.value} />;
  },
}
```

## 🎯 Common Patterns

### Currency Formatting
```tsx
valueFormatter: (params) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(params.value);
}
```

### Date Formatting
```tsx
valueFormatter: (params) => {
  return new Date(params.value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
```

### Custom Cell with Badge
```tsx
cellRenderer: (params) => {
  const variant = params.value === "Active" ? "default" : "secondary";
  return <Badge variant={variant}>{params.value}</Badge>;
}
```

## 🔧 Grid Features

```tsx
const grid = useLyteNyte({
  columns: [...],
  dataSource: dataSource,
  
  // Features
  enableSorting: true,
  enableFiltering: true,
  enableColumnResize: true,
  enableRowSelection: true,
  
  // Callbacks
  onRowClick: (row) => console.log(row.data),
  onSelectionChange: (selection) => console.log(selection),
  onCellValueChanged: (params) => console.log(params),
});
```

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

