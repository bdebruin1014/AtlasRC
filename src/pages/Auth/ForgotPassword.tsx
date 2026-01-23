import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase, isDemoMode } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

// Email validation pattern
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Countdown duration in seconds
const RESEND_COUNTDOWN = 60;

interface FormErrors {
  email?: string;
  general?: string;
}

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [errors, setErrors] = useState<FormErrors>({});

  const emailInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Auto-focus email field on mount
  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  // Validate email
  const validateEmail = (value: string): string | undefined => {
    if (!value) {
      return 'Email is required';
    }
    if (!EMAIL_PATTERN.test(value)) {
      return 'Please enter a valid email address';
    }
    return undefined;
  };

  // Handle email blur for validation
  const handleEmailBlur = () => {
    const error = validateEmail(email);
    setErrors((prev) => ({ ...prev, email: error }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailError = validateEmail(email);
    if (emailError) {
      setErrors({ email: emailError });
      return;
    }

    if (isDemoMode) {
      // In demo mode, simulate success
      setSent(true);
      setCountdown(RESEND_COUNTDOWN);
      toast({
        title: 'Demo Mode',
        description: 'In production, a password reset link would be sent to your email.',
      });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setSent(true);
      setCountdown(RESEND_COUNTDOWN);

      toast({
        title: 'Reset link sent',
        description: 'Check your email for password reset instructions.',
      });
    } catch (error: any) {
      const message = error?.message || 'Failed to send reset email. Please try again.';
      setErrors({ general: message });

      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle resend
  const handleResend = async () => {
    if (countdown > 0) return;

    setLoading(true);

    try {
      if (isDemoMode) {
        setCountdown(RESEND_COUNTDOWN);
        toast({
          title: 'Demo Mode',
          description: 'In production, a new password reset link would be sent.',
        });
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setCountdown(RESEND_COUNTDOWN);

      toast({
        title: 'Reset link resent',
        description: 'Check your email for the new password reset link.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to resend reset email.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Format countdown
  const formatCountdown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">Atlas</span>
            </div>
          </div>

          {sent ? (
            /* Success State */
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Check your email
              </h2>
              <p className="text-gray-500 mb-6">
                We've sent password reset instructions to{' '}
                <strong className="text-gray-900">{email}</strong>
              </p>

              {/* Resend countdown */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                {countdown > 0 ? (
                  <p className="text-sm text-gray-600">
                    Resend email in{' '}
                    <span className="font-medium text-emerald-600">
                      {formatCountdown(countdown)}
                    </span>
                  </p>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 p-0 h-auto"
                    onClick={handleResend}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Didn't receive the email? Click to resend"
                    )}
                  </Button>
                )}
              </div>

              {/* Helpful tips */}
              <div className="text-left mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800 font-medium mb-2">Can't find the email?</p>
                <ul className="text-sm text-amber-700 list-disc list-inside space-y-1">
                  <li>Check your spam or junk folder</li>
                  <li>Make sure you entered the correct email</li>
                  <li>Wait a few minutes for delivery</li>
                </ul>
              </div>

              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSent(false);
                    setEmail('');
                    setCountdown(0);
                  }}
                >
                  Try a different email
                </Button>

                <Link to="/login" className="block">
                  <Button variant="ghost" className="w-full gap-2 text-gray-600">
                    <ArrowLeft className="w-4 h-4" />
                    Back to login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            /* Form State */
            <>
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                Reset your password
              </h2>
              <p className="text-gray-500 text-center mb-8">
                Enter your email address and we'll send you instructions to reset your password
              </p>

              {/* General error display */}
              {errors.general && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm text-center">{errors.general}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                  <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      ref={emailInputRef}
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                      }}
                      onBlur={handleEmailBlur}
                      placeholder="bryan@vanrockholdings.com"
                      className={`pl-10 ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                      disabled={loading}
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && (
                    <p id="email-error" className="mt-1 text-sm text-red-600">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending reset link...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </form>

              {/* Back to Login */}
              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="text-emerald-600 hover:text-emerald-700 text-sm font-medium inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Demo Mode Indicator */}
        {isDemoMode && (
          <div className="mt-4 text-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
              Demo Mode - No emails will be sent
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
