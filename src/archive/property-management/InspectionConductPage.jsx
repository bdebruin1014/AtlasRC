// src/pages/property-management/InspectionConductPage.jsx
// Full-page inspection conducting interface

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Camera, Check, X, AlertTriangle, Save, 
  ChevronDown, ChevronRight, Loader2, Image, Trash2,
  CheckCircle, AlertCircle, Clock, ClipboardCheck,
  Pencil, Plus, Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  getInspection, 
  updateInspectionItem, 
  completeInspection,
  uploadInspectionPhoto,
  removeInspectionPhoto,
  updateInspection,
  ITEM_CONDITIONS,
  INSPECTION_TYPES,
} from '@/services/inspectionService';

const CONDITION_COLORS = {
  excellent: 'bg-green-100 border-green-500 text-green-700',
  good: 'bg-emerald-100 border-emerald-500 text-emerald-700',
  fair: 'bg-yellow-100 border-yellow-500 text-yellow-700',
  poor: 'bg-orange-100 border-orange-500 text-orange-700',
  damaged: 'bg-red-100 border-red-500 text-red-700',
  na: 'bg-gray-100 border-gray-400 text-gray-600',
};

const InspectionConductPage = () => {
  const { inspectionId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [inspection, setInspection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [activeItem, setActiveItem] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(null);
  const [summaryNotes, setSummaryNotes] = useState('');
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  useEffect(() => {
    loadInspection();
  }, [inspectionId]);

  const loadInspection = async () => {
    setLoading(true);
    const { data, error } = await getInspection(inspectionId);
    if (data) {
      setInspection(data);
      setSummaryNotes(data.summary_notes || '');
      
      // Expand first section by default
      if (data.items?.length > 0) {
        const sections = [...new Set(data.items.map(i => i.section_name))];
        setExpandedSections({ [sections[0]]: true });
      }
      
      // Update status to in_progress if scheduled
      if (data.status === 'scheduled') {
        await updateInspection(inspectionId, { status: 'in_progress' });
      }
    }
    setLoading(false);
  };

  const toggleSection = (sectionName) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  const handleConditionChange = async (item, condition) => {
    setSaving(true);
    await updateInspectionItem(item.id, { condition });
    
    // Update local state
    setInspection(prev => ({
      ...prev,
      items: prev.items.map(i => 
        i.id === item.id ? { ...i, condition } : i
      )
    }));
    setSaving(false);
  };

  const handleNotesChange = async (item, notes) => {
    // Debounced save would be better, but for now just save on blur
    await updateInspectionItem(item.id, { notes });
    
    setInspection(prev => ({
      ...prev,
      items: prev.items.map(i => 
        i.id === item.id ? { ...i, notes } : i
      )
    }));
  };

  const handleRepairToggle = async (item) => {
    setSaving(true);
    const newValue = !item.requires_repair;
    await updateInspectionItem(item.id, { requires_repair: newValue });
    
    setInspection(prev => ({
      ...prev,
      items: prev.items.map(i => 
        i.id === item.id ? { ...i, requires_repair: newValue } : i
      )
    }));
    setSaving(false);
  };

  const handlePhotoUpload = async (item, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(item.id);
    const { url, error } = await uploadInspectionPhoto(inspectionId, item.id, file);
    
    if (url) {
      setInspection(prev => ({
        ...prev,
        items: prev.items.map(i => 
          i.id === item.id 
            ? { ...i, photo_urls: [...(i.photo_urls || []), url] }
            : i
        )
      }));
    }
    
    setUploadingPhoto(null);
    e.target.value = '';
  };

  const handleRemovePhoto = async (item, photoUrl) => {
    if (!confirm('Remove this photo?')) return;
    
    await removeInspectionPhoto(item.id, photoUrl);
    
    setInspection(prev => ({
      ...prev,
      items: prev.items.map(i => 
        i.id === item.id 
          ? { ...i, photo_urls: (i.photo_urls || []).filter(u => u !== photoUrl) }
          : i
      )
    }));
  };

  const handleComplete = async () => {
    setCompleting(true);
    
    const { data, error } = await completeInspection(inspectionId, {
      notes: summaryNotes,
    });

    if (!error) {
      navigate('/property-management/inspections');
    }
    
    setCompleting(false);
    setShowCompleteModal(false);
  };

  // Group items by section
  const getSections = () => {
    if (!inspection?.items) return [];
    
    const sectionMap = {};
    inspection.items.forEach(item => {
      if (!sectionMap[item.section_name]) {
        sectionMap[item.section_name] = [];
      }
      sectionMap[item.section_name].push(item);
    });

    return Object.entries(sectionMap).map(([name, items]) => ({
      name,
      items,
      completed: items.filter(i => i.condition).length,
      total: items.length,
      hasIssues: items.some(i => i.requires_repair || ['poor', 'damaged'].includes(i.condition)),
    }));
  };

  const getProgress = () => {
    if (!inspection?.items) return { completed: 0, total: 0, percent: 0 };
    const total = inspection.items.length;
    const completed = inspection.items.filter(i => i.condition).length;
    return { completed, total, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Inspection not found</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => navigate('/property-management/inspections')}
          >
            Back to Inspections
          </Button>
        </div>
      </div>
    );
  }

  const sections = getSections();
  const progress = getProgress();
  const inspectionType = INSPECTION_TYPES.find(t => t.id === inspection.inspection_type);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/property-management/inspections')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-semibold">{inspectionType?.label || 'Inspection'}</h1>
                <p className="text-sm text-gray-500">
                  {inspection.property?.name || inspection.property?.address}
                  {inspection.unit && ` • Unit ${inspection.unit.unit_number}`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {saving && (
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </span>
              )}
              <Button 
                onClick={() => setShowCompleteModal(true)}
                disabled={progress.percent < 100}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete Inspection
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium">{progress.completed} / {progress.total} items ({progress.percent}%)</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        {/* Section Cards */}
        {sections.map((section) => (
          <div key={section.name} className="bg-white rounded-lg border shadow-sm">
            {/* Section Header */}
            <button
              onClick={() => toggleSection(section.name)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                {expandedSections[section.name] ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
                <span className="font-medium">{section.name}</span>
                {section.hasIssues && (
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {section.completed} / {section.total}
                </span>
                {section.completed === section.total && (
                  <Check className="w-4 h-4 text-emerald-500" />
                )}
              </div>
            </button>

            {/* Section Items */}
            {expandedSections[section.name] && (
              <div className="border-t divide-y">
                {section.items.map((item) => (
                  <div key={item.id} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.item_name}</p>
                        
                        {/* Condition Buttons */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {ITEM_CONDITIONS.map((cond) => (
                            <button
                              key={cond.id}
                              onClick={() => handleConditionChange(item, cond.id)}
                              className={cn(
                                "px-2 py-1 text-xs rounded border transition-all",
                                item.condition === cond.id
                                  ? CONDITION_COLORS[cond.id]
                                  : "bg-gray-50 border-gray-200 hover:border-gray-300"
                              )}
                            >
                              {cond.label}
                            </button>
                          ))}
                        </div>

                        {/* Notes */}
                        <textarea
                          value={item.notes || ''}
                          onChange={(e) => {
                            // Local update immediately
                            setInspection(prev => ({
                              ...prev,
                              items: prev.items.map(i => 
                                i.id === item.id ? { ...i, notes: e.target.value } : i
                              )
                            }));
                          }}
                          onBlur={(e) => handleNotesChange(item, e.target.value)}
                          placeholder="Add notes..."
                          rows={1}
                          className="w-full mt-2 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                        />

                        {/* Photos */}
                        {item.photo_urls?.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {item.photo_urls.map((url, idx) => (
                              <div key={idx} className="relative group">
                                <img 
                                  src={url} 
                                  alt={`Photo ${idx + 1}`}
                                  className="w-16 h-16 object-cover rounded border"
                                />
                                <button
                                  onClick={() => handleRemovePhoto(item, url)}
                                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        {/* Requires Repair Toggle */}
                        <button
                          onClick={() => handleRepairToggle(item)}
                          className={cn(
                            "p-2 rounded border transition-colors",
                            item.requires_repair
                              ? "bg-orange-100 border-orange-300 text-orange-600"
                              : "bg-gray-50 border-gray-200 text-gray-400 hover:border-gray-300"
                          )}
                          title="Requires Repair"
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </button>

                        {/* Photo Upload */}
                        <label className="p-2 rounded border bg-gray-50 border-gray-200 text-gray-400 hover:border-gray-300 cursor-pointer transition-colors">
                          {uploadingPhoto === item.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Camera className="w-4 h-4" />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={(e) => handlePhotoUpload(item, e)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Summary Notes */}
        <div className="bg-white rounded-lg border shadow-sm p-4">
          <h3 className="font-medium mb-2">Summary Notes</h3>
          <textarea
            value={summaryNotes}
            onChange={(e) => setSummaryNotes(e.target.value)}
            placeholder="Overall inspection notes, recommendations, follow-up items..."
            rows={4}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Complete Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCompleteModal(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-2">Complete Inspection</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to complete this inspection? This will finalize the report.
            </p>
            
            {inspection.items?.some(i => i.requires_repair) && (
              <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-orange-700">Items Requiring Repair</p>
                  <p className="text-sm text-orange-600">
                    {inspection.items.filter(i => i.requires_repair).length} items flagged for repair
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCompleteModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleComplete}
                disabled={completing}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {completing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Completing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectionConductPage;
