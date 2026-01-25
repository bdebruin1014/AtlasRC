import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { isDemoMode } from '@/lib/utils';
import ScatteredLotDealSheet from './ScatteredLotDealSheet';
import BTRDealSheet from './BTRDealSheet';
import HorizontalDevDealSheet from './HorizontalDevDealSheet';
import MultifamilyDealSheet from './MultifamilyDealSheet';
import {
  Home,
  Building2,
  Layers,
  Users,
  ChevronDown
} from 'lucide-react';

// Deal type configurations
const DEAL_TYPES = [
  {
    id: 'scattered_lot',
    name: 'Scattered Lot',
    description: 'Single-lot spec home construction',
    icon: Home,
    color: 'blue'
  },
  {
    id: 'build_to_rent',
    name: 'Build-to-Rent',
    description: 'BTR community development',
    icon: Building2,
    color: 'purple'
  },
  {
    id: 'horizontal_development',
    name: 'Horizontal Development',
    description: 'Land subdivision & lot sales',
    icon: Layers,
    color: 'emerald'
  },
  {
    id: 'multifamily_acquisition',
    name: 'Multifamily Acquisition',
    description: 'Existing property acquisition',
    icon: Users,
    color: 'amber'
  }
];

export default function AbbreviatedDealSheet({
  opportunityId,
  opportunityType = null,
  onSave,
  onCreateProject,
  className = ''
}) {
  const [dealType, setDealType] = useState(opportunityType || 'scattered_lot');
  const [savedData, setSavedData] = useState(null);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (opportunityId) {
      fetchSavedDealSheet();
    } else {
      setLoading(false);
    }
  }, [opportunityId]);

  const fetchSavedDealSheet = async () => {
    if (isDemoMode()) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('opportunity_deal_sheets')
        .select('*')
        .eq('opportunity_id', opportunityId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (data && !error) {
        setSavedData(data);
        setDealType(data.deal_type);
      }
    } catch (error) {
      console.error('Error fetching deal sheet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data) => {
    if (isDemoMode()) {
      console.log('Demo mode: Would save deal sheet', data);
      if (onSave) onSave(data);
      return;
    }

    try {
      const { data: saved, error } = await supabase
        .from('opportunity_deal_sheets')
        .upsert({
          ...data,
          opportunity_id: opportunityId,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'opportunity_id'
        })
        .select()
        .single();

      if (error) throw error;
      setSavedData(saved);
      if (onSave) onSave(saved);
    } catch (error) {
      console.error('Error saving deal sheet:', error);
    }
  };

  const handleCreateProject = (calculations) => {
    if (onCreateProject) {
      onCreateProject({
        dealType,
        calculations,
        dealSheetId: savedData?.id
      });
    }
  };

  const selectedType = DEAL_TYPES.find(t => t.id === dealType);
  const Icon = selectedType?.icon || Home;

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border shadow-sm p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Deal Type Selector */}
      <div className="mb-4 flex items-center justify-between">
        <div className="relative">
          <button
            onClick={() => setShowTypeSelector(!showTypeSelector)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Icon className="w-4 h-4" />
            <span className="font-medium">{selectedType?.name}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showTypeSelector ? 'rotate-180' : ''}`} />
          </button>

          {showTypeSelector && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowTypeSelector(false)}
              />
              <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-lg border z-20">
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 px-3 py-2">
                    SELECT DEAL TYPE
                  </div>
                  {DEAL_TYPES.map(type => {
                    const TypeIcon = type.icon;
                    return (
                      <button
                        key={type.id}
                        onClick={() => {
                          setDealType(type.id);
                          setShowTypeSelector(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-left ${
                          dealType === type.id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${
                          type.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                          type.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                          type.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                          'bg-amber-100 text-amber-600'
                        }`}>
                          <TypeIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{type.name}</div>
                          <div className="text-xs text-gray-500">{type.description}</div>
                        </div>
                        {dealType === type.id && (
                          <div className="ml-auto text-blue-600">✓</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="text-xs text-gray-500">
          Quick financial analysis • Not for final decisions
        </div>
      </div>

      {/* Deal Sheet Component */}
      {dealType === 'scattered_lot' && (
        <ScatteredLotDealSheet
          opportunityId={opportunityId}
          initialData={savedData?.deal_type === 'scattered_lot' ? savedData : null}
          onSave={handleSave}
          onCreateProject={handleCreateProject}
        />
      )}

      {dealType === 'build_to_rent' && (
        <BTRDealSheet
          opportunityId={opportunityId}
          initialData={savedData?.deal_type === 'build_to_rent' ? savedData : null}
          onSave={handleSave}
          onCreateProject={handleCreateProject}
        />
      )}

      {dealType === 'horizontal_development' && (
        <HorizontalDevDealSheet
          opportunityId={opportunityId}
          initialData={savedData?.deal_type === 'horizontal_development' ? savedData : null}
          onSave={handleSave}
          onCreateProject={handleCreateProject}
        />
      )}

      {dealType === 'multifamily_acquisition' && (
        <MultifamilyDealSheet
          opportunityId={opportunityId}
          initialData={savedData?.deal_type === 'multifamily_acquisition' ? savedData : null}
          onSave={handleSave}
          onCreateProject={handleCreateProject}
        />
      )}
    </div>
  );
}

// Export individual components for direct use
export { ScatteredLotDealSheet, BTRDealSheet, HorizontalDevDealSheet, MultifamilyDealSheet };
