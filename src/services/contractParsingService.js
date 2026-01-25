// src/services/contractParsingService.js
// Purchase Contract Parsing Service with AI integration

import { supabase, isDemoMode } from '@/lib/supabase';

const mockParsedContract = {
  id: 'contract-1',
  project_id: 'proj-1',
  contract_date: '2025-01-15',
  effective_date: '2025-01-15',
  closing_date: '2025-03-15',
  buyer_name: 'Highland Park Development LLC',
  buyer_entity: 'Highland Park Development LLC',
  seller_name: 'John & Mary Smith',
  seller_entity: '',
  purchase_price: 450000,
  earnest_money: 10000,
  earnest_money_due_date: '2025-01-20',
  financing_type: 'conventional',
  inspection_period_days: 14,
  inspection_deadline: '2025-01-29',
  due_diligence_deadline: '2025-02-14',
  contingencies: [
    { type: 'financing', description: 'Subject to buyer obtaining financing', deadline: '2025-02-28' },
    { type: 'inspection', description: 'Subject to satisfactory inspection', deadline: '2025-01-29' },
    { type: 'appraisal', description: 'Subject to property appraising at purchase price', deadline: '2025-02-15' },
  ],
  status: 'executed',
  parsing_status: 'completed',
};

export async function getPurchaseContract(projectId) {
  if (isDemoMode) {
    return { ...mockParsedContract, project_id: projectId };
  }

  const { data, error } = await supabase
    .from('purchase_contracts')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function createPurchaseContract(projectId, contractData) {
  if (isDemoMode) {
    return { id: `contract-${Date.now()}`, project_id: projectId, ...contractData, parsing_status: 'pending', created_at: new Date().toISOString() };
  }

  const { data, error } = await supabase
    .from('purchase_contracts')
    .insert([{ project_id: projectId, ...contractData, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePurchaseContract(contractId, updates) {
  if (isDemoMode) {
    return { ...mockParsedContract, ...updates, id: contractId };
  }

  const { data, error } = await supabase
    .from('purchase_contracts')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', contractId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function uploadContractDocument(projectId, file) {
  if (isDemoMode) {
    // Simulate upload and parsing
    return {
      documentUrl: `https://storage.example.com/contracts/${file.name}`,
      parsedData: mockParsedContract,
      parsing_status: 'completed',
    };
  }

  // Upload file to Supabase storage
  const fileName = `${projectId}/${Date.now()}_${file.name}`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('contracts')
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('contracts')
    .getPublicUrl(fileName);

  // Trigger edge function for parsing
  const { data: parseResult, error: parseError } = await supabase.functions
    .invoke('parse-contract', {
      body: { documentUrl: publicUrl, projectId },
    });

  if (parseError) {
    console.warn('Contract parsing failed, saving without parsed data:', parseError);
    return { documentUrl: publicUrl, parsedData: {}, parsing_status: 'failed' };
  }

  return {
    documentUrl: publicUrl,
    parsedData: parseResult?.data || {},
    parsing_status: 'completed',
  };
}

export async function retryContractParsing(contractId) {
  if (isDemoMode) {
    return { ...mockParsedContract, parsing_status: 'completed' };
  }

  const contract = await supabase
    .from('purchase_contracts')
    .select('document_url, project_id')
    .eq('id', contractId)
    .single();

  if (contract.error) throw contract.error;

  const { data, error } = await supabase.functions
    .invoke('parse-contract', {
      body: { documentUrl: contract.data.document_url, projectId: contract.data.project_id },
    });

  if (error) throw error;

  await updatePurchaseContract(contractId, {
    parsed_data: data?.data || {},
    parsing_status: 'completed',
  });

  return data;
}
