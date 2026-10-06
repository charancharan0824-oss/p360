import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Plus, 
  Sparkles,
  Play,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  LayoutGrid,
  List,
  Check
} from 'lucide-react';
import { Task, Subject } from '../types';
import { TaskCard } from '../components/TaskCard';
import { 
  PriorityBadge, 
  DeadlineCountdown, 
  SubjectChip, 
  EmptyState, 
  LoadingState, 
  ErrorState, 
  ConfirmDeleteDialog 
} from '../components/common';

export function TasksScreen({
  tasks,
  subjects,
  loading,
  error,
  onRefresh,
  onOpenCreateTask,
  onOpenEditTask,
  onDeleteTask,
  onCompleteTask,
  onReopenTask,
  onExplainPriority,
  onStartFocus,
  onAskAI,
}: {
  tasks: Task[];
  subjects: Subject[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onOpenCreateTask: () => void;
  onOpenEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onCompleteTask: (taskId: string) => void;
  onReopenTask: (taskId: string) => void;
  onExplainPriority: (task: Task) => void;
  onStartFocus: (task: Task) => void;
  onAskAI: (task?: Task) => void;
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'In Progress' | 'Completed' | 'Overdue'>('All');
  const [priorityFilter, setPriorityFilter] = useState<'All' | 'Critical' | 'High' | 'Medium' | 'Low'>('All');
  const [subjectFilter, setSubjectFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'priority' | 'deadline' | 'difficulty'>('priority');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Selected task for full detail modal
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Client-side filtering & sorting
  const now = new Date();
  const filteredTasks = tasks.filter((t) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const subj = subjects.find((s) => s.id === t.subjectId);
      const match =
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        subj?.name.toLowerCase().includes(q) ||
        subj?.code.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (statusFilter === 'Pending' && t.status !== 'Pending') return false;
    if (statusFilter === 'In Progress' && t.status !== 'In Progress') return false;
    if (statusFilter === 'Completed' && t.status !== 'Completed') return false;
    if (statusFilter === 'Overdue') {
      const isOver = t.status !== 'Completed' && new Date(t.deadline) < now;
      if (!isOver) return false;
    }

    if (priorityFilter !== 'All' && t.priority?.priorityLevel !== priorityFilter) return false;
    if (subjectFilter !== 'All' && t.subjectId !== subjectFilter) return false;

    return true;
  });

  filteredTasks.sort((a, b) => {
    if (sortBy === 'deadline') {
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
    if (sortBy === 'difficulty') {
      return (b.difficulty || 0) - (a.difficulty || 0);
    }
    return (b.priority?.priorityScore || 0) - (a.priority?.priorityScore || 0);
  });

  const activeSubject = selectedTask ? subjects.find((s) => s.id === selectedTask.subjectId) : null;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Page Header & CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Assignments & Tasks
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {filteredTasks.length} academic task{filteredTasks.length === 1 ? '' : 's'} matching active filters
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Desktop View Mode Toggle */}
          <div className="hidden md:flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenCreateTask}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Desktop Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-xl">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, topic, or description..."
              className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status filters */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 text-xs">
            {(['All', 'Pending', 'In Progress', 'Completed', 'Overdue'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Priority & Sorting Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Priority:
            </span>
            {(['All', 'Critical', 'High', 'Medium', 'Low'] as const).map((pr) => (
              <button
                key={pr}
                type="button"
                onClick={() => setPriorityFilter(pr)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer ${
                  priorityFilter === pr
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {pr}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {subjects.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-400">Subject:</span>
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-800 border-none text-xs font-semibold text-slate-700 dark:text-slate-300 rounded-lg px-2.5 py-1 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="All">All Subjects ({subjects.length})</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code ? `${s.name} (${s.code})` : s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] text-slate-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-100 dark:bg-slate-800 border-none text-xs font-semibold text-slate-700 dark:text-slate-300 rounded-lg px-2.5 py-1 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="priority">Priority Score</option>
                <option value="deadline">Deadline Date</option>
                <option value="difficulty">Cognitive Difficulty</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Task List Content */}
      {loading && tasks.length === 0 ? (
        <LoadingState message="Loading tasks and priority matrix..." />
      ) : error ? (
        <ErrorState message={error} onRetry={onRefresh} />
      ) : filteredTasks.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <EmptyState
            title="No tasks found"
            description={
              search || statusFilter !== 'All' || priorityFilter !== 'All'
                ? 'No tasks match your active filters. Try clearing your search or filters.'
                : 'No tasks yet. Create your first task to start protecting your deadlines.'
            }
            actionLabel="Create Task"
            onAction={onOpenCreateTask}
          />
        </div>
      ) : viewMode === 'table' ? (
        /* Desktop Data Table View */
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4 w-10">Done</th>
                  <th className="py-3 px-4">Task & Type</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Deadline</th>
                  <th className="py-3 px-4 text-right">Effort / Diff</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800">
                {filteredTasks.map((task) => {
                  const subj = subjects.find((s) => s.id === task.subjectId);
                  const isCompleted = task.status === 'Completed';

                  return (
                    <tr
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer ${
                        isCompleted ? 'opacity-65' : ''
                      }`}
                    >
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => {
                            if (isCompleted) onReopenTask(task.id);
                            else onCompleteTask(task.id);
                          }}
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                            isCompleted
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 dark:border-slate-600 hover:border-indigo-600 bg-white dark:bg-slate-800'
                          }`}
                        >
                          {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className={`font-bold text-slate-900 dark:text-white ${isCompleted ? 'line-through text-slate-400' : ''}`}>
                          {task.title}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {task.taskType}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <SubjectChip
                          name={subj?.name || 'General'}
                          code={subj?.code}
                          color={subj?.color}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <DeadlineCountdown deadline={task.deadline} status={task.status} />
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-300">
                        {task.estimatedEffortHours}h · {task.difficulty}/5
                      </td>
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <PriorityBadge
                          level={task.priority?.priorityLevel}
                          score={task.priority?.priorityScore}
                          onClick={() => onExplainPriority(task)}
                        />
                      </td>
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center justify-end gap-1.5">
                          {!isCompleted && (
                            <button
                              type="button"
                              onClick={() => onStartFocus(task)}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 cursor-pointer"
                            >
                              Focus
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onOpenEditTask(task)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setTaskToDelete(task)}
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Multi-Column Responsive Card Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredTasks.map((task) => {
            const subj = subjects.find((s) => s.id === task.subjectId);
            return (
              <TaskCard
                key={task.id}
                task={task}
                subject={subj}
                onComplete={onCompleteTask}
                onReopen={onReopenTask}
                onClick={(t) => setSelectedTask(t)}
                onExplainPriority={onExplainPriority}
                onStartFocus={onStartFocus}
                onAskAI={onAskAI}
              />
            );
          })}
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between">
              <div>
                <SubjectChip 
                  name={activeSubject?.name || 'General Academic'} 
                  code={activeSubject?.code} 
                  color={activeSubject?.color} 
                />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1 leading-snug">
                  {selectedTask.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">
                    Deadline Schedule
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                    {new Date(selectedTask.deadline).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
                <DeadlineCountdown deadline={selectedTask.deadline} status={selectedTask.status} />
              </div>

              <div className="p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/40 dark:bg-indigo-950/20 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 block mb-0.5">
                    Priority Intelligence
                  </span>
                  <div className="flex items-center gap-2">
                    <PriorityBadge 
                      level={selectedTask.priority?.priorityLevel} 
                      score={selectedTask.priority?.priorityScore} 
                    />
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      (0-100 Normalized)
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onExplainPriority(selectedTask);
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 cursor-pointer"
                >
                  Explain Why →
                </button>
              </div>

              {selectedTask.description && (
                <div>
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Description & Objectives
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    {selectedTask.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Effort</span>
                  <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">{selectedTask.estimatedEffortHours} hrs</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Difficulty</span>
                  <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">{selectedTask.difficulty}/5</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Credits Weight</span>
                  <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">{selectedTask.academicWeight}/5</span>
                </div>
              </div>

              {selectedTask.notes && (
                <div>
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Student Study Notes
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 italic bg-amber-50/50 dark:bg-amber-950/20 p-2.5 rounded-xl border border-amber-200/50 dark:border-amber-900/50">
                    "{selectedTask.notes}"
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  onStartFocus(selectedTask);
                  setSelectedTask(null);
                }}
                className="flex-1 py-2.5 px-3 rounded-xl font-semibold text-xs bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Focus Session
              </button>

              <button
                type="button"
                onClick={() => {
                  onAskAI(selectedTask);
                  setSelectedTask(null);
                }}
                className="py-2.5 px-3 rounded-xl font-semibold text-xs bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 border border-purple-200 dark:border-purple-800 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Ask AI
              </button>

              {selectedTask.status === 'Completed' ? (
                <button
                  type="button"
                  onClick={() => {
                    onReopenTask(selectedTask.id);
                    setSelectedTask(null);
                  }}
                  className="py-2.5 px-3 rounded-xl font-medium text-xs border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  Reopen
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onCompleteTask(selectedTask.id);
                    setSelectedTask(null);
                  }}
                  className="py-2.5 px-3 rounded-xl font-semibold text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Complete
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  onOpenEditTask(selectedTask);
                  setSelectedTask(null);
                }}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                title="Edit Task"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setTaskToDelete(selectedTask);
                  setSelectedTask(null);
                }}
                className="p-2.5 rounded-xl border border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-600 cursor-pointer"
                title="Delete Task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDeleteDialog
        isOpen={Boolean(taskToDelete)}
        onClose={() => setTaskToDelete(null)}
        onConfirm={() => {
          if (taskToDelete) onDeleteTask(taskToDelete.id);
        }}
        title="Delete Academic Task?"
        message={`Are you sure you want to delete "${taskToDelete?.title}"? This will remove its deadline schedule and priority tracking.`}
      />
    </div>
  );
}
