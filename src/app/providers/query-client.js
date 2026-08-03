import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { API_ERROR_CODES, AppError } from "@/shared/api";

const RETRYABLE_CODES = new Set([
  API_ERROR_CODES.NETWORK_ERROR,
  API_ERROR_CODES.OFFLINE,
  API_ERROR_CODES.TIMEOUT,
  API_ERROR_CODES.SERVER_ERROR,
]);

function shouldRetry(failureCount, error) {
  return (
    failureCount < 2 &&
    error instanceof AppError &&
    RETRYABLE_CODES.has(error.code)
  );
}

function showGlobalError(error, queryOrMutation) {
  if (queryOrMutation?.meta?.showGlobalError && error?.message)
    toast.error(error.message);
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => showGlobalError(error, query),
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) =>
      showGlobalError(error, mutation),
  }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: shouldRetry,
      refetchOnWindowFocus: false,
    },
    mutations: { retry: 0 },
  },
});
