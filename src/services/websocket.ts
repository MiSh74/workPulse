import { io, Socket } from 'socket.io-client';
import { message as antdMessage } from 'antd';
import type {
    UserOnlinePayload,
    UserOfflinePayload,
    SessionUpdatePayload,
    AlertPayload,
} from '@/types';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

type EventCallback = (data: unknown) => void;

class WebSocketService {
    private socket: Socket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private eventCallbacks: Map<string, Set<EventCallback>> = new Map();

    /**
     * Initialize WebSocket connection
     */
    connect(token: string): void {
        if (this.socket?.connected) {
            return;
        }

        this.socket = io(WS_URL, {
            auth: { token },
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: this.maxReconnectAttempts,
        });

        this.socket.on('connect', () => {
            console.log('✅ WebSocket connected');
            this.reconnectAttempts = 0;
            antdMessage.success('Connected to server');
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ WebSocket disconnected:', reason);
            if (reason === 'io server disconnect') {
                // Server disconnected, try to reconnect
                this.socket?.connect();
            }
        });

        this.socket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
            this.reconnectAttempts++;

            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                antdMessage.error('Failed to connect to server. Please refresh the page.');
            }
        });

        this.socket.on('reconnect', () => {
            console.log('✅ WebSocket reconnected');
            antdMessage.success('Reconnected to server');
            // Trigger refetch callbacks
            this.triggerEvent('RECONNECT', {});
        });
    }

    /**
     * Disconnect WebSocket
     */
    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.eventCallbacks.clear();
        }
    }

    /**
     * Subscribe to an event
     */
    on(event: string, callback: EventCallback): void {
        // Add to internal tracking
        if (!this.eventCallbacks.has(event)) {
            this.eventCallbacks.set(event, new Set());
        }
        this.eventCallbacks.get(event)?.add(callback);

        // Register with socket
        this.socket?.on(event, callback);
    }

    /**
     * Unsubscribe from an event
     */
    off(event: string, callback?: EventCallback): void {
        if (callback) {
            this.eventCallbacks.get(event)?.delete(callback);
            this.socket?.off(event, callback);
        } else {
            this.eventCallbacks.delete(event);
            this.socket?.off(event);
        }
    }

    /**
     * Emit an event
     */
    emit(event: string, data?: unknown): void {
        this.socket?.emit(event, data);
    }

    /**
     * Check if connected
     */
    isConnected(): boolean {
        return this.socket?.connected || false;
    }

    /**
     * Get socket instance (for advanced usage)
     */
    getSocket(): Socket | null {
        return this.socket;
    }

    /**
     * Trigger event callbacks manually (useful for testing or reconnect logic)
     */
    private triggerEvent(event: string, data: unknown): void {
        const callbacks = this.eventCallbacks.get(event);
        if (callbacks) {
            callbacks.forEach((cb) => cb(data));
        }
    }

    /**
     * Setup standard event handlers
     */
    setupEventHandlers(handlers: {
        onUserOnline?: (data: UserOnlinePayload) => void;
        onUserOffline?: (data: UserOfflinePayload) => void;
        onSessionUpdate?: (data: SessionUpdatePayload) => void;
        onInactiveAlert?: (data: AlertPayload) => void;
        onOvertimeAlert?: (data: AlertPayload) => void;
        onReconnect?: () => void;
    }): void {
        if (handlers.onUserOnline) {
            this.on('USER_ONLINE', (data) => handlers.onUserOnline?.(data as UserOnlinePayload));
        }
        if (handlers.onUserOffline) {
            this.on('USER_OFFLINE', (data) => handlers.onUserOffline?.(data as UserOfflinePayload));
        }
        if (handlers.onSessionUpdate) {
            this.on('SESSION_UPDATE', (data) => handlers.onSessionUpdate?.(data as SessionUpdatePayload));
        }
        if (handlers.onInactiveAlert) {
            this.on('INACTIVE_ALERT', (data) => {
                const payload = data as AlertPayload;
                handlers.onInactiveAlert?.(payload);
                antdMessage.warning(payload.message);
            });
        }
        if (handlers.onOvertimeAlert) {
            this.on('OVERTIME_ALERT', (data) => {
                const payload = data as AlertPayload;
                handlers.onOvertimeAlert?.(payload);
                antdMessage.warning(payload.message);
            });
        }
        if (handlers.onReconnect) {
            this.on('RECONNECT', handlers.onReconnect);
        }
    }
}

export const websocketService = new WebSocketService();
