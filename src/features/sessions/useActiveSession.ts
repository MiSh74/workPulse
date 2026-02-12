import { useQuery } from '@tanstack/react-query';
import { getActiveSession } from './session.api';

export const useActiveSession = () => {
    return useQuery({
        queryKey: ['activeSession'],
        queryFn: getActiveSession,
        refetchInterval: 30000, // Refetch every 30 seconds
        staleTime: 20000,
    });
};
