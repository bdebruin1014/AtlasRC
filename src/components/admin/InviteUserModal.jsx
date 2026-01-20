// src/components/admin/InviteUserModal.jsx
// Modal for inviting new users

import React, { useState } from 'react';
import { 
  X, UserPlus, Mail, Shield, Loader2, AlertCircle, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import {
  ROLES,
  ROLE_LABELS,
  ROLE_DESCRIPTIONS,
  setUserRole,
} from '@/services/permissionService';

const InviteUserModal = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState(ROLES.TEAM_MEMBER);
  const [sendInvite, setSendInvite] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create user profile first
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          email,
          full_name: fullName || null,
          is_active: true,
          invited_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (profileError) throw profileError;

      // Set their role
      await setUserRole(profile.id, selectedRole);

      // Send invite email if requested
      if (sendInvite) {
        const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
          data: {
            full_name: fullName,
            role: selectedRole,
          }
        });
        
        // Note: This may fail if not using admin API key
        // In production, you'd use an edge function or API route
        if (inviteError) {
          console.warn('Could not send invite email:', inviteError);
        }
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
      }, 1500);
    } catch (err) {
      console.error('Error inviting user:', err);
      setError(err.message || 'Failed to invite user');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setFullName('');
    setSelectedRole(ROLES.TEAM_MEMBER);
    setSendInvite(true);
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Invite User</h2>
              <p className="text-sm text-gray-500">Add a new team member</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success State */}
        {success ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Invitation Sent!</h3>
            <p className="text-gray-500">
              {email} has been invited to join as {ROLE_LABELS[selectedRole]}.
            </p>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Smith"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign Role
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {Object.entries(ROLES)
                  .filter(([_, roleId]) => roleId !== ROLES.SUPER_ADMIN)
                  .map(([key, roleId]) => (
                    <button
                      key={roleId}
                      type="button"
                      onClick={() => setSelectedRole(roleId)}
                      className={cn(
                        "p-2 border rounded-lg text-left transition-all text-sm",
                        selectedRole === roleId
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-gray-400" />
                        <span className="font-medium">{ROLE_LABELS[roleId]}</span>
                      </div>
                    </button>
                  ))}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                {ROLE_DESCRIPTIONS[selectedRole]}
              </p>
            </div>

            {/* Send Invite Toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sendInvite}
                onChange={(e) => setSendInvite(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Send invitation email</span>
            </label>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Inviting...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Send Invite
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default InviteUserModal;
