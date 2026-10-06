export type TaskType = 'Assignment' | 'Exam' | 'Project' | 'Lab' | 'Presentation' | 'Quiz' | 'Other';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';
export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface TaskPriority {
  id: string;
  taskId: string;
  priorityScore: number;
  priorityLevel: PriorityLevel;
  urgencyScore: number;
  difficultyScore: number;
  weightScore: number;
  effortScore: number;
  workloadScore: number;
  reasons: string[];
  calculatedAt: string;
}

export interface Task {
  id: string;
  userId: string;
  subjectId: string;
  title: string;
  description: string;
  taskType: TaskType;
  deadline: string;
  estimatedEffortHours: number;
  difficulty: number;
  academicWeight: number;
  status: TaskStatus;
  notes?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  priority?: TaskPriority;
}

export interface Subject {
  id: string;
  userId: string;
  name: string;
  code: string;
  credits?: number;
  facultyName: string;
  academicWeight: number;
  color: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  reminderOffsetHours?: number;
  createdAt: string;
}

export interface StudySession {
  id: string;
  userId: string;
  taskId?: string;
  durationMinutes: number;
  plannedMinutes: number;
  completed: boolean;
  notes?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  taskId?: string;
  title: string;
  message: string;
  type: 'deadline' | 'overdue' | 'study' | 'ai' | 'system';
  read: boolean;
  scheduledFor: string;
  createdAt: string;
}

export interface AIRecommendation {
  id: string;
  userId: string;
  taskId?: string;
  title: string;
  recommendation: string;
  rationale: string;
  priorityLevel: PriorityLevel;
  urgencySummary: string;
  createdAt: string;
}

export interface DashboardData {
  user: {
    id: string;
    name: string;
    email: string;
  };
  overview: {
    tasksDueToday: number;
    tasksOverdue: number;
    tasksHighPriority: number;
    tasksCompleted: number;
    tasksPending: number;
    totalTasks: number;
  };
  productivity: {
    completionPercentage: number;
    studyHours: number;
    tasksCompletedCount: number;
    currentStreakDays: number;
  };
  topPriorities: Task[];
  subjects: Subject[];
  aiInsight: string;
}

export interface PlannerBlock {
  timeRange: string;
  title: string;
  subjectName: string;
  type: string;
  completed: boolean;
  taskId?: string;
}

export interface PlannerData {
  today: Task[];
  tomorrow: Task[];
  thisWeek: Task[];
  later: Task[];
  scheduledBlocks: PlannerBlock[];
}

export interface AnalyticsData {
  metrics: {
    tasksCompleted: number;
    tasksPending: number;
    tasksOverdue: number;
    studyHours: number;
    completionRate: number;
    productivityStreakDays: number;
  };
  weeklyDays: string[];
  weeklyStudyHours: number[];
  weeklyCompletedTasks: number[];
  subjectWorkload: {
    subjectId: string;
    name: string;
    code: string;
    color: string;
    pendingTasks: number;
    completedTasks: number;
  }[];
  priorityDistribution: {
    Critical: number;
    High: number;
    Medium: number;
    Low: number;
  };
}
