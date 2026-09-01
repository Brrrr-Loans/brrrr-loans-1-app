/** Canonical Deal URLs. Import these instead of hardcoding path strings. */

export const DEAL_LIST_PATH = "/balance-sheet/investor-portfolio/deals";
export const DEAL_PIPELINE_PATH = `${DEAL_LIST_PATH}/pipeline`;
export const DEAL_NEW_PATH = `${DEAL_LIST_PATH}/new`;

export function dealRecordPath(id: string | number): string {
  return `${DEAL_LIST_PATH}/${id}`;
}
