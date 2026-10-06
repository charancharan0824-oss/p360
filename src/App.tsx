import React, { useState, useEffect, useCallback } from 'react';
import { 
  User, 
  Task, 
  Subject, 
  DashboardData, 
  PlannerData, 
  NotificationItem 
} from './types';
import { api, storage } from './services/api';
import { AuthScreen } from './screens/AuthScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { TasksScreen } from './screens/TasksScreen';
import { PlannerScreen } from './screens/PlannerScreen';
import { AIScreen } from './screens/AIScreen';
import { FocusScreen } from './screens/FocusScreen';
import { SubjectsScreen } from './screens/SubjectsScreen';
import { AnalyticsScreen } from './screens/AnalyticsScreen';
import { NotificationCenterScreen } from './screens/NotificationCenterScreen';
import { ProfileSettingsScreen } from './screens/ProfileSettingsScreen';
import { TaskFormModal } from './screens/TaskFormModal';
import { PriorityExplanationSheet } from './components/common';
import { 
  SidebarNavigation, 
  AppTopBar, 
  TabType 
} from './components/Navigation';

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Auth state
  const [user, setUser] = useState<User | null>(storage.getUser());
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  // Active navigation tab (unified across all primary & secondary sections)
  const [currentTab, setCurrentTab] = useState<TabType>('home');

  // Responsive mobile sidebar menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Modal states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  // Priority explanation modal & Focus task target
  const [explainingTask, setExplainingTask] = useState<Task | null>(null);
  const [focusTask, setFocusTask] = useState<Task | null>(null);

  // Data states
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [plannerData, setPlannerData] = useState<PlannerData | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Apply dark mode to document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Auth expiration listener
  useEffect(() => {
    const handleAuthExpired = () => {
      setUser(null);
      setError('Your session has expired. Please log in again.');
    };
    window.addEventListener('deadlineguard:auth_expired', handleAuthExpired);
    return () => window.removeEventListener('deadlineguard:auth_expired', handleAuthExpired);
  }, []);

  // Check auth session on startup
  useEffect(() => {
    const verifySession = async () => {
      const token = storage.getToken();
      if (!token) {
        setCheckingAuth(false);
        return;
      }
      try {
        const me = await api.auth.getMe();
        setUser(me);
        storage.setUser(me);
      } catch (err) {
        storage.clearAll();
        setUser(null);
      } finally {
        setCheckingAuth(false);
      }
    };
    verifySession();
  }, []);

  // Fetch all core application data
  const loadAllData = useCallback(async () => {
    if (!storage.getToken()) return;
    setLoading(true);
    setError(null);
    try {
      const [dash, tList, sList, planner, notifs] = await Promise.all([
        api.dashboard.get().catch(() => null),
        api.tasks.getAll().catch(() => []),
        api.subjects.getAll().catch(() => []),
        api.planner.get().catch(() => null),
        api.notifications.getAll().catch(() => []),
      ]);

      if (dash) setDashboardData(dash);
      setTasks(tList);
      setSubjects(sList);
      if (planner) setPlannerData(planner);
      setNotifications(notifs);
    } catch (err: any) {
      setError(err.message || 'Error loading application data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user, loadAllData]);

  // Actions
  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setCurrentTab('home');
  };

  const handleLogout = () => {
    api.auth.logout();
    setUser(null);
    setDashboardData(null);
    setTasks([]);
    setSubjects([]);
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    if (taskToEdit) {
      await api.tasks.update(taskToEdit.id, taskData);
    } else {
      await api.tasks.create(taskData);
    }
    setTaskToEdit(null);
    loadAllData();
  };

  const handleDeleteTask = async (taskId: string) => {
    await api.tasks.delete(taskId);
    loadAllData();
  };

  const handleCompleteTask = async (taskId: string) => {
    await api.tasks.complete(taskId);
    loadAllData();
  };

  const handleReopenTask = async (taskId: string) => {
    await api.tasks.reopen(taskId);
    loadAllData();
  };

  const handleResetSeedData = async () => {
    await api.seed.reset();
    await loadAllData();
  };

  const handleStartFocus = (task: Task) => {
    setFocusTask(task);
    setCurrentTab('focus');
  };

  const handleAskAI = (task?: Task) => {
    setCurrentTab('ai');
  };

  // If not authenticated, show full-screen web AuthScreen
  if (!user && !checkingAuth) {
    return (
      <div className={`w-full min-h-screen ${isDark ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'} flex flex-col transition-colors`}>
        <AuthScreen onAuthSuccess={handleAuthSuccess} isDark={isDark} onToggleDark={() => setIsDark(!isDark)} />
      </div>
    );
  }

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;
  const pendingTasksCount = tasks.filter((t) => t.status !== 'Completed').length;

  const getTabSubtitle = (tab: TabType) => {
    switch (tab) {
      case 'home':
        return 'Academic Overview & Priority Matrix';
      case 'tasks':
        return 'Academic Task Matrix';
      case 'planner':
        return 'Study Schedule & Time Blocks';
      case 'subjects':
        return 'Course Subjects & Credit Weights';
      case 'ai':
        return 'Academic Workload Advisor';
      case 'analytics':
        return 'Productivity & Workload Telemetry';
      case 'focus':
        return 'Pomodoro Focus Session';
      case 'notifications':
        return 'Deadline Alerts & Reminders';
      case 'profile':
        return 'Account & Preferences';
      default:
        return 'Never Miss a Deadline.';
    }
  };

  return (
    <div className={`w-full min-h-screen flex flex-col transition-colors ${isDark ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Top Full-Width Header */}
      <AppTopBar
        title="DeadlineGuard AI"
        subtitle={getTabSubtitle(currentTab)}
        unreadNotifications={unreadNotificationsCount}
        onOpenNotifications={() => setCurrentTab('notifications')}
        onOpenFocusMode={() => {
          setFocusTask(tasks.find((t) => t.status !== 'Completed') || null);
          setCurrentTab('focus');
        }}
        onOpenSubjects={() => setCurrentTab('subjects')}
        onOpenCreateTask={() => {
          setTaskToEdit(null);
          setIsTaskModalOpen(true);
        }}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isDark={isDark}
        onToggleDark={() => setIsDark(!isDark)}
        user={user}
        onOpenProfile={() => setCurrentTab('profile')}
      />

      {/* Main Web Application Body: Sidebar + Full-Width Content Area */}
      <div className="flex-1 flex w-full">
        <SidebarNavigation
          currentTab={currentTab}
          onTabChange={(tab) => setCurrentTab(tab)}
          unreadNotifications={unreadNotificationsCount}
          pendingTasksCount={pendingTasksCount}
          onOpenCreateTask={() => {
            setTaskToEdit(null);
            setIsTaskModalOpen(true);
          }}
          user={user}
          onLogout={handleLogout}
          isMobileMenuOpen={isMobileMenuOpen}
          onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 min-w-0 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {currentTab === 'home' && (
              <DashboardScreen
                data={dashboardData}
                loading={loading}
                error={error}
                onRefresh={loadAllData}
                onOpenCreateTask={() => {
                  setTaskToEdit(null);
                  setIsTaskModalOpen(true);
                }}
                onOpenTaskDetail={(t) => setExplainingTask(t)}
                onExplainPriority={(t) => setExplainingTask(t)}
                onStartFocus={handleStartFocus}
                onAskAI={handleAskAI}
                onCompleteTask={handleCompleteTask}
                onReopenTask={handleReopenTask}
                onNavigateToTab={(tab) => setCurrentTab(tab)}
              />
            )}

            {currentTab === 'tasks' && (
              <TasksScreen
                tasks={tasks}
                subjects={subjects}
                loading={loading}
                error={error}
                onRefresh={loadAllData}
                onOpenCreateTask={() => {
                  setTaskToEdit(null);
                  setIsTaskModalOpen(true);
                }}
                onOpenEditTask={(t) => {
                  setTaskToEdit(t);
                  setIsTaskModalOpen(true);
                }}
                onDeleteTask={handleDeleteTask}
                onCompleteTask={handleCompleteTask}
                onReopenTask={handleReopenTask}
                onExplainPriority={(t) => setExplainingTask(t)}
                onStartFocus={handleStartFocus}
                onAskAI={handleAskAI}
              />
            )}

            {currentTab === 'planner' && (
              <PlannerScreen
                plannerData={plannerData}
                subjects={subjects}
                loading={loading}
                error={error}
                onRefresh={loadAllData}
                onStartFocus={handleStartFocus}
                onExplainPriority={(t) => setExplainingTask(t)}
                onAskAI={handleAskAI}
              />
            )}

            {currentTab === 'subjects' && (
              <SubjectsScreen
                subjects={subjects}
                tasks={tasks}
                loading={loading}
                onRefresh={loadAllData}
              />
            )}

            {currentTab === 'ai' && (
              <AIScreen
                tasks={tasks}
                onStartFocus={handleStartFocus}
              />
            )}

            {currentTab === 'analytics' && (
              <AnalyticsScreen />
            )}

            {currentTab === 'focus' && (
              <FocusScreen
                tasks={tasks}
                subjects={subjects}
                selectedTaskFromProps={focusTask}
                onSessionSaved={() => {
                  loadAllData();
                }}
              />
            )}

            {currentTab === 'notifications' && (
              <NotificationCenterScreen
                notifications={notifications}
                loading={loading}
                onRefresh={loadAllData}
              />
            )}

            {currentTab === 'profile' && (
              <ProfileSettingsScreen
                user={user}
                isDark={isDark}
                onToggleDark={() => setIsDark(!isDark)}
                onLogout={handleLogout}
                onResetSeedData={handleResetSeedData}
                onUpdateUser={(u) => setUser(u)}
              />
            )}
          </div>
        </main>
      </div>

      {/* Create / Edit Task Modal Form */}
      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        subjects={subjects}
        onSubjectCreated={(newSub) => {
          setSubjects((prev) => [...prev, newSub]);
          loadAllData();
        }}
        onNavigateToSubjects={() => setCurrentTab('subjects')}
      />

      {/* Priority Explanation Modal */}
      <PriorityExplanationSheet
        isOpen={Boolean(explainingTask)}
        onClose={() => setExplainingTask(null)}
        taskTitle={explainingTask?.title || ''}
        priority={explainingTask?.priority}
      />
    </div>
  );
}
