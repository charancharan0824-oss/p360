import React from 'react';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Plus, 
  Flame, 
  ArrowRight, 
  Calendar,
  ChevronRight,
  TrendingUp,
  BookOpen,
  BarChart3
} from 'lucide-react';
import { DashboardData, Task } from '../types';
import { StatCard, LoadingState, ErrorState } from '../components/common';
import { TaskCard } from '../components/TaskCard';

export function DashboardScreen({
  data,
  loading,
  error,
  onRefresh,
  onOpenCreateTask,
  onOpenTaskDetail,
  onExplainPriority,
  onStartFocus,
  onAskAI,
  onCompleteTask,
  onReopenTask,
  onNavigateToTab,
}: {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onOpenCreateTask: () => void;
  onOpenTaskDetail: (task: Task) => void;
  onExplainPriority: (task: Task) => void;
  onStartFocus: (task: Task) => void;
  onAskAI: (task?: Task) => void;
  onCompleteTask: (taskId: string) => void;
  onReopenTask: (taskId: string) => void;
  onNavigateToTab: (tab: any) => void;
}) {
  if (loading && !data) {
    return <LoadingState message="Loading your deadline matrix..." />;
  }

  if (error && !data) {
    return <ErrorState message={error} onRetry={onRefresh} />;
  }

  if (!data) {
    return <LoadingState message="Loading your deadline matrix..." />;
  }

  // Determine dynamic time-based greeting
  const hour = new Date().getHours();
  let timeGreeting = 'Good morning';
  if (hour >= 12 && hour < 17) timeGreeting = 'Good afternoon';
  else if (hour >= 17) timeGreeting = 'Good evening';

  const userFirstName = data.user?.name ? data.user.name.split(' ')[0] : 'Student';

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Desktop Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Student Dashboard
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
            {timeGreeting}, {userFirstName}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monitor upcoming deadlines, 5-factor task priorities, and AI study recommendations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => onNavigateToTab('analytics')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Analytics</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateToTab('planner')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Study Planner</span>
          </button>

          <button
            type="button"
            onClick={onOpenCreateTask}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* 2. Overdue Alert Banner */}
      {data.overview.tasksOverdue > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-600 text-white shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-rose-900 dark:text-rose-200">
                Immediate Action Needed: {data.overview.tasksOverdue} Overdue Task{data.overview.tasksOverdue === 1 ? '' : 's'}
              </h4>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5 leading-relaxed">
                These deadlines have passed. Submit today to minimize late grade penalties.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateToTab('tasks')}
            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1 self-start sm:self-center shrink-0 transition-colors cursor-pointer"
          >
            <span>Review Tasks</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. Today's Overview KPI Cards (4-column desktop row) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Due Today"
          value={data.overview.tasksDueToday}
          subtitle={data.overview.tasksDueToday > 0 ? 'Urgent attention required' : 'All clear today'}
          icon={Clock}
          accentColor="text-amber-600 dark:text-amber-400"
          bgColor="bg-amber-500/10"
          onClick={() => onNavigateToTab('tasks')}
        />
        <StatCard
          title="Overdue"
          value={data.overview.tasksOverdue}
          subtitle={data.overview.tasksOverdue > 0 ? 'Needs immediate submission' : '0 overdue tasks'}
          icon={AlertTriangle}
          accentColor="text-rose-600 dark:text-rose-400"
          bgColor="bg-rose-500/10"
          onClick={() => onNavigateToTab('tasks')}
        />
        <StatCard
          title="High Priority"
          value={data.overview.tasksHighPriority}
          subtitle="Critical & High ranked"
          icon={Flame}
          accentColor="text-indigo-600 dark:text-indigo-400"
          bgColor="bg-indigo-500/10"
          onClick={() => onNavigateToTab('tasks')}
        />
        <StatCard
          title="Completed"
          value={data.overview.tasksCompleted}
          subtitle={`${data.productivity.completionPercentage}% of total tasks`}
          icon={CheckCircle2}
          accentColor="text-emerald-600 dark:text-emerald-400"
          bgColor="bg-emerald-500/10"
          onClick={() => onNavigateToTab('tasks')}
        />
      </div>

      {/* 4. Main Desktop 2-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left/Main Column (8 cols): Top Priorities + Active Subjects */}
        <div className="lg:col-span-8 space-y-6">
          {/* Top Priorities Section */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Your Top Priorities
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Ranked by urgency (40%), difficulty (20%), credit weight (20%), effort & workload
                </p>
              </div>

              <button
                type="button"
                onClick={() => onNavigateToTab('tasks')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All ({data.overview.tasksPending})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {data.topPriorities.length === 0 ? (
              <div className="p-10 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  Zero pending deadlines!
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  You are completely caught up. Add a new assignment or study ahead.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.topPriorities.map((task) => {
                  const subj = data.subjects.find((s) => s.id === task.subjectId);
                  return (
                    <TaskCard
                      key={task.id}
                      task={task}
                      subject={subj}
                      onComplete={onCompleteTask}
                      onReopen={onReopenTask}
                      onClick={onOpenTaskDetail}
                      onExplainPriority={onExplainPriority}
                      onStartFocus={onStartFocus}
                      onAskAI={onAskAI}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Enrolled Course Subjects Summary */}
          {data.subjects && data.subjects.length > 0 && (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Enrolled Course Subjects
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateToTab('subjects')}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Manage Subjects</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {data.subjects.map((sub) => (
                  <div
                    key={sub.id}
                    onClick={() => onNavigateToTab('subjects')}
                    className="p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 flex items-center gap-3 cursor-pointer transition-all"
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0"
                      style={{ backgroundColor: sub.color || '#4f46e5' }}
                    >
                      {sub.code ? sub.code.slice(0, 4) : sub.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {sub.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {sub.code} · {sub.academicWeight} Credits
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (4 cols): AI Guard Insight + Productivity Metric + Focus Block */}
        <div className="lg:col-span-4 space-y-6">
          {/* AI Insight Card */}
          <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white border border-indigo-800/50 shadow-md">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="inline-flex items-center gap-1.5 text-indigo-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>AI Guard Recommendation</span>
              </div>
              <button
                type="button"
                onClick={() => onAskAI()}
                className="text-xs font-semibold text-indigo-200 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Open AI Advisor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm font-medium text-slate-100 leading-relaxed">
              "{data.aiInsight}"
            </p>

            {data.topPriorities.length > 0 && (
              <div className="mt-4 pt-3.5 border-t border-indigo-800/50 flex flex-col gap-2.5 text-xs">
                <div className="text-indigo-200/90">
                  Highest urgency: <span className="font-semibold text-white">{data.topPriorities[0].title}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onStartFocus(data.topPriorities[0])}
                  className="w-full py-2 px-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-xs transition-colors cursor-pointer text-center"
                >
                  Start 25m Focus Session
                </button>
              </div>
            )}
          </div>

          {/* Productivity Summary Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Productivity Metric</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Consistent academic progress</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300 text-xs font-bold">
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>{data.productivity.currentStreakDays}d Streak</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                  {data.productivity.completionPercentage}%
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Completion</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="text-lg font-bold font-mono text-indigo-600 dark:text-indigo-400">
                  {data.productivity.studyHours}h
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Study Hours</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {data.productivity.tasksCompletedCount}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Done Tasks</div>
              </div>
            </div>
          </div>

          {/* Quick Study Session Banner */}
          <div className="p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20 space-y-3">
            <div>
              <h4 className="text-sm font-bold text-indigo-950 dark:text-indigo-200">
                Ready for a Focus Block?
              </h4>
              <p className="text-xs text-indigo-700/80 dark:text-indigo-300/80 mt-1 leading-relaxed">
                Pomodoro 25/5 or 50/10 intervals logged directly to your academic transcript and analytics.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigateToTab('focus')}
                className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition-all cursor-pointer"
              >
                Open Focus Timer
              </button>
              <button
                type="button"
                onClick={() => onNavigateToTab('planner')}
                className="py-2 px-3 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 transition-all cursor-pointer"
              >
                Study Planner
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
