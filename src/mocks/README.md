# Mock Data Guide

## Overview
This directory contains mock data for testing the WorkPulse application with all three user roles.

## Available Mock Users

### Admin User
- **Email**: `admin@example.com`
- **Password**: `password`
- **Access**: Full organization visibility

### Manager User
- **Email**: `manager@example.com`
- **Password**: `password`
- **Access**: Team-scoped data (employees only)

### Employee User
- **Email**: `employee@example.com`
- **Password**: `password`
- **Access**: Personal data only

## Mock Data Includes

- **5 Users**: 1 Admin, 1 Manager, 3 Employees
- **4 Projects**: WorkPulse Frontend, Backend, Mobile App, Documentation
- **3 Active Sessions**: Realistic session data with active/idle times
- **4 Online Users**: With different statuses (active, idle)
- **3 Alerts**: Inactive and overtime alerts
- **3 Reports**: Weekly productivity reports
- **7 Days** of productivity chart data
- **Session History**: Past sessions for employees

## Usage

Import mock data in your components:

```typescript
import { mockUsers, mockProjects, getMockDataForRole } from '@/mocks/data';

// Get role-specific data
const adminData = getMockDataForRole('admin');
const managerData = getMockDataForRole('manager');
const employeeData = getMockDataForRole('employee');
```

## Testing Different Roles

1. Login with admin credentials to see organization-wide data
2. Login with manager credentials to see team-scoped data
3. Login with employee credentials to see personal data only
