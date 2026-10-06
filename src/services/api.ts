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
  PriorityLevel,
  TaskPriority,
} from '../types';

const TOKEN_KEY = 'deadlineguard_jwt_token';
const USER_KEY = 'deadlineguard_user';
const DB_STORAGE_KEY = 'deadlineguard_client_db';

export const storage = {
  getToken: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  setToken: (token: string) => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      // ignore
    }
  },
  clearToken: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // ignore
    }
  },

  getUser: (): User | null => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  setUser: (user: User) => {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      // ignore
    }
  },
  clearUser: () => {
    try {
      localStorage.removeItem(USER_KEY);
    } catch {
      // ignore
    }
  },

  clearAll: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      // ignore
    }
  },
};

// ==========================================
// 5-Factor Academic Priority Calculation Engine
// Matches server.ts formula:
// Urgency (40%) + Difficulty (20%) + Weight (20%) + Effort (10%) + Workload (10%)
// ==========================================
export function calculateTaskPriority(task: Partial<Task>, allPendingTasks: Task[] = []): TaskPriority {
  const now = new Date();
  const deadlineDate = new Date(task.deadline || new Date().toISOString());
  const diffHours = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  // 1. Urgency (40%)
  let urgency = 20;
  let urgencyReason = '';

  if (diffHours < 0) {
    urgency = 100;
    const overdueHours = Math.abs(Math.round(diffHours));
    urgencyReason = overdueHours > 24
      ? `OVERDUE by ${Math.floor(overdueHours / 24)} day(s)! Requires immediate remediation.`
      : `OVERDUE by ${overdueHours} hour(s)! Urgent attention needed.`;
  } else if (diffHours <= 12) {
    urgency = 98;
    urgencyReason = `Due within 12 hours (${Math.round(diffHours)}h remaining). Critical urgency.`;
  } else if (diffHours <= 24) {
    urgency = 88;
    urgencyReason = `Deadline is tomorrow (~${Math.round(diffHours)}h remaining). Highly pressing.`;
  } else if (diffHours <= 48) {
    urgency = 72;
    urgencyReason = `Deadline is within 2 days (${Math.round(diffHours)}h remaining).`;
  } else if (diffHours <= 72) {
    urgency = 55;
    urgencyReason = `Deadline in 3 days. Ample time if scheduled early.`;
  } else if (diffHours <= 168) {
    urgency = 35;
    urgencyReason = `Due this week (${Math.round(diffHours / 24)} days away).`;
  } else {
    urgency = 15;
    urgencyReason = `Due in more than a week (${Math.round(diffHours / 24)} days away).`;
  }

  // 2. Difficulty (20%)
  const difficulty = Math.min(5, Math.max(1, task.difficulty || 3));
  const difficultyScore = (difficulty / 5) * 100;
  const difficultyReason = difficulty >= 4
    ? `Difficulty is rated high (${difficulty}/5), requiring deep cognitive focus.`
    : difficulty === 3
    ? `Moderate complexity (${difficulty}/5).`
    : `Straightforward task difficulty (${difficulty}/5).`;

  // 3. Academic Weight (20%)
  const academicWeight = Math.min(5, Math.max(1, task.academicWeight || 3));
  const weightScore = (academicWeight / 5) * 100;
  const weightReason = academicWeight >= 4
    ? `Academic credit weight is high (${academicWeight}/5), strongly affecting GPA.`
    : academicWeight === 3
    ? `Standard course credit weight (${academicWeight}/5).`
    : `Minor credit impact (${academicWeight}/5).`;

  // 4. Estimated Effort (10%)
  const effort = Math.max(0.5, task.estimatedEffortHours || 2);
  let effortScore = 25;
  if (effort >= 8) effortScore = 100;
  else if (effort >= 5) effortScore = 85;
  else if (effort >= 3) effortScore = 65;
  else if (effort >= 2) effortScore = 45;
  const effortReason = `Estimated effort is ${effort} hour(s).`;

  // 5. Workload Cluster (10%)
  const otherPending = allPendingTasks.filter(t => t.id !== task.id);
  const pendingCount = otherPending.length;
  const closePendingCount = otherPending.filter(t => {
    const tDeadline = new Date(t.deadline);
    const dDiff = Math.abs(tDeadline.getTime() - deadlineDate.getTime()) / (1000 * 60 * 60);
    return dDiff <= 48;
  }).length;

  let workloadScore = 30;
  if (closePendingCount >= 3 || pendingCount >= 6) workloadScore = 100;
  else if (closePendingCount >= 2 || pendingCount >= 4) workloadScore = 75;
  else if (closePendingCount >= 1 || pendingCount >= 2) workloadScore = 50;

  const workloadReason = closePendingCount > 0
    ? `High cluster workload: ${closePendingCount} other deadline(s) due around the same time.`
    : `Manageable workload (${pendingCount} other pending task${pendingCount === 1 ? '' : 's'}).`;

  const rawScore =
    (urgency * 0.40) +
    (difficultyScore * 0.20) +
    (weightScore * 0.20) +
    (effortScore * 0.10) +
    (workloadScore * 0.10);

  const priorityScore = Math.round(Math.min(100, Math.max(0, rawScore)));

  let priorityLevel: PriorityLevel = 'Low';
  if (priorityScore >= 80) priorityLevel = 'Critical';
  else if (priorityScore >= 60) priorityLevel = 'High';
  else if (priorityScore >= 40) priorityLevel = 'Medium';
  else priorityLevel = 'Low';

  return {
    id: `prio-${task.id || Date.now()}`,
    taskId: task.id || '',
    priorityScore,
    priorityLevel,
    urgencyScore: Math.round(urgency),
    difficultyScore: Math.round(difficultyScore),
    weightScore: Math.round(weightScore),
    effortScore: Math.round(effortScore),
    workloadScore: Math.round(workloadScore),
    reasons: [urgencyReason, difficultyReason, weightReason, effortReason, workloadReason],
    calculatedAt: new Date().toISOString(),
  };
}

// ==========================================
// Client-Side In-Memory / LocalStorage Database
// Provides 100% offline & Netlify static hosting functionality
// ==========================================
interface LocalDatabase {
  users: Array<User & { passwordHash?: string }>;
  subjects: Subject[];
  tasks: Task[];
  studySessions: StudySession[];
  notifications: NotificationItem[];
}

function getSeedDatabase(): LocalDatabase {
  const defaultUser: User = {
    id: 'user-vignesh',
    name: 'Vignesh S',
    email: 'vs2513@srmist.edu.in',
    reminderOffsetHours: 24,
    createdAt: '2026-09-15T04:36:24.186Z',
  };

  const now = new Date();
  const addHours = (h: number) => new Date(now.getTime() + h * 3600 * 1000).toISOString();

  const subjects: Subject[] = [
    {
      id: 'sub-dsa',
      userId: defaultUser.id,
      name: 'Data Structures & Algorithms',
      code: 'CS2001',
      credits: 4,
      facultyName: 'Dr. K. Raman',
      academicWeight: 5,
      color: '#6366f1',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'sub-os',
      userId: defaultUser.id,
      name: 'Operating Systems',
      code: 'CS2002',
      credits: 4,
      facultyName: 'Prof. M. Anitha',
      academicWeight: 4,
      color: '#8b5cf6',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'sub-networks',
      userId: defaultUser.id,
      name: 'Computer Networks',
      code: 'CS2003',
      credits: 3,
      facultyName: 'Dr. S. Rajesh',
      academicWeight: 4,
      color: '#0ea5e9',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'sub-dbms',
      userId: defaultUser.id,
      name: 'Database Management Systems',
      code: 'CS2004',
      credits: 4,
      facultyName: 'Dr. P. Venkatesh',
      academicWeight: 3,
      color: '#10b981',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'sub-cloud',
      userId: defaultUser.id,
      name: 'Cloud Computing & DevOps',
      code: 'CS2005',
      credits: 3,
      facultyName: 'Prof. A. Priya',
      academicWeight: 4,
      color: '#f59e0b',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
  ];

  const initialTasks: Task[] = [
    {
      id: 'task-1',
      userId: defaultUser.id,
      subjectId: 'sub-networks',
      title: 'TCP/UDP Socket Programming Lab Report',
      description: 'Implement multi-threaded client-server echo application with packet loss metrics.',
      taskType: 'Lab',
      deadline: addHours(18),
      estimatedEffortHours: 3.5,
      difficulty: 4,
      academicWeight: 4,
      status: 'In Progress',
      notes: 'Need to capture Wireshark pcap traces before submitting.',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'task-2',
      userId: defaultUser.id,
      subjectId: 'sub-dsa',
      title: 'Red-Black Tree & B+ Tree Implementation',
      description: 'Construct balanced binary search trees and evaluate search/insertion rotation performance.',
      taskType: 'Assignment',
      deadline: addHours(42),
      estimatedEffortHours: 5,
      difficulty: 5,
      academicWeight: 5,
      status: 'Pending',
      notes: 'Double-check left-leaning red-black delete rotations.',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'task-3',
      userId: defaultUser.id,
      subjectId: 'sub-os',
      title: 'Virtual Memory & Page Replacement Simulator',
      description: 'Simulate LRU, FIFO, and Optimal page replacement algorithms with TLB miss telemetry.',
      taskType: 'Project',
      deadline: addHours(86),
      estimatedEffortHours: 6.5,
      difficulty: 5,
      academicWeight: 4,
      status: 'Pending',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'task-4',
      userId: defaultUser.id,
      subjectId: 'sub-dbms',
      title: 'SQL Query Optimization & Indexing Benchmark',
      description: 'Benchmark EXPLAIN ANALYZE on 1M rows with composite B-tree vs hash indexes.',
      taskType: 'Assignment',
      deadline: addHours(130),
      estimatedEffortHours: 2.5,
      difficulty: 3,
      academicWeight: 3,
      status: 'Pending',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'task-5',
      userId: defaultUser.id,
      subjectId: 'sub-cloud',
      title: 'Kubernetes Microservices CI/CD Pipeline',
      description: 'Containerize express/node microservice, configure Helm charts and ingress manifests.',
      taskType: 'Project',
      deadline: addHours(170),
      estimatedEffortHours: 4,
      difficulty: 4,
      academicWeight: 4,
      status: 'Pending',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'task-6',
      userId: defaultUser.id,
      subjectId: 'sub-os',
      title: 'Mid-Semester Operating Systems Preparation',
      description: 'Revise concurrency, Peterson algorithm, semaphores, monitors, and deadlock avoidance.',
      taskType: 'Exam',
      deadline: addHours(260),
      estimatedEffortHours: 10,
      difficulty: 5,
      academicWeight: 5,
      status: 'Pending',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
  ];

  // Calculate priorities for initial tasks
  const pending = initialTasks.filter(t => t.status !== 'Completed');
  initialTasks.forEach(t => {
    t.priority = calculateTaskPriority(t, pending);
  });

  const notifications: NotificationItem[] = [
    {
      id: 'notif-1',
      userId: defaultUser.id,
      taskId: 'task-1',
      title: 'Upcoming Deadline Alert',
      message: 'TCP/UDP Socket Programming Lab is due tomorrow. Recommended to allocate 2 Pomodoro blocks today.',
      type: 'deadline',
      read: false,
      scheduledFor: now.toISOString(),
      createdAt: now.toISOString(),
    },
    {
      id: 'notif-2',
      userId: defaultUser.id,
      taskId: 'task-2',
      title: 'High Cognitive Load Notice',
      message: 'Red-Black Tree Assignment carries 5/5 difficulty. Start early to avoid deadline crunch.',
      type: 'ai',
      read: false,
      scheduledFor: now.toISOString(),
      createdAt: now.toISOString(),
    },
  ];

  const studySessions: StudySession[] = [
    {
      id: 'sess-1',
      userId: defaultUser.id,
      taskId: 'task-1',
      durationMinutes: 50,
      plannedMinutes: 50,
      completed: true,
      notes: 'Completed socket server protocol loop and Wireshark trace.',
      createdAt: new Date(now.getTime() - 24 * 3600 * 1000).toISOString(),
    },
    {
      id: 'sess-2',
      userId: defaultUser.id,
      taskId: 'task-2',
      durationMinutes: 45,
      plannedMinutes: 50,
      completed: true,
      notes: 'Implemented BST node rotation and color flip.',
      createdAt: new Date(now.getTime() - 48 * 3600 * 1000).toISOString(),
    },
  ];

  return {
    users: [defaultUser],
    subjects,
    tasks: initialTasks,
    studySessions,
    notifications,
  };
}

function loadLocalDatabase(): LocalDatabase {
  try {
    const raw = localStorage.getItem(DB_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.tasks) && parsed.tasks.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }

  const seeded = getSeedDatabase();
  try {
    localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(seeded));
  } catch {
    // ignore
  }
  return seeded;
}

function saveLocalDatabase(db: LocalDatabase) {
  try {
    localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(db));
  } catch {
    // ignore
  }
}

// Global flag to remember if server is unreachable
let isServerAvailable: boolean | null = null;

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

  // If we already know the server is not available (e.g. Netlify static hosting), immediately throw so client fallback handles it
  if (isServerAvailable === false) {
    throw new Error('FALLBACK_TO_CLIENT_DB');
  }

  try {
    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    // Check if the response returned HTML (happens on Netlify when SPA rewrites /* to /index.html)
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      isServerAvailable = false;
      throw new Error('FALLBACK_TO_CLIENT_DB');
    }

    if (response.status === 404) {
      isServerAvailable = false;
      throw new Error('FALLBACK_TO_CLIENT_DB');
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

    isServerAvailable = true;
    return response.json();
  } catch (err: any) {
    if (err.message === 'FALLBACK_TO_CLIENT_DB' || err.name === 'TypeError') {
      isServerAvailable = false;
      throw new Error('FALLBACK_TO_CLIENT_DB');
    }
    throw err;
  }
}

// Helper to calculate fresh priorities
function recalculateAllPriorities(tasks: Task[]): Task[] {
  const pending = tasks.filter(t => t.status !== 'Completed');
  return tasks.map(t => {
    if (t.status === 'Completed') return t;
    return {
      ...t,
      priority: calculateTaskPriority(t, pending),
    };
  });
}

// Client-Side Database Fallback Handlers
const clientDb = {
  auth: {
    login: async (email: string, password?: string) => {
      const db = loadLocalDatabase();
      let user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        // Create student account on the fly for demo flexibility
        user = {
          id: `user-${Date.now()}`,
          name: email.split('@')[0] || 'Student',
          email,
          reminderOffsetHours: 24,
          createdAt: new Date().toISOString(),
        };
        db.users.push(user);
        saveLocalDatabase(db);
      }

      const token = `dg-client-token-${user.id}`;
      storage.setToken(token);
      storage.setUser(user);
      return { message: 'Logged in successfully', token, user };
    },

    register: async (name: string, email: string, _pass?: string, _cpass?: string) => {
      const db = loadLocalDatabase();
      const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        throw new Error('A user with this email address already exists.');
      }

      const user: User = {
        id: `user-${Date.now()}`,
        name,
        email,
        reminderOffsetHours: 24,
        createdAt: new Date().toISOString(),
      };
      db.users.push(user);
      saveLocalDatabase(db);

      const token = `dg-client-token-${user.id}`;
      storage.setToken(token);
      storage.setUser(user);
      return { message: 'Registered successfully', token, user };
    },

    getMe: async (): Promise<User> => {
      const stored = storage.getUser();
      if (stored) return stored;

      const db = loadLocalDatabase();
      const defaultUser = db.users[0] || {
        id: 'user-vignesh',
        name: 'Vignesh S',
        email: 'vs2513@srmist.edu.in',
        reminderOffsetHours: 24,
        createdAt: new Date().toISOString(),
      };
      storage.setUser(defaultUser);
      storage.setToken(`dg-client-token-${defaultUser.id}`);
      return defaultUser;
    },

    updateProfile: async (data: { name?: string; reminderOffsetHours?: number }) => {
      const db = loadLocalDatabase();
      const current = storage.getUser() || db.users[0];
      if (data.name) current.name = data.name;
      if (data.reminderOffsetHours) current.reminderOffsetHours = data.reminderOffsetHours;

      const idx = db.users.findIndex(u => u.id === current.id);
      if (idx !== -1) db.users[idx] = current;
      saveLocalDatabase(db);
      storage.setUser(current);
      return { message: 'Profile updated successfully', user: current };
    },
  },

  dashboard: {
    get: async (): Promise<DashboardData> => {
      const db = loadLocalDatabase();
      const user = storage.getUser() || db.users[0];
      const tasks = recalculateAllPriorities(db.tasks);
      db.tasks = tasks;
      saveLocalDatabase(db);

      const now = new Date();
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

      const pending = tasks.filter(t => t.status !== 'Completed');
      const completed = tasks.filter(t => t.status === 'Completed');

      const tasksDueToday = pending.filter(t => {
        const d = new Date(t.deadline);
        return d <= todayEnd && d >= now;
      }).length;

      const tasksOverdue = pending.filter(t => new Date(t.deadline) < now).length;
      const tasksHighPriority = pending.filter(t => t.priority?.priorityLevel === 'High' || t.priority?.priorityLevel === 'Critical').length;

      const totalTasks = tasks.length;
      const completionPercentage = totalTasks > 0 ? Math.round((completed.length / totalTasks) * 100) : 0;

      const studyHours = db.studySessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0) / 60;

      // Top priorities: sorted by score descending
      const topPriorities = [...pending].sort((a, b) => (b.priority?.priorityScore || 0) - (a.priority?.priorityScore || 0)).slice(0, 5);

      const aiInsight = tasksOverdue > 0
        ? `Warning: You have ${tasksOverdue} overdue item(s). Rebalance your workload and focus on highest credit weights first.`
        : tasksHighPriority > 0
        ? `Focus alert: ${tasksHighPriority} urgent or critical task(s) require attention today. Use Pomodoro study blocks.`
        : `Your academic schedule is balanced! Keep up the consistent study momentum.`;

      return {
        user: {
          id: user?.id || 'user-vignesh',
          name: user?.name || 'Vignesh S',
          email: user?.email || 'vs2513@srmist.edu.in',
        },
        overview: {
          tasksDueToday,
          tasksOverdue,
          tasksHighPriority,
          tasksCompleted: completed.length,
          tasksPending: pending.length,
          totalTasks,
        },
        productivity: {
          completionPercentage,
          studyHours: Math.round(studyHours * 10) / 10,
          tasksCompletedCount: completed.length,
          currentStreakDays: 4,
        },
        topPriorities,
        subjects: db.subjects,
        aiInsight,
      };
    },
  },

  tasks: {
    getAll: async (params?: { status?: string; priority?: string; subjectId?: string; search?: string; sort?: string }) => {
      const db = loadLocalDatabase();
      let tasks = recalculateAllPriorities(db.tasks);
      db.tasks = tasks;
      saveLocalDatabase(db);

      if (params?.status && params.status !== 'All') {
        tasks = tasks.filter(t => t.status === params.status);
      }
      if (params?.priority && params.priority !== 'All') {
        tasks = tasks.filter(t => t.priority?.priorityLevel === params.priority);
      }
      if (params?.subjectId && params.subjectId !== 'All') {
        tasks = tasks.filter(t => t.subjectId === params.subjectId);
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        tasks = tasks.filter(t => t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q)));
      }

      if (params?.sort === 'deadline') {
        tasks.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
      } else if (params?.sort === 'priority' || !params?.sort) {
        tasks.sort((a, b) => (b.priority?.priorityScore || 0) - (a.priority?.priorityScore || 0));
      }

      return tasks;
    },

    getById: async (id: string) => {
      const db = loadLocalDatabase();
      const task = db.tasks.find(t => t.id === id);
      if (!task) throw new Error('Task not found');
      return task;
    },

    create: async (taskData: Partial<Task>) => {
      const db = loadLocalDatabase();
      const user = storage.getUser() || db.users[0];
      const now = new Date().toISOString();

      const newTask: Task = {
        id: `task-${Date.now()}`,
        userId: user.id,
        subjectId: taskData.subjectId || db.subjects[0]?.id || 'sub-dsa',
        title: taskData.title || 'Untitled Task',
        description: taskData.description || '',
        taskType: taskData.taskType || 'Assignment',
        deadline: taskData.deadline || new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
        estimatedEffortHours: taskData.estimatedEffortHours || 2,
        difficulty: taskData.difficulty || 3,
        academicWeight: taskData.academicWeight || 3,
        status: taskData.status || 'Pending',
        notes: taskData.notes || '',
        createdAt: now,
        updatedAt: now,
      };

      const pending = db.tasks.filter(t => t.status !== 'Completed');
      newTask.priority = calculateTaskPriority(newTask, pending);

      db.tasks.unshift(newTask);
      saveLocalDatabase(db);
      return newTask;
    },

    update: async (id: string, updates: Partial<Task>) => {
      const db = loadLocalDatabase();
      const idx = db.tasks.findIndex(t => t.id === id);
      if (idx === -1) throw new Error('Task not found');

      const updated = {
        ...db.tasks[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      const pending = db.tasks.filter(t => t.id !== id && t.status !== 'Completed');
      if (updated.status !== 'Completed') {
        updated.priority = calculateTaskPriority(updated, pending);
      }

      db.tasks[idx] = updated;
      saveLocalDatabase(db);
      return updated;
    },

    delete: async (id: string) => {
      const db = loadLocalDatabase();
      db.tasks = db.tasks.filter(t => t.id !== id);
      saveLocalDatabase(db);
      return { message: 'Task deleted successfully' };
    },

    complete: async (id: string) => {
      const db = loadLocalDatabase();
      const idx = db.tasks.findIndex(t => t.id === id);
      if (idx === -1) throw new Error('Task not found');

      db.tasks[idx].status = 'Completed';
      db.tasks[idx].completedAt = new Date().toISOString();
      db.tasks[idx].updatedAt = new Date().toISOString();
      saveLocalDatabase(db);
      return db.tasks[idx];
    },

    reopen: async (id: string) => {
      const db = loadLocalDatabase();
      const idx = db.tasks.findIndex(t => t.id === id);
      if (idx === -1) throw new Error('Task not found');

      db.tasks[idx].status = 'In Progress';
      delete db.tasks[idx].completedAt;
      db.tasks[idx].updatedAt = new Date().toISOString();

      const pending = db.tasks.filter(t => t.id !== id && t.status !== 'Completed');
      db.tasks[idx].priority = calculateTaskPriority(db.tasks[idx], pending);

      saveLocalDatabase(db);
      return db.tasks[idx];
    },
  },

  subjects: {
    getAll: async () => {
      const db = loadLocalDatabase();
      return db.subjects;
    },
    create: async (sub: Partial<Subject>) => {
      const db = loadLocalDatabase();
      const user = storage.getUser() || db.users[0];
      const now = new Date().toISOString();

      const newSubject: Subject = {
        id: `sub-${Date.now()}`,
        userId: user.id,
        name: sub.name || 'New Subject',
        code: sub.code || 'CS' + Math.floor(1000 + Math.random() * 9000),
        credits: sub.credits || 3,
        facultyName: sub.facultyName || 'Department Faculty',
        academicWeight: sub.academicWeight || 3,
        color: sub.color || '#6366f1',
        createdAt: now,
        updatedAt: now,
      };

      db.subjects.push(newSubject);
      saveLocalDatabase(db);
      return newSubject;
    },
    update: async (id: string, updates: Partial<Subject>) => {
      const db = loadLocalDatabase();
      const idx = db.subjects.findIndex(s => s.id === id);
      if (idx === -1) throw new Error('Subject not found');

      db.subjects[idx] = {
        ...db.subjects[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      saveLocalDatabase(db);
      return db.subjects[idx];
    },
    delete: async (id: string) => {
      const db = loadLocalDatabase();
      db.subjects = db.subjects.filter(s => s.id !== id);
      saveLocalDatabase(db);
      return { message: 'Subject deleted successfully' };
    },
  },

  planner: {
    get: async (): Promise<PlannerData> => {
      const db = loadLocalDatabase();
      const tasks = recalculateAllPriorities(db.tasks);
      const pending = tasks.filter(t => t.status !== 'Completed');

      const now = new Date();
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      const tomorrowEnd = new Date(todayEnd.getTime() + 24 * 3600 * 1000);
      const weekEnd = new Date(todayEnd.getTime() + 7 * 24 * 3600 * 1000);

      const today = pending.filter(t => new Date(t.deadline) <= todayEnd);
      const tomorrow = pending.filter(t => {
        const d = new Date(t.deadline);
        return d > todayEnd && d <= tomorrowEnd;
      });
      const thisWeek = pending.filter(t => {
        const d = new Date(t.deadline);
        return d > tomorrowEnd && d <= weekEnd;
      });
      const later = pending.filter(t => new Date(t.deadline) > weekEnd);

      const scheduledBlocks = [
        {
          timeRange: '09:00 - 10:30',
          title: today[0]?.title || 'Deep Focus: Problem Solving',
          subjectName: db.subjects[0]?.name || 'Core Engineering',
          type: 'Deep Focus',
          completed: false,
          taskId: today[0]?.id,
        },
        {
          timeRange: '11:00 - 12:15',
          title: tomorrow[0]?.title || 'Lab & Practical Implementation',
          subjectName: db.subjects[1]?.name || 'Operating Systems',
          type: 'Implementation',
          completed: false,
          taskId: tomorrow[0]?.id,
        },
        {
          timeRange: '14:30 - 16:00',
          title: 'Revision & Peer Code Review',
          subjectName: db.subjects[2]?.name || 'Computer Networks',
          type: 'Review',
          completed: true,
        },
      ];

      return {
        today,
        tomorrow,
        thisWeek,
        later,
        scheduledBlocks,
      };
    },
  },

  ai: {
    chat: async (message: string) => {
      const db = loadLocalDatabase();
      const pending = db.tasks.filter(t => t.status !== 'Completed');
      const topTask = pending.sort((a, b) => (b.priority?.priorityScore || 0) - (a.priority?.priorityScore || 0))[0];

      let reply = `Based on your academic schedule, you have ${pending.length} pending tasks. `;
      if (topTask) {
        reply += `I recommend prioritizing "${topTask.title}" (${topTask.taskType}) which currently has the highest priority score of ${topTask.priority?.priorityScore ?? 85}/100. `;
        reply += `Break this task into 25-minute Pomodoro intervals to maintain steady cognitive focus.`;
      } else {
        reply += `All current coursework deadlines are clear! Use this time for advance reading or project brainstorming.`;
      }

      if (message.toLowerCase().includes('exam') || message.toLowerCase().includes('study plan')) {
        reply += `\n\nTip: For optimal retention, space out revision across 3 days rather than cramming the night before.`;
      }

      return { reply };
    },

    generateStudyPlan: async (availableHours: number, targetDate: string) => {
      const db = loadLocalDatabase();
      const pending = db.tasks.filter(t => t.status !== 'Completed');
      const topTasks = [...pending].sort((a, b) => (b.priority?.priorityScore || 0) - (a.priority?.priorityScore || 0)).slice(0, 3);

      const blocks = topTasks.map((t, idx) => {
        const startH = 9 + idx * 2;
        const timeRange = `${startH.toString().padStart(2, '0')}:00 - ${(startH + 1).toString().padStart(2, '0')}:30`;
        const subj = db.subjects.find(s => s.id === t.subjectId);
        return {
          timeRange,
          taskId: t.id,
          taskTitle: t.title,
          subject: subj?.name || 'Academic Course',
          focusObjective: `Target high-difficulty components of ${t.title}.`,
          breakAfterMinutes: 15,
        };
      });

      return {
        summary: `Optimized academic schedule for ${targetDate} allocating ~${availableHours} available hours across top priorities.`,
        totalAllocatedMinutes: Math.min(availableHours * 60, 240),
        blocks,
        studyTips: [
          'Hydrate between focus blocks.',
          'Review notes for 5 minutes at the conclusion of each block.',
          'Keep your workspace clutter-free.',
        ],
      };
    },

    getRecommendations: async (): Promise<AIRecommendation[]> => {
      const db = loadLocalDatabase();
      const pending = db.tasks.filter(t => t.status !== 'Completed');
      const topTasks = [...pending].sort((a, b) => (b.priority?.priorityScore || 0) - (a.priority?.priorityScore || 0)).slice(0, 2);

      return topTasks.map((t, idx) => ({
        id: `rec-${t.id}-${idx}`,
        userId: t.userId,
        taskId: t.id,
        title: `Priority Action: ${t.title}`,
        recommendation: `Allocate the next study block exclusively to ${t.title}. Estimated effort is ${t.estimatedEffortHours}h.`,
        rationale: t.priority?.reasons[0] || 'High credit impact and upcoming deadline.',
        priorityLevel: t.priority?.priorityLevel || 'High',
        urgencySummary: `${t.priority?.urgencyScore || 80}% urgency rating`,
        createdAt: new Date().toISOString(),
      }));
    },
  },

  studySessions: {
    getAll: async () => {
      const db = loadLocalDatabase();
      return db.studySessions;
    },
    create: async (session: { taskId?: string; durationMinutes: number; plannedMinutes: number; completed?: boolean; notes?: string }) => {
      const db = loadLocalDatabase();
      const user = storage.getUser() || db.users[0];
      const newSession: StudySession = {
        id: `sess-${Date.now()}`,
        userId: user.id,
        taskId: session.taskId,
        durationMinutes: session.durationMinutes,
        plannedMinutes: session.plannedMinutes,
        completed: session.completed ?? true,
        notes: session.notes,
        createdAt: new Date().toISOString(),
      };
      db.studySessions.push(newSession);
      saveLocalDatabase(db);
      return newSession;
    },
  },

  notifications: {
    getAll: async () => {
      const db = loadLocalDatabase();
      return db.notifications;
    },
    markRead: async (id: string) => {
      const db = loadLocalDatabase();
      const idx = db.notifications.findIndex(n => n.id === id);
      if (idx !== -1) {
        db.notifications[idx].read = true;
        saveLocalDatabase(db);
        return db.notifications[idx];
      }
      throw new Error('Notification not found');
    },
    markAllRead: async () => {
      const db = loadLocalDatabase();
      db.notifications.forEach(n => { n.read = true; });
      saveLocalDatabase(db);
      return { message: 'All notifications marked as read' };
    },
    delete: async (id: string) => {
      const db = loadLocalDatabase();
      db.notifications = db.notifications.filter(n => n.id !== id);
      saveLocalDatabase(db);
      return { message: 'Notification deleted' };
    },
  },

  analytics: {
    get: async (): Promise<AnalyticsData> => {
      const db = loadLocalDatabase();
      const tasks = recalculateAllPriorities(db.tasks);
      const completed = tasks.filter(t => t.status === 'Completed');
      const pending = tasks.filter(t => t.status !== 'Completed');
      const now = new Date();
      const overdue = pending.filter(t => new Date(t.deadline) < now);

      const studyHours = db.studySessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0) / 60;
      const completionRate = tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0;

      const subjectWorkload = db.subjects.map(s => {
        const subTasks = tasks.filter(t => t.subjectId === s.id);
        return {
          subjectId: s.id,
          name: s.name,
          code: s.code,
          color: s.color,
          pendingTasks: subTasks.filter(t => t.status !== 'Completed').length,
          completedTasks: subTasks.filter(t => t.status === 'Completed').length,
        };
      });

      const priorityDistribution = {
        Critical: tasks.filter(t => t.priority?.priorityLevel === 'Critical').length,
        High: tasks.filter(t => t.priority?.priorityLevel === 'High').length,
        Medium: tasks.filter(t => t.priority?.priorityLevel === 'Medium').length,
        Low: tasks.filter(t => t.priority?.priorityLevel === 'Low').length,
      };

      return {
        metrics: {
          tasksCompleted: completed.length,
          tasksPending: pending.length,
          tasksOverdue: overdue.length,
          studyHours: Math.round(studyHours * 10) / 10,
          completionRate,
          productivityStreakDays: 4,
        },
        weeklyDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        weeklyStudyHours: [2.5, 3.0, 1.5, 4.0, 3.5, 2.0, 1.0],
        weeklyCompletedTasks: [1, 2, 0, 3, 1, 2, 0],
        subjectWorkload,
        priorityDistribution,
      };
    },
  },

  seed: {
    reset: async () => {
      const seeded = getSeedDatabase();
      saveLocalDatabase(seeded);
      return { message: 'Database reset to default seed data' };
    },
  },
};

// Hybrid API Gateway: tries remote backend server first; seamlessly falls back to client database
export const api = {
  auth: {
    login: async (email: string, password: string) => {
      try {
        const data = await apiFetch<{ message: string; token: string; user: User }>('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        storage.setToken(data.token);
        storage.setUser(data.user);
        return data;
      } catch {
        return clientDb.auth.login(email, password);
      }
    },
    register: async (name: string, email: string, password: string, confirmPassword: string) => {
      try {
        const data = await apiFetch<{ message: string; token: string; user: User }>('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({ name, email, password, confirmPassword }),
        });
        storage.setToken(data.token);
        storage.setUser(data.user);
        return data;
      } catch {
        return clientDb.auth.register(name, email, password, confirmPassword);
      }
    },
    getMe: async () => {
      try {
        return await apiFetch<User>('/api/users/me');
      } catch {
        return clientDb.auth.getMe();
      }
    },
    updateProfile: async (data: { name?: string; reminderOffsetHours?: number; newPassword?: string }) => {
      try {
        return await apiFetch<{ message: string; user: User }>('/api/users/profile', {
          method: 'PUT',
          body: JSON.stringify(data),
        });
      } catch {
        return clientDb.auth.updateProfile(data);
      }
    },
    logout: () => {
      storage.clearAll();
    },
  },

  dashboard: {
    get: async () => {
      try {
        return await apiFetch<DashboardData>('/api/dashboard');
      } catch {
        return clientDb.dashboard.get();
      }
    },
  },

  tasks: {
    getAll: async (params?: { status?: string; priority?: string; subjectId?: string; search?: string; sort?: string }) => {
      try {
        const query = new URLSearchParams();
        if (params?.status) query.set('status', params.status);
        if (params?.priority) query.set('priority', params.priority);
        if (params?.subjectId) query.set('subjectId', params.subjectId);
        if (params?.search) query.set('search', params.search);
        if (params?.sort) query.set('sort', params.sort);
        const qs = query.toString();
        return await apiFetch<Task[]>(`/api/tasks${qs ? `?${qs}` : ''}`);
      } catch {
        return clientDb.tasks.getAll(params);
      }
    },
    getById: async (id: string) => {
      try {
        return await apiFetch<Task>(`/api/tasks/${id}`);
      } catch {
        return clientDb.tasks.getById(id);
      }
    },
    create: async (task: Partial<Task>) => {
      try {
        return await apiFetch<Task>('/api/tasks', {
          method: 'POST',
          body: JSON.stringify(task),
        });
      } catch {
        return clientDb.tasks.create(task);
      }
    },
    update: async (id: string, task: Partial<Task>) => {
      try {
        return await apiFetch<Task>(`/api/tasks/${id}`, {
          method: 'PUT',
          body: JSON.stringify(task),
        });
      } catch {
        return clientDb.tasks.update(id, task);
      }
    },
    delete: async (id: string) => {
      try {
        return await apiFetch<{ message: string }>(`/api/tasks/${id}`, {
          method: 'DELETE',
        });
      } catch {
        return clientDb.tasks.delete(id);
      }
    },
    complete: async (id: string) => {
      try {
        return await apiFetch<Task>(`/api/tasks/${id}/complete`, {
          method: 'PATCH',
        });
      } catch {
        return clientDb.tasks.complete(id);
      }
    },
    reopen: async (id: string) => {
      try {
        return await apiFetch<Task>(`/api/tasks/${id}/reopen`, {
          method: 'PATCH',
        });
      } catch {
        return clientDb.tasks.reopen(id);
      }
    },
  },

  subjects: {
    getAll: async () => {
      try {
        return await apiFetch<Subject[]>('/api/subjects');
      } catch {
        return clientDb.subjects.getAll();
      }
    },
    create: async (subject: Partial<Subject>) => {
      try {
        return await apiFetch<Subject>('/api/subjects', {
          method: 'POST',
          body: JSON.stringify(subject),
        });
      } catch {
        return clientDb.subjects.create(subject);
      }
    },
    update: async (id: string, subject: Partial<Subject>) => {
      try {
        return await apiFetch<Subject>(`/api/subjects/${id}`, {
          method: 'PUT',
          body: JSON.stringify(subject),
        });
      } catch {
        return clientDb.subjects.update(id, subject);
      }
    },
    delete: async (id: string) => {
      try {
        return await apiFetch<{ message: string }>(`/api/subjects/${id}`, {
          method: 'DELETE',
        });
      } catch {
        return clientDb.subjects.delete(id);
      }
    },
  },

  planner: {
    get: async () => {
      try {
        return await apiFetch<PlannerData>('/api/planner');
      } catch {
        return clientDb.planner.get();
      }
    },
  },

  ai: {
    chat: async (message: string) => {
      try {
        return await apiFetch<{ reply: string; savedRecommendationId?: string }>('/api/ai/chat', {
          method: 'POST',
          body: JSON.stringify({ message }),
        });
      } catch {
        return clientDb.ai.chat(message);
      }
    },
    generateStudyPlan: async (availableHours: number, targetDate: string) => {
      try {
        return await apiFetch<{
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
      } catch {
        return clientDb.ai.generateStudyPlan(availableHours, targetDate);
      }
    },
    getRecommendations: async () => {
      try {
        return await apiFetch<AIRecommendation[]>('/api/ai/recommendations');
      } catch {
        return clientDb.ai.getRecommendations();
      }
    },
  },

  studySessions: {
    getAll: async () => {
      try {
        return await apiFetch<StudySession[]>('/api/study-sessions');
      } catch {
        return clientDb.studySessions.getAll();
      }
    },
    create: async (session: { taskId?: string; durationMinutes: number; plannedMinutes: number; completed?: boolean; notes?: string }) => {
      try {
        return await apiFetch<StudySession>('/api/study-sessions', {
          method: 'POST',
          body: JSON.stringify(session),
        });
      } catch {
        return clientDb.studySessions.create(session);
      }
    },
  },

  notifications: {
    getAll: async () => {
      try {
        return await apiFetch<NotificationItem[]>('/api/notifications');
      } catch {
        return clientDb.notifications.getAll();
      }
    },
    markRead: async (id: string) => {
      try {
        return await apiFetch<NotificationItem>(`/api/notifications/${id}/read`, {
          method: 'PATCH',
        });
      } catch {
        return clientDb.notifications.markRead(id);
      }
    },
    markAllRead: async () => {
      try {
        return await apiFetch<{ message: string }>('/api/notifications/read-all', {
          method: 'PATCH',
        });
      } catch {
        return clientDb.notifications.markAllRead();
      }
    },
    delete: async (id: string) => {
      try {
        return await apiFetch<{ message: string }>(`/api/notifications/${id}`, {
          method: 'DELETE',
        });
      } catch {
        return clientDb.notifications.delete(id);
      }
    },
  },

  analytics: {
    get: async () => {
      try {
        return await apiFetch<AnalyticsData>('/api/analytics');
      } catch {
        return clientDb.analytics.get();
      }
    },
  },

  seed: {
    reset: async () => {
      try {
        return await apiFetch<{ message: string }>('/api/seed/reset', {
          method: 'POST',
        });
      } catch {
        return clientDb.seed.reset();
      }
    },
  },
};
