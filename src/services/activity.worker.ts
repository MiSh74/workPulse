/**
 * SharedWorker for Activity Tracking
 * Centralizes timers and logging across all open tabs.
 */

interface TabState {
    port: MessagePort;
    lastActivity: number;
}

const ports: Set<MessagePort> = new Set();
let activeSessionId: string | null = null;
let token: string | null = null;
let apiUrl: string = 'http://localhost:3000';
let lastLogTime = Date.now();
let lastActivityTime = Date.now();
let isIdle = false;
const IDLE_THRESHOLD = 5 * 60 * 1000;
const LOG_INTERVAL = 60 * 1000;

let interval: any = null;

const logActivity = async () => {
    if (!activeSessionId || !token) return;

    const now = Date.now();
    const durationSeconds = Math.floor((now - lastLogTime) / 1000);
    const timeSinceLastActivity = now - lastActivityTime;

    if (timeSinceLastActivity >= IDLE_THRESHOLD && !isIdle) {
        isIdle = true;
    } else if (timeSinceLastActivity < IDLE_THRESHOLD && isIdle) {
        isIdle = false;
    }

    if (durationSeconds < 1) return;

    try {
        const res = await fetch(`${apiUrl}/sessions/${activeSessionId}/activity`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                activityType: isIdle ? 'idle' : 'active',
                durationSeconds,
                appName: 'WorkPulse Web (Worker)'
            })
        });
        lastLogTime = now;
        if (res.ok) {
            const data = await res.json();
            // Broadcast to all tabs so they can refresh session data
            ports.forEach(p => {
                try {
                    p.postMessage({ type: 'LOG_SUCCESS', payload: { session: data.session } });
                } catch { /* tab may be closed */ }
            });
        }
    } catch (error) {
        console.error('Worker failed to log activity:', error);
    }
};

const startTimer = () => {
    if (interval) return;
    interval = setInterval(logActivity, LOG_INTERVAL);
    lastLogTime = Date.now();
};

const stopTimer = () => {
    if (interval) {
        clearInterval(interval);
        interval = null;
    }
};

// @ts-ignore
onconnect = (e: MessageEvent) => {
    const port = e.ports[0];
    ports.add(port);

    port.onmessage = (msg) => {
        const { type, payload } = msg.data;

        switch (type) {
            case 'INIT':
                activeSessionId = payload.sessionId;
                token = payload.token;
                apiUrl = payload.apiUrl || apiUrl;
                lastLogTime = Date.now();
                lastActivityTime = Date.now();
                startTimer();
                break;
            case 'ACTIVITY':
                lastActivityTime = Date.now();
                if (isIdle) {
                    isIdle = false;
                    // Resume logging immediately if needed?
                }
                break;
            case 'STOP':
                stopTimer();
                activeSessionId = null;
                token = null;
                break;
        }
    };

    port.start();
};
