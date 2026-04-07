export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const MIN_PAGE_SIZE = 1;

export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: DEFAULT_PAGE_SIZE,
} as const;