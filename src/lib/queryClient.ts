import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime: 1000 * 60 * 10,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      retry: 1,
    },
  },
});
