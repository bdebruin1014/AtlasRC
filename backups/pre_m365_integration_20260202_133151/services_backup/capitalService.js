import { supabase, isDemoMode } from '@/lib/supabase';

// Mock data for demo mode
const mockMembers = [
  {
    id: 1,
    name: 'Bryan De Bruin',
    member_type: 'individual',
    ownership_pct: 50.0,
    capital_account: 250000,
    email: 'bryan@vanrock.com',
    phone: '(864) 555-1234',
    status: 'active',
    joined_date: '2023-01-01',
  },
  {
    id: 2,
    name: 'VanRock Holdings LLC',
    member_type: 'entity',
    ownership_pct: 50.0,
    capital_account: 250000,
    email: 'admin@vanrock.com',
    status: 'active',
    joined_date: '2023-01-01',
  },
];

const mockContributions = [
  {
    id: 1,
    member_id: 1,
    member_name: 'Bryan De Bruin',
    date: '2023-01-01',
    amount: 200000,
    type: 'cash',
    description: 'Initial capital contribution',
    created_at: '2023-01-01T10:00:00Z',
  },
  {
    id: 2,
    member_id: 2,
    member_name: 'VanRock Holdings LLC',
    date: '2023-01-01',
    amount: 200000,
    type: 'cash',
    description: 'Initial capital contribution',
    created_at: '2023-01-01T10:00:00Z',
  },
  {
    id: 3,
    member_id: 1,
    member_name: 'Bryan De Bruin',
    date: '2024-06-15',
    amount: 50000,
    type: 'cash',
    description: 'Additional capital contribution',
    created_at: '2024-06-15T14:00:00Z',
  },
  {
    id: 4,
    member_id: 2,
    member_name: 'VanRock Holdings LLC',
    date: '2024-06-15',
    amount: 50000,
    type: 'cash',
    description: 'Additional capital contribution',
    created_at: '2024-06-15T14:00:00Z',
  },
];

const mockDistributions = [
  {
    id: 1,
    member_id: 1,
    member_name: 'Bryan De Bruin',
    date: '2024-03-31',
    amount: 25000,
    type: 'profit_distribution',
    description: 'Q1 2024 profit distribution',
    created_at: '2024-03-31T10:00:00Z',
  },
  {
    id: 2,
    member_id: 2,
    member_name: 'VanRock Holdings LLC',
    date: '2024-03-31',
    amount: 25000,
    type: 'profit_distribution',
    description: 'Q1 2024 profit distribution',
    created_at: '2024-03-31T10:00:00Z',
  },
];

let mockMembersData = [...mockMembers];
let mockContributionsData = [...mockContributions];
let mockDistributionsData = [...mockDistributions];

export const capitalService = {
  // ========== MEMBERS ==========
  
  async getMembers(entityId) {
    if (isDemoMode) {
      return { data: mockMembersData, error: null };
    }
    
    return await supabase
      .from('entity_members')
      .select('*')
      .eq('entity_id', entityId)
      .order('name', { ascending: true });
  },
  
  async getMemberById(id) {
    if (isDemoMode) {
      const member = mockMembersData.find(m => m.id === id);
      return { data: member || null, error: member ? null : 'Not found' };
    }
    
    return await supabase
      .from('entity_members')
      .select('*')
      .eq('id', id)
      .single();
  },
  
  async createMember(member) {
    if (isDemoMode) {
      const newMember = {
        ...member,
        id: Date.now(),
        capital_account: 0,
        created_at: new Date().toISOString(),
      };
      mockMembersData.push(newMember);
      return { data: newMember, error: null };
    }
    
    return await supabase
      .from('entity_members')
      .insert(member)
      .select()
      .single();
  },
  
  async updateMember(id, updates) {
    if (isDemoMode) {
      const index = mockMembersData.findIndex(m => m.id === id);
      if (index !== -1) {
        mockMembersData[index] = { ...mockMembersData[index], ...updates };
        return { data: mockMembersData[index], error: null };
      }
      return { data: null, error: 'Not found' };
    }
    
    return await supabase
      .from('entity_members')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
  },
  
  async deleteMember(id) {
    if (isDemoMode) {
      const index = mockMembersData.findIndex(m => m.id === id);
      if (index !== -1) {
        mockMembersData.splice(index, 1);
        return { error: null };
      }
      return { error: 'Not found' };
    }
    
    return await supabase.from('entity_members').delete().eq('id', id);
  },
  
  // ========== CONTRIBUTIONS ==========
  
  async getContributions(entityId, options = {}) {
    if (isDemoMode) {
      let filtered = [...mockContributionsData];
      
      if (options.memberId) {
        filtered = filtered.filter(c => c.member_id === options.memberId);
      }
      
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
      return { data: filtered, error: null };
    }
    
    let query = supabase
      .from('capital_contributions')
      .select('*, entity_members(name)')
      .eq('entity_id', entityId)
      .order('date', { ascending: false });
    
    if (options.memberId) {
      query = query.eq('member_id', options.memberId);
    }
    
    return await query;
  },
  
  async createContribution(contribution) {
    if (isDemoMode) {
      const member = mockMembersData.find(m => m.id === contribution.member_id);
      const newContribution = {
        ...contribution,
        id: Date.now(),
        member_name: member?.name || 'Unknown',
        created_at: new Date().toISOString(),
      };
      mockContributionsData.push(newContribution);
      
      // Update member capital account
      if (member) {
        member.capital_account += contribution.amount;
      }
      
      return { data: newContribution, error: null };
    }
    
    const { data, error } = await supabase
      .from('capital_contributions')
      .insert(contribution)
      .select()
      .single();
    
    if (!error) {
      // Update member capital account
      await supabase.rpc('update_capital_account', {
        p_member_id: contribution.member_id,
        p_amount: contribution.amount,
      });
    }
    
    return { data, error };
  },
  
  async updateContribution(id, updates) {
    if (isDemoMode) {
      const index = mockContributionsData.findIndex(c => c.id === id);
      if (index !== -1) {
        mockContributionsData[index] = { ...mockContributionsData[index], ...updates };
        return { data: mockContributionsData[index], error: null };
      }
      return { data: null, error: 'Not found' };
    }
    
    return await supabase
      .from('capital_contributions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
  },
  
  async deleteContribution(id) {
    if (isDemoMode) {
      const index = mockContributionsData.findIndex(c => c.id === id);
      if (index !== -1) {
        mockContributionsData.splice(index, 1);
        return { error: null };
      }
      return { error: 'Not found' };
    }
    
    return await supabase.from('capital_contributions').delete().eq('id', id);
  },
  
  // ========== DISTRIBUTIONS ==========
  
  async getDistributions(entityId, options = {}) {
    if (isDemoMode) {
      let filtered = [...mockDistributionsData];
      
      if (options.memberId) {
        filtered = filtered.filter(d => d.member_id === options.memberId);
      }
      
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
      return { data: filtered, error: null };
    }
    
    let query = supabase
      .from('distributions')
      .select('*, entity_members(name)')
      .eq('entity_id', entityId)
      .order('date', { ascending: false });
    
    if (options.memberId) {
      query = query.eq('member_id', options.memberId);
    }
    
    return await query;
  },
  
  async createDistribution(distribution) {
    if (isDemoMode) {
      const member = mockMembersData.find(m => m.id === distribution.member_id);
      const newDistribution = {
        ...distribution,
        id: Date.now(),
        member_name: member?.name || 'Unknown',
        created_at: new Date().toISOString(),
      };
      mockDistributionsData.push(newDistribution);
      
      // Update member capital account (decrease)
      if (member) {
        member.capital_account -= distribution.amount;
      }
      
      return { data: newDistribution, error: null };
    }
    
    const { data, error } = await supabase
      .from('distributions')
      .insert(distribution)
      .select()
      .single();
    
    if (!error) {
      // Update member capital account
      await supabase.rpc('update_capital_account', {
        p_member_id: distribution.member_id,
        p_amount: -distribution.amount,
      });
    }
    
    return { data, error };
  },
  
  async updateDistribution(id, updates) {
    if (isDemoMode) {
      const index = mockDistributionsData.findIndex(d => d.id === id);
      if (index !== -1) {
        mockDistributionsData[index] = { ...mockDistributionsData[index], ...updates };
        return { data: mockDistributionsData[index], error: null };
      }
      return { data: null, error: 'Not found' };
    }
    
    return await supabase
      .from('distributions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
  },
  
  async deleteDistribution(id) {
    if (isDemoMode) {
      const index = mockDistributionsData.findIndex(d => d.id === id);
      if (index !== -1) {
        mockDistributionsData.splice(index, 1);
        return { error: null };
      }
      return { error: 'Not found' };
    }
    
    return await supabase.from('distributions').delete().eq('id', id);
  },
  
  // ========== CAPITAL SUMMARY ==========
  
  async getCapitalSummary(entityId) {
    if (isDemoMode) {
      const totalContributions = mockContributionsData.reduce((sum, c) => sum + c.amount, 0);
      const totalDistributions = mockDistributionsData.reduce((sum, d) => sum + d.amount, 0);
      const totalCapital = mockMembersData.reduce((sum, m) => sum + m.capital_account, 0);
      
      return {
        data: {
          totalContributions,
          totalDistributions,
          totalCapital,
          memberCount: mockMembersData.length,
          members: mockMembersData.map(m => ({
            id: m.id,
            name: m.name,
            ownership_pct: m.ownership_pct,
            capital_account: m.capital_account,
          })),
        },
        error: null,
      };
    }
    
    const { data: members, error } = await supabase
      .from('entity_members')
      .select('id, name, ownership_pct, capital_account')
      .eq('entity_id', entityId);
    
    if (error) return { data: null, error };
    
    const totalCapital = members.reduce((sum, m) => sum + (m.capital_account || 0), 0);
    
    return {
      data: {
        totalCapital,
        memberCount: members.length,
        members,
      },
      error: null,
    };
  },
};

export default capitalService;
