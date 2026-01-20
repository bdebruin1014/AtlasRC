import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { Bar, Pie } from 'react-chartjs-2';
import { supabase } from '@/lib/supabase';

const DashboardPage = () => {
  // Fetch metrics
  const { data: opportunities = [] } = useQuery(['opportunities'], async () => {
    const { data } = await supabase.from('opportunities').select('*');
    return data || [];
  });
  const { data: projects = [] } = useQuery(['projects'], async () => {
    const { data } = await supabase.from('projects').select('*');
    return data || [];
  });
  const { data: transactions = [] } = useQuery(['transactions'], async () => {
    const { data } = await supabase.from('transactions').select('*');
    return data || [];
  });

  // Key metrics
  const activeOpportunities = opportunities.filter(o => o.stage !== 'Under Contract').length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const pipelineValue = opportunities.reduce((sum, o) => sum + (o.estimated_value || 0), 0);
  const ytdRevenue = useMemo(() => {
    const year = new Date().getFullYear();
    return transactions.filter(t => t.transaction_type === 'income' && new Date(t.transaction_date).getFullYear() === year)
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  }, [transactions]);

  // Pipeline overview (bar chart)
  const dealsByStage = useMemo(() => {
    const stages = ['Prospecting', 'Contacted', 'Qualified', 'Negotiating', 'Under Contract'];
    const counts = stages.map(stage => opportunities.filter(o => o.stage === stage).length);
    return { labels: stages, datasets: [{ label: 'Deals', data: counts, backgroundColor: '#6366f1' }] };
  }, [opportunities]);

  // Project status (pie chart)
  const projectStatus = useMemo(() => {
    const statuses = ['active', 'completed', 'on-hold'];
    const counts = statuses.map(status => projects.filter(p => p.status === status).length);
    return {
      labels: ['Active', 'Completed', 'On-Hold'],
      datasets: [{ data: counts, backgroundColor: ['#10b981', '#6366f1', '#f59e0b'] }],
    };
  }, [projects]);

  // Recent activity
  const recentOpportunities = [...opportunities].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 10);
  const recentProjects = [...projects].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 10);
  const recentTransactions = [...transactions].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 10);

  return (
    <div className="p-6 space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader><CardTitle>Active Opportunities</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{activeOpportunities}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Active Projects</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{activeProjects}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Pipeline Value</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">${pipelineValue.toLocaleString()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>YTD Revenue</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">${ytdRevenue.toLocaleString()}</div></CardContent>
        </Card>
      </div>

      {/* Pipeline Overview Bar Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Pipeline Overview</h2>
        <Bar data={dealsByStage} options={{ plugins: { legend: { display: false } } }} />
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h3 className="font-medium mb-2">Opportunities</h3>
            <ul className="text-sm">
              {recentOpportunities.map(o => (
                <li key={o.id}>{o.deal_number} - {o.address}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Projects</h3>
            <ul className="text-sm">
              {recentProjects.map(p => (
                <li key={p.id}>{p.name} - {p.status}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Transactions</h3>
            <ul className="text-sm">
              {recentTransactions.map(t => (
                <li key={t.id}>{t.description} - ${t.amount}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Project Status Pie Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Project Status</h2>
        <Pie data={projectStatus} options={{ plugins: { legend: { position: 'bottom' } } }} />
      </div>
    </div>
  );
};

export default DashboardPage;
