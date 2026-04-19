import { useState, useEffect } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import api from "../services/api";

export const PAGE_SIZE = 25;

/**
 * Generic paginated list hook backed by React Query.
 *
 * - Automatically resets to page 1 when filter params change.
 * - Keeps previous data visible while the next page loads (no flash to empty).
 * - Works with both paginated ({ count, next, previous, results }) and plain-array responses.
 */
export function useList(queryKey, endpoint, params = {}) {
  const [page, setPage] = useState(1);

  // Strip empty/null/undefined values so we don't send ?date=&method= noise
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== null && v !== undefined)
  );

  // Reset to page 1 whenever the filter params actually change
  const paramsStr = JSON.stringify(cleanParams);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setPage(1); }, [paramsStr]);

  const key = Array.isArray(queryKey) ? queryKey : [queryKey];

  const query = useQuery({
    queryKey: [...key, { page, ...cleanParams }],
    queryFn: () =>
      api.get(endpoint, { params: { page, ...cleanParams } }).then((r) => r.data),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const raw = query.data;
  const isPaginated =
    raw != null && !Array.isArray(raw) && typeof raw === "object" && "results" in raw;

  return {
    ...query,
    page,
    setPage,
    items: isPaginated ? raw.results : Array.isArray(raw) ? raw : [],
    totalCount: isPaginated ? raw.count : 0,
    hasNext: isPaginated ? !!raw.next : false,
    hasPrev: isPaginated ? !!raw.previous : false,
    pageSize: PAGE_SIZE,
  };
}
