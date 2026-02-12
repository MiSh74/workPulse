# WorkPulse Frontend

Production-ready enterprise SaaS React application for workforce productivity tracking.

## Tech Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool
- **Ant Design v5** - Enterprise UI component library
- **TanStack Query v5** - Server state management
- **Axios** - HTTP client with interceptors
- **Socket.IO Client** - Real-time WebSocket communication
- **React Router v6** - Client-side routing
- **Zustand** - UI state management
- **Day.js** - Date/time utilities
- **Recharts** - Data visualization

## Features

### Authentication
- JWT-based authentication
- Automatic token refresh via interceptors
- Role-based access control (Admin, Manager, Employee)

### Session Management
- Start/stop work sessions
- Project-based time tracking
- Live timer updates
- Activity monitoring
- Idle time detection

### Real-time Updates
- WebSocket integration for live data
- Online user presence tracking
- Session status updates
- Alert notifications

### Dashboards
- **Admin Dashboard**: Overview of all users, active sessions, productivity charts
- **Employee Dashboard**: Personal productivity tracking, session control

### Reports
- Date range filtering
- User-specific reports
- Productivity analytics
- Time breakdowns (active/idle)

### User Management
- User listing
- Role management
- User creation/deletion

### Project Management
- Create projects
- Assign sessions to projects
- Track project usage

### Alerts
- Real-time alert notifications
- Inactive user alerts
- Overtime alerts

## Project Structure

```
src/
├── app/
│   ├── layout/
│   │   ├── AppLayout.tsx
│   │   ├── Sidebar.tsx
│   │   └── HeaderBar.tsx
│   ├── providers.tsx
│   └── router.tsx
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── sessions/
│   ├── projects/
│   ├── reports/
│   ├── users/
│   └── alerts/
├── components/
│   ├── StatusBadge.tsx
│   ├── LiveTimer.tsx
│   ├── ProductivityScore.tsx
│   ├── RealtimeCounter.tsx
│   └── LoadingSkeleton.tsx
├── services/
│   ├── api.ts
│   ├── websocket.ts
│   └── queryClient.ts
├── store/
│   ├── auth.store.ts
│   └── presence.store.ts
├── types/
│   └── index.ts
├── utils/
│   └── format.ts
├── theme/
│   └── antdTheme.ts
└── main.tsx
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=http://localhost:5000
```

### Development

```bash
npm run dev
```

Visit `http://localhost:3000`

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

## Backend Integration

The frontend is ready to connect to a backend API. Expected endpoints:

### Auth
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Sessions
- `POST /api/sessions/start` - Start session
- `POST /api/sessions/:id/stop` - Stop session
- `GET /api/sessions/active` - Get active session
- `POST /api/sessions/:id/activity` - Activity ping

### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project

### Reports
- `GET /api/reports` - Get reports
- `GET /api/reports/productivity-overview` - Productivity data
- `GET /api/reports/daily-summary` - Daily summary
- `GET /api/reports/my-daily-summary` - User's daily summary

### Users
- `GET /api/users` - List users
- `DELETE /api/users/:id` - Delete user

### Alerts
- `GET /api/alerts` - Get alerts

### WebSocket Events
- `USER_ONLINE` - User comes online
- `USER_OFFLINE` - User goes offline
- `SESSION_UPDATE` - Session state changes
- `INACTIVE_ALERT` - User inactive alert
- `OVERTIME_ALERT` - Overtime alert

## Architecture Decisions

### State Management Strategy
- **Server State**: TanStack Query for all API data with automatic caching and revalidation
- **WebSocket Presence**: Zustand for online user tracking
- **Auth State**: Zustand with localStorage persistence
- **UI State**: Local component state with React hooks

### Performance Optimizations
- Lazy-loaded routes for code splitting
- Memoized components where appropriate
- Optimistic updates for mutations
- Background refetch with tuned staleTime
- Debounced filters

### Security
- JWT stored in localStorage (consider httpOnly cookies for production)
- Axios interceptor for automatic token attachment
- 401 handling with automatic logout
- Protected routes with redirect

## License

MIT
