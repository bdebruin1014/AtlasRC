import React from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import EntityAccountingSidebar from '@/components/accounting/EntityAccountingSidebar';
import { supabase } from '@/lib/supabase';

// Mock entities for demo
const mockEntities = {
  'ent-001': { id: 'ent-001', name: 'VanRock Holdings LLC', short_name: 'VanRock Holdings', type: 'holding', entity_type: 'holding_company', cash_balance: 485000, ytd_revenue: 1250000, ytd_expenses: 890000 },
  'ent-002': { id: 'ent-002', name: 'Olive Brynn LLC', short_name: 'Olive Brynn', type: 'holding', entity_type: 'holding_company', cash_balance: 892000, ytd_revenue: 450000, ytd_expenses: 125000 },
  'ent-003': { id: 'ent-003', name: 'Highland Park Development LLC', short_name: 'Highland Park', type: 'project', entity_type: 'spe', cash_balance: 125000, ytd_revenue: 0, ytd_expenses: 1850000 },
  'ent-004': { id: 'ent-004', name: 'Riverside Commons LLC', short_name: 'Riverside Commons', type: 'project', entity_type: 'spe', cash_balance: 340000, ytd_revenue: 3200000, ytd_expenses: 2100000 },
  'ent-005': { id: 'ent-005', name: 'Cedar Mill Phase 2 LLC', short_name: 'Cedar Mill', type: 'project', entity_type: 'spe', cash_balance: 75000, ytd_revenue: 0, ytd_expenses: 450000 },
  'ent-006': { id: 'ent-006', name: 'VanRock Property Management LLC', short_name: 'VanRock PM', type: 'operating', entity_type: 'operating_company', cash_balance: 95000, ytd_revenue: 385000, ytd_expenses: 290000 },
  'ent-olive': { id: 'ent-olive', name: 'Olive Brynn LLC', short_name: 'Olive Brynn', type: 'holding', entity_type: 'holding_company', cash_balance: 892000, ytd_revenue: 450000, ytd_expenses: 125000 },
  'ent-vanrock': { id: 'ent-vanrock', name: 'VanRock Holdings LLC', short_name: 'VanRock Holdings', type: 'holding', entity_type: 'holding_company', cash_balance: 485000, ytd_revenue: 1250000, ytd_expenses: 890000 },
  'ent-highland': { id: 'ent-highland', name: 'Highland Park Development LLC', short_name: 'Highland Park', type: 'project', entity_type: 'spe', cash_balance: 125000, ytd_revenue: 0, ytd_expenses: 1850000 },
  'ent-riverside': { id: 'ent-riverside', name: 'Riverside Commons LLC', short_name: 'Riverside Commons', type: 'project', entity_type: 'spe', cash_balance: 340000, ytd_revenue: 3200000, ytd_expenses: 2100000 },
  'ent-cedar': { id: 'ent-cedar', name: 'Cedar Mill Phase 2 LLC', short_name: 'Cedar Mill', type: 'project', entity_type: 'spe', cash_balance: 75000, ytd_revenue: 0, ytd_expenses: 450000 },
  'ent-propman': { id: 'ent-propman', name: 'VanRock Property Management LLC', short_name: 'VanRock PM', type: 'operating', entity_type: 'operating_company', cash_balance: 95000, ytd_revenue: 385000, ytd_expenses: 290000 },
};

const fetchEntity = async (entityId) => {
  try {
    const { data, error } = await supabase
      .from('entities')
      .select('*')
      .eq('id', entityId)
      .single();

    if (data && !error) {
      return data;
    }
  } catch (err) {
    console.error('Error fetching entity:', err);
  }

  // Fallback to mock data
  return mockEntities[entityId] || {
    id: entityId,
    name: `Entity ${entityId}`,
    short_name: `Entity ${entityId}`,
    type: 'entity',
    entity_type: 'llc',
    cash_balance: 0,
    ytd_revenue: 0,
    ytd_expenses: 0
  };
};

const fetchTaskCount = async (entityId) => {
  try {
    const { count, error } = await supabase
      .from('entity_tasks')
      .select('*', { count: 'exact', head: true })
      .eq('entity_id', entityId)
      .in('status', ['pending', 'in_progress']);

    if (!error) {
      return count || 0;
    }
  } catch (err) {
    console.error('Error fetching task count:', err);
  }

  // Demo task count for mock entities
  return mockEntities[entityId] ? 3 : 0;
};

export default function EntityAccountingLayout() {
  const { entityId } = useParams();

  const { data: entity, isLoading: entityLoading } = useQuery({
    queryKey: ['entity', entityId],
    queryFn: () => fetchEntity(entityId),
    enabled: !!entityId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: taskCount = 0 } = useQuery({
    queryKey: ['entity-task-count', entityId],
    queryFn: () => fetchTaskCount(entityId),
    enabled: !!entityId,
    staleTime: 60 * 1000, // 1 minute
  });

  if (entityLoading) {
    return (
      <div className="flex h-[calc(100vh-64px)]">
        <div className="w-64 border-r bg-muted/20 animate-pulse" />
        <div className="flex-1 p-6">
          <div className="h-8 w-48 bg-muted rounded animate-pulse mb-4" />
          <div className="h-4 w-64 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Left Sidebar */}
      <EntityAccountingSidebar
        entity={entity}
        taskCount={taskCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-background">
        <Outlet context={{ entity, taskCount }} />
      </main>
    </div>
  );
}
