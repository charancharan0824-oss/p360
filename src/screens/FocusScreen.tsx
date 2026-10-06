import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Flame, 
  Coffee, 
  Volume2,
  VolumeX,
  X,
  Clock
} from 'lucide-react';
import { Task, Subject } from '../types';
import { api } from '../services/api';
import { PriorityBadge, SubjectChip, DeadlineCountdown } from '../components/common';

export function FocusScreen({
  tasks,
  subjects,
  selectedTaskFromProps,
  onSessionSaved,
  onClose,
}: {
  tasks: Task[];
  subjects: Subject[];
  selectedTaskFromProps?: Task | null;
  onSessionSaved?: () => void;
  onClose?: () => void;
}) {
  const pendingTasks = tasks.filter((t) => t.status !== 'Completed');
  const [selectedTask, setSelectedTask] = useState<Task | null>(
    selectedTaskFromProps || pendingTasks[0] || null
  );

  // Timer settings
  const [preset, setPreset] = useState<'25_5' | '50_10'>('25_5');
  const [mode, setMode] = useState<'focus' | 'break'>('focus');

  const focusDuration = preset === '25_5' ? 25 * 60 : 50 * 60;
  const breakDuration = preset === '25_5' ? 5 * 60 : 10 * 60;
  const currentTargetSeconds = mode === 'focus' ? focusDuration : breakDuration;

  const [secondsRemaining, setSecondsRemaining] = useState(focusDuration);
  const [isActive, setIsActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Session completion modal
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (selectedTaskFromProps) {
      setSelectedTask(selectedTaskFromProps);
    }
  }, [selectedTaskFromProps]);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsActive(false);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  const handleTimerComplete = () => {
    if (soundEnabled) {
      playChime();
    }
    if (mode === 'focus') {
      setShowCompletionDialog(true);
    } else {
      setMode('focus');
      setSecondsRemaining(focusDuration);
    }
  };

  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch {
      // Audio fallback
    }
  };

  const handleToggleTimer = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setSecondsRemaining(currentTargetSeconds);
  };

  const handleSwitchPreset = (p: '25_5' | '50_10') => {
    setPreset(p);
    setIsActive(false);
    setMode('focus');
    setSecondsRemaining(p === '25_5' ? 25 * 60 : 50 * 60);
  };

  const handleSaveCompletedSession = async (completedTask: boolean) => {
    setSaving(true);
    try {
      const durationMins = Math.round((focusDuration - secondsRemaining) / 60) || (preset === '25_5' ? 25 : 50);
      await api.studySessions.create({
        taskId: selectedTask?.id,
        durationMinutes: durationMins,
        plannedMinutes: preset === '25_5' ? 25 : 50,
        completed: true,
        notes: sessionNotes.trim() || undefined,
      });

      if (completedTask && selectedTask) {
        await api.tasks.complete(selectedTask.id);
      }

      setShowCompletionDialog(false);
      setSessionNotes('');
      if (onSessionSaved) onSessionSaved();

      setMode('break');
      setSecondsRemaining(breakDuration);
    } catch (err) {
      console.error('Failed to log study session:', err);
    } finally {
      setSaving(false);
    }
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const progressPercent = ((currentTargetSeconds - secondsRemaining) / currentTargetSeconds) * 100;

  const currentSubject = selectedTask ? subjects.find((s) => s.id === selectedTask.subjectId) : null;

  return (
    <div className="space-y-6 pb-12">
      {/* Desktop Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Flame className="w-6 h-6 text-indigo-600 dark:text-indigo-400 fill-current" />
            <span>Pomodoro Focus Mode</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Deep academic focus blocks automatically logged to your study analytics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={soundEnabled ? 'Mute Chime' : 'Enable Chime'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            <span className="hidden sm:inline">{soundEnabled ? 'Sound On' : 'Muted'}</span>
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Desktop 12-Column Grid: Timer Panel (7 cols) + Target Coursework & Queue (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Timer Card */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col items-center justify-center space-y-6">
          {/* Preset Selector */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold w-full max-w-md">
            <button
              type="button"
              onClick={() => handleSwitchPreset('25_5')}
              disabled={isActive}
              className={`flex-1 py-2.5 text-center rounded-lg transition-all cursor-pointer ${
                preset === '25_5'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              25m Focus · 5m Break
            </button>
            <button
              type="button"
              onClick={() => handleSwitchPreset('50_10')}
              disabled={isActive}
              className={`flex-1 py-2.5 text-center rounded-lg transition-all cursor-pointer ${
                preset === '50_10'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              50m Deep · 10m Break
            </button>
          </div>

          {/* Circular Progress Timer Display */}
          <div className="py-4 flex flex-col items-center justify-center relative">
            <div className="relative w-72 h-72 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  className="text-slate-100 dark:text-slate-800 stroke-current"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  className={`${
                    mode === 'focus' 
                      ? 'text-indigo-600 dark:text-indigo-500 stroke-current' 
                      : 'text-emerald-500 stroke-current'
                  } transition-all duration-1000 ease-linear`}
                  strokeWidth="6"
                  strokeDasharray={276.46}
                  strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              <div className="absolute flex flex-col items-center justify-center text-center">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                  {mode === 'focus' ? (
                    <>
                      <Flame className="w-4 h-4 text-indigo-500 fill-current" />
                      <span>Focus Block</span>
                    </>
                  ) : (
                    <>
                      <Coffee className="w-4 h-4 text-emerald-500" />
                      <span>Rest Break</span>
                    </>
                  )}
                </div>

                <div className="text-6xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </div>

                <div className="text-xs font-mono text-slate-400 mt-1.5">
                  {Math.round(progressPercent)}% elapsed
                </div>
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-3 w-full max-w-sm">
            <button
              type="button"
              onClick={handleReset}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
              title="Reset timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={handleToggleTimer}
              className={`flex-1 py-4 px-6 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer ${
                isActive
                  ? 'bg-amber-600 hover:bg-amber-500'
                  : 'bg-indigo-600 hover:bg-indigo-500'
              }`}
            >
              {isActive ? (
                <>
                  <Pause className="w-5 h-5 fill-current" />
                  <span>Pause Focus</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>{secondsRemaining < currentTargetSeconds ? 'Resume Focus' : 'Start Focus Session'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Target Coursework Selector & Details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Target Coursework
              </span>
              {selectedTask && (
                <PriorityBadge 
                  level={selectedTask.priority?.priorityLevel} 
                  score={selectedTask.priority?.priorityScore} 
                />
              )}
            </div>

            <select
              value={selectedTask?.id || ''}
              onChange={(e) => {
                const t = tasks.find((item) => item.id === e.target.value);
                if (t) setSelectedTask(t);
              }}
              disabled={isActive}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              {pendingTasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} (Diff {t.difficulty}/5)
                </option>
              ))}
              {pendingTasks.length === 0 && (
                <option value="">General Academic Study</option>
              )}
            </select>

            {selectedTask && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <SubjectChip 
                    name={currentSubject?.name || 'General Academic'} 
                    code={currentSubject?.code} 
                    color={currentSubject?.color} 
                  />
                  <span className="font-mono text-slate-500 dark:text-slate-400">
                    {selectedTask.estimatedEffortHours}h est. effort
                  </span>
                </div>

                {selectedTask.description && (
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {selectedTask.description}
                  </p>
                )}

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700 flex items-center justify-between">
                  <span className="text-slate-400">Deadline:</span>
                  <DeadlineCountdown deadline={selectedTask.deadline} status={selectedTask.status} />
                </div>
              </div>
            )}
          </div>

          {/* Pending Queue Quick Switcher */}
          {pendingTasks.length > 1 && (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Up Next in Priority Queue</span>
              </h4>

              <div className="space-y-2">
                {pendingTasks.slice(0, 4).map((t) => {
                  const isSelected = selectedTask?.id === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      disabled={isActive}
                      onClick={() => setSelectedTask(t)}
                      className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-2 text-xs cursor-pointer ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-white'
                          : 'border-slate-200/70 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <span className="font-semibold truncate">{t.title}</span>
                      <PriorityBadge level={t.priority?.priorityLevel} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Session Completion Modal */}
      {showCompletionDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Focus Session Complete!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
              Did you complete your planned work for "{selectedTask?.title || 'Coursework'}"?
            </p>

            <div className="mb-4 text-left">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Session Reflection / Notes
              </label>
              <input
                type="text"
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="e.g. Completed problem set #3 and verified tests"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleSaveCompletedSession(true)}
                disabled={saving}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs cursor-pointer"
              >
                Yes, Mark Task Completed & Log Session
              </button>
              <button
                type="button"
                onClick={() => handleSaveCompletedSession(false)}
                disabled={saving}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Keep Task Pending & Log Study Time
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
