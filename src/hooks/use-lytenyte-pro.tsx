// ✅ Using specific imports for optimal tree shaking
// ❌ Avoid: import * as All from "@1771technologies/lytenyte-pro"

import { Grid } from "@1771technologies/lytenyte-pro";
import { useClientRowDataSource } from "@1771technologies/lytenyte-pro";
import { useClientRowDataSourcePaginated } from "@1771technologies/lytenyte-pro";
import { useClientTreeDataSource } from "@1771technologies/lytenyte-pro";
import { useServerDataSource } from "@1771technologies/lytenyte-pro";

// Export the useLyteNyte hook from Grid
export const useLyteNyte = Grid.useLyteNyte;

// Re-export data source hooks
export {
  useClientRowDataSource,
  useClientRowDataSourcePaginated,
  useServerDataSource,
  useClientTreeDataSource,
};
