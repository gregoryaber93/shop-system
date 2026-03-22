import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(300 * 2 ** attemptIndex, 5_000),
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
