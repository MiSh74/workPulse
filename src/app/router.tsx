import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { LoginPage } from '@/features/auth/LoginPage';
import { AppLayout } from './layout/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { DashboardPage } from './DashboardPage';
import { PageLoader } from './PageLoader';

// Lazy load feature pages
const ProjectsPage = lazy(() =>
    import('@/features/projects/ProjectsPage').then((m) => ({ default: m.ProjectsPage }))
);
const ReportsPage = lazy(() =>
    import('@/features/reports/ReportsPage').then((m) => ({ default: m.ReportsPage }))
);
const UsersPage = lazy(() =>
    import('@/features/users/UsersPage').then((m) => ({ default: m.UsersPage }))
);
const AlertsPage = lazy(() =>
    import('@/features/alerts/AlertsPage').then((m) => ({ default: m.AlertsPage }))
);

export const router = createBrowserRouter([
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '/',
        element: (
            <ProtectedRoute>
                <AppLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: <Navigate to="/dashboard" replace />,
            },
            {
                path: 'dashboard',
                element: <DashboardPage />,
            },
            {
                path: 'projects',
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <ProjectsPage />
                    </Suspense>
                ),
            },
            {
                path: 'reports',
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <ReportsPage />
                    </Suspense>
                ),
            },
            {
                path: 'users',
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <UsersPage />
                    </Suspense>
                ),
            },
            {
                path: 'alerts',
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <AlertsPage />
                    </Suspense>
                ),
            },
        ],
    },
]);
