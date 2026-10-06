import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Save, Plus, Search, BookOpen } from 'lucide-react';
import { Task, Subject, TaskType } from '../types';
import { api } from '../services/api';
import { PrimaryButton, SecondaryButton } from '../components/common';

export function TaskFormModal({
  isOpen,
  onClose,
  onSave,
  taskToEdit,
  subjects,
  onSubjectCreated,
  onNavigateToSubjects,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<Task>) => Promise<void>;
  taskToEdit?: Task | null;
  subjects: Subject[];
  onSubjectCreated?: (newSubject: Subject) => void;
  onNavigateToSubjects?: () => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [taskType, setTaskType] = useState<TaskType>('Assignment');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('23:59');
  const [estimatedEffortHours, setEstimatedEffortHours] = useState(3);
  const [difficulty, setDifficulty] = useState(3);
  const [academicWeight, setAcademicWeight] = useState(4);
  const [notes, setNotes] = useState('');

  // Subject search filter for large subject lists
  const [subjectSearch, setSubjectSearch] = useState('');

  // Inline quick-create subject state
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubCode, setNewSubCode] = useState('');
  const [newSubCredits, setNewSubCredits] = useState<number>(4);
  const [savingSubject, setSavingSubject] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setSubjectSearch('');
    setIsAddingSubject(false);
    setError(null);

    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setSubjectId(taskToEdit.subjectId || '');
      setTaskType(taskToEdit.taskType);

      const d = new Date(taskToEdit.deadline);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      setDeadlineDate(`${yyyy}-${mm}-${dd}`);

      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      setDeadlineTime(`${hh}:${min}`);

      setEstimatedEffortHours(taskToEdit.estimatedEffortHours || 3);
      setDifficulty(taskToEdit.difficulty || 3);
      setAcademicWeight(taskToEdit.academicWeight || 4);
      setNotes(taskToEdit.notes || '');
    } else {
      const d = new Date(Date.now() + 3 * 86400000);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      setDeadlineDate(`${yyyy}-${mm}-${dd}`);
      setDeadlineTime('23:59');

      setTitle('');
      setDescription('');
      const firstSub = subjects[0];
      setSubjectId(firstSub?.id || '');
      setTaskType('Assignment');
      setEstimatedEffortHours(3);
      setDifficulty(3);
      setAcademicWeight(
        firstSub ? Math.max(1, Math.min(5, Math.round(firstSub.credits ?? firstSub.academicWeight ?? 4))) : 4
      );
      setNotes('');
    }
  }, [taskToEdit, isOpen]);

  // Keep selected subjectId valid if subjects list updates dynamically
  useEffect(() => {
    if (!isOpen) return;
    if (!subjectId && subjects.length > 0 && !taskToEdit) {
      const firstSub = subjects[0];
      setSubjectId(firstSub.id);
      setAcademicWeight(Math.max(1, Math.min(5, Math.round(firstSub.credits ?? firstSub.academicWeight ?? 4))));
    }
  }, [subjects, isOpen, subjectId, taskToEdit]);

  if (!isOpen) return null;

  const filteredSubjects = subjects.filter((sub) => {
    if (!subjectSearch.trim()) return true;
    const q = subjectSearch.toLowerCase();
    return sub.name.toLowerCase().includes(q) || sub.code.toLowerCase().includes(q);
  });

  const handleSelectSubjectChange = (selectedId: string) => {
    setSubjectId(selectedId);
    const matched = subjects.find((s) => s.id === selectedId);
    if (matched) {
      setAcademicWeight(Math.max(1, Math.min(5, Math.round(matched.credits ?? matched.academicWeight ?? 4))));
    }
  };

  const handleQuickAddSubject = async () => {
    setError(null);
    if (!newSubName.trim()) {
      setError('Subject Name is required.');
      return;
    }
    if (!newSubCode.trim()) {
      setError('Subject Code is required.');
      return;
    }

    const numericCredits = Number(newSubCredits) || 4;
    const palette = ['#4f46e5', '#0d9488', '#ea580c', '#7c3aed', '#e11d48', '#0284c7', '#16a34a', '#d97706'];

    setSavingSubject(true);
    try {
      const created = await api.subjects.create({
        name: newSubName.trim(),
        code: newSubCode.trim().toUpperCase(),
        credits: numericCredits,
        academicWeight: Math.max(1, Math.min(5, Math.round(numericCredits))),
        color: palette[subjects.length % palette.length],
      });

      if (onSubjectCreated) {
        onSubjectCreated(created);
      }
      setSubjectId(created.id);
      setAcademicWeight(created.academicWeight);
      setNewSubName('');
      setNewSubCode('');
      setNewSubCredits(4);
      setIsAddingSubject(false);
    } catch (err: any) {
      setError(err.message || 'Failed to add subject.');
    } finally {
      setSavingSubject(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Task Title is required.');
      return;
    }
    if (subjects.length === 0 || !subjectId) {
      setError('Please select a Subject Course (or click "+ Add Subject" to add one first).');
      return;
    }
    if (!deadlineDate || !deadlineTime) {
      setError('A valid deadline date and time is required.');
      return;
    }

    const isoString = new Date(`${deadlineDate}T${deadlineTime}:00`).toISOString();
    if (isNaN(new Date(isoString).getTime())) {
      setError('Invalid date format.');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        subjectId,
        taskType,
        deadline: isoString,
        estimatedEffortHours: Number(estimatedEffortHours),
        difficulty: Number(difficulty),
        academicWeight: Number(academicWeight),
        notes: notes.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save task.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {taskToEdit ? 'Edit Academic Task' : 'Create New Academic Task'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Priority engine calculates score automatically on save.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter assignment, lab, or exam title"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          {/* Subject & Type row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Subject Course <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddingSubject(!isAddingSubject)}
                  className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>{isAddingSubject ? 'Close' : 'Add Subject'}</span>
                </button>
              </div>

              {subjects.length > 5 && (
                <div className="relative mb-1.5">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={subjectSearch}
                    onChange={(e) => setSubjectSearch(e.target.value)}
                    placeholder="Search subject..."
                    className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              <select
                value={subjectId}
                onChange={(e) => handleSelectSubjectChange(e.target.value)}
                disabled={subjects.length === 0}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 disabled:opacity-60 cursor-pointer"
              >
                {subjects.length === 0 ? (
                  <option value="">No subjects available. Add a subject first.</option>
                ) : filteredSubjects.length === 0 ? (
                  <option value="">No matching subjects found</option>
                ) : (
                  filteredSubjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.code ? `${sub.name} (${sub.code})` : sub.name}
                    </option>
                  ))
                )}
              </select>

              {subjects.length === 0 && !isAddingSubject && (
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-amber-600 dark:text-amber-400">
                  <span>No subjects added yet.</span>
                  {onNavigateToSubjects && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onNavigateToSubjects();
                      }}
                      className="font-semibold underline cursor-pointer"
                    >
                      Open Subject Management →
                    </button>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Task Type
              </label>
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 cursor-pointer"
              >
                <option value="Assignment">Assignment</option>
                <option value="Exam">Exam / Midterm</option>
                <option value="Project">Course Project</option>
                <option value="Lab">Lab Sheet / Code</option>
                <option value="Presentation">Presentation</option>
                <option value="Quiz">Quiz</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Inline Quick-Add Subject Panel */}
          {isAddingSubject && (
            <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Quick Add New Subject</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingSubject(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Subject Name *
                  </label>
                  <input
                    type="text"
                    value={newSubName}
                    onChange={(e) => setNewSubName(e.target.value)}
                    placeholder="Subject name"
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Subject Code *
                  </label>
                  <input
                    type="text"
                    value={newSubCode}
                    onChange={(e) => setNewSubCode(e.target.value)}
                    placeholder="Code"
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs uppercase font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Credits
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={newSubCredits}
                    onChange={(e) => setNewSubCredits(Number(e.target.value))}
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingSubject(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleQuickAddSubject}
                  disabled={savingSubject}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 cursor-pointer"
                >
                  {savingSubject ? 'Adding...' : 'Add Subject'}
                </button>
              </div>
            </div>
          )}

          {/* Deadline Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Deadline Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                required
                value={deadlineTime}
                onChange={(e) => setDeadlineTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>

          {/* Effort & Difficulty & Weight Sliders */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Estimated Effort: <span className="text-indigo-600 dark:text-indigo-400 font-mono">{estimatedEffortHours} Hours</span>
                </span>
                <span className="text-[10px] text-slate-400">10% formula weight</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="12"
                step="0.5"
                value={estimatedEffortHours}
                onChange={(e) => setEstimatedEffortHours(parseFloat(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Cognitive Difficulty: <span className="text-amber-600 dark:text-amber-400 font-mono">{difficulty} / 5</span>
                </span>
                <span className="text-[10px] text-slate-400">20% formula weight</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDifficulty(lvl)}
                    className={`py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                      difficulty === lvl
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Academic Credit Weight: <span className="text-indigo-600 dark:text-indigo-400 font-mono">{academicWeight} / 5</span>
                </span>
                <span className="text-[10px] text-slate-400">20% formula weight</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setAcademicWeight(w)}
                    className={`py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                      academicWeight === w
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {w} cr
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Description & Requirements
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline key deliverables or submission requirements..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Personal Study Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional study notes or reference links"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div className="pt-2">
            <PrimaryButton type="submit" loading={loading} icon={Save}>
              {taskToEdit ? 'Update Task & Recompute Priority' : 'Save Task & Guard Deadline'}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
}
