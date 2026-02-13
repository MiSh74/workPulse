import { QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, App as AntApp } from 'antd';
import { queryClient } from '@/services/queryClient';
import { antdTheme } from '@/theme/antdTheme';
import { useWebSocketEvents } from '@/hooks/useWebSocketEvents';
import { useAuthStore } from '@/store/auth.store';
import { websocketService } from '@/services/websocket';
import { useEffect } from 'react';

/**
 * WebSocket Provider Component
 * Initializes WebSocket connection and event listeners
 */
const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
    const { accessToken, isAuthenticated } = useAuthStore();

    // Initialize WebSocket connection when authenticated
    useEffect(() => {
        if (isAuthenticated && accessToken) {
            websocketService.connect(accessToken);
        }

        return () => {
            if (isAuthenticated) {
                websocketService.disconnect();
            }
        };
    }, [isAuthenticated, accessToken]);

    // Setup event handlers
    useWebSocketEvents();

    return <>{children}</>;
};

/**
 * Root providers for the application
 */
export const AppProviders = ({ children }: { children: React.ReactNode }) => {
    return (
        <QueryClientProvider client={queryClient}>
            <ConfigProvider theme={antdTheme}>
                <AntApp>
                    <WebSocketProvider>{children}</WebSocketProvider>
                </AntApp>
            </ConfigProvider>
        </QueryClientProvider>
    );
};
