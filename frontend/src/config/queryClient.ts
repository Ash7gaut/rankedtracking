import { QueryClient } from 'react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: 'always',
      refetchOnWindowFocus: true,
      staleTime: 0,
      cacheTime: 0,
      retry: 1,
      retryDelay: 0,
    },
  },
});
