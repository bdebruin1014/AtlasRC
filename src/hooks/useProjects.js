// hooks/useProjects.js
// React hooks for Projects - connects to Supabase projects table

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { projectService } from '@/services/projectService';
import { activityService } from '@/services/activityService';

// Status configuration matching database constraints
export const PROJECT_STATUSES = [
  { key: 'active', label: 'Active', color: '#10b981' },
  { key: 'completed', label: 'Completed', color: '#6366f1' },
  { key: 'on-hold', label: 'On Hold', color: '#f59e0b' },
  { key: 'cancelled', label: 'Cancelled', color: '#ef4444' },
];

// Project types — aligned with constants.js and the New Project dropdown
export const PROJECT_TYPES = [
  { key: 'scattered-lot', label: 'Scattered Lot' },
  { key: 'lot-development', label: 'Lot Development' },
  { key: 'lot-purchase-development', label: 'Lot Purchase Development' },
  { key: 'community-development', label: 'Community Development' },
];

// Hook to fetch all projects
export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await projectService.getAll();
      setProjects(data || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return { projects, isLoading, error, refetch: fetchProjects };
}

// Hook to fetch a single project by ID
export function useProject(projectId) {
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProject = useCallback(async () => {
    if (!projectId) {
      setProject(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await projectService.getById(projectId);
      setProject(data);
    } catch (err) {
      console.error('Error fetching project:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  return { project, isLoading, error, refetch: fetchProject };
}

// Hook for project CRUD actions
export function useProjectActions() {
  const [isLoading, setIsLoading] = useState(false);

  const createProject = useCallback(async (data) => {
    setIsLoading(true);
    try {
      const result = await projectService.create(data);
      // Log activity
      activityService.log({
        entityType: 'project',
        entityId: result.id,
        action: 'created',
        newValue: data.name,
        metadata: { project_type: data.project_type },
      }).catch(() => {}); // fire-and-forget
      return result;
    } catch (err) {
      console.error('Create project failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProject = useCallback(async (id, data) => {
    setIsLoading(true);
    try {
      const result = await projectService.update(id, data);
      return result;
    } catch (err) {
      console.error('Update project failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteProject = useCallback(async (id) => {
    setIsLoading(true);
    try {
      const result = await projectService.delete(id);
      activityService.log({
        entityType: 'project',
        entityId: id,
        action: 'deleted',
      }).catch(() => {});
      return result;
    } catch (err) {
      console.error('Delete project failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateStatus = useCallback(async (id, status, oldStatus) => {
    const result = await updateProject(id, { status });
    activityService.log({
      entityType: 'project',
      entityId: id,
      action: 'status_changed',
      fieldChanged: 'status',
      oldValue: oldStatus,
      newValue: status,
    }).catch(() => {});
    return result;
  }, [updateProject]);

  return {
    createProject,
    updateProject,
    deleteProject,
    updateStatus,
    isLoading,
  };
}

// Hook for project summary/stats
export function useProjectSummary(projects) {
  const [summary, setSummary] = useState({
    total: 0,
    byStatus: {},
    totalBudget: 0,
    activeCount: 0,
  });

  useEffect(() => {
    if (!projects || projects.length === 0) {
      setSummary({
        total: 0,
        byStatus: {},
        totalBudget: 0,
        activeCount: 0,
      });
      return;
    }

    const byStatus = {};
    let totalBudget = 0;
    let activeCount = 0;

    PROJECT_STATUSES.forEach(status => {
      byStatus[status.key] = { count: 0, budget: 0 };
    });

    projects.forEach(proj => {
      if (byStatus[proj.status]) {
        byStatus[proj.status].count++;
        byStatus[proj.status].budget += parseFloat(proj.budget) || 0;
      }
      totalBudget += parseFloat(proj.budget) || 0;
      if (proj.status === 'active') {
        activeCount++;
      }
    });

    setSummary({
      total: projects.length,
      byStatus,
      totalBudget,
      activeCount,
    });
  }, [projects]);

  return summary;
}

// Hook for real-time subscription to projects
export function useProjectSubscription(onUpdate) {
  useEffect(() => {
    const subscription = supabase
      .channel('projects-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        (payload) => {
          console.log('Project change:', payload);
          onUpdate?.();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [onUpdate]);
}

// Hook to fetch project financials (budget spent, etc.)
export function useProjectFinancials(projectId) {
  const [financials, setFinancials] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFinancials = useCallback(async () => {
    if (!projectId) {
      setFinancials(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await projectService.getFinancials(projectId);
      setFinancials(data);
    } catch (err) {
      console.error('Error fetching project financials:', err);
      setError(err.message);
      setFinancials({
        budget: 0,
        actualCost: 0,
        totalExpenses: 0,
        totalIncome: 0,
        percentSpent: 0,
        budgetRemaining: 0,
        expensesByCategory: {}
      });
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchFinancials();
  }, [fetchFinancials]);

  return { financials, isLoading, error, refetch: fetchFinancials };
}

// Hook to calculate project progress from schedule
export function useProjectProgress(projectId) {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function calculateProgress() {
      if (!projectId) {
        setProgress(0);
        setIsLoading(false);
        return;
      }

      try {
        // Get schedule items to calculate progress
        const { data: scheduleItems, error } = await supabase
          .from('schedule_items')
          .select('percent_complete, weight')
          .eq('project_id', projectId);

        if (error) throw error;

        if (!scheduleItems || scheduleItems.length === 0) {
          // No schedule items - try to calculate from milestones
          const { data: milestones } = await supabase
            .from('project_milestones')
            .select('status')
            .eq('project_id', projectId);

          if (milestones && milestones.length > 0) {
            const completed = milestones.filter(m => m.status === 'completed').length;
            setProgress(Math.round((completed / milestones.length) * 100));
          } else {
            setProgress(0);
          }
          return;
        }

        // Calculate weighted progress
        const totalWeight = scheduleItems.reduce((sum, item) => sum + (item.weight || 1), 0);
        const weightedProgress = scheduleItems.reduce((sum, item) => {
          const weight = item.weight || 1;
          const complete = item.percent_complete || 0;
          return sum + (weight * complete);
        }, 0);

        setProgress(Math.round(weightedProgress / totalWeight));
      } catch (err) {
        console.error('Error calculating project progress:', err);
        setProgress(0);
      } finally {
        setIsLoading(false);
      }
    }

    calculateProgress();
  }, [projectId]);

  return { progress, isLoading };
}

export default {
  useProjects,
  useProject,
  useProjectActions,
  useProjectSummary,
  useProjectSubscription,
  useProjectFinancials,
  useProjectProgress,
  PROJECT_STATUSES,
  PROJECT_TYPES,
};
