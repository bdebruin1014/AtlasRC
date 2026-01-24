// src/hooks/useSchedule.js
// React hooks for the Schedule Module

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getProjectSchedule,
  createProjectSchedule,
  updateProjectSchedule,
  getSchedulePhases,
  createPhase,
  getScheduleTasks,
  createTask,
  updateTask,
  deleteTask,
  getScheduleTemplates,
  recalculateTaskDates,
  calculateScheduleProgress,
  getTasksByPhase,
} from '@/services/scheduleService';

// ─── useProjectSchedule ──────────────────────────────────────────────────────

export function useProjectSchedule(projectId) {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getProjectSchedule(projectId);
      setSchedule(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  return { schedule, loading, error, refetch: load };
}

// ─── useSchedulePhases ───────────────────────────────────────────────────────

export function useSchedulePhases(scheduleId) {
  const [phases, setPhases] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!scheduleId) { setPhases([]); setLoading(false); return; }
    try {
      setLoading(true);
      const data = await getSchedulePhases(scheduleId);
      setPhases(data);
    } catch (err) {
      console.error('Error loading phases:', err);
    } finally {
      setLoading(false);
    }
  }, [scheduleId]);

  useEffect(() => { load(); }, [load]);

  const addPhase = useCallback(async (phaseData) => {
    const newPhase = await createPhase(scheduleId, phaseData);
    setPhases(prev => [...prev, newPhase]);
    return newPhase;
  }, [scheduleId]);

  return { phases, loading, addPhase, refetch: load };
}

// ─── useScheduleTasks ────────────────────────────────────────────────────────

export function useScheduleTasks(scheduleId) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!scheduleId) { setTasks([]); setLoading(false); return; }
    try {
      setLoading(true);
      const data = await getScheduleTasks(scheduleId);
      setTasks(data);
    } catch (err) {
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [scheduleId]);

  useEffect(() => { load(); }, [load]);

  const addTask = useCallback(async (taskData) => {
    const newTask = await createTask(scheduleId, taskData);
    setTasks(prev => [...prev, newTask]);
    return newTask;
  }, [scheduleId]);

  const editTask = useCallback(async (taskId, updates) => {
    const updated = await updateTask(taskId, updates);
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updated } : t));
    return updated;
  }, []);

  const removeTask = useCallback(async (taskId) => {
    await deleteTask(taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));
  }, []);

  return { tasks, loading, addTask, editTask, removeTask, refetch: load };
}

// ─── useScheduleData (combined) ──────────────────────────────────────────────

export function useScheduleData(projectId) {
  const { schedule, loading: scheduleLoading, refetch: refetchSchedule } = useProjectSchedule(projectId);
  const { phases, loading: phasesLoading, addPhase, refetch: refetchPhases } = useSchedulePhases(schedule?.id);
  const { tasks, loading: tasksLoading, addTask, editTask, removeTask, refetch: refetchTasks } = useScheduleTasks(schedule?.id);

  const loading = scheduleLoading || phasesLoading || tasksLoading;

  const progress = useMemo(() => calculateScheduleProgress(tasks), [tasks]);

  const tasksByPhase = useMemo(() => getTasksByPhase(tasks, phases), [tasks, phases]);

  const milestones = useMemo(() => tasks.filter(t => t.is_milestone), [tasks]);

  const criticalPath = useMemo(() => tasks.filter(t => t.is_critical_path), [tasks]);

  const recalculate = useCallback(() => {
    if (!schedule?.project_start_date || tasks.length === 0) return;
    const recalculated = recalculateTaskDates(tasks, schedule.project_start_date);
    // In production, this would update the DB. For demo, just update local state.
    refetchTasks();
  }, [schedule, tasks, refetchTasks]);

  const refetchAll = useCallback(() => {
    refetchSchedule();
    refetchPhases();
    refetchTasks();
  }, [refetchSchedule, refetchPhases, refetchTasks]);

  return {
    schedule,
    phases,
    tasks,
    tasksByPhase,
    milestones,
    criticalPath,
    progress,
    loading,
    addPhase,
    addTask,
    editTask,
    removeTask,
    recalculate,
    refetchAll,
  };
}

// ─── useScheduleTemplates ────────────────────────────────────────────────────

export function useScheduleTemplates(projectType) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getScheduleTemplates(projectType);
        setTemplates(data);
      } catch (err) {
        console.error('Error loading schedule templates:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [projectType]);

  return { templates, loading };
}
