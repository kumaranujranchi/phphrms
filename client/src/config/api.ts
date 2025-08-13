// API Configuration for HRMS Frontend
// This file contains API base URL and endpoint configurations

export const config = {
  // API Base URL - will be replaced during build
  API_BASE_URL: __API_BASE_URL__ || 'http://localhost:3000/api',
  
  // API Timeout
  TIMEOUT: 30000,
  
  // Default headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};

// API Endpoints
export const endpoints = {
  // Authentication
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    profile: '/auth/profile',
    changePassword: '/auth/change-password',
    resetPassword: '/auth/reset-password',
    confirmReset: '/auth/confirm-reset',
  },
  
  // Users
  users: {
    list: '/users',
    search: '/users/search',
    create: '/admin/users',
    update: (id: string) => `/admin/users/${id}`,
    delete: (id: string) => `/admin/users/${id}`,
  },
  
  // Dashboard
  dashboard: {
    stats: '/dashboard/stats',
    adminStats: '/admin/dashboard',
  },
  
  // Attendance
  attendance: {
    list: '/attendance',
    checkIn: '/attendance/check-in',
    checkOut: '/attendance/check-out',
  },
  
  // Leave Management
  leaves: {
    list: '/leaves',
    create: '/leaves',
    approve: (id: string) => `/admin/leaves/${id}/approve`,
  },
  
  // Expense Management
  expenses: {
    list: '/expenses',
    create: '/expenses',
    approve: (id: string) => `/admin/expenses/${id}/approve`,
  },
  
  // Payroll
  payroll: {
    list: '/payroll',
  },
  
  // Health Check
  health: '/health',
};

// Helper function to build full API URL
export const buildApiUrl = (endpoint: string): string => {
  return `${config.API_BASE_URL}${endpoint}`;
};

// Helper function to get auth headers
export const getAuthHeaders = (token?: string) => {
  const headers = { ...config.DEFAULT_HEADERS };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};
