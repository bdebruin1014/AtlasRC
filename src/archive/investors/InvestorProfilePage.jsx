import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  User, Mail, Phone, MapPin, Building2, Shield, Calendar, Edit2, Save,
  CreditCard, FileText, CheckCircle, AlertCircle, Plus, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const InvestorProfilePage = () => {
  const { investorId } = useParams();
  const [isEditing, setIsEditing] = useState(false);

  const investor = {
    id: investorId,
    // Personal/Entity Info
    name: 'John Smith',
    entityType: 'individual',
    entityName: null,
    dateOfBirth: '1975-03-15',
    ssn: '***-**-1234',
    
    // Contact Info
    email: 'john.smith@email.com',
    phone: '(864) 555-0101',
    altPhone: '(864) 555-0102',
    
    // Address
    address: {
      street: '123 Main Street',
      unit: 'Suite 100',
      city: 'Greenville',
      state: 'SC',
      zip: '29601',
      country: 'USA',
    },
    mailingAddressSame: true,
    mailingAddress: null,
    
    // Investor Classification
    investorType: 'accredited',
    accreditationMethod: 'income',
    accreditationStatus: 'verified',
    accreditationExpiry: '2025-06-15',
    qualifiedPurchaser: false,
    
    // Banking
    bankAccounts: [
      { id: 'bank-1', name: 'Primary Checking', bank: 'Bank of America', accountType: 'checking', last4: '4521', isDefault: true },
      { id: 'bank-2', name: 'Investment Account', bank: 'Charles Schwab', accountType: 'brokerage', last4: '8834', isDefault: false },
    ],
    
    // Tax Info
    taxId: '***-**-1234',
    taxIdType: 'ssn',
    taxState: 'SC',
    
    // Documents on File
    documentsOnFile: {
      w9: { status: 'complete', date: '2024-01-15' },
      id: { status: 'complete', date: '2024-01-15' },
      accreditationLetter: { status: 'complete', date: '2024-06-15' },
      bankVerification: { status: 'complete', date: '2024-01-20' },
    },
    
    // Portal
    portalAccess: true,
    portalEmail: 'john.smith@email.com',
    lastLogin: '2024-12-27',
    twoFactorEnabled: true,
    
    // Preferences
    communicationPreferences: {
      email: true,
      portal: true,
      sms: false,
      mail: true,
    },
    distributionPreference: 'ach',
    k1Delivery: 'electronic',
    
    // Notes
    notes: 'Long-term investor, interested in multifamily and development deals. Prefers quarterly updates.',
    
    // Meta
    createdAt: '2023-03-15',
    updatedAt: '2024-12-27',
  };

  const getDocStatusConfig = (status) => ({
    complete: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Complete' },
    pending: { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-100', label: 'Pending' },
    expired: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Expired' },
  }[status] || { icon: AlertCircle, color: 'text-gray-600', bg: 'bg-gray-100', label: status });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Investor Profile</h1>
          <p className="text-sm text-gray-500">View and manage investor information</p>
        </div>
        <Button 
          onClick={() => setIsEditing(!isEditing)}
          className={isEditing ? "bg-[#047857] hover:bg-[#065f46]" : ""}
          variant={isEditing ? "default" : "outline"}
        >
          {isEditing ? <><Save className="w-4 h-4 mr-2" />Save Changes</> : <><Edit2 className="w-4 h-4 mr-2" />Edit Profile</>}
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Personal Information */}
        <div className="col-span-2 space-y-6">
          <div className="bg-white border rounded-lg">
            <div className="p-4 border-b">
              <h3 className="font-semibold flex items-center gap-2"><User className="w-4 h-4" />Personal Information</h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Full Name</label>
                {isEditing ? (
                  <Input defaultValue={investor.name} className="mt-1" />
                ) : (
                  <p className="font-medium">{investor.name}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-500">Entity Type</label>
                {isEditing ? (
                  <select className="mt-1 w-full border rounded-md px-3 py-2" defaultValue={investor.entityType}>
                    <option value="individual">Individual</option>
                    <option value="trust">Trust</option>
                    <option value="llc">LLC</option>
                    <option value="corporation">Corporation</option>
                    <option value="ira">IRA</option>
                    <option value="sdira">Self-Directed IRA</option>
                  </select>
                ) : (
                  <p className="font-medium capitalize">{investor.entityType}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-500">Date of Birth</label>
                <p className="font-medium">{investor.dateOfBirth}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">SSN/Tax ID</label>
                <p className="font-medium">{investor.ssn}</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white border rounded-lg">
            <div className="p-4 border-b">
              <h3 className="font-semibold flex items-center gap-2"><Mail className="w-4 h-4" />Contact Information</h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Email</label>
                {isEditing ? (
                  <Input type="email" defaultValue={investor.email} className="mt-1" />
                ) : (
                  <p className="font-medium">{investor.email}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-500">Primary Phone</label>
                {isEditing ? (
                  <Input type="tel" defaultValue={investor.phone} className="mt-1" />
                ) : (
                  <p className="font-medium">{investor.phone}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-500">Alternate Phone</label>
                {isEditing ? (
                  <Input type="tel" defaultValue={investor.altPhone} className="mt-1" />
                ) : (
                  <p className="font-medium">{investor.altPhone || '—'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white border rounded-lg">
            <div className="p-4 border-b">
              <h3 className="font-semibold flex items-center gap-2"><MapPin className="w-4 h-4" />Address</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-sm text-gray-500">Street Address</label>
                  {isEditing ? (
                    <Input defaultValue={investor.address.street} className="mt-1" />
                  ) : (
                    <p className="font-medium">{investor.address.street}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-gray-500">City</label>
                  {isEditing ? (
                    <Input defaultValue={investor.address.city} className="mt-1" />
                  ) : (
                    <p className="font-medium">{investor.address.city}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm text-gray-500">State</label>
                    {isEditing ? (
                      <Input defaultValue={investor.address.state} className="mt-1" />
                    ) : (
                      <p className="font-medium">{investor.address.state}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">ZIP</label>
                    {isEditing ? (
                      <Input defaultValue={investor.address.zip} className="mt-1" />
                    ) : (
                      <p className="font-medium">{investor.address.zip}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bank Accounts */}
          <div className="bg-white border rounded-lg">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2"><CreditCard className="w-4 h-4" />Bank Accounts</h3>
              <Button size="sm" variant="outline"><Plus className="w-4 h-4 mr-1" />Add Account</Button>
            </div>
            <div className="divide-y">
              {investor.bankAccounts.map(account => (
                <div key={account.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium">{account.name}</p>
                      <p className="text-sm text-gray-500">{account.bank} • ****{account.last4}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {account.isDefault && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">Default</span>
                    )}
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium capitalize">{account.accountType}</span>
                    {isEditing && (
                      <button className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white border rounded-lg">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Internal Notes</h3>
            </div>
            <div className="p-4">
              {isEditing ? (
                <textarea 
                  className="w-full border rounded-md px-3 py-2 min-h-[100px]" 
                  defaultValue={investor.notes}
                />
              ) : (
                <p className="text-gray-700">{investor.notes}</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Documents on File */}
          <div className="bg-white border rounded-lg">
            <div className="p-4 border-b">
              <h3 className="font-semibold flex items-center gap-2"><FileText className="w-4 h-4" />Documents on File</h3>
            </div>
            <div className="divide-y">
              {Object.entries(investor.documentsOnFile).map(([key, doc]) => {
                const config = getDocStatusConfig(doc.status);
                const Icon = config.icon;
                const labels = { w9: 'W-9 Form', id: 'ID Verification', accreditationLetter: 'Accreditation Letter', bankVerification: 'Bank Verification' };
                return (
                  <div key={key} className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={cn("w-4 h-4", config.color)} />
                      <span className="text-sm">{labels[key]}</span>
                    </div>
                    <span className={cn("px-2 py-0.5 rounded text-xs font-medium", config.bg, config.color)}>
                      {config.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white border rounded-lg">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Preferences</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Distribution Method</span>
                <span className="font-medium text-sm uppercase">{investor.distributionPreference}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">K-1 Delivery</span>
                <span className="font-medium text-sm capitalize">{investor.k1Delivery}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tax State</span>
                <span className="font-medium text-sm">{investor.taxState}</span>
              </div>
            </div>
          </div>

          {/* Communication Preferences */}
          <div className="bg-white border rounded-lg">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Communication</h3>
            </div>
            <div className="p-4 space-y-2">
              {Object.entries(investor.communicationPreferences).map(([key, enabled]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">{key}</span>
                  <span className={cn("px-2 py-0.5 rounded text-xs font-medium", 
                    enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  )}>
                    {enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Portal Access */}
          <div className="bg-white border rounded-lg">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Portal Access</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">2FA</span>
                <span className={cn("px-2 py-0.5 rounded text-xs font-medium",
                  investor.twoFactorEnabled ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                )}>
                  {investor.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Login</span>
                <span className="text-sm font-medium">{investor.lastLogin}</span>
              </div>
              <Button size="sm" variant="outline" className="w-full mt-2">Reset Password</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestorProfilePage;
