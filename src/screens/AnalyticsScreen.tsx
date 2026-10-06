import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  RefreshCw 
} from 'lucide-react';
import { AnalyticsData } from '../types';
import { api } from '../services/api';
import { StatCard, LoadingState, ErrorState } from '../components/common';

export function AnalyticsScreen({
  onClose,
}: {
  onClose?: () => void;
}) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.analytics.get();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading && !data) {
    return <LoadingState message="Aggregating academic analytics..." />;
  }

  if (error && !data) {
    return <ErrorState message={error} onRetry={fetchAnalytics} />;
  }

  if (!data) return null;

  const maxWeeklyHours = Math.max(...data.weeklyStudyHours, 4);

  return (
    <div className="space-y-6 pb-12">
      {/* Desktop Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Productivity Analytics</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time coursework completion metrics, study hours, and subject workload distribution.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAnalytics}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Refresh metrics"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Primary 4-Column KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Completed Tasks"
          value={data.metrics.tasksCompleted}
          subtitle={`${data.metrics.completionRate}% overall completion rate`}
          icon={CheckCircle2}
          accentColor="text-emerald-600 dark:text-emerald-400"
          bgColor="bg-emerald-500/10"
        />
        <StatCard
          title="Pending Tasks"
          value={data.metrics.tasksPending}
          subtitle={data.metrics.tasksOverdue > 0 ? `${data.metrics.tasksOverdue} overdue` : 'All on schedule'}
          icon={AlertTriangle}
          accentColor="text-rose-600 dark:text-rose-400"
          bgColor="bg-rose-500/10"
        />
        <StatCard
          title="Total Study Hours"
          value={`${data.metrics.studyHours}h`}
          subtitle="Logged focus session duration"
          icon={Clock}
          accentColor="text-indigo-600 dark:text-indigo-400"
          bgColor="bg-indigo-500/10"
        />
        <StatCard
          title="Active Streak"
          value={`${data.metrics.productivityStreakDays} Days`}
          subtitle="Consecutive study days"
          icon={Flame}
          accentColor="text-amber-600 dark:text-amber-400"
          bgColor="bg-amber-500/10"
        />
      </div>

      {/* Desktop 2-Column Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Study Hours Bar Chart */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Weekly Study Hours
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Daily Pomodoro focus blocks logged</p>
            </div>
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 font-mono">
              {data.metrics.studyHours}h Total
            </span>
          </div>

          {/* Desktop-dimension Bar Visualizer */}
          <div className="pt-6 pb-2">
            <div className="flex items-end justify-between h-56 gap-4 px-2">
              {data.weeklyDays.map((day, idx) => {
                const hours = data.weeklyStudyHours[idx] || 0;
                const heightPct = Math.round((hours / maxWeeklyHours) * 100);
                const isToday = idx === 6;

                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 font-semibold">
                      {hours}h
                    </span>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-xl h-full max-h-44 flex items-end overflow-hidden p-1">
                      <div
                        className={`w-full rounded-t-lg transition-all duration-500 ${
                          isToday
                            ? 'bg-indigo-600 dark:bg-indigo-500'
                            : 'bg-indigo-400/80 dark:bg-indigo-800/80 group-hover:bg-indigo-500'
                        }`}
                        style={{ height: `${Math.max(8, heightPct)}%` }}
                      />
                    </div>
                    <span className={`text-xs font-semibold ${isToday ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                      {day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Subject-wise Workload Distribution */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Subject-wise Workload Distribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pending vs. completed tasks across enrolled courses
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {data.subjectWorkload.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-center text-xs text-slate-500 dark:text-slate-400">
                No subjects added yet. Add subjects in Subject Management to track course-level workload distribution.
              </div>
            ) : (
              data.subjectWorkload.map((sw) => {
                const total = sw.pendingTasks + sw.completedTasks;
                const completionPct = total > 0 ? Math.round((sw.completedTasks / total) * 100) : 0;

                return (
                  <div key={sw.subjectId} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0" 
                          style={{ backgroundColor: sw.color }} 
                        />
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {sw.name}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">{sw.code}</span>
                      </div>
                      <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                        {sw.pendingTasks} pending · {completionPct}% done
                      </span>
                    </div>

                    <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${completionPct}%` }}
                      />
                      <div 
                        className="h-full opacity-60 transition-all duration-300"
                        style={{ 
                          backgroundColor: sw.color, 
                          width: `${100 - completionPct}%` 
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Priority Distribution Breakdown */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Pending Priority Distribution
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Breakdown of active coursework by 5-factor priority tier
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40">
            <span className="text-rose-600 dark:text-rose-400 font-bold block text-2xl font-mono">
              {data.priorityDistribution.Critical}
            </span>
            <span className="text-xs font-semibold text-rose-700 dark:text-rose-300 mt-1 block">Critical Priority</span>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
            <span className="text-amber-600 dark:text-amber-400 font-bold block text-2xl font-mono">
              {data.priorityDistribution.High}
            </span>
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 mt-1 block">High Priority</span>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40">
            <span className="text-indigo-600 dark:text-indigo-400 font-bold block text-2xl font-mono">
              {data.priorityDistribution.Medium}
            </span>
            <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 mt-1 block">Medium Priority</span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold block text-2xl font-mono">
              {data.priorityDistribution.Low}
            </span>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mt-1 block">Low Priority</span>
          </div>
        </div>
      </div>
    </div>
  );
}
