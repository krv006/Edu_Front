function getPageFromUrl(value) {
  if (!value) return null;
  try {
    return Number(new URL(value).searchParams.get("page")) || null;
  } catch {
    return null;
  }
}

export function normalizePagination(payload, { page = 1, pageSize = 20 } = {}) {
  const source = payload?.success === true ? payload.data : payload;
  const items = Array.isArray(source) ? source : source?.results ?? [];
  const total = Array.isArray(source)
    ? source.length
    : Number(source?.count ?? items.length);
  const resolvedPage = getPageFromUrl(source?.previous)
    ? getPageFromUrl(source.previous) + 1
    : Number(page);
  const resolvedPageSize = Math.max(1, Number(pageSize) || items.length || 1);
  return {
    items,
    page: resolvedPage,
    pageSize: resolvedPageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / resolvedPageSize)),
    next: source?.next ?? null,
    previous: source?.previous ?? null,
  };
}
