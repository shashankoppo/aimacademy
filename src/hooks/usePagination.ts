import { useState, useEffect, useMemo } from "react";

export const PAGE_SIZES = [10, 25, 50, 100] as const;
export type PageSize = (typeof PAGE_SIZES)[number];

export function usePagination<T>(data: T[], defaultPageSize: PageSize = 25) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(defaultPageSize);

  // Reset to page 1 whenever data length changes (e.g. search / filter applied)
  useEffect(() => {
    setPage(1);
  }, [data.length]);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));

  // Clamp page if it goes out of range (e.g. deleted last item on last page)
  const safePage = Math.min(page, totalPages);

  const paginatedData = useMemo(
    () => data.slice((safePage - 1) * pageSize, safePage * pageSize),
    [data, safePage, pageSize]
  );

  return {
    page: safePage,
    setPage,
    pageSize,
    setPageSize: (s: PageSize) => { setPageSize(s); setPage(1); },
    totalPages,
    totalItems: data.length,
    paginatedData,
    from: data.length === 0 ? 0 : (safePage - 1) * pageSize + 1,
    to: Math.min(safePage * pageSize, data.length),
  };
}
