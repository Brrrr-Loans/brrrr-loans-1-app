import { basehub } from "basehub";

export { basehub };

/**
 * Fragment definitions for common BaseHub queries
 */
export const articleFragment = `
  _id
  _title
  _slug
  excerpt
  fullBleed
  sidebarOverrides {
    title
    markAsNew
    icon
  }
  body {
    json
  }
  children {
    items {
      _id
      _title
      _slug
      excerpt
      sidebarOverrides {
        title
        markAsNew
        icon
      }
      children {
        items {
          _id
          _title
          _slug
        }
      }
    }
  }
`;

export const pageFragment = `
  _id
  _title
  _slug
  articles {
    items {
      ${articleFragment}
    }
  }
`;
