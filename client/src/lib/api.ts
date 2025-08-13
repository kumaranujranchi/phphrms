// API Service for HRMS Frontend
// Handles all HTTP requests to the backend

import { config, endpoints, buildApiUrl, getAuthHeaders } from '../config/api';

// Types
interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    employee_id: string;
  };
  token: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  employee_id: string;
  department_name?: string;
  designation_name?: string;
  status: string;
}

interface Attendance {
  id: string;
  user_id: string;
  check_in_time: string;
  check_out_time?: string;
  status: string;
  date: string;
}

interface LeaveRequest {
  id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  status: string;
}

interface ExpenseClaim {
  id: string;
  expense_type: string;
  amount: number;
  description: string;
  claim_date: string;
  status: string;
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = buildApiUrl(endpoint);
  const token = localStorage.getItem('token') || undefined;
  
  const defaultOptions: RequestInit = {
    headers: getAuthHeaders(token),
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Authentication API
export const authApi = {
  login: async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    return apiRequest<LoginResponse>(endpoints.auth.login, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  register: async (userData: any): Promise<ApiResponse<User>> => {
    return apiRequest<User>(endpoints.auth.register, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  logout: async (): Promise<ApiResponse> => {
    return apiRequest(endpoints.auth.logout, {
      method: 'POST',
    });
  },

  getProfile: async (): Promise<ApiResponse<User>> => {
    return apiRequest<User>(endpoints.auth.profile);
  },

  changePassword: async (passwords: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse> => {
    return apiRequest(endpoints.auth.changePassword, {
      method: 'POST',
      body: JSON.stringify(passwords),
    });
  },

  resetPassword: async (email: string): Promise<ApiResponse> => {
    return apiRequest(endpoints.auth.resetPassword, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  confirmReset: async (data: {
    email: string;
    token: string;
    newPassword: string;
  }): Promise<ApiResponse> => {
    return apiRequest(endpoints.auth.confirmReset, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Users API
export const usersApi = {
  getAll: async (): Promise<ApiResponse<User[]>> => {
    return apiRequest<User[]>(endpoints.users.list);
  },

  search: async (query: string): Promise<ApiResponse<User[]>> => {
    return apiRequest<User[]>(`${endpoints.users.search}?q=${encodeURIComponent(query)}`);
  },

  create: async (userData: any): Promise<ApiResponse<User>> => {
    return apiRequest<User>(endpoints.users.create, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  update: async (id: string, userData: any): Promise<ApiResponse<User>> => {
    return apiRequest<User>(endpoints.users.update(id), {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  delete: async (id: string): Promise<ApiResponse> => {
    return apiRequest(endpoints.users.delete(id), {
      method: 'DELETE',
    });
  },
};

// Dashboard API
export const dashboardApi = {
  getStats: async (): Promise<ApiResponse<any>> => {
    return apiRequest(endpoints.dashboard.stats);
  },

  getAdminStats: async (): Promise<ApiResponse<any>> => {
    return apiRequest(endpoints.dashboard.adminStats);
  },
};

// Attendance API
export const attendanceApi = {
  getAll: async (): Promise<ApiResponse<Attendance[]>> => {
    return apiRequest<Attendance[]>(endpoints.attendance.list);
  },

  checkIn: async (data: {
    latitude?: number;
    longitude?: number;
    notes?: string;
  }): Promise<ApiResponse<Attendance>> => {
    return apiRequest<Attendance>(endpoints.attendance.checkIn, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  checkOut: async (data: {
    latitude?: number;
    longitude?: number;
    notes?: string;
  }): Promise<ApiResponse<Attendance>> => {
    return apiRequest<Attendance>(endpoints.attendance.checkOut, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Leave API
export const leaveApi = {
  getAll: async (): Promise<ApiResponse<LeaveRequest[]>> => {
    return apiRequest<LeaveRequest[]>(endpoints.leaves.list);
  },

  create: async (leaveData: {
    leave_type: string;
    start_date: string;
    end_date: string;
    total_days: number;
    reason: string;
  }): Promise<ApiResponse<LeaveRequest>> => {
    return apiRequest<LeaveRequest>(endpoints.leaves.create, {
      method: 'POST',
      body: JSON.stringify(leaveData),
    });
  },

  approve: async (id: string, data: {
    status: 'approved' | 'rejected';
    rejection_reason?: string;
  }): Promise<ApiResponse<LeaveRequest>> => {
    return apiRequest<LeaveRequest>(endpoints.leaves.approve(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Expense API
export const expenseApi = {
  getAll: async (): Promise<ApiResponse<ExpenseClaim[]>> => {
    return apiRequest<ExpenseClaim[]>(endpoints.expenses.list);
  },

  create: async (expenseData: {
    expense_type: string;
    amount: number;
    description: string;
    claim_date: string;
    receipt_file?: string;
  }): Promise<ApiResponse<ExpenseClaim>> => {
    return apiRequest<ExpenseClaim>(endpoints.expenses.create, {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });
  },

  approve: async (id: string, data: {
    status: 'approved' | 'rejected';
    rejection_reason?: string;
  }): Promise<ApiResponse<ExpenseClaim>> => {
    return apiRequest<ExpenseClaim>(endpoints.expenses.approve(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Payroll API
export const payrollApi = {
  getAll: async (): Promise<ApiResponse<any[]>> => {
    return apiRequest<any[]>(endpoints.payroll.list);
  },
};

// Health Check API
export const healthApi = {
  check: async (): Promise<ApiResponse> => {
    return apiRequest(endpoints.health);
  },
};

// Export all APIs
export const api = {
  auth: authApi,
  users: usersApi,
  dashboard: dashboardApi,
  attendance: attendanceApi,
  leave: leaveApi,
  expense: expenseApi,
  payroll: payrollApi,
  health: healthApi,
};
