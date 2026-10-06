import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Check, 
  AlertCircle,
  Search
} from 'lucide-react';
import { Subject, Task } from '../types';
import { api } from '../services/api';
import { PrimaryButton, SecondaryButton, ConfirmDeleteDialog, LoadingState } from '../components/common';

export function SubjectsScreen({
  subjects,
  tasks,
  loading,
  onRefresh,
  onSubjectCreated,
  onSubjectUpdated,
  onSubjectDeleted,
  onClose,
}: {
  subjects: Subject[];
  tasks: Task[];
  loading: boolean;
  onRefresh: () => void;
  onSubjectCreated?: (subject: Subject) => void;
  onSubjectUpdated?: (subject: Subject) => void;
  onSubjectDeleted?: (subjectId: string) => void;
  onClose?: () => void;
}) {
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form fields
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [credits, setCredits] = useState<number>(4);
  const [facultyName, setFacultyName] = useState('');
  const [color, setColor] = useState('#4f46e5');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const colors = [
    '#4f46e5', // Indigo
    '#0d9488', // Teal
    '#ea580c', // Orange
    '#7c3aed', // Purple
    '#e11d48', // Rose
    '#0284c7', // Sky
    '#16a34a', // Emerald
    '#d97706', // Amber
  ];

  const handleOpenCreate = () => {
    setName('');
    setCode('');
    setCredits(4);
    setFacultyName('');
    setColor(colors[subjects.length % colors.length] || '#4f46e5');
    setError(null);
    setIsCreating(true);
    setEditingSubject(null);
  };

  const handleOpenEdit = (sub: Subject) => {
    setName(sub.name);
    setCode(sub.code);
    setCredits(sub.credits ?? sub.academicWeight ?? 4);
    setFacultyName(sub.facultyName || '');
    setColor(sub.color || '#4f46e5');
    setError(null);
    setEditingSubject(sub);
    setIsCreating(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Subject Name is required.');
      return;
    }
    if (!code.trim()) {
      setError('Subject Code is required.');
      return;
    }

    const numericCredits = Number(credits);
    if (isNaN(numericCredits) || numericCredits <= 0) {
      setError('Credits must be a positive number.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        credits: numericCredits,
        academicWeight: Math.max(1, Math.min(5, Math.round(numericCredits))),
        facultyName: facultyName.trim(),
        color,
      };

      if (editingSubject) {
        const updated = await api.subjects.update(editingSubject.id, payload);
        if (onSubjectUpdated) onSubjectUpdated(updated);
      } else {
        const created = await api.subjects.create(payload);
        if (onSubjectCreated) onSubjectCreated(created);
      }
      onRefresh();
      setIsCreating(false);
      setEditingSubject(null);
    } catch (err: any) {
      setError(err.message || 'Failed to save subject.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.subjects.delete(id);
      if (onSubjectDeleted) onSubjectDeleted(id);
      onRefresh();
    } catch (err) {
      console.error('Failed to delete subject:', err);
    }
  };

  const totalCredits = subjects.reduce((acc, s) => acc + (s.credits ?? s.academicWeight ?? 0), 0);

  const filteredSubjects = subjects.filter((sub) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      sub.name.toLowerCase().includes(q) ||
      sub.code.toLowerCase().includes(q) ||
      (sub.facultyName && sub.facultyName.toLowerCase().includes(q))
    );
  });

  const tasksForDeletingSubject = subjectToDelete
    ? tasks.filter((t) => t.subjectId === subjectToDelete.id).length
    : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Desktop Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Subject Management</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {subjects.length} user-created subject{subjects.length === 1 ? '' : 's'} · {totalCredits} total credits
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Subject</span>
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Search / Filter Bar when subjects exist */}
      {subjects.length > 0 && (
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search subject by name, code, or instructor..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Subject List / Empty State */}
      {loading && subjects.length === 0 ? (
        <LoadingState message="Loading your subjects..." />
      ) : subjects.length === 0 ? (
        <div className="p-12 rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            No subjects added yet.
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed mb-6">
            Add your courses (name, subject code, and credits) so they automatically appear in the Subject Course dropdown when creating tasks.
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Your First Subject</span>
          </button>
        </div>
      ) : filteredSubjects.length === 0 ? (
        <div className="p-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            No subjects match "{searchQuery}"
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredSubjects.map((sub) => {
            const subjectTasks = tasks.filter((t) => t.subjectId === sub.id);
            const pendingCount = subjectTasks.filter((t) => t.status !== 'Completed').length;
            const completedCount = subjectTasks.filter((t) => t.status === 'Completed').length;
            const totalCount = subjectTasks.length;
            const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
            const displayCredits = sub.credits ?? sub.academicWeight ?? 4;

            return (
              <div
                key={sub.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between gap-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-xs shrink-0 px-1 text-center"
                      style={{ backgroundColor: sub.color || '#4f46e5' }}
                    >
                      {sub.code ? sub.code.slice(0, 5) : sub.name.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                        {sub.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {sub.code && <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{sub.code}</span>}
                        {sub.code && <span>·</span>}
                        <span>{displayCredits} Credit{displayCredits === 1 ? '' : 's'}</span>
                      </div>
                      {sub.facultyName && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                          Instructor: {sub.facultyName}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(sub)}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Edit Subject"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubjectToDelete(sub)}
                      className="p-2 rounded-xl text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Delete Subject"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      {pendingCount} active deadline{pendingCount === 1 ? '' : 's'}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 font-mono">
                      {completedCount}/{totalCount} completed ({completionPct}%)
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${completionPct}%`,
                        backgroundColor: sub.color || '#4f46e5',
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Subject Modal */}
      {(isCreating || editingSubject) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingSubject ? 'Edit Subject' : 'Add Subject'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingSubject(null);
                }}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 pt-4 text-xs">
              {error && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subject Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter subject name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Subject Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter course code"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs uppercase font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Credits
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    step="0.5"
                    value={credits}
                    onChange={(e) => setCredits(Number(e.target.value))}
                    placeholder="4"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Instructor / Faculty (Optional)
                </label>
                <input
                  type="text"
                  value={facultyName}
                  onChange={(e) => setFacultyName(e.target.value)}
                  placeholder="Optional instructor name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Color
                </label>
                <div className="flex items-center gap-2.5">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                      style={{ backgroundColor: c }}
                    >
                      {color === c && <Check className="w-4 h-4 text-white stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <SecondaryButton
                  onClick={() => {
                    setIsCreating(false);
                    setEditingSubject(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </SecondaryButton>
                <PrimaryButton type="submit" loading={saving} className="flex-1">
                  {editingSubject ? 'Save Changes' : 'Add Subject'}
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDeleteDialog
        isOpen={Boolean(subjectToDelete)}
        onClose={() => setSubjectToDelete(null)}
        onConfirm={() => {
          if (subjectToDelete) handleDelete(subjectToDelete.id);
        }}
        title="Delete Subject?"
        message={
          tasksForDeletingSubject > 0
            ? `"${subjectToDelete?.name} (${subjectToDelete?.code})" is currently assigned to ${tasksForDeletingSubject} task(s). Deleting this subject will safely detach it from those tasks without deleting the tasks.`
            : `Are you sure you want to delete "${subjectToDelete?.name} (${subjectToDelete?.code})"?`
        }
      />
    </div>
  );
}
