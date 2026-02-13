import { useQuery } from '@tanstack/react-query';
import { getMyActiveSession } from './sessions.api';
import type { WorkSession } from '@/types';

export const useActiveSession = () => {
    return useQuery<WorkSession | null>({
        queryKey: ['activeSession'],
        queryFn: getMyActiveSession,
        refetchInterval: 30000, // Refetch every 30 seconds
        staleTime: 20000,
    });
};
