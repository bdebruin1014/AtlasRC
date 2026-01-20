/**
 * Atlas - Contract Record Page
 * Individual contract record management for dispositions:
 * - Bulk sale contracts (lot development)
 * - Home sale contracts (for-sale development)
 * - Lease agreements (BTR)
 * - Assignment contracts (wholesale)
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, FileSignature, Calendar, DollarSign, Users, 
  Building2, FileText, CheckCircle2, Clock, AlertCircle, Download,
  Upload, Send, Eye, Edit2, Trash2, Plus, MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const ContractRecordPage = () => {
  const { projectId, contractId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  const [isEditing, setIsEditing] = useState(!contractId); // New contracts start in edit mode

  // Contract form state
  const [contract, setContract] = useState({
    // Basic Info
    contractNumber: contractId || '',
    contractType: 'bulk-sale', // bulk-sale, home-sale, lease, assignment
    status: 'draft', // draft, pending-signatures, active, closed, cancelled
    
    // Parties
    seller: {
      name: 'VanRock Holdings LLC',
      entity: 'VanRock Holdings LLC',
      contactName: 'Bryan Van Rock',
      email: 'bryan@vanrock.com',
      phone: '(864) 555-0100',
      address: '123 Main Street, Greenville, SC 29601'
    },
    buyer: {
      name: '',
      entity: '',
      contactName: '',
      email: '',
      phone: '',
      address: ''
    },
    
    // Property/Units
    units: [],
    totalUnits: 0,
    lotList: '', // For bulk sales: "Lots 1-8, Block A, Phase 1"
    
    // Financial Terms
    purchasePrice: 0,
    pricePerUnit: 0,
    earnestMoney: 0,
    earnestMoneyDueDate: '',
    earnestMoneyReceived: false,
    additionalDeposit: 0,
    additionalDepositDueDate: '',
    additionalDepositReceived: false,
    
    // Dates
    effectiveDate: '',
    dueDiligenceDeadline: '',
    financingContingencyDeadline: '',
    inspectionDeadline: '',
    closingDate: '',
    possessionDate: '',
    
    // Terms
    financingContingency: false,
    inspectionContingency: false,
    appraisalContingency: false,
    saleContingency: false,
    titleCompany: '',
    escrowAgent: '',
    escrowNumber: '',
    specialTerms: '',
    
    // Takedown Schedule (for bulk sales)
    hasTakedownSchedule: false,
    takedownFrequency: 'quarterly', // quarterly, monthly, custom
    takedownSchedule: [],
    escalationRate: 0,
    
    // Documents
    documents: [],
    
    // Timeline/Audit
    createdDate: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    history: []
  });

  // Contract type configurations
  const contractTypes = [
    { value: 'bulk-sale', label: 'Bulk Sale Contract', description: 'Sale of multiple lots to a builder' },
    { value: 'home-sale', label: 'Home Sale Contract', description: 'Sale of individual home to end buyer' },
    { value: 'lease', label: 'Lease Agreement', description: 'Residential lease for BTR units' },
    { value: 'assignment', label: 'Assignment Contract', description: 'Wholesale assignment agreement' },
    { value: 'lot-sale', label: 'Lot Sale Contract', description: 'Sale of individual lot' }
  ];

  const statusOptions = [
    { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-700' },
    { value: 'pending-signatures', label: 'Pending Signatures', color: 'bg-amber-100 text-amber-700' },
    { value: 'active', label: 'Active/Under Contract', color: 'bg-blue-100 text-blue-700' },
    { value: 'closed', label: 'Closed', color: 'bg-green-100 text-green-700' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-700' },
    { value: 'expired', label: 'Expired', color: 'bg-gray-100 text-gray-600' }
  ];

  const formatCurrency = (val) => {
    if (!val) return '';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  const handleInputChange = (field, value) => {
    setContract(prev => ({
      ...prev,
      [field]: value,
      lastModified: new Date().toISOString()
    }));
  };

  const handleNestedChange = (parent, field, value) => {
    setContract(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      },
      lastModified: new Date().toISOString()
    }));
  };

  const handleSave = () => {
    // In real app, would save to database
    console.log('Saving contract:', contract);
    setIsEditing(false);
  };

  const addTakedown = () => {
    const newTakedown = {
      id: Date.now(),
      number: contract.takedownSchedule.length + 1,
      scheduledDate: '',
      lots: 0,
      amount: 0,
      status: 'scheduled',
      actualDate: '',
      actualAmount: 0,
      notes: ''
    };
    setContract(prev => ({
      ...prev,
      takedownSchedule: [...prev.takedownSchedule, newTakedown]
    }));
  };

  const updateTakedown = (id, field, value) => {
    setContract(prev => ({
      ...prev,
      takedownSchedule: prev.takedownSchedule.map(td => 
        td.id === id ? { ...td, [field]: value } : td
      )
    }));
  };

  const removeTakedown = (id) => {
    setContract(prev => ({
      ...prev,
      takedownSchedule: prev.takedownSchedule.filter(td => td.id !== id)
    }));
  };

  const renderDetailsTab = () => (
    <div className="p-6 space-y-8">
      {/* Contract Type & Status */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold mb-4">Contract Information</h3>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contract Number</label>
            <Input 
              value={contract.contractNumber}
              onChange={(e) => handleInputChange('contractNumber', e.target.value)}
              placeholder="CON-001"
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contract Type</label>
            <select 
              className="w-full h-10 px-3 border rounded-md text-sm"
              value={contract.contractType}
              onChange={(e) => handleInputChange('contractType', e.target.value)}
              disabled={!isEditing}
            >
              {contractTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select 
              className="w-full h-10 px-3 border rounded-md text-sm"
              value={contract.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              disabled={!isEditing}
            >
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Parties */}
      <div className="grid grid-cols-2 gap-6">
        {/* Seller */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-gray-500" />Seller
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Entity Name</label>
              <Input 
                value={contract.seller.entity}
                onChange={(e) => handleNestedChange('seller', 'entity', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
              <Input 
                value={contract.seller.contactName}
                onChange={(e) => handleNestedChange('seller', 'contactName', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input 
                  type="email"
                  value={contract.seller.email}
                  onChange={(e) => handleNestedChange('seller', 'email', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <Input 
                  value={contract.seller.phone}
                  onChange={(e) => handleNestedChange('seller', 'phone', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <Input 
                value={contract.seller.address}
                onChange={(e) => handleNestedChange('seller', 'address', e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>

        {/* Buyer */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-500" />Buyer
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Entity/Name</label>
              <Input 
                value={contract.buyer.entity}
                onChange={(e) => handleNestedChange('buyer', 'entity', e.target.value)}
                placeholder="Enter buyer name or entity"
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
              <Input 
                value={contract.buyer.contactName}
                onChange={(e) => handleNestedChange('buyer', 'contactName', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input 
                  type="email"
                  value={contract.buyer.email}
                  onChange={(e) => handleNestedChange('buyer', 'email', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <Input 
                  value={contract.buyer.phone}
                  onChange={(e) => handleNestedChange('buyer', 'phone', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <Input 
                value={contract.buyer.address}
                onChange={(e) => handleNestedChange('buyer', 'address', e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Property/Units */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-gray-500" />Property / Units
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Units/Lots</label>
            <Input 
              type="number"
              value={contract.totalUnits}
              onChange={(e) => handleInputChange('totalUnits', parseInt(e.target.value) || 0)}
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lot List / Description</label>
            <Input 
              value={contract.lotList}
              onChange={(e) => handleInputChange('lotList', e.target.value)}
              placeholder="e.g., Lots 1-8, Block A, Phase 1"
              disabled={!isEditing}
            />
          </div>
        </div>
      </div>

      {/* Financial Terms */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-gray-500" />Financial Terms
        </h3>
        <div className="grid grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price</label>
            <Input 
              type="number"
              value={contract.purchasePrice}
              onChange={(e) => handleInputChange('purchasePrice', parseFloat(e.target.value) || 0)}
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price Per Unit</label>
            <Input 
              type="number"
              value={contract.pricePerUnit}
              onChange={(e) => handleInputChange('pricePerUnit', parseFloat(e.target.value) || 0)}
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Earnest Money</label>
            <Input 
              type="number"
              value={contract.earnestMoney}
              onChange={(e) => handleInputChange('earnestMoney', parseFloat(e.target.value) || 0)}
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">EM Due Date</label>
            <Input 
              type="date"
              value={contract.earnestMoneyDueDate}
              onChange={(e) => handleInputChange('earnestMoneyDueDate', e.target.value)}
              disabled={!isEditing}
            />
          </div>
        </div>
        
        <div className="mt-4 flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input 
              type="checkbox"
              checked={contract.earnestMoneyReceived}
              onChange={(e) => handleInputChange('earnestMoneyReceived', e.target.checked)}
              disabled={!isEditing}
              className="rounded"
            />
            <span className="text-sm">Earnest Money Received</span>
          </label>
        </div>
      </div>

      {/* Key Dates */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-500" />Key Dates
        </h3>
        <div className="grid grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Effective Date</label>
            <Input 
              type="date"
              value={contract.effectiveDate}
              onChange={(e) => handleInputChange('effectiveDate', e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">DD Deadline</label>
            <Input 
              type="date"
              value={contract.dueDiligenceDeadline}
              onChange={(e) => handleInputChange('dueDiligenceDeadline', e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Closing Date</label>
            <Input 
              type="date"
              value={contract.closingDate}
              onChange={(e) => handleInputChange('closingDate', e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Possession Date</label>
            <Input 
              type="date"
              value={contract.possessionDate}
              onChange={(e) => handleInputChange('possessionDate', e.target.value)}
              disabled={!isEditing}
            />
          </div>
        </div>
      </div>

      {/* Contingencies */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold mb-4">Contingencies</h3>
        <div className="grid grid-cols-4 gap-6">
          <label className="flex items-center gap-2">
            <input 
              type="checkbox"
              checked={contract.financingContingency}
              onChange={(e) => handleInputChange('financingContingency', e.target.checked)}
              disabled={!isEditing}
              className="rounded"
            />
            <span className="text-sm">Financing Contingency</span>
          </label>
          <label className="flex items-center gap-2">
            <input 
              type="checkbox"
              checked={contract.inspectionContingency}
              onChange={(e) => handleInputChange('inspectionContingency', e.target.checked)}
              disabled={!isEditing}
              className="rounded"
            />
            <span className="text-sm">Inspection Contingency</span>
          </label>
          <label className="flex items-center gap-2">
            <input 
              type="checkbox"
              checked={contract.appraisalContingency}
              onChange={(e) => handleInputChange('appraisalContingency', e.target.checked)}
              disabled={!isEditing}
              className="rounded"
            />
            <span className="text-sm">Appraisal Contingency</span>
          </label>
          <label className="flex items-center gap-2">
            <input 
              type="checkbox"
              checked={contract.saleContingency}
              onChange={(e) => handleInputChange('saleContingency', e.target.checked)}
              disabled={!isEditing}
              className="rounded"
            />
            <span className="text-sm">Sale Contingency</span>
          </label>
        </div>
      </div>

      {/* Closing Info */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold mb-4">Closing Information</h3>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title Company</label>
            <Input 
              value={contract.titleCompany}
              onChange={(e) => handleInputChange('titleCompany', e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Escrow Agent</label>
            <Input 
              value={contract.escrowAgent}
              onChange={(e) => handleInputChange('escrowAgent', e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Escrow Number</label>
            <Input 
              value={contract.escrowNumber}
              onChange={(e) => handleInputChange('escrowNumber', e.target.value)}
              disabled={!isEditing}
            />
          </div>
        </div>
      </div>

      {/* Special Terms */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold mb-4">Special Terms & Notes</h3>
        <textarea 
          className="w-full h-32 px-3 py-2 border rounded-md text-sm resize-none"
          value={contract.specialTerms}
          onChange={(e) => handleInputChange('specialTerms', e.target.value)}
          placeholder="Enter any special terms, conditions, or notes..."
          disabled={!isEditing}
        />
      </div>
    </div>
  );

  const renderTakedownTab = () => (
    <div className="p-6 space-y-6">
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Takedown Schedule</h3>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox"
                checked={contract.hasTakedownSchedule}
                onChange={(e) => handleInputChange('hasTakedownSchedule', e.target.checked)}
                disabled={!isEditing}
                className="rounded"
              />
              <span className="text-sm">Enable Takedown Schedule</span>
            </label>
            {contract.hasTakedownSchedule && isEditing && (
              <Button size="sm" onClick={addTakedown}>
                <Plus className="w-4 h-4 mr-1" />Add Takedown
              </Button>
            )}
          </div>
        </div>

        {contract.hasTakedownSchedule && (
          <>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Takedown Frequency</label>
                <select 
                  className="w-full h-10 px-3 border rounded-md text-sm"
                  value={contract.takedownFrequency}
                  onChange={(e) => handleInputChange('takedownFrequency', e.target.value)}
                  disabled={!isEditing}
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="semi-annual">Semi-Annual</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Escalation Rate (%)</label>
                <Input 
                  type="number"
                  step="0.1"
                  value={contract.escalationRate}
                  onChange={(e) => handleInputChange('escalationRate', parseFloat(e.target.value) || 0)}
                  disabled={!isEditing}
                />
              </div>
            </div>

            {contract.takedownSchedule.length > 0 && (
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium">#</th>
                    <th className="text-left px-4 py-2 font-medium">Scheduled Date</th>
                    <th className="text-right px-4 py-2 font-medium">Lots</th>
                    <th className="text-right px-4 py-2 font-medium">Amount</th>
                    <th className="text-left px-4 py-2 font-medium">Status</th>
                    <th className="text-left px-4 py-2 font-medium">Actual Date</th>
                    <th className="text-right px-4 py-2 font-medium">Actual Amount</th>
                    <th className="text-left px-4 py-2 font-medium">Notes</th>
                    {isEditing && <th className="w-12 px-4 py-2"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {contract.takedownSchedule.map((takedown, idx) => (
                    <tr key={takedown.id}>
                      <td className="px-4 py-2 font-medium">{idx + 1}</td>
                      <td className="px-4 py-2">
                        <Input 
                          type="date"
                          value={takedown.scheduledDate}
                          onChange={(e) => updateTakedown(takedown.id, 'scheduledDate', e.target.value)}
                          disabled={!isEditing}
                          className="h-8"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <Input 
                          type="number"
                          value={takedown.lots}
                          onChange={(e) => updateTakedown(takedown.id, 'lots', parseInt(e.target.value) || 0)}
                          disabled={!isEditing}
                          className="h-8 w-20 text-right"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <Input 
                          type="number"
                          value={takedown.amount}
                          onChange={(e) => updateTakedown(takedown.id, 'amount', parseFloat(e.target.value) || 0)}
                          disabled={!isEditing}
                          className="h-8 w-28 text-right"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <select 
                          className="h-8 px-2 border rounded text-sm"
                          value={takedown.status}
                          onChange={(e) => updateTakedown(takedown.id, 'status', e.target.value)}
                          disabled={!isEditing}
                        >
                          <option value="scheduled">Scheduled</option>
                          <option value="upcoming">Upcoming</option>
                          <option value="completed">Completed</option>
                          <option value="delayed">Delayed</option>
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <Input 
                          type="date"
                          value={takedown.actualDate}
                          onChange={(e) => updateTakedown(takedown.id, 'actualDate', e.target.value)}
                          disabled={!isEditing}
                          className="h-8"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <Input 
                          type="number"
                          value={takedown.actualAmount}
                          onChange={(e) => updateTakedown(takedown.id, 'actualAmount', parseFloat(e.target.value) || 0)}
                          disabled={!isEditing}
                          className="h-8 w-28 text-right"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <Input 
                          value={takedown.notes}
                          onChange={(e) => updateTakedown(takedown.id, 'notes', e.target.value)}
                          disabled={!isEditing}
                          className="h-8"
                          placeholder="Notes..."
                        />
                      </td>
                      {isEditing && (
                        <td className="px-4 py-2">
                          <Button variant="ghost" size="sm" onClick={() => removeTakedown(takedown.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 font-semibold">
                  <tr>
                    <td className="px-4 py-2">Total</td>
                    <td className="px-4 py-2"></td>
                    <td className="px-4 py-2 text-right">{contract.takedownSchedule.reduce((sum, t) => sum + t.lots, 0)}</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(contract.takedownSchedule.reduce((sum, t) => sum + t.amount, 0))}</td>
                    <td colSpan={isEditing ? 5 : 4} className="px-4 py-2"></td>
                  </tr>
                </tfoot>
              </table>
            )}
          </>
        )}
      </div>
    </div>
  );

  const renderDocumentsTab = () => (
    <div className="p-6 space-y-6">
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Contract Documents</h3>
          <Button size="sm">
            <Upload className="w-4 h-4 mr-1" />Upload Document
          </Button>
        </div>
        
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Drop files here or click to upload</p>
          <p className="text-sm text-gray-400">Supported: PDF, DOC, DOCX, Images</p>
        </div>

        <div className="mt-6 space-y-2">
          <p className="text-sm font-medium text-gray-700">Required Documents:</p>
          <div className="space-y-2">
            {['Purchase Agreement', 'Exhibit A - Property Description', 'Earnest Money Receipt', 'Title Commitment'].map(doc => (
              <div key={doc} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{doc}</span>
                </div>
                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">Missing</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'details':
        return renderDetailsTab();
      case 'takedown':
        return renderTakedownTab();
      case 'documents':
        return renderDocumentsTab();
      default:
        return renderDetailsTab();
    }
  };

  const statusConfig = statusOptions.find(s => s.value === contract.status);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-1" />Back
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">
                  {contractId ? `Contract ${contract.contractNumber}` : 'New Contract'}
                </h1>
                <span className={cn("px-2 py-1 rounded text-xs font-medium", statusConfig?.color)}>
                  {statusConfig?.label}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {contract.buyer.entity || 'No buyer assigned'} • {contractTypes.find(t => t.value === contract.contractType)?.label}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit2 className="w-4 h-4 mr-1" />Edit
                </Button>
                <Button variant="outline">
                  <Send className="w-4 h-4 mr-1" />Send for Signature
                </Button>
                <Button className="bg-[#047857] hover:bg-[#065f46]">
                  <Download className="w-4 h-4 mr-1" />Export
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={handleSave}>
                  <Save className="w-4 h-4 mr-1" />Save Contract
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1">
          {['details', 'takedown', 'documents'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-colors capitalize",
                activeTab === tab
                  ? "bg-[#047857] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              {tab === 'takedown' ? 'Takedown Schedule' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default ContractRecordPage;
