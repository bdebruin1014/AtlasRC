import { supabase } from '@/lib/supabase';

// Mock duplicate alerts for demo mode
const mockDuplicateAlerts = [
  {
    id: 'alert-1',
    entity_id: 'entity-2',
    account_id: 'acc-101',
    account: { account_number: '1110', account_name: 'Operating Cash' },
    duplicate_entity_id: 'entity-3',
    duplicate_account_id: 'acc-201',
    duplicate_account: { account_number: '1110', account_name: 'Operating Cash' },
    match_type: 'exact_number',
    confidence_score: 1.0,
    status: 'pending',
    created_at: '2024-12-15T10:00:00Z',
  },
  {
    id: 'alert-2',
    entity_id: 'entity-2',
    account_id: 'acc-102',
    account: { account_number: '2110', account_name: 'Trade Payables' },
    duplicate_entity_id: 'entity-3',
    duplicate_account_id: 'acc-202',
    duplicate_account: { account_number: '2100', account_name: 'Accounts Payable - Trade' },
    match_type: 'similar_name',
    confidence_score: 0.85,
    status: 'pending',
    created_at: '2024-12-15T10:00:00Z',
  },
];

// String similarity using Levenshtein distance
function calculateSimilarity(str1, str2) {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1.0;

  const len1 = s1.length;
  const len2 = s2.length;

  // Quick check for very different lengths
  if (Math.abs(len1 - len2) > Math.max(len1, len2) * 0.5) {
    return 0;
  }

  // Levenshtein distance
  const matrix = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  const distance = matrix[len1][len2];
  const maxLen = Math.max(len1, len2);
  return maxLen === 0 ? 1.0 : 1.0 - distance / maxLen;
}

// Normalize account name for comparison
function normalizeAccountName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    // Remove common suffixes/prefixes
    .replace(/^(the|a|an)\s+/g, '')
    .replace(/\s+(account|acct|acc)$/g, '')
    // Standardize common terms
    .replace(/accounts?\s+receivable/g, 'ar')
    .replace(/accounts?\s+payable/g, 'ap')
    .replace(/accumulated\s+depreciation/g, 'accum depr')
    .replace(/work\s+in\s+progress/g, 'wip')
    .replace(/construction\s+in\s+progress/g, 'cip');
}

export const duplicateDetectionService = {
  // Get all duplicate alerts
  async getAll(options = {}) {
    try {
      let query = supabase
        .from('coa_duplicate_alerts')
        .select(`
          *,
          account:accounts!coa_duplicate_alerts_account_id_fkey(id, account_number, account_name),
          duplicate_account:accounts!coa_duplicate_alerts_duplicate_account_id_fkey(id, account_number, account_name),
          entity:entities!coa_duplicate_alerts_entity_id_fkey(id, name),
          duplicate_entity:entities!coa_duplicate_alerts_duplicate_entity_id_fkey(id, name)
        `)
        .order('created_at', { ascending: false });

      if (options.entityId) {
        query = query.or(`entity_id.eq.${options.entityId},duplicate_entity_id.eq.${options.entityId}`);
      }

      if (options.status) {
        query = query.eq('status', options.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data: data || [], error: null };
    } catch (err) {
      console.error('Error fetching duplicate alerts:', err);
      let alerts = [...mockDuplicateAlerts];

      if (options.entityId) {
        alerts = alerts.filter(a =>
          a.entity_id === options.entityId || a.duplicate_entity_id === options.entityId
        );
      }
      if (options.status) {
        alerts = alerts.filter(a => a.status === options.status);
      }

      return { data: alerts, error: null };
    }
  },

  // Get alert by ID
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('coa_duplicate_alerts')
        .select(`
          *,
          account:accounts!coa_duplicate_alerts_account_id_fkey(*),
          duplicate_account:accounts!coa_duplicate_alerts_duplicate_account_id_fkey(*),
          entity:entities!coa_duplicate_alerts_entity_id_fkey(id, name),
          duplicate_entity:entities!coa_duplicate_alerts_duplicate_entity_id_fkey(id, name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      console.error('Error fetching duplicate alert by ID:', err);
      const alert = mockDuplicateAlerts.find(a => a.id === id);
      return { data: alert || null, error: alert ? null : 'Not found' };
    }
  },

  // Detect duplicates between two entities
  async detectDuplicates(entity1Id, entity2Id, options = {}) {
    const threshold = options.threshold || 0.75; // Similarity threshold

    // Get accounts for both entities
    let accounts1, accounts2;

    try {
      const { data: a1 } = await supabase
        .from('accounts')
        .select('*')
        .eq('entity_id', entity1Id)
        .eq('is_active', true);

      const { data: a2 } = await supabase
        .from('accounts')
        .select('*')
        .eq('entity_id', entity2Id)
        .eq('is_active', true);

      accounts1 = a1 || [];
      accounts2 = a2 || [];
    } catch (err) {
      console.error('Error fetching accounts for duplicate detection:', err);
      // Fallback to demo data
      accounts1 = [
        { id: 'acc-101', entity_id: entity1Id, account_number: '1110', account_name: 'Operating Cash' },
        { id: 'acc-102', entity_id: entity1Id, account_number: '2110', account_name: 'Trade Payables' },
      ];
      accounts2 = [
        { id: 'acc-201', entity_id: entity2Id, account_number: '1110', account_name: 'Operating Cash' },
        { id: 'acc-202', entity_id: entity2Id, account_number: '2100', account_name: 'Accounts Payable - Trade' },
      ];
    }

    const duplicates = [];

    for (const acc1 of accounts1) {
      for (const acc2 of accounts2) {
        let matchType = null;
        let confidence = 0;

        // Check for exact account number match
        if (acc1.account_number === acc2.account_number) {
          matchType = 'exact_number';
          confidence = 1.0;
        }

        // Check for exact name match
        if (normalizeAccountName(acc1.account_name) === normalizeAccountName(acc2.account_name)) {
          if (matchType === 'exact_number') {
            matchType = 'exact_match';
          } else {
            matchType = 'similar_name';
            confidence = 1.0;
          }
        }

        // Check for similar names
        if (!matchType) {
          const similarity = calculateSimilarity(
            normalizeAccountName(acc1.account_name),
            normalizeAccountName(acc2.account_name)
          );

          if (similarity >= threshold) {
            matchType = 'similar_name';
            confidence = similarity;
          }
        }

        if (matchType && confidence >= threshold) {
          duplicates.push({
            entity_id: entity1Id,
            account_id: acc1.id,
            account: acc1,
            duplicate_entity_id: entity2Id,
            duplicate_account_id: acc2.id,
            duplicate_account: acc2,
            match_type: matchType,
            confidence_score: confidence,
          });
        }
      }
    }

    return { data: duplicates, error: null };
  },

  // Scan all related entities for duplicates
  async scanRelatedEntities(entityId) {
    // Get related entities through ownership
    let relatedEntityIds = [];

    try {
      const { data: relationships } = await supabase
        .from('entity_relationships')
        .select('parent_entity_id, child_entity_id')
        .or(`parent_entity_id.eq.${entityId},child_entity_id.eq.${entityId}`);

      if (relationships) {
        relatedEntityIds = [
          ...new Set(
            relationships.flatMap(r => [r.parent_entity_id, r.child_entity_id])
          )
        ].filter(id => id !== entityId);
      }
    } catch (err) {
      console.error('Error fetching related entities for scan:', err);
      relatedEntityIds = ['entity-2', 'entity-3'].filter(id => id !== entityId);
    }

    const allDuplicates = [];

    for (const relatedId of relatedEntityIds) {
      const { data: duplicates } = await this.detectDuplicates(entityId, relatedId);
      if (duplicates) {
        allDuplicates.push(...duplicates);
      }
    }

    return { data: allDuplicates, error: null };
  },

  // Create alert from detection
  async createAlert(detection) {
    try {
      // Check if alert already exists
      const { data: existing } = await supabase
        .from('coa_duplicate_alerts')
        .select('id')
        .eq('account_id', detection.account_id)
        .eq('duplicate_account_id', detection.duplicate_account_id)
        .single();

      if (existing) {
        return { data: null, error: 'Alert already exists' };
      }

      const { data, error } = await supabase
        .from('coa_duplicate_alerts')
        .insert({
          entity_id: detection.entity_id,
          account_id: detection.account_id,
          duplicate_entity_id: detection.duplicate_entity_id,
          duplicate_account_id: detection.duplicate_account_id,
          match_type: detection.match_type,
          confidence_score: detection.confidence_score,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      console.error('Error creating duplicate alert:', err);
      const newAlert = {
        ...detection,
        id: `alert-${Date.now()}`,
        status: 'pending',
        created_at: new Date().toISOString(),
      };
      mockDuplicateAlerts.push(newAlert);
      return { data: newAlert, error: null };
    }
  },

  // Update alert status
  async updateStatus(id, status, notes = null, userId = null) {
    const updates = {
      status,
      notes,
      reviewed_at: new Date().toISOString(),
      reviewed_by: userId,
    };

    try {
      const { data, error } = await supabase
        .from('coa_duplicate_alerts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      console.error('Error updating duplicate alert status:', err);
      const index = mockDuplicateAlerts.findIndex(a => a.id === id);
      if (index !== -1) {
        mockDuplicateAlerts[index] = { ...mockDuplicateAlerts[index], ...updates };
        return { data: mockDuplicateAlerts[index], error: null };
      }
      return { data: null, error: 'Not found' };
    }
  },

  // Dismiss an alert
  async dismiss(id, notes = null, userId = null) {
    return this.updateStatus(id, 'dismissed', notes, userId);
  },

  // Confirm an alert as a true duplicate
  async confirm(id, notes = null, userId = null) {
    return this.updateStatus(id, 'confirmed', notes, userId);
  },

  // Mark as merged (after accounts have been consolidated)
  async markMerged(id, notes = null, userId = null) {
    return this.updateStatus(id, 'merged', notes, userId);
  },

  // Get statistics for dashboard
  async getStats(entityId = null) {
    const { data: alerts, error } = await this.getAll({ entityId });
    if (error) return { data: null, error };

    const stats = {
      total: alerts.length,
      pending: alerts.filter(a => a.status === 'pending').length,
      confirmed: alerts.filter(a => a.status === 'confirmed').length,
      dismissed: alerts.filter(a => a.status === 'dismissed').length,
      merged: alerts.filter(a => a.status === 'merged').length,
      byMatchType: {
        exact_match: alerts.filter(a => a.match_type === 'exact_match').length,
        exact_number: alerts.filter(a => a.match_type === 'exact_number').length,
        similar_name: alerts.filter(a => a.match_type === 'similar_name').length,
      },
      averageConfidence: alerts.length > 0
        ? alerts.reduce((sum, a) => sum + (a.confidence_score || 0), 0) / alerts.length
        : 0,
    };

    return { data: stats, error: null };
  },

  // Batch create alerts from scan results
  async createAlertsFromScan(detections) {
    const results = [];

    for (const detection of detections) {
      const { data, error } = await this.createAlert(detection);
      results.push({ detection, data, error });
    }

    return {
      data: {
        created: results.filter(r => r.data).length,
        failed: results.filter(r => r.error).length,
        results,
      },
      error: null,
    };
  },
};

export default duplicateDetectionService;
