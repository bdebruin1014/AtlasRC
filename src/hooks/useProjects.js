// hooks/useProjects.js
// React hooks for Projects - connects to Supabase projects table

import { useState, useEffect, useCallback } from 'react';
import { supabase, isDemoMode } from '@/lib/supabase';
import { projectService } from '@/services/projectService';

// Status configuration matching database constraints
export const PROJECT_STATUSES = [
  { key: 'active', label: 'Active', color: '#10b981' },
  { key: 'completed', label: 'Completed', color: '#6366f1' },
  { key: 'on-hold', label: 'On Hold', color: '#f59e0b' },
  { key: 'cancelled', label: 'Cancelled', color: '#ef4444' },
];

// Project types matching database constraints
export const PROJECT_TYPES = [
  { key: 'lot-development', label: 'Lot Development' },
  { key: 'spec-build', label: 'Spec Build' },
  { key: 'fix-flip', label: 'Fix & Flip' },
  { key: 'build-to-rent', label: 'Build to Rent' },
];

// Mock data for demo mode
const MOCK_PROJECTS = [
  {
    id: 'mock-1',
    name: 'Watson House',
    address: '123 Main Street, Greenville, SC 29601',
    status: 'active',
    project_type: 'spec-build',
    budget: 265000,
    start_date: '2024-12-01',
    target_completion_date: '2025-05-15',
    notes: 'Single family spec home build',
    entity: { id: 'ent-1', name: 'Watson House LLC', type: 'project' },
    created_at: new Date().toISOString(),
  },
  {
    id: 'mock-2',
    name: 'Oslo Townhomes',
    address: '456 Oslo Drive, Spartanburg, SC 29302',
    status: 'active',
    project_type: 'build-to-rent',
    budget: 4500000,
    start_date: '2024-06-01',
    target_completion_date: '2025-12-31',
    notes: '12-unit townhome development',
    entity: { id: 'ent-2', name: 'Oslo Townhomes LLC', type: 'project' },
    created_at: new Date().toISOString(),
  },
  {
    id: 'mock-3',
    name: 'Pine Valley Lots',
    address: 'Pine Valley Road, Simpsonville, SC 29680',
    status: 'active',
    project_type: 'lot-development',
    budget: 2800000,
    start_date: '2024-03-01',
    target_completion_date: '2024-12-31',
    notes: '35 lot subdivision development',
    entity: { id: 'ent-3', name: 'VanRock Holdings LLC', type: 'operating' },
    created_at: new Date().toISOString(),
  },
  {
    id: 'mock-4',
    name: 'Maple Street Flip',
    address: '789 Maple Street, Greenville, SC 29605',
    status: 'active',
    project_type: 'fix-flip',
    budget: 185000,
    start_date: '2024-11-01',
    target_completion_date: '2025-02-28',
    notes: 'Single family renovation',
    entity: { id: 'ent-4', name: 'VanRock Holdings LLC', type: 'operating' },
    created_at: new Date().toISOString(),
  },
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
      if (isDemoMode) {
        setProjects(MOCK_PROJECTS);
        return;
      }

      const data = await projectService.getAll();
      setProjects(data || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err.message);
      // Fallback to mock data on error
      setProjects(MOCK_PROJECTS);
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
      if (isDemoMode) {
        const mockProject = MOCK_PROJECTS.find(p => p.id === projectId);
        setProject(mockProject || null);
        return;
      }

      const data = await projectService.getById(projectId);
      setProject(data);
    } catch (err) {
      console.error('Error fetching project:', err);
      setError(err.message);
      // Try mock data as fallback
      const mockProject = MOCK_PROJECTS.find(p => p.id === projectId);
      setProject(mockProject || null);
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
      if (isDemoMode) {
        console.log('Demo mode: would create project', data);
        return { ...data, id: `mock-${Date.now()}` };
      }
      return await projectService.create(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProject = useCallback(async (id, data) => {
    setIsLoading(true);
    try {
      if (isDemoMode) {
        console.log('Demo mode: would update project', id, data);
        return { id, ...data };
      }
      return await projectService.update(id, data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteProject = useCallback(async (id) => {
    setIsLoading(true);
    try {
      if (isDemoMode) {
        console.log('Demo mode: would delete project', id);
        return true;
      }
      return await projectService.delete(id);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateStatus = useCallback(async (id, status) => {
    return updateProject(id, { status });
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
    if (isDemoMode) return;

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

export default {
  useProjects,
  useProject,
  useProjectActions,
  useProjectSummary,
  useProjectSubscription,
  PROJECT_STATUSES,
  PROJECT_TYPES,
};
