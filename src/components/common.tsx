import React from 'react';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Calendar, 
  Layers, 
  Flame, 
  ChevronRight, 
  X,
  Info,
  BookOpen,
  ArrowUpRight
} from 'lucide-react';
import { PriorityLevel, TaskPriority } from '../types';

export function getPriorityColor(level?: PriorityLevel) {
  switch (level) {
    case 'Critical':
      return {
        text: 'text-rose-600 dark:text-rose-400',
        bg: 'bg-rose-500/10 border-rose-500/30',
        indicator: 'bg-rose-500',
        label: 'Critical',
      };
    case 'High':
      return {
        text: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-500/10 border-amber-500/30',
        indicator: 'bg-amber-500',
        label: 'High',
      };
    case 'Medium':
      return {
        text: 'text-indigo-600 dark:text-indigo-400',
        bg: 'bg-indigo-500/10 border-indigo-500/30',
        indicator: 'bg-indigo-500',
        label: 'Medium',
      };
    case 'Low':
    default:
      return {
        text: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-500/10 border-emerald-500/30',
        indicator: 'bg-emerald-500',
        label: 'Low',
      };
  }
}

export function PriorityBadge({ 
  level, 
  score, 
  onClick 
}: { 
  level?: PriorityLevel; 
  score?: number; 
  onClick?: () => void;
}) {
  const conf = getPriorityColor(level);
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all ${conf.bg} ${conf.text} ${onClick ? 'cursor-pointer hover:opacity-85 active:scale-95' : 'cursor-default'}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${conf.indicator}`} />
      <span>{conf.label}</span>
      {score !== undefined && (
        <span className="opacity-80 font-mono text-[11px]">({score})</span>
      )}
      {onClick && <Info className="w-3 h-3 ml-0.5 opacity-70" />}
    </button>
  );
}

export function DeadlineCountdown({ deadline, status }: { deadline: string; status?: string }) {
  const now = new Date();
  const d = new Date(deadline);
  const diffMs = d.getTime() - now.getTime();
  const isCompleted = status === 'Completed';

  if (isCompleted) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Completed
      </span>
    );
  }

  if (diffMs < 0) {
    const hoursOver = Math.abs(Math.round(diffMs / (1000 * 60 * 60)));
    const daysOver = Math.floor(hoursOver / 24);
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 animate-pulse">
        <AlertTriangle className="w-3.5 h-3.5" />
        OVERDUE {daysOver > 0 ? `by ${daysOver}d` : `by ${hoursOver}h`}
      </span>
    );
  }

  const hours = Math.round(diffMs / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;

  let text = '';
  let isUrgent = false;

  if (days > 1) {
    text = `${days} days ${remHours > 0 ? `${remHours}h` : ''} remaining`;
  } else if (days === 1) {
    text = `1 day ${remHours}h remaining`;
    isUrgent = true;
  } else if (hours > 0) {
    text = `${hours} hours remaining`;
    isUrgent = true;
  } else {
    const mins = Math.max(1, Math.round(diffMs / (1000 * 60)));
    text = `Due in ${mins} minutes`;
    isUrgent = true;
  }

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${isUrgent ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
      <Clock className="w-3.5 h-3.5" />
      {text}
    </span>
  );
}

export function SubjectChip({ 
  name, 
  code, 
  color 
}: { 
  name: string; 
  code?: string; 
  color?: string 
}) {
  return (
    <div className="inline-flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
      <span 
        className="w-2 h-2 rounded-full flex-shrink-0" 
        style={{ backgroundColor: color || '#6366f1' }} 
      />
      <span className="font-medium truncate max-w-[140px]">{name}</span>
      {code && (
        <>
          <span className="text-slate-300 dark:text-slate-600">·</span>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{code}</span>
        </>
      )}
    </div>
  );
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accentColor = 'text-indigo-600 dark:text-indigo-400',
  bgColor = 'bg-indigo-50/50 dark:bg-indigo-950/20',
  onClick,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor?: string;
  bgColor?: string;
  onClick?: () => void;
}) {
  return (
    <div 
      onClick={onClick}
      className={`p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all ${onClick ? 'cursor-pointer hover:border-indigo-400/50 hover:shadow-sm active:scale-98' : ''}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{title}</span>
        <div className={`p-1.5 rounded-lg ${bgColor} ${accentColor}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
        {value}
      </div>
      {subtitle && (
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
          {subtitle}
        </div>
      )}
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
  loading,
  className = '',
  type = 'button',
  icon: Icon,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      <span>{children}</span>
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
  disabled,
  className = '',
  type = 'button',
  icon: Icon,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-sm transition-all duration-150 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {Icon && <Icon className="w-4 h-4 text-slate-500" />}
      <span>{children}</span>
    </button>
  );
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon = Calendar,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="py-12 px-6 text-center flex flex-col items-center justify-center">
      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
        {title}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed mb-4">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline py-1 px-3 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
        >
          {actionLabel} →
        </button>
      )}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-center my-4">
      <AlertTriangle className="w-6 h-6 text-rose-500 mx-auto mb-2" />
      <p className="text-xs text-rose-700 dark:text-rose-300 font-medium mb-3">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-500 active:scale-95 transition-all"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="py-12 flex flex-col items-center justify-center gap-3">
      <div className="w-7 h-7 border-2 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin" />
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{message}</span>
    </div>
  );
}

// Priority Explanation Bottom Sheet (Section 13)
export function PriorityExplanationSheet({
  isOpen,
  onClose,
  taskTitle,
  priority,
}: {
  isOpen: boolean;
  onClose: () => void;
  taskTitle: string;
  priority?: TaskPriority;
}) {
  if (!isOpen || !priority) return null;

  const conf = getPriorityColor(priority.priorityLevel);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs transition-opacity p-0 sm:p-4">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-4 duration-200"
        role="dialog"
      >
        {/* Handle */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-3 sm:hidden" />

        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2 h-2 rounded-full ${conf.indicator}`} />
              <span className={`text-xs font-bold uppercase tracking-wider ${conf.text}`}>
                {priority.priorityLevel} Priority ({priority.priorityScore}/100)
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
              Why this priority was calculated
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs mt-0.5">
              Task: {taskTitle}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Formula formula breakdown banner */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Intelligent 5-Factor Formula
            </span>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono space-y-0.5">
              <div>Urgency (40%) + Difficulty (20%) + Academic Weight (20%)</div>
              <div>+ Estimated Effort (10%) + Workload (10%)</div>
            </div>
          </div>

          {/* Factor Scores Bars */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-400">Urgency (40% Weight)</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">{priority.urgencyScore}/100</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full transition-all" style={{ width: `${priority.urgencyScore}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-400">Difficulty (20% Weight)</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">{priority.difficultyScore}/100</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${priority.difficultyScore}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-400">Academic Weight (20% Weight)</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">{priority.weightScore}/100</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${priority.weightScore}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-400">Estimated Effort (10% Weight)</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">{priority.effortScore}/100</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${priority.effortScore}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-400">Current Workload (10% Weight)</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">{priority.workloadScore}/100</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${priority.workloadScore}%` }} />
              </div>
            </div>
          </div>

          {/* Explainable Reasons */}
          <div className="pt-2">
            <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-2">
              Explainable Rationale
            </h4>
            <div className="space-y-2">
              {priority.reasons.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                  <span className="leading-relaxed">{reason}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <PrimaryButton onClick={onClose}>
            Got it, close
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

// Confirm Delete Dialog (Section 35)
export function ConfirmDeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xl animate-in zoom-in-95 duration-150">
        <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          {title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-5">
          {message}
        </p>
        <div className="flex gap-2">
          <SecondaryButton onClick={onClose} className="flex-1">
            Cancel
          </SecondaryButton>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-xs bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white transition-all shadow-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
