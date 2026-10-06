import {
  DashboardData,
  PlannerData,
  AnalyticsData,
  Task,
  Subject,
  StudySession,
  NotificationItem,
  AIRecommendation,
  User,
} from '../types';

const TOKEN_KEY = 'deadlineguard_jwt_token';
const USER_KEY = 'deadlineguard_user';

export const storage = {
  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),

  getUser: (): User | null => {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  setUser: (user: User) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  clearUser: () => localStorage.removeItem(USER_KEY),

  clearAll: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

// API Fetcher with automatic error interception and Authorization Header
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = storage.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(endpoint, {
      ...options,
      headers,
    });
  } catch (err: any) {
    throw new Error('Unable to connect to DeadlineGuard server. Please check your network connection.');
  }

  if (response.status === 401) {
    storage.clearAll();
    window.dispatchEvent(new CustomEvent('deadlineguard:auth_expired'));
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Your session has expired. Please log in again.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server request failed with status ${response.status}`);
  }

  return response.json();
}

export const api = {
  auth: {
    login: async (email: string, password: string) => {
      const data = await apiFetch<{ message: string; token: string; user: User }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      storage.setToken(data.token);
      storage.setUser(data.user);
      return data;
    },
    register: async (name: string, email: string, password: string, confirmPassword: string) => {
      const data = await apiFetch<{ message: string; token: string; user: User }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, confirmPassword }),
      });
      storage.setToken(data.token);
      storage.setUser(data.user);
      return data;
    },
    getMe: async () => {
      return apiFetch<User>('/api/users/me');
    },
    updateProfile: async (data: { name?: string; reminderOffsetHours?: number; newPassword?: string }) => {
      return apiFetch<{ message: string; user: User }>('/api/users/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    logout: () => {
      storage.clearAll();
    },
  },

  dashboard: {
    get: async () => {
      return apiFetch<DashboardData>('/api/dashboard');
    },
  },

  tasks: {
    getAll: async (params?: { status?: string; priority?: string; subjectId?: string; search?: string; sort?: string }) => {
      const query = new URLSearchParams();
      if (params?.status) query.set('status', params.status);
      if (params?.priority) query.set('priority', params.priority);
      if (params?.subjectId) query.set('subjectId', params.subjectId);
      if (params?.search) query.set('search', params.search);
      if (params?.sort) query.set('sort', params.sort);

      const qs = query.toString();
      return apiFetch<Task[]>(`/api/tasks${qs ? `?${qs}` : ''}`);
    },
    getById: async (id: string) => {
      return apiFetch<Task>(`/api/tasks/${id}`);
    },
    create: async (task: Partial<Task>) => {
      return apiFetch<Task>('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(task),
      });
    },
    update: async (id: string, task: Partial<Task>) => {
      return apiFetch<Task>(`/api/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(task),
      });
    },
    delete: async (id: string) => {
      return apiFetch<{ message: string }>(`/api/tasks/${id}`, {
        method: 'DELETE',
      });
    },
    complete: async (id: string) => {
      return apiFetch<Task>(`/api/tasks/${id}/complete`, {
        method: 'PATCH',
      });
    },
    reopen: async (id: string) => {
      return apiFetch<Task>(`/api/tasks/${id}/reopen`, {
        method: 'PATCH',
      });
    },
  },

  subjects: {
    getAll: async () => {
      return apiFetch<Subject[]>('/api/subjects');
    },
    create: async (subject: Partial<Subject>) => {
      return apiFetch<Subject>('/api/subjects', {
        method: 'POST',
        body: JSON.stringify(subject),
      });
    },
    update: async (id: string, subject: Partial<Subject>) => {
      return apiFetch<Subject>(`/api/subjects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(subject),
      });
    },
    delete: async (id: string) => {
      return apiFetch<{ message: string }>(`/api/subjects/${id}`, {
        method: 'DELETE',
      });
    },
  },

  planner: {
    get: async () => {
      return apiFetch<PlannerData>('/api/planner');
    },
  },

  ai: {
    chat: async (message: string) => {
      return apiFetch<{ reply: string; savedRecommendationId?: string }>('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message }),
      });
    },
    generateStudyPlan: async (availableHours: number, targetDate: string) => {
      return apiFetch<{
        summary: string;
        totalAllocatedMinutes: number;
        blocks: Array<{
          timeRange: string;
          taskId?: string;
          taskTitle: string;
          subject: string;
          focusObjective: string;
          breakAfterMinutes: number;
        }>;
        studyTips: string[];
      }>('/api/ai/study-plan', {
        method: 'POST',
        body: JSON.stringify({ availableHours, targetDate }),
      });
    },
    getRecommendations: async () => {
      return apiFetch<AIRecommendation[]>('/api/ai/recommendations');
    },
  },

  studySessions: {
    getAll: async () => {
      return apiFetch<StudySession[]>('/api/study-sessions');
    },
    create: async (session: { taskId?: string; durationMinutes: number; plannedMinutes: number; completed?: boolean; notes?: string }) => {
      return apiFetch<StudySession>('/api/study-sessions', {
        method: 'POST',
        body: JSON.stringify(session),
      });
    },
  },

  notifications: {
    getAll: async () => {
      return apiFetch<NotificationItem[]>('/api/notifications');
    },
    markRead: async (id: string) => {
      return apiFetch<NotificationItem>(`/api/notifications/${id}/read`, {
        method: 'PATCH',
      });
    },
    markAllRead: async () => {
      return apiFetch<{ message: string }>('/api/notifications/read-all', {
        method: 'PATCH',
      });
    },
    delete: async (id: string) => {
      return apiFetch<{ message: string }>(`/api/notifications/${id}`, {
        method: 'DELETE',
      });
    },
  },

  analytics: {
    get: async () => {
      return apiFetch<AnalyticsData>('/api/analytics');
    },
  },

  seed: {
    reset: async () => {
      return apiFetch<{ message: string }>('/api/seed/reset', {
        method: 'POST',
      });
    },
  },
};
