import React from 'react';
import { 
  Check, 
  Clock, 
  Flame, 
  Sparkles, 
  Play, 
  MoreVertical, 
  ExternalLink,
  ChevronRight,
  BarChart3,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Task, Subject } from '../types';
import { PriorityBadge, DeadlineCountdown, SubjectChip } from './common';

export function TaskCard({
  task,
  subject,
  onComplete,
  onReopen,
  onClick,
  onExplainPriority,
  onStartFocus,
  onAskAI,
}: {
  task: Task;
  subject?: Subject;
  onComplete?: (taskId: string) => void;
  onReopen?: (taskId: string) => void;
  onClick?: (task: Task) => void;
  onExplainPriority?: (task: Task) => void;
  onStartFocus?: (task: Task) => void;
  onAskAI?: (task: Task) => void;
}) {
  const isCompleted = task.status === 'Completed';
  const isCritical = task.priority?.priorityLevel === 'Critical';

  return (
    <div 
      className={`group relative p-4 rounded-2xl border transition-all duration-200 bg-white dark:bg-slate-900 ${
        isCritical && !isCompleted
          ? 'border-rose-300/80 dark:border-rose-900/60 shadow-xs'
          : 'border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700 hover:shadow-xs'
      } ${isCompleted ? 'opacity-70 bg-slate-50/50 dark:bg-slate-900/40' : ''}`}
    >
      {/* Top row: Subject & Priority */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <SubjectChip 
          name={subject?.name || 'General Academic'} 
          code={subject?.code} 
          color={subject?.color} 
        />
        <PriorityBadge 
          level={task.priority?.priorityLevel} 
          score={task.priority?.priorityScore} 
          onClick={onExplainPriority ? () => onExplainPriority(task) : undefined}
        />
      </div>

      {/* Title & Checkbox */}
      <div className="flex items-start gap-3 my-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (isCompleted && onReopen) onReopen(task.id);
            else if (!isCompleted && onComplete) onComplete(task.id);
          }}
          className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
            isCompleted 
              ? 'bg-emerald-600 border-emerald-600 text-white' 
              : 'border-slate-300 dark:border-slate-600 hover:border-indigo-600 dark:hover:border-indigo-400 bg-white dark:bg-slate-800'
          }`}
          title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        <div className="flex-1 cursor-pointer" onClick={() => onClick && onClick(task)}>
          <h4 className={`text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 ${isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
            {task.title}
          </h4>

          {task.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
              {task.description}
            </p>
          )}
        </div>
      </div>

      {/* Metadata Row: Zero-pill text discipline with subtle separators */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
        <DeadlineCountdown deadline={task.deadline} status={task.status} />

        <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
        <span>{task.estimatedEffortHours}h effort</span>

        <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
        <span>Diff {task.difficulty}/5</span>

        {task.taskType && (
          <>
            <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
            <span className="capitalize">{task.taskType}</span>
          </>
        )}
      </div>

      {/* Quick Action Bar */}
      {!isCompleted && (
        <div className="flex items-center justify-end gap-1.5 mt-2.5 pt-2 border-t border-slate-50 dark:border-slate-800/50">
          {onStartFocus && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onStartFocus(task);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/60 transition-colors"
            >
              <Play className="w-3 h-3 fill-current" />
              Focus
            </button>
          )}

          {onAskAI && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAskAI(task);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-950/60 transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              Ask AI
            </button>
          )}

          {onClick && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClick(task);
              }}
              className="inline-flex items-center p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-auto"
              title="View details"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
