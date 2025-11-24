import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // Cache kept for 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      // Enable structural sharing for better performance
      structuralSharing: true,
    },
    mutations: {
      retry: 1,
    },
  },
})