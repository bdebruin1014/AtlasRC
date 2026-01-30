import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Shield, Lock, Key, AlertTriangle, CheckCircle, Save,
  RefreshCw, Eye, EyeOff, Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PasswordPolicyPage = () => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [testPassword, setTestPassword] = useState('');
  const [showTestPassword, setShowTestPassword] = useState(false);

  // Password policy settings
  const [policy, setPolicy] = useState({
    // Length requirements
    minLength: 8,
    maxLength: 128,

    // Complexity requirements
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    minUppercase: 1,
    minLowercase: 1,
    minNumbers: 1,
    minSpecialChars: 1,

    // History & Expiration
    passwordHistory: 5,
    maxAge: 90,
    minAge: 1,
    warnBeforeExpiry: 14,

    // Lockout settings
    maxFailedAttempts: 5,
    lockoutDuration: 30,
    lockoutResetAfter: 15,

    // Additional options
    preventCommonPasswords: true,
    preventUserInfo: true,
    requireMfaOnReset: false,
    allowPasswordReset: true,
    tempPasswordExpiry: 24,
  });

  const calculatePasswordStrength = (password) => {
    if (!password) return { score: 0, label: 'No password', color: 'bg-gray-200' };

    let score = 0;
    const checks = [];

    // Length check
    if (password.length >= policy.minLength) {
      score += 20;
      checks.push({ label: `At least ${policy.minLength} characters`, passed: true });
    } else {
      checks.push({ label: `At least ${policy.minLength} characters`, passed: false });
    }

    // Uppercase check
    if (policy.requireUppercase) {
      const count = (password.match(/[A-Z]/g) || []).length;
      if (count >= policy.minUppercase) {
        score += 20;
        checks.push({ label: `${policy.minUppercase}+ uppercase letter(s)`, passed: true });
      } else {
        checks.push({ label: `${policy.minUppercase}+ uppercase letter(s)`, passed: false });
      }
    }

    // Lowercase check
    if (policy.requireLowercase) {
      const count = (password.match(/[a-z]/g) || []).length;
      if (count >= policy.minLowercase) {
        score += 20;
        checks.push({ label: `${policy.minLowercase}+ lowercase letter(s)`, passed: true });
      } else {
        checks.push({ label: `${policy.minLowercase}+ lowercase letter(s)`, passed: false });
      }
    }

    // Numbers check
    if (policy.requireNumbers) {
      const count = (password.match(/[0-9]/g) || []).length;
      if (count >= policy.minNumbers) {
        score += 20;
        checks.push({ label: `${policy.minNumbers}+ number(s)`, passed: true });
      } else {
        checks.push({ label: `${policy.minNumbers}+ number(s)`, passed: false });
      }
    }

    // Special chars check
    if (policy.requireSpecialChars) {
      const count = (password.match(/[!@#$%^&*(),.?":{}|<>]/g) || []).length;
      if (count >= policy.minSpecialChars) {
        score += 20;
        checks.push({ label: `${policy.minSpecialChars}+ special character(s)`, passed: true });
      } else {
        checks.push({ label: `${policy.minSpecialChars}+ special character(s)`, passed: false });
      }
    }

    let label = 'Weak';
    let color = 'bg-red-500';

    if (score >= 100) {
      label = 'Strong';
      color = 'bg-green-500';
    } else if (score >= 80) {
      label = 'Good';
      color = 'bg-blue-500';
    } else if (score >= 60) {
      label = 'Fair';
      color = 'bg-yellow-500';
    }

    return { score, label, color, checks };
  };

  const handleSavePolicy = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);

    toast({
      title: 'Policy Saved',
      description: 'Password policy has been updated successfully',
    });
  };

  const handleResetToDefaults = () => {
    setPolicy({
      minLength: 8,
      maxLength: 128,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      minUppercase: 1,
      minLowercase: 1,
      minNumbers: 1,
      minSpecialChars: 1,
      passwordHistory: 5,
      maxAge: 90,
      minAge: 1,
      warnBeforeExpiry: 14,
      maxFailedAttempts: 5,
      lockoutDuration: 30,
      lockoutResetAfter: 15,
      preventCommonPasswords: true,
      preventUserInfo: true,
      requireMfaOnReset: false,
      allowPasswordReset: true,
      tempPasswordExpiry: 24,
    });

    toast({
      title: 'Reset to Defaults',
      description: 'Password policy has been reset to default values',
    });
  };

  const passwordStrength = calculatePasswordStrength(testPassword);

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Password Policy | Admin</title>
      </Helmet>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Password Policy</h1>
          <p className="text-gray-600 mt-2">Configure password requirements and security settings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleResetToDefaults}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSavePolicy} disabled={saving}>
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Policy
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Settings */}
        <div className="col-span-2 space-y-6">
          {/* Length Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Length Requirements
              </CardTitle>
              <CardDescription>Set minimum and maximum password length</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Minimum Length: {policy.minLength} characters</Label>
                  <Slider
                    value={[policy.minLength]}
                    onValueChange={([value]) => setPolicy(prev => ({ ...prev, minLength: value }))}
                    min={6}
                    max={32}
                    step={1}
                  />
                  <p className="text-xs text-gray-500">Recommended: 8-12 characters</p>
                </div>
                <div className="space-y-2">
                  <Label>Maximum Length: {policy.maxLength} characters</Label>
                  <Slider
                    value={[policy.maxLength]}
                    onValueChange={([value]) => setPolicy(prev => ({ ...prev, maxLength: value }))}
                    min={32}
                    max={256}
                    step={8}
                  />
                  <p className="text-xs text-gray-500">Max length for password field</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Complexity Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Complexity Requirements
              </CardTitle>
              <CardDescription>Define required character types</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require Uppercase Letters</Label>
                      <p className="text-sm text-gray-500">A-Z</p>
                    </div>
                    <Switch
                      checked={policy.requireUppercase}
                      onCheckedChange={(checked) => setPolicy(prev => ({ ...prev, requireUppercase: checked }))}
                    />
                  </div>
                  {policy.requireUppercase && (
                    <div className="pl-4 border-l-2">
                      <Label>Minimum count: {policy.minUppercase}</Label>
                      <Slider
                        value={[policy.minUppercase]}
                        onValueChange={([value]) => setPolicy(prev => ({ ...prev, minUppercase: value }))}
                        min={1}
                        max={5}
                        step={1}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require Lowercase Letters</Label>
                      <p className="text-sm text-gray-500">a-z</p>
                    </div>
                    <Switch
                      checked={policy.requireLowercase}
                      onCheckedChange={(checked) => setPolicy(prev => ({ ...prev, requireLowercase: checked }))}
                    />
                  </div>
                  {policy.requireLowercase && (
                    <div className="pl-4 border-l-2">
                      <Label>Minimum count: {policy.minLowercase}</Label>
                      <Slider
                        value={[policy.minLowercase]}
                        onValueChange={([value]) => setPolicy(prev => ({ ...prev, minLowercase: value }))}
                        min={1}
                        max={5}
                        step={1}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require Numbers</Label>
                      <p className="text-sm text-gray-500">0-9</p>
                    </div>
                    <Switch
                      checked={policy.requireNumbers}
                      onCheckedChange={(checked) => setPolicy(prev => ({ ...prev, requireNumbers: checked }))}
                    />
                  </div>
                  {policy.requireNumbers && (
                    <div className="pl-4 border-l-2">
                      <Label>Minimum count: {policy.minNumbers}</Label>
                      <Slider
                        value={[policy.minNumbers]}
                        onValueChange={([value]) => setPolicy(prev => ({ ...prev, minNumbers: value }))}
                        min={1}
                        max={5}
                        step={1}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require Special Characters</Label>
                      <p className="text-sm text-gray-500">!@#$%^&*</p>
                    </div>
                    <Switch
                      checked={policy.requireSpecialChars}
                      onCheckedChange={(checked) => setPolicy(prev => ({ ...prev, requireSpecialChars: checked }))}
                    />
                  </div>
                  {policy.requireSpecialChars && (
                    <div className="pl-4 border-l-2">
                      <Label>Minimum count: {policy.minSpecialChars}</Label>
                      <Slider
                        value={[policy.minSpecialChars]}
                        onValueChange={([value]) => setPolicy(prev => ({ ...prev, minSpecialChars: value }))}
                        min={1}
                        max={5}
                        step={1}
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* History & Expiration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                History & Expiration
              </CardTitle>
              <CardDescription>Password rotation and history settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Password History</Label>
                  <Select
                    value={String(policy.passwordHistory)}
                    onValueChange={(value) => setPolicy(prev => ({ ...prev, passwordHistory: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">None</SelectItem>
                      <SelectItem value="3">Last 3 passwords</SelectItem>
                      <SelectItem value="5">Last 5 passwords</SelectItem>
                      <SelectItem value="10">Last 10 passwords</SelectItem>
                      <SelectItem value="24">Last 24 passwords</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">Prevent reuse of previous passwords</p>
                </div>

                <div className="space-y-2">
                  <Label>Password Expires After</Label>
                  <Select
                    value={String(policy.maxAge)}
                    onValueChange={(value) => setPolicy(prev => ({ ...prev, maxAge: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Never</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="180">180 days</SelectItem>
                      <SelectItem value="365">365 days</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">Force password change after this period</p>
                </div>

                <div className="space-y-2">
                  <Label>Minimum Password Age</Label>
                  <Select
                    value={String(policy.minAge)}
                    onValueChange={(value) => setPolicy(prev => ({ ...prev, minAge: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">None</SelectItem>
                      <SelectItem value="1">1 day</SelectItem>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="7">7 days</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">Minimum time before password can be changed again</p>
                </div>

                <div className="space-y-2">
                  <Label>Expiry Warning</Label>
                  <Select
                    value={String(policy.warnBeforeExpiry)}
                    onValueChange={(value) => setPolicy(prev => ({ ...prev, warnBeforeExpiry: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days before</SelectItem>
                      <SelectItem value="14">14 days before</SelectItem>
                      <SelectItem value="30">30 days before</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">Warn users before password expires</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Lockout */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Account Lockout
              </CardTitle>
              <CardDescription>Security settings for failed login attempts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Max Failed Attempts</Label>
                  <Select
                    value={String(policy.maxFailedAttempts)}
                    onValueChange={(value) => setPolicy(prev => ({ ...prev, maxFailedAttempts: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 attempts</SelectItem>
                      <SelectItem value="5">5 attempts</SelectItem>
                      <SelectItem value="10">10 attempts</SelectItem>
                      <SelectItem value="0">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Lockout Duration</Label>
                  <Select
                    value={String(policy.lockoutDuration)}
                    onValueChange={(value) => setPolicy(prev => ({ ...prev, lockoutDuration: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="0">Until admin unlock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Reset Counter After</Label>
                  <Select
                    value={String(policy.lockoutResetAfter)}
                    onValueChange={(value) => setPolicy(prev => ({ ...prev, lockoutResetAfter: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                Additional Security Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label>Prevent Common Passwords</Label>
                  <p className="text-sm text-gray-500">Block passwords from common password lists</p>
                </div>
                <Switch
                  checked={policy.preventCommonPasswords}
                  onCheckedChange={(checked) => setPolicy(prev => ({ ...prev, preventCommonPasswords: checked }))}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label>Prevent User Information</Label>
                  <p className="text-sm text-gray-500">Block passwords containing username, email, or name</p>
                </div>
                <Switch
                  checked={policy.preventUserInfo}
                  onCheckedChange={(checked) => setPolicy(prev => ({ ...prev, preventUserInfo: checked }))}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label>Require MFA on Password Reset</Label>
                  <p className="text-sm text-gray-500">Require 2FA verification when resetting password</p>
                </div>
                <Switch
                  checked={policy.requireMfaOnReset}
                  onCheckedChange={(checked) => setPolicy(prev => ({ ...prev, requireMfaOnReset: checked }))}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label>Allow Self-Service Password Reset</Label>
                  <p className="text-sm text-gray-500">Let users reset their own passwords via email</p>
                </div>
                <Switch
                  checked={policy.allowPasswordReset}
                  onCheckedChange={(checked) => setPolicy(prev => ({ ...prev, allowPasswordReset: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Preview & Test */}
        <div className="space-y-6">
          {/* Policy Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Policy Summary</CardTitle>
              <CardDescription>Current password requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{policy.minLength}+ characters</span>
                </div>
                {policy.requireUppercase && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>{policy.minUppercase}+ uppercase letter(s)</span>
                  </div>
                )}
                {policy.requireLowercase && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>{policy.minLowercase}+ lowercase letter(s)</span>
                  </div>
                )}
                {policy.requireNumbers && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>{policy.minNumbers}+ number(s)</span>
                  </div>
                )}
                {policy.requireSpecialChars && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>{policy.minSpecialChars}+ special character(s)</span>
                  </div>
                )}
                {policy.passwordHistory > 0 && (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-blue-500" />
                    <span>Can&apos;t reuse last {policy.passwordHistory} passwords</span>
                  </div>
                )}
                {policy.maxAge > 0 && (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <span>Expires after {policy.maxAge} days</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Password Tester */}
          <Card>
            <CardHeader>
              <CardTitle>Test Password</CardTitle>
              <CardDescription>Check if a password meets the policy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Input
                  type={showTestPassword ? 'text' : 'password'}
                  placeholder="Enter a test password..."
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowTestPassword(!showTestPassword)}
                >
                  {showTestPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>

              {testPassword && (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Strength: {passwordStrength.label}</span>
                      <span>{passwordStrength.score}%</span>
                    </div>
                    <Progress value={passwordStrength.score} className={passwordStrength.color} />
                  </div>

                  <div className="space-y-2">
                    {passwordStrength.checks?.map((check, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        {check.passed ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                        <span className={check.passed ? 'text-green-700' : 'text-red-700'}>
                          {check.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Security Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Security Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800">Best Practices</AlertTitle>
                <AlertDescription className="text-blue-700 text-sm">
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>Use at least 12 characters for strong security</li>
                    <li>Enable password history to prevent reuse</li>
                    <li>Set reasonable expiration (60-90 days)</li>
                    <li>Block common passwords</li>
                    <li>Consider enabling MFA for all users</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PasswordPolicyPage;
