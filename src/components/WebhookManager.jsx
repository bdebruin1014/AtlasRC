import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { isDemoMode } from '@/lib/utils';

// Demo webhooks data
const demoWebhooks = [
  {
    id: 'wh-001',
    name: 'CRM Sync - New Contacts',
    url: 'https://crm.example.com/webhooks/contacts',
    events: ['contact.created', 'contact.updated'],
    status: 'active',
    secret: 'whsec_abc123def456',
    lastTriggered: '2026-01-25T10:30:00Z',
    successCount: 1247,
    failureCount: 3,
    createdAt: '2025-10-15',
    headers: { 'X-Custom-Header': 'value' }
  },
  {
    id: 'wh-002',
    name: 'Project Status Updates',
    url: 'https://slack.example.com/api/webhooks/atlas',
    events: ['project.status_changed', 'project.milestone_reached'],
    status: 'active',
    secret: 'whsec_ghi789jkl012',
    lastTriggered: '2026-01-24T16:45:00Z',
    successCount: 892,
    failureCount: 12,
    createdAt: '2025-11-01',
    headers: {}
  },
  {
    id: 'wh-003',
    name: 'Document Notifications',
    url: 'https://docs.example.com/callback',
    events: ['document.uploaded', 'document.signed', 'document.expired'],
    status: 'active',
    secret: 'whsec_mno345pqr678',
    lastTriggered: '2026-01-25T09:15:00Z',
    successCount: 456,
    failureCount: 0,
    createdAt: '2025-11-15',
    headers: { 'Authorization': 'Bearer token123' }
  },
  {
    id: 'wh-004',
    name: 'Financial Events',
    url: 'https://accounting.example.com/webhooks',
    events: ['budget.updated', 'expense.created', 'invoice.paid'],
    status: 'paused',
    secret: 'whsec_stu901vwx234',
    lastTriggered: '2026-01-20T14:00:00Z',
    successCount: 234,
    failureCount: 45,
    createdAt: '2025-12-01',
    headers: {}
  },
  {
    id: 'wh-005',
    name: 'Task Automation',
    url: 'https://zapier.example.com/hooks/catch/123456',
    events: ['task.created', 'task.completed', 'task.overdue'],
    status: 'active',
    secret: 'whsec_yza567bcd890',
    lastTriggered: '2026-01-25T11:00:00Z',
    successCount: 2103,
    failureCount: 8,
    createdAt: '2025-10-20',
    headers: {}
  }
];

// Demo API keys data
const demoApiKeys = [
  {
    id: 'key-001',
    name: 'Production API Key',
    keyPrefix: 'atlas_prod_',
    keyHint: '****abcd',
    permissions: ['read:all', 'write:projects', 'write:contacts', 'write:documents'],
    status: 'active',
    lastUsed: '2026-01-25T11:30:00Z',
    requestCount: 15420,
    createdAt: '2025-09-01',
    expiresAt: '2026-09-01'
  },
  {
    id: 'key-002',
    name: 'Development API Key',
    keyPrefix: 'atlas_dev_',
    keyHint: '****efgh',
    permissions: ['read:all', 'write:all'],
    status: 'active',
    lastUsed: '2026-01-24T18:00:00Z',
    requestCount: 8934,
    createdAt: '2025-10-15',
    expiresAt: null
  },
  {
    id: 'key-003',
    name: 'Mobile App Key',
    keyPrefix: 'atlas_mob_',
    keyHint: '****ijkl',
    permissions: ['read:projects', 'read:contacts', 'read:tasks'],
    status: 'active',
    lastUsed: '2026-01-25T10:45:00Z',
    requestCount: 45210,
    createdAt: '2025-11-01',
    expiresAt: '2026-05-01'
  },
  {
    id: 'key-004',
    name: 'Legacy Integration',
    keyPrefix: 'atlas_leg_',
    keyHint: '****mnop',
    permissions: ['read:all'],
    status: 'revoked',
    lastUsed: '2025-12-15T09:00:00Z',
    requestCount: 2341,
    createdAt: '2025-06-01',
    expiresAt: null
  }
];

const availableEvents = [
  { category: 'Contacts', events: ['contact.created', 'contact.updated', 'contact.deleted'] },
  { category: 'Projects', events: ['project.created', 'project.updated', 'project.status_changed', 'project.milestone_reached', 'project.completed'] },
  { category: 'Documents', events: ['document.uploaded', 'document.signed', 'document.expired', 'document.deleted'] },
  { category: 'Tasks', events: ['task.created', 'task.updated', 'task.completed', 'task.overdue'] },
  { category: 'Financial', events: ['budget.updated', 'expense.created', 'invoice.created', 'invoice.paid'] },
  { category: 'Properties', events: ['property.created', 'property.updated', 'property.status_changed'] }
];

const availablePermissions = [
  { category: 'Read', permissions: ['read:all', 'read:projects', 'read:contacts', 'read:documents', 'read:tasks', 'read:properties'] },
  { category: 'Write', permissions: ['write:all', 'write:projects', 'write:contacts', 'write:documents', 'write:tasks', 'write:properties'] },
  { category: 'Delete', permissions: ['delete:all', 'delete:projects', 'delete:contacts', 'delete:documents', 'delete:tasks'] }
];

export default function WebhookManager() {
  const [activeTab, setActiveTab] = useState('webhooks');
  const [webhooks, setWebhooks] = useState([]);
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState(null);
  const [editingApiKey, setEditingApiKey] = useState(null);
  const [newApiKey, setNewApiKey] = useState(null);
  const [showLogs, setShowLogs] = useState(null);

  const [webhookForm, setWebhookForm] = useState({
    name: '',
    url: '',
    events: [],
    secret: '',
    headers: {}
  });

  const [apiKeyForm, setApiKeyForm] = useState({
    name: '',
    permissions: [],
    expiresAt: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      if (isDemoMode()) {
        setWebhooks(demoWebhooks);
        setApiKeys(demoApiKeys);
        setLoading(false);
        return;
      }

      const [webhooksRes, apiKeysRes] = await Promise.all([
        supabase.from('webhooks').select('*').order('created_at', { ascending: false }),
        supabase.from('api_keys').select('*').order('created_at', { ascending: false })
      ]);

      if (webhooksRes.error) throw webhooksRes.error;
      if (apiKeysRes.error) throw apiKeysRes.error;

      setWebhooks(webhooksRes.data || []);
      setApiKeys(apiKeysRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setWebhooks(demoWebhooks);
      setApiKeys(demoApiKeys);
    } finally {
      setLoading(false);
    }
  }

  function openCreateWebhook() {
    setEditingWebhook(null);
    setWebhookForm({
      name: '',
      url: '',
      events: [],
      secret: generateSecret(),
      headers: {}
    });
    setShowWebhookModal(true);
  }

  function openEditWebhook(webhook) {
    setEditingWebhook(webhook);
    setWebhookForm({
      name: webhook.name,
      url: webhook.url,
      events: webhook.events || [],
      secret: webhook.secret,
      headers: webhook.headers || {}
    });
    setShowWebhookModal(true);
  }

  function openCreateApiKey() {
    setEditingApiKey(null);
    setApiKeyForm({
      name: '',
      permissions: [],
      expiresAt: ''
    });
    setNewApiKey(null);
    setShowApiKeyModal(true);
  }

  function generateSecret() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'whsec_';
    for (let i = 0; i < 24; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  function generateApiKey() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'atlas_';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async function handleWebhookSubmit(e) {
    e.preventDefault();

    if (isDemoMode()) {
      if (editingWebhook) {
        setWebhooks(prev => prev.map(w =>
          w.id === editingWebhook.id
            ? { ...w, ...webhookForm }
            : w
        ));
      } else {
        const newWebhook = {
          id: `wh-${Date.now()}`,
          ...webhookForm,
          status: 'active',
          lastTriggered: null,
          successCount: 0,
          failureCount: 0,
          createdAt: new Date().toISOString().split('T')[0]
        };
        setWebhooks(prev => [newWebhook, ...prev]);
      }
      setShowWebhookModal(false);
      return;
    }

    try {
      if (editingWebhook) {
        const { error } = await supabase
          .from('webhooks')
          .update({
            name: webhookForm.name,
            url: webhookForm.url,
            events: webhookForm.events,
            secret: webhookForm.secret,
            headers: webhookForm.headers,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingWebhook.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('webhooks')
          .insert({
            name: webhookForm.name,
            url: webhookForm.url,
            events: webhookForm.events,
            secret: webhookForm.secret,
            headers: webhookForm.headers,
            status: 'active'
          });

        if (error) throw error;
      }

      fetchData();
      setShowWebhookModal(false);
    } catch (error) {
      console.error('Error saving webhook:', error);
    }
  }

  async function handleApiKeySubmit(e) {
    e.preventDefault();

    const fullKey = generateApiKey();

    if (isDemoMode()) {
      const newKey = {
        id: `key-${Date.now()}`,
        name: apiKeyForm.name,
        keyPrefix: fullKey.substring(0, 11),
        keyHint: '****' + fullKey.slice(-4),
        permissions: apiKeyForm.permissions,
        status: 'active',
        lastUsed: null,
        requestCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
        expiresAt: apiKeyForm.expiresAt || null
      };
      setApiKeys(prev => [newKey, ...prev]);
      setNewApiKey(fullKey);
      return;
    }

    try {
      const { error } = await supabase
        .from('api_keys')
        .insert({
          name: apiKeyForm.name,
          key_hash: fullKey, // In production, this would be hashed
          key_prefix: fullKey.substring(0, 11),
          key_hint: '****' + fullKey.slice(-4),
          permissions: apiKeyForm.permissions,
          status: 'active',
          expires_at: apiKeyForm.expiresAt || null
        });

      if (error) throw error;

      setNewApiKey(fullKey);
      fetchData();
    } catch (error) {
      console.error('Error creating API key:', error);
    }
  }

  async function toggleWebhookStatus(webhook) {
    const newStatus = webhook.status === 'active' ? 'paused' : 'active';

    if (isDemoMode()) {
      setWebhooks(prev => prev.map(w =>
        w.id === webhook.id ? { ...w, status: newStatus } : w
      ));
      return;
    }

    try {
      const { error } = await supabase
        .from('webhooks')
        .update({ status: newStatus })
        .eq('id', webhook.id);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error updating webhook:', error);
    }
  }

  async function deleteWebhook(webhook) {
    if (!confirm(`Delete webhook "${webhook.name}"?`)) return;

    if (isDemoMode()) {
      setWebhooks(prev => prev.filter(w => w.id !== webhook.id));
      return;
    }

    try {
      const { error } = await supabase
        .from('webhooks')
        .delete()
        .eq('id', webhook.id);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error deleting webhook:', error);
    }
  }

  async function revokeApiKey(key) {
    if (!confirm(`Revoke API key "${key.name}"? This cannot be undone.`)) return;

    if (isDemoMode()) {
      setApiKeys(prev => prev.map(k =>
        k.id === key.id ? { ...k, status: 'revoked' } : k
      ));
      return;
    }

    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ status: 'revoked' })
        .eq('id', key.id);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error revoking API key:', error);
    }
  }

  function toggleEvent(event) {
    setWebhookForm(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event]
    }));
  }

  function togglePermission(permission) {
    setApiKeyForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  }

  function formatDate(dateString) {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  }

  const stats = useMemo(() => ({
    activeWebhooks: webhooks.filter(w => w.status === 'active').length,
    totalWebhooks: webhooks.length,
    activeApiKeys: apiKeys.filter(k => k.status === 'active').length,
    totalApiKeys: apiKeys.length,
    totalRequests: apiKeys.reduce((sum, k) => sum + (k.requestCount || 0), 0),
    webhookCalls: webhooks.reduce((sum, w) => sum + (w.successCount || 0) + (w.failureCount || 0), 0)
  }), [webhooks, apiKeys]);

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
          <h1 className="text-2xl font-bold text-gray-900">API & Webhooks</h1>
          <p className="text-gray-600 mt-1">Manage integrations, API keys, and webhook endpoints</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Active Webhooks</div>
          <div className="text-2xl font-bold text-green-600">{stats.activeWebhooks}</div>
          <div className="text-xs text-gray-500">of {stats.totalWebhooks} total</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Webhook Calls</div>
          <div className="text-2xl font-bold text-blue-600">{stats.webhookCalls.toLocaleString()}</div>
          <div className="text-xs text-gray-500">total delivered</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Active API Keys</div>
          <div className="text-2xl font-bold text-purple-600">{stats.activeApiKeys}</div>
          <div className="text-xs text-gray-500">of {stats.totalApiKeys} total</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">API Requests</div>
          <div className="text-2xl font-bold text-orange-600">{stats.totalRequests.toLocaleString()}</div>
          <div className="text-xs text-gray-500">total made</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('webhooks')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'webhooks'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Webhooks
            </button>
            <button
              onClick={() => setActiveTab('apikeys')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'apikeys'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              API Keys
            </button>
            <button
              onClick={() => setActiveTab('docs')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'docs'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Documentation
            </button>
          </div>
        </div>

        {/* Webhooks Tab */}
        {activeTab === 'webhooks' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Webhook Endpoints</h2>
              <button
                onClick={openCreateWebhook}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <span>+</span>
                <span>Add Webhook</span>
              </button>
            </div>

            {webhooks.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">🔗</div>
                <p>No webhooks configured</p>
                <button
                  onClick={openCreateWebhook}
                  className="mt-4 text-blue-600 hover:text-blue-800"
                >
                  Create your first webhook
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {webhooks.map(webhook => (
                  <div key={webhook.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-gray-900">{webhook.name}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            webhook.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {webhook.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 font-mono mb-2">{webhook.url}</div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {webhook.events?.map(event => (
                            <span key={event} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                              {event}
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-4 text-xs text-gray-500">
                          <span>Last triggered: {formatDate(webhook.lastTriggered)}</span>
                          <span className="text-green-600">{webhook.successCount} success</span>
                          <span className="text-red-600">{webhook.failureCount} failed</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleWebhookStatus(webhook)}
                          className={`p-2 rounded ${
                            webhook.status === 'active'
                              ? 'text-yellow-600 hover:bg-yellow-50'
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={webhook.status === 'active' ? 'Pause' : 'Activate'}
                        >
                          {webhook.status === 'active' ? '⏸️' : '▶️'}
                        </button>
                        <button
                          onClick={() => openEditWebhook(webhook)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteWebhook(webhook)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* API Keys Tab */}
        {activeTab === 'apikeys' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">API Keys</h2>
              <button
                onClick={openCreateApiKey}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <span>+</span>
                <span>Generate Key</span>
              </button>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex gap-2">
                <span className="text-yellow-600">⚠️</span>
                <div className="text-sm text-yellow-800">
                  <strong>Security Notice:</strong> API keys provide access to your data. Keep them secure and never share them publicly.
                </div>
              </div>
            </div>

            {apiKeys.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">🔑</div>
                <p>No API keys created</p>
                <button
                  onClick={openCreateApiKey}
                  className="mt-4 text-blue-600 hover:text-blue-800"
                >
                  Generate your first API key
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {apiKeys.map(key => (
                  <div key={key.id} className={`border rounded-lg p-4 ${
                    key.status === 'revoked' ? 'bg-gray-50 opacity-60' : ''
                  }`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-gray-900">{key.name}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            key.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {key.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 font-mono mb-2">
                          {key.keyPrefix}{key.keyHint}
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {key.permissions?.map(perm => (
                            <span key={perm} className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                              {perm}
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-4 text-xs text-gray-500">
                          <span>Last used: {formatDate(key.lastUsed)}</span>
                          <span>{key.requestCount?.toLocaleString() || 0} requests</span>
                          {key.expiresAt && (
                            <span className={new Date(key.expiresAt) < new Date() ? 'text-red-600' : ''}>
                              Expires: {new Date(key.expiresAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      {key.status === 'active' && (
                        <button
                          onClick={() => revokeApiKey(key)}
                          className="px-3 py-1 text-red-600 hover:bg-red-50 rounded border border-red-200"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Documentation Tab */}
        {activeTab === 'docs' && (
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">API Documentation</h2>
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Base URL</h3>
                  <code className="block bg-gray-800 text-green-400 p-3 rounded">
                    https://api.atlas-platform.com/v1
                  </code>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Authentication</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Include your API key in the Authorization header:
                  </p>
                  <code className="block bg-gray-800 text-green-400 p-3 rounded">
                    Authorization: Bearer atlas_your_api_key
                  </code>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Example Request</h3>
                  <pre className="bg-gray-800 text-green-400 p-3 rounded overflow-x-auto text-sm">
{`curl -X GET "https://api.atlas-platform.com/v1/projects" \\
  -H "Authorization: Bearer atlas_your_api_key" \\
  -H "Content-Type: application/json"`}
                  </pre>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Webhook Payload Format</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="bg-gray-800 text-green-400 p-3 rounded overflow-x-auto text-sm">
{`{
  "event": "project.status_changed",
  "timestamp": "2026-01-25T10:30:00Z",
  "data": {
    "id": "proj-123",
    "name": "Downtown Development",
    "old_status": "planning",
    "new_status": "in_progress"
  },
  "signature": "sha256=..."
}`}
                </pre>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Available Events</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {availableEvents.map(category => (
                  <div key={category.category} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-800 mb-2">{category.category}</h4>
                    <ul className="space-y-1">
                      {category.events.map(event => (
                        <li key={event} className="text-sm text-gray-600 font-mono">{event}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Webhook Modal */}
      {showWebhookModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {editingWebhook ? 'Edit Webhook' : 'Create Webhook'}
              </h2>
            </div>

            <form onSubmit={handleWebhookSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={webhookForm.name}
                  onChange={(e) => setWebhookForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., CRM Sync"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endpoint URL *
                </label>
                <input
                  type="url"
                  required
                  value={webhookForm.url}
                  onChange={(e) => setWebhookForm(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://example.com/webhooks"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Signing Secret
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={webhookForm.secret}
                    onChange={(e) => setWebhookForm(prev => ({ ...prev, secret: e.target.value }))}
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setWebhookForm(prev => ({ ...prev, secret: generateSecret() }))}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Generate
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Events to Subscribe
                </label>
                <div className="max-h-48 overflow-y-auto border rounded-lg p-3 space-y-3">
                  {availableEvents.map(category => (
                    <div key={category.category}>
                      <div className="text-xs font-medium text-gray-500 mb-1">{category.category}</div>
                      <div className="flex flex-wrap gap-2">
                        {category.events.map(event => (
                          <label key={event} className="flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={webhookForm.events.includes(event)}
                              onChange={() => toggleEvent(event)}
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                            <span className="text-sm text-gray-700">{event.split('.')[1]}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowWebhookModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingWebhook ? 'Update Webhook' : 'Create Webhook'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {newApiKey ? 'API Key Generated' : 'Generate API Key'}
              </h2>
            </div>

            {newApiKey ? (
              <div className="p-6 space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex gap-2 mb-2">
                    <span className="text-green-600">✓</span>
                    <span className="font-medium text-green-800">API Key Created Successfully</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Copy this key now. You won't be able to see it again.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your API Key
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newApiKey}
                      readOnly
                      className="flex-1 px-3 py-2 border rounded-lg bg-gray-50 font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(newApiKey)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <button
                    onClick={() => setShowApiKeyModal(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleApiKeySubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Key Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={apiKeyForm.name}
                    onChange={(e) => setApiKeyForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Production API Key"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiration Date (optional)
                  </label>
                  <input
                    type="date"
                    value={apiKeyForm.expiresAt}
                    onChange={(e) => setApiKeyForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permissions
                  </label>
                  <div className="border rounded-lg p-3 space-y-3">
                    {availablePermissions.map(category => (
                      <div key={category.category}>
                        <div className="text-xs font-medium text-gray-500 mb-1">{category.category}</div>
                        <div className="flex flex-wrap gap-2">
                          {category.permissions.map(perm => (
                            <label key={perm} className="flex items-center gap-1">
                              <input
                                type="checkbox"
                                checked={apiKeyForm.permissions.includes(perm)}
                                onChange={() => togglePermission(perm)}
                                className="w-4 h-4 text-blue-600 rounded"
                              />
                              <span className="text-sm text-gray-700">{perm}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowApiKeyModal(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Generate Key
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
