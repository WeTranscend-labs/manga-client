import { QueryClient } from '@tanstack/react-query';

// Simple rate limiter integration for QueryClient
// We'll trust the fetch wrapper to handle the actual rate limiting headers/checks
// This is mainly for global configuration

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes (matches old CACHE_TTL)
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on 400s or 401s
        if (
          error instanceof Error &&
          (error.message.includes('401') ||
            error.message.includes('400') ||
            error.message.includes('403') ||
            error.message.includes('404'))
        ) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false, // Prevent too many requests in dev
    },
    mutations: {
      onError: (error) => {
        // Global error handling for mutations if needed
        console.error('Mutation error:', error);
      },
    },
  },
});

// Global error handling for 401s if we want it at the cache level
// However, it's often better to handle this in the fetcher itself
