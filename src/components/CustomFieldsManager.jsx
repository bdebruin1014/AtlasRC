import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { isDemoMode } from '@/lib/utils';

// Demo custom fields data
const demoCustomFields = [
  {
    id: 'cf-001',
    name: 'Property Type',
    fieldKey: 'property_type',
    fieldType: 'dropdown',
    entityType: 'properties',
    description: 'Type of property classification',
    options: ['Residential', 'Commercial', 'Industrial', 'Mixed-Use', 'Land'],
    required: true,
    showInList: true,
    searchable: true,
    createdAt: '2025-11-01',
    updatedAt: '2025-12-15'
  },
  {
    id: 'cf-002',
    name: 'Deal Source',
    fieldKey: 'deal_source',
    fieldType: 'dropdown',
    entityType: 'projects',
    description: 'How the deal was sourced',
    options: ['Broker', 'Direct Owner', 'Auction', 'Off-Market', 'Referral', 'Cold Call'],
    required: false,
    showInList: true,
    searchable: true,
    createdAt: '2025-11-05',
    updatedAt: '2025-11-05'
  },
  {
    id: 'cf-003',
    name: 'Contact Rating',
    fieldKey: 'contact_rating',
    fieldType: 'rating',
    entityType: 'contacts',
    description: 'Internal rating for contact priority',
    options: [],
    required: false,
    showInList: true,
    searchable: false,
    createdAt: '2025-11-10',
    updatedAt: '2025-11-10'
  },
  {
    id: 'cf-004',
    name: 'Zoning Classification',
    fieldKey: 'zoning_classification',
    fieldType: 'text',
    entityType: 'properties',
    description: 'Local zoning code classification',
    options: [],
    required: false,
    showInList: false,
    searchable: true,
    createdAt: '2025-11-12',
    updatedAt: '2025-11-12'
  },
  {
    id: 'cf-005',
    name: 'Estimated Close Date',
    fieldKey: 'estimated_close_date',
    fieldType: 'date',
    entityType: 'projects',
    description: 'Expected deal closing date',
    options: [],
    required: true,
    showInList: true,
    searchable: false,
    createdAt: '2025-11-15',
    updatedAt: '2025-12-01'
  },
  {
    id: 'cf-006',
    name: 'Company Size',
    fieldKey: 'company_size',
    fieldType: 'dropdown',
    entityType: 'contacts',
    description: 'Size of contact\'s company',
    options: ['1-10', '11-50', '51-200', '201-500', '500+'],
    required: false,
    showInList: false,
    searchable: true,
    createdAt: '2025-11-18',
    updatedAt: '2025-11-18'
  },
  {
    id: 'cf-007',
    name: 'Due Diligence Notes',
    fieldKey: 'due_diligence_notes',
    fieldType: 'textarea',
    entityType: 'projects',
    description: 'Detailed due diligence information',
    options: [],
    required: false,
    showInList: false,
    searchable: true,
    createdAt: '2025-11-20',
    updatedAt: '2025-12-10'
  },
  {
    id: 'cf-008',
    name: 'Parking Spaces',
    fieldKey: 'parking_spaces',
    fieldType: 'number',
    entityType: 'properties',
    description: 'Number of parking spaces available',
    options: [],
    required: false,
    showInList: true,
    searchable: false,
    createdAt: '2025-11-22',
    updatedAt: '2025-11-22'
  },
  {
    id: 'cf-009',
    name: 'Has NDA',
    fieldKey: 'has_nda',
    fieldType: 'checkbox',
    entityType: 'contacts',
    description: 'Whether an NDA is on file',
    options: [],
    required: false,
    showInList: true,
    searchable: false,
    createdAt: '2025-11-25',
    updatedAt: '2025-11-25'
  },
  {
    id: 'cf-010',
    name: 'Last Inspection Date',
    fieldKey: 'last_inspection_date',
    fieldType: 'date',
    entityType: 'properties',
    description: 'Date of most recent property inspection',
    options: [],
    required: false,
    showInList: false,
    searchable: false,
    createdAt: '2025-11-28',
    updatedAt: '2025-12-05'
  }
];

const fieldTypes = [
  { value: 'text', label: 'Text', icon: '📝' },
  { value: 'textarea', label: 'Long Text', icon: '📄' },
  { value: 'number', label: 'Number', icon: '🔢' },
  { value: 'date', label: 'Date', icon: '📅' },
  { value: 'dropdown', label: 'Dropdown', icon: '📋' },
  { value: 'checkbox', label: 'Checkbox', icon: '☑️' },
  { value: 'rating', label: 'Rating', icon: '⭐' },
  { value: 'email', label: 'Email', icon: '✉️' },
  { value: 'phone', label: 'Phone', icon: '📞' },
  { value: 'url', label: 'URL', icon: '🔗' },
  { value: 'currency', label: 'Currency', icon: '💰' }
];

const entityTypes = [
  { value: 'properties', label: 'Properties', icon: '🏢' },
  { value: 'projects', label: 'Projects', icon: '📊' },
  { value: 'contacts', label: 'Contacts', icon: '👥' },
  { value: 'documents', label: 'Documents', icon: '📁' },
  { value: 'tasks', label: 'Tasks', icon: '✅' }
];

export default function CustomFieldsManager() {
  const [customFields, setCustomFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    fieldKey: '',
    fieldType: 'text',
    entityType: 'properties',
    description: '',
    options: [],
    required: false,
    showInList: false,
    searchable: false
  });
  const [optionInput, setOptionInput] = useState('');

  useEffect(() => {
    fetchCustomFields();
  }, []);

  async function fetchCustomFields() {
    try {
      if (isDemoMode()) {
        setCustomFields(demoCustomFields);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('custom_fields')
        .select('*')
        .order('entity_type', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setCustomFields(data || []);
    } catch (error) {
      console.error('Error fetching custom fields:', error);
      setCustomFields(demoCustomFields);
    } finally {
      setLoading(false);
    }
  }

  const filteredFields = useMemo(() => {
    return customFields.filter(field => {
      const matchesSearch = !searchQuery ||
        field.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        field.fieldKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
        field.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesEntity = entityFilter === 'all' || field.entityType === entityFilter;
      const matchesType = typeFilter === 'all' || field.fieldType === typeFilter;

      return matchesSearch && matchesEntity && matchesType;
    });
  }, [customFields, searchQuery, entityFilter, typeFilter]);

  const fieldsByEntity = useMemo(() => {
    return entityTypes.reduce((acc, entity) => {
      acc[entity.value] = customFields.filter(f => f.entityType === entity.value).length;
      return acc;
    }, {});
  }, [customFields]);

  function generateFieldKey(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);
  }

  function handleNameChange(e) {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      fieldKey: editingField ? prev.fieldKey : generateFieldKey(name)
    }));
  }

  function addOption() {
    if (optionInput.trim() && !formData.options.includes(optionInput.trim())) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, optionInput.trim()]
      }));
      setOptionInput('');
    }
  }

  function removeOption(index) {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  }

  function openCreateModal() {
    setEditingField(null);
    setFormData({
      name: '',
      fieldKey: '',
      fieldType: 'text',
      entityType: 'properties',
      description: '',
      options: [],
      required: false,
      showInList: false,
      searchable: false
    });
    setOptionInput('');
    setShowModal(true);
  }

  function openEditModal(field) {
    setEditingField(field);
    setFormData({
      name: field.name,
      fieldKey: field.fieldKey,
      fieldType: field.fieldType,
      entityType: field.entityType,
      description: field.description || '',
      options: field.options || [],
      required: field.required,
      showInList: field.showInList,
      searchable: field.searchable
    });
    setOptionInput('');
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (isDemoMode()) {
      if (editingField) {
        setCustomFields(prev => prev.map(f =>
          f.id === editingField.id
            ? { ...f, ...formData, updatedAt: new Date().toISOString().split('T')[0] }
            : f
        ));
      } else {
        const newField = {
          id: `cf-${Date.now()}`,
          ...formData,
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0]
        };
        setCustomFields(prev => [...prev, newField]);
      }
      setShowModal(false);
      return;
    }

    try {
      if (editingField) {
        const { error } = await supabase
          .from('custom_fields')
          .update({
            name: formData.name,
            field_key: formData.fieldKey,
            field_type: formData.fieldType,
            entity_type: formData.entityType,
            description: formData.description,
            options: formData.options,
            required: formData.required,
            show_in_list: formData.showInList,
            searchable: formData.searchable,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingField.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('custom_fields')
          .insert({
            name: formData.name,
            field_key: formData.fieldKey,
            field_type: formData.fieldType,
            entity_type: formData.entityType,
            description: formData.description,
            options: formData.options,
            required: formData.required,
            show_in_list: formData.showInList,
            searchable: formData.searchable
          });

        if (error) throw error;
      }

      fetchCustomFields();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving custom field:', error);
    }
  }

  async function handleDelete(field) {
    if (!confirm(`Delete the field "${field.name}"? This may affect existing data.`)) return;

    if (isDemoMode()) {
      setCustomFields(prev => prev.filter(f => f.id !== field.id));
      return;
    }

    try {
      const { error } = await supabase
        .from('custom_fields')
        .delete()
        .eq('id', field.id);

      if (error) throw error;
      fetchCustomFields();
    } catch (error) {
      console.error('Error deleting custom field:', error);
    }
  }

  function getFieldTypeInfo(type) {
    return fieldTypes.find(ft => ft.value === type) || { label: type, icon: '📝' };
  }

  function getEntityInfo(entity) {
    return entityTypes.find(et => et.value === entity) || { label: entity, icon: '📋' };
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Custom Fields Manager</h1>
          <p className="text-gray-600 mt-1">Define and manage custom fields for your data entities</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span>+</span>
          <span>Add Custom Field</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {entityTypes.map(entity => (
          <div key={entity.value} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{entity.icon}</span>
              <span className="text-sm text-gray-600">{entity.label}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {fieldsByEntity[entity.value] || 0}
            </div>
            <div className="text-xs text-gray-500">fields defined</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search fields..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Entities</option>
            {entityTypes.map(entity => (
              <option key={entity.value} value={entity.value}>
                {entity.label}
              </option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Field Types</option>
            {fieldTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Fields List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredFields.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <div className="text-4xl mb-4">📋</div>
            <p>No custom fields found</p>
            <button
              onClick={openCreateModal}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              Create your first custom field
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Field</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Settings</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredFields.map(field => {
                  const typeInfo = getFieldTypeInfo(field.fieldType);
                  const entityInfo = getEntityInfo(field.entityType);

                  return (
                    <tr key={field.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{typeInfo.icon}</span>
                          <div>
                            <div className="font-medium text-gray-900">{field.name}</div>
                            {field.description && (
                              <div className="text-sm text-gray-500">{field.description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-700">
                          {field.fieldKey}
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">{typeInfo.label}</span>
                        {field.options && field.options.length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            {field.options.length} options
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm">
                          <span>{entityInfo.icon}</span>
                          <span>{entityInfo.label}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {field.required && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs">
                              Required
                            </span>
                          )}
                          {field.showInList && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                              In List
                            </span>
                          )}
                          {field.searchable && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                              Searchable
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(field)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(field)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {editingField ? 'Edit Custom Field' : 'Create Custom Field'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Field Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="e.g., Property Type"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Field Key *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fieldKey}
                  onChange={(e) => setFormData(prev => ({ ...prev, fieldKey: e.target.value }))}
                  placeholder="property_type"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Unique identifier used in the database (auto-generated from name)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Field Type *
                  </label>
                  <select
                    required
                    value={formData.fieldType}
                    onChange={(e) => setFormData(prev => ({ ...prev, fieldType: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {fieldTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Entity Type *
                  </label>
                  <select
                    required
                    value={formData.entityType}
                    onChange={(e) => setFormData(prev => ({ ...prev, entityType: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {entityTypes.map(entity => (
                      <option key={entity.value} value={entity.value}>
                        {entity.icon} {entity.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this field is used for..."
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {formData.fieldType === 'dropdown' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Options
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={optionInput}
                      onChange={(e) => setOptionInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
                      placeholder="Add option..."
                      className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={addOption}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.options.map((option, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full"
                      >
                        {option}
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3 pt-4 border-t">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.required}
                    onChange={(e) => setFormData(prev => ({ ...prev, required: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-medium text-gray-700">Required Field</span>
                    <p className="text-xs text-gray-500">Users must fill in this field</p>
                  </div>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.showInList}
                    onChange={(e) => setFormData(prev => ({ ...prev, showInList: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-medium text-gray-700">Show in List View</span>
                    <p className="text-xs text-gray-500">Display this field in table/list views</p>
                  </div>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.searchable}
                    onChange={(e) => setFormData(prev => ({ ...prev, searchable: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-medium text-gray-700">Searchable</span>
                    <p className="text-xs text-gray-500">Include this field in search results</p>
                  </div>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingField ? 'Update Field' : 'Create Field'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
