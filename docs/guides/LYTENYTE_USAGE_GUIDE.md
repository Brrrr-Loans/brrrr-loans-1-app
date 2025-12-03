# LyteNyte Grid PRO - Usage Guide

## 📋 Installation Checklist

✅ Package installed: `@1771technologies/lytenyte-pro`  
✅ Component created: `src/components/lytenyte-pro.tsx`  
✅ Hooks created: `src/hooks/use-lytenyte-pro.tsx`  
✅ License activator: `src/components/lytenyte-license-activator.tsx`  
✅ License activator added to root layout  
⏳ License key pending (add to `.env.local` when received)

---

## 🚀 Quick Start

### 1. Add Your License Key

When you receive your license key by email, add it to `.env.local`:

```bash
# Lyte Nyte Grid 
NEXT_PUBLIC_LYTENYTE_LICENSE_KEY=your-license-key-here
```

### 2. Basic Usage Example

```tsx
"use client";

import { LyteNyte } from "@/components/lytenyte-pro";
import { useLyteNyte, useClientRowDataSource } from "@/hooks/use-lytenyte-pro";

interface Deal {
  id: string;
  name: string;
  amount: number;
  status: string;
}

export function DealsGrid() {
  const deals: Deal[] = [
    { id: "1", name: "Deal A", amount: 100000, status: "Active" },
    { id: "2", name: "Deal B", amount: 250000, status: "Pending" },
    { id: "3", name: "Deal C", amount: 75000, status: "Closed" },
  ];

  const grid = useLyteNyte<Deal>({
    columns: [
      {
        id: "name",
        title: "Deal Name",
        width: 200,
      },
      {
        id: "amount",
        title: "Amount",
        width: 150,
        valueFormatter: (params) => 
          `$${params.value.toLocaleString()}`,
      },
      {
        id: "status",
        title: "Status",
        width: 120,
      },
    ],
    dataSource: useClientRowDataSource({
      data: deals,
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

---

## 📦 Optimal Bundling Best Practices

### ✅ DO: Use Specific Imports

```tsx
// ✅ GOOD - Enables tree shaking
import { useLyteNyte, useClientRowDataSource } from "@/hooks/use-lytenyte-pro";
import { LyteNyte } from "@/components/lytenyte-pro";
```

### ❌ DON'T: Use Wildcard Imports

```tsx
// ❌ BAD - Prevents tree shaking
import * as LyteNyteAll from "@1771technologies/lytenyte-pro";
```

### ✅ DO: Import Only What You Need

```tsx
// ✅ GOOD - Only import the hooks you actually use
import { useLyteNyte, useClientRowDataSource } from "@/hooks/use-lytenyte-pro";

// If you only need server data source:
import { useLyteNyte, useServerDataSource } from "@/hooks/use-lytenyte-pro";
```

### ✅ DO: Use ES Modules

All files in this project use ES module syntax (`import`/`export`), which is required for optimal tree shaking.

---

## 🎯 Data Source Types

### 1. Client-Side Row Data (Static Data)

```tsx
import { useClientRowDataSource } from "@/hooks/use-lytenyte-pro";

const dataSource = useClientRowDataSource({
  data: myData,
  getRowId: (row) => row.id,
});
```

### 2. Client-Side Paginated Data

```tsx
import { useClientRowDataSourcePaginated } from "@/hooks/use-lytenyte-pro";

const dataSource = useClientRowDataSourcePaginated({
  data: largeDataset,
  getRowId: (row) => row.id,
  pageSize: 50,
});
```

### 3. Server-Side Data (Dynamic Loading)

```tsx
import { useServerDataSource } from "@/hooks/use-lytenyte-pro";

const dataSource = useServerDataSource({
  getRows: async (params) => {
    const response = await fetch(`/api/data?page=${params.page}`);
    return response.json();
  },
  getRowId: (row) => row.id,
});
```

### 4. Tree Data (Hierarchical)

```tsx
import { useClientTreeDataSource } from "@/hooks/use-lytenyte-pro";

const dataSource = useClientTreeDataSource({
  data: treeData,
  getRowId: (row) => row.id,
  getChildren: (row) => row.children,
});
```

---

## 🎨 Styling

The grid uses shadcn/ui styling through the `lng1771-shadcn` class. It automatically integrates with your project's theme:

```tsx
<div className="lng-grid lng1771-shadcn h-full w-full">
  {/* Grid content */}
</div>
```

---

## 🔧 Advanced Configuration

### Column Definitions

```tsx
columns: [
  {
    id: "column-id",
    title: "Column Title",
    width: 150,
    minWidth: 100,
    maxWidth: 300,
    resizable: true,
    sortable: true,
    editable: true,
    valueFormatter: (params) => {
      return formatValue(params.value);
    },
    cellRenderer: (params) => {
      return <CustomCell value={params.value} />;
    },
  },
]
```

### Grid Features

```tsx
const grid = useLyteNyte<T>({
  columns: [...],
  dataSource: dataSource,
  
  // Enable features
  enableSorting: true,
  enableFiltering: true,
  enableColumnResize: true,
  enableRowSelection: true,
  
  // Callbacks
  onRowClick: (row) => console.log("Row clicked:", row),
  onSelectionChange: (selection) => console.log("Selection:", selection),
});
```

---

## 📚 Next Steps

1. **Wait for your license key** to arrive by email
2. **Add the license key** to `.env.local`
3. **Restart your dev server** to activate the license
4. **Build your first grid** using the examples above
5. **Refer to the [official documentation](https://www.1771technologies.com/docs)** for advanced features

---

## 🐛 Troubleshooting

### Watermarks Appearing?
- Check that your license key is in `.env.local`
- Restart your dev server after adding the key
- Check browser console for activation errors

### Tree Shaking Not Working?
- Verify you're using specific imports (not `import *`)
- Check that your bundler (Next.js) has tree shaking enabled (it does by default)
- Avoid side effects in imported modules

### Performance Issues?
- Use paginated data source for large datasets
- Implement virtual scrolling (enabled by default)
- Consider server-side data source for very large datasets

---

## 📖 Resources

- [LyteNyte Documentation](https://www.1771technologies.com/docs)
- [License Activation Guide](https://www.1771technologies.com/docs/intro-license-activation)
- [API Reference](https://www.1771technologies.com/docs/api)
- [Support](https://www.1771technologies.com/support)

