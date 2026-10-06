import React from 'react';
import { 
  Home, 
  CheckSquare, 
  Calendar, 
  Sparkles, 
  User as UserIcon, 
  Bell, 
  Timer, 
  BookOpen, 
  BarChart3,
  Moon,
  Sun,
  Menu,
  X,
  Plus,
  LogOut,
  GraduationCap
} from 'lucide-react';
import { User } from '../types';

export type TabType = 
  | 'home' 
  | 'tasks' 
  | 'planner' 
  | 'subjects' 
  | 'ai' 
  | 'analytics' 
  | 'focus' 
  | 'notifications' 
  | 'profile';

export interface NavItemConfig {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export function SidebarNavigation({
  currentTab,
  onTabChange,
  unreadNotifications = 0,
  pendingTasksCount = 0,
  onOpenCreateTask,
  user,
  onLogout,
  isMobileMenuOpen,
  onCloseMobileMenu,
}: {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  unreadNotifications?: number;
  pendingTasksCount?: number;
  onOpenCreateTask?: () => void;
  user?: User | null;
  onLogout?: () => void;
  isMobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
}) {
  const navItems: NavItemConfig[] = [
    { id: 'home', label: 'Dashboard', icon: Home },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, badge: pendingTasksCount > 0 ? pendingTasksCount : undefined },
    { id: 'planner', label: 'Study Planner', icon: Calendar },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'ai', label: 'AI Assistant', icon: Sparkles },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'focus', label: 'Focus Mode', icon: Timer },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifications > 0 ? unreadNotifications : undefined },
    { id: 'profile', label: 'Settings', icon: UserIcon },
  ];

  const handleSelect = (tab: TabType) => {
    onTabChange(tab);
    onCloseMobileMenu();
  };

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 select-none">
      {/* Quick Action Button */}
      {onOpenCreateTask && (
        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              onOpenCreateTask();
              onCloseMobileMenu();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Academic Task</span>
          </button>
        </div>
      )}

      {/* Primary Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Workspace Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400 stroke-[2.2]' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    item.id === 'notifications'
                      ? 'bg-rose-600 text-white'
                      : isActive
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* User Footer */}
      {user && (
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => handleSelect('profile')}
              className="flex items-center gap-2.5 min-w-0 flex-1 text-left hover:opacity-85 transition-opacity cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                {user.name ? user.name.slice(0, 2).toUpperCase() : 'ST'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {user.name}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                  <GraduationCap className="w-3 h-3 text-indigo-500 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
              </div>
            </button>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 border-r border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 min-h-[calc(100vh-4rem)] sticky top-16 self-start">
        {renderSidebarContent()}
      </aside>

      {/* Mobile & Tablet Slide-Over Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobileMenu}
          />
          <div className="relative w-72 max-w-[85vw] bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col z-10 border-r border-slate-200 dark:border-slate-800">
            <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-bold text-sm">
                  DG
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  DeadlineGuard AI
                </span>
              </div>
              <button
                type="button"
                onClick={onCloseMobileMenu}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {renderSidebarContent()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function AppTopBar({
  title = 'DeadlineGuard AI',
  subtitle,
  onOpenNotifications,
  onOpenFocusMode,
  onOpenSubjects,
  onOpenCreateTask,
  onToggleMobileMenu,
  unreadNotifications = 0,
  isDark,
  onToggleDark,
  user,
  onOpenProfile,
}: {
  title?: string;
  subtitle?: string;
  onOpenNotifications?: () => void;
  onOpenFocusMode?: () => void;
  onOpenSubjects?: () => void;
  onOpenCreateTask?: () => void;
  onToggleMobileMenu?: () => void;
  unreadNotifications?: number;
  isDark?: boolean;
  onToggleDark?: () => void;
  user?: User | null;
  onOpenProfile?: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 w-full h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="flex items-center justify-between h-full w-full">
        {/* Left: Hamburger (Mobile/Tablet) + Brand & Context */}
        <div className="flex items-center gap-3">
          {onToggleMobileMenu && (
            <button
              type="button"
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 -ml-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              DG
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  {title}
                </span>
                {subtitle && (
                  <>
                    <span className="hidden sm:inline text-slate-300 dark:text-slate-700">·</span>
                    <span className="hidden sm:inline text-xs font-medium text-slate-500 dark:text-slate-400">
                      {subtitle}
                    </span>
                  </>
                )}
              </div>
              <p className="sm:hidden text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[180px]">
                {subtitle || 'Never Miss a Deadline.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2">
          {onOpenCreateTask && (
            <button
              type="button"
              onClick={onOpenCreateTask}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Task</span>
            </button>
          )}

          {onOpenFocusMode && (
            <button
              type="button"
              onClick={onOpenFocusMode}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-950 transition-colors cursor-pointer"
              title="Start Focus Timer"
            >
              <Timer className="w-4 h-4" />
              <span className="hidden md:inline">Focus Mode</span>
            </button>
          )}

          {onOpenSubjects && (
            <button
              type="button"
              onClick={onOpenSubjects}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Course Subjects"
            >
              <BookOpen className="w-4 h-4" />
            </button>
          )}

          {onOpenNotifications && (
            <button
              type="button"
              onClick={onOpenNotifications}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </button>
          )}

          {onToggleDark && (
            <button
              type="button"
              onClick={onToggleDark}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          )}

          {user && onOpenProfile && (
            <button
              type="button"
              onClick={onOpenProfile}
              className="hidden sm:flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Student Profile & Settings"
            >
              <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
                {user.name ? user.name.slice(0, 2).toUpperCase() : 'ST'}
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 max-w-[120px] truncate">
                {user.name.split(' ')[0]}
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
