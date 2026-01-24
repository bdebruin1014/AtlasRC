// src/pages/projects/Contacts/ContactProfiles/ProfileFieldRenderer.jsx
// Renders category-specific profile fields based on contact category

import React from 'react';

const CATEGORY_FIELDS = {
  architect: [
    { key: 'license_number', label: 'License Number', type: 'text' },
    { key: 'license_state', label: 'License State', type: 'text' },
    { key: 'specialty', label: 'Specialty', type: 'select', options: ['Residential', 'Commercial', 'Mixed-Use', 'Industrial', 'Landscape'] },
    { key: 'firm_size', label: 'Firm Size', type: 'text' },
  ],
  consultant: [
    { key: 'specialty', label: 'Specialty', type: 'text' },
    { key: 'hourly_rate', label: 'Hourly Rate', type: 'number' },
    { key: 'contract_type', label: 'Contract Type', type: 'select', options: ['Hourly', 'Fixed', 'Retainer'] },
    { key: 'insurance_expiry', label: 'Insurance Expiry', type: 'date' },
  ],
  contractor: [
    { key: 'license_number', label: 'License Number', type: 'text' },
    { key: 'license_state', label: 'License State', type: 'text' },
    { key: 'specialty', label: 'Trade/Specialty', type: 'select', options: ['General', 'Framing', 'Plumbing', 'Electrical', 'HVAC', 'Roofing', 'Concrete', 'Drywall', 'Painting', 'Flooring', 'Landscaping'] },
    { key: 'insurance_expiry', label: 'Insurance Expiry', type: 'date' },
    { key: 'bond_amount', label: 'Bond Amount', type: 'number' },
    { key: 'workers_comp', label: 'Workers Comp Policy', type: 'text' },
  ],
  engineer: [
    { key: 'pe_number', label: 'PE Number', type: 'text' },
    { key: 'license_state', label: 'License State', type: 'text' },
    { key: 'specialty', label: 'Specialty', type: 'select', options: ['Civil', 'Structural', 'Mechanical', 'Electrical', 'Environmental', 'Geotechnical'] },
    { key: 'insurance_expiry', label: 'Insurance Expiry', type: 'date' },
  ],
  government: [
    { key: 'department', label: 'Department', type: 'text' },
    { key: 'jurisdiction', label: 'Jurisdiction', type: 'text' },
    { key: 'office_hours', label: 'Office Hours', type: 'text' },
    { key: 'permit_types', label: 'Permit Types Handled', type: 'text' },
  ],
  investor: [
    { key: 'investment_type', label: 'Investment Type', type: 'select', options: ['Equity', 'Debt', 'Preferred Equity', 'Mezzanine'] },
    { key: 'investment_amount', label: 'Investment Amount', type: 'number' },
    { key: 'ownership_percentage', label: 'Ownership %', type: 'number' },
    { key: 'preferred_return', label: 'Preferred Return %', type: 'number' },
    { key: 'entity_name', label: 'Investment Entity', type: 'text' },
  ],
  legal_title: [
    { key: 'bar_number', label: 'Bar Number', type: 'text' },
    { key: 'bar_state', label: 'Bar State', type: 'text' },
    { key: 'specialty', label: 'Specialty', type: 'select', options: ['Real Estate', 'Corporate', 'Environmental', 'Land Use', 'Title'] },
    { key: 'title_company', label: 'Title Company', type: 'text' },
    { key: 'escrow_officer', label: 'Escrow Officer', type: 'text' },
  ],
  lender: [
    { key: 'loan_type', label: 'Loan Type', type: 'select', options: ['Construction', 'Permanent', 'Bridge', 'Hard Money', 'Line of Credit'] },
    { key: 'nmls_id', label: 'NMLS ID', type: 'text' },
    { key: 'loan_amount', label: 'Loan Amount', type: 'number' },
    { key: 'interest_rate', label: 'Interest Rate %', type: 'number' },
    { key: 'loan_term', label: 'Loan Term (months)', type: 'number' },
  ],
  sales: [
    { key: 'license_number', label: 'License Number', type: 'text' },
    { key: 'license_state', label: 'License State', type: 'text' },
    { key: 'brokerage', label: 'Brokerage', type: 'text' },
    { key: 'commission_rate', label: 'Commission Rate %', type: 'number' },
    { key: 'listing_type', label: 'Listing Type', type: 'select', options: ['Exclusive', 'Open', 'Net'] },
  ],
  survey: [
    { key: 'license_number', label: 'PLS Number', type: 'text' },
    { key: 'license_state', label: 'License State', type: 'text' },
    { key: 'survey_type', label: 'Survey Type', type: 'select', options: ['Boundary', 'ALTA', 'Topographic', 'Construction', 'As-Built'] },
    { key: 'insurance_expiry', label: 'Insurance Expiry', type: 'date' },
  ],
  team_member: [
    { key: 'role', label: 'Project Role', type: 'select', options: ['Project Manager', 'Superintendent', 'Assistant PM', 'Coordinator', 'Inspector', 'Estimator'] },
    { key: 'department', label: 'Department', type: 'text' },
    { key: 'start_date', label: 'Start Date', type: 'date' },
    { key: 'hourly_rate', label: 'Hourly Rate', type: 'number' },
  ],
  other: [
    { key: 'relationship', label: 'Relationship', type: 'text' },
    { key: 'category_detail', label: 'Category Detail', type: 'text' },
  ],
};

const ProfileFieldRenderer = ({ category, profileData = {}, onChange }) => {
  const fields = CATEGORY_FIELDS[category] || CATEGORY_FIELDS.other;
  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2F855A] focus:border-transparent text-sm';

  return (
    <div className="grid grid-cols-2 gap-3">
      {fields.map(field => (
        <div key={field.key}>
          <label className="block text-xs font-medium text-gray-600 mb-1">{field.label}</label>
          {field.type === 'select' ? (
            <select
              value={profileData[field.key] || ''}
              onChange={(e) => onChange(field.key, e.target.value)}
              className={inputClass}
            >
              <option value="">Select...</option>
              {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          ) : (
            <input
              type={field.type}
              value={profileData[field.key] || ''}
              onChange={(e) => onChange(field.key, e.target.value)}
              className={inputClass}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default ProfileFieldRenderer;
