import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  ArrowLeft,
  Play,
  BookOpen,
  Settings,
  Users,
  Building2,
  FileText,
  Target,
  Rocket,
  PartyPopper
} from 'lucide-react';

const UserOnboardingWizardPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [userRole, setUserRole] = useState('');
  const [preferences, setPreferences] = useState({
    notifications: true,
    emailDigest: 'daily',
    defaultView: 'dashboard',
    timezone: 'America/New_York'
  });
  const [checklist, setChecklist] = useState({
    profileComplete: false,
    watchedIntro: false,
    exploredDashboard: false,
    viewedProject: false,
    reviewedDocs: false
  });

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome',
      description: 'Get started with AtlasRC',
      icon: Rocket
    },
    {
      id: 'role',
      title: 'Your Role',
      description: 'Tell us about your role',
      icon: Users
    },
    {
      id: 'preferences',
      title: 'Preferences',
      description: 'Customize your experience',
      icon: Settings
    },
    {
      id: 'tour',
      title: 'Quick Tour',
      description: 'Learn the basics',
      icon: BookOpen
    },
    {
      id: 'checklist',
      title: 'Getting Started',
      description: 'Complete key tasks',
      icon: Target
    },
    {
      id: 'complete',
      title: 'All Set!',
      description: 'You\'re ready to go',
      icon: PartyPopper
    }
  ];

  const roleOptions = [
    { value: 'executive', label: 'Executive / Owner', description: 'High-level portfolio oversight and reporting' },
    { value: 'project_manager', label: 'Project Manager', description: 'Day-to-day project management and coordination' },
    { value: 'accountant', label: 'Accountant / Finance', description: 'Financial tracking, budgets, and reporting' },
    { value: 'acquisitions', label: 'Acquisitions', description: 'Deal sourcing and due diligence' },
    { value: 'construction', label: 'Construction Manager', description: 'Construction oversight and contractor management' },
    { value: 'sales', label: 'Sales / Dispositions', description: 'Property sales and listing management' }
  ];

  const tourModules = [
    { id: 'dashboard', title: 'Dashboard Overview', duration: '2 min', description: 'Navigate the main dashboard and key metrics' },
    { id: 'projects', title: 'Projects & Units', duration: '3 min', description: 'Manage projects, lots, and unit inventory' },
    { id: 'pipeline', title: 'Deal Pipeline', duration: '2 min', description: 'Track opportunities and acquisitions' },
    { id: 'accounting', title: 'Accounting Basics', duration: '3 min', description: 'Financial tracking and reporting' },
    { id: 'reports', title: 'Reports & Analytics', duration: '2 min', description: 'Generate insights and reports' }
  ];

  const progress = Math.round((completedSteps.length / (steps.length - 1)) * 100);

  const handleNextStep = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepComplete = (stepIndex) => completedSteps.includes(stepIndex);

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case 'welcome':
        return (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Rocket className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Welcome to AtlasRC!</h2>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              Your complete real estate development management platform. Let's get you set up
              in just a few minutes so you can start managing your projects effectively.
            </p>
            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mt-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Building2 className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-sm text-gray-600">Manage Projects</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-sm text-gray-600">Track Finances</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Target className="w-6 h-6 text-orange-600" />
                </div>
                <p className="text-sm text-gray-600">Close Deals</p>
              </div>
            </div>
          </div>
        );

      case 'role':
        return (
          <div className="py-4">
            <h2 className="text-xl font-bold mb-2">What's your primary role?</h2>
            <p className="text-gray-600 mb-6">We'll customize your experience based on your role.</p>
            <div className="grid gap-3">
              {roleOptions.map((role) => (
                <div
                  key={role.value}
                  onClick={() => setUserRole(role.value)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    userRole === role.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{role.label}</p>
                      <p className="text-sm text-gray-500">{role.description}</p>
                    </div>
                    {userRole === role.value && (
                      <CheckCircle2 className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div className="py-4">
            <h2 className="text-xl font-bold mb-2">Set Your Preferences</h2>
            <p className="text-gray-600 mb-6">Customize how AtlasRC works for you.</p>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Email Notifications</Label>
                  <p className="text-sm text-gray-500">Receive updates about your projects</p>
                </div>
                <Checkbox
                  checked={preferences.notifications}
                  onCheckedChange={(checked) => setPreferences({...preferences, notifications: checked})}
                />
              </div>
              <div>
                <Label className="font-medium">Email Digest Frequency</Label>
                <Select
                  value={preferences.emailDigest}
                  onValueChange={(value) => setPreferences({...preferences, emailDigest: value})}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Real-time</SelectItem>
                    <SelectItem value="daily">Daily Summary</SelectItem>
                    <SelectItem value="weekly">Weekly Summary</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="font-medium">Default Dashboard View</Label>
                <Select
                  value={preferences.defaultView}
                  onValueChange={(value) => setPreferences({...preferences, defaultView: value})}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dashboard">Executive Dashboard</SelectItem>
                    <SelectItem value="projects">Projects List</SelectItem>
                    <SelectItem value="pipeline">Deal Pipeline</SelectItem>
                    <SelectItem value="calendar">Calendar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="font-medium">Timezone</Label>
                <Select
                  value={preferences.timezone}
                  onValueChange={(value) => setPreferences({...preferences, timezone: value})}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 'tour':
        return (
          <div className="py-4">
            <h2 className="text-xl font-bold mb-2">Quick Tour</h2>
            <p className="text-gray-600 mb-6">Watch these short videos to get up to speed quickly.</p>
            <div className="space-y-3">
              {tourModules.map((module) => (
                <div
                  key={module.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Play className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{module.title}</p>
                      <p className="text-sm text-gray-500">{module.description}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{module.duration}</Badge>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-4 text-center">
              You can access these videos anytime from the Training Library
            </p>
          </div>
        );

      case 'checklist':
        return (
          <div className="py-4">
            <h2 className="text-xl font-bold mb-2">Getting Started Checklist</h2>
            <p className="text-gray-600 mb-6">Complete these tasks to get the most out of AtlasRC.</p>
            <div className="space-y-3">
              <div
                className={`flex items-center gap-4 p-4 border rounded-lg ${checklist.profileComplete ? 'bg-green-50 border-green-200' : ''}`}
                onClick={() => setChecklist({...checklist, profileComplete: !checklist.profileComplete})}
              >
                <Checkbox checked={checklist.profileComplete} />
                <div className="flex-1">
                  <p className="font-medium">Complete your profile</p>
                  <p className="text-sm text-gray-500">Add your photo and contact information</p>
                </div>
              </div>
              <div
                className={`flex items-center gap-4 p-4 border rounded-lg ${checklist.watchedIntro ? 'bg-green-50 border-green-200' : ''}`}
                onClick={() => setChecklist({...checklist, watchedIntro: !checklist.watchedIntro})}
              >
                <Checkbox checked={checklist.watchedIntro} />
                <div className="flex-1">
                  <p className="font-medium">Watch the intro video</p>
                  <p className="text-sm text-gray-500">5-minute overview of key features</p>
                </div>
              </div>
              <div
                className={`flex items-center gap-4 p-4 border rounded-lg ${checklist.exploredDashboard ? 'bg-green-50 border-green-200' : ''}`}
                onClick={() => setChecklist({...checklist, exploredDashboard: !checklist.exploredDashboard})}
              >
                <Checkbox checked={checklist.exploredDashboard} />
                <div className="flex-1">
                  <p className="font-medium">Explore the dashboard</p>
                  <p className="text-sm text-gray-500">Familiarize yourself with the main views</p>
                </div>
              </div>
              <div
                className={`flex items-center gap-4 p-4 border rounded-lg ${checklist.viewedProject ? 'bg-green-50 border-green-200' : ''}`}
                onClick={() => setChecklist({...checklist, viewedProject: !checklist.viewedProject})}
              >
                <Checkbox checked={checklist.viewedProject} />
                <div className="flex-1">
                  <p className="font-medium">View a sample project</p>
                  <p className="text-sm text-gray-500">See how projects are organized</p>
                </div>
              </div>
              <div
                className={`flex items-center gap-4 p-4 border rounded-lg ${checklist.reviewedDocs ? 'bg-green-50 border-green-200' : ''}`}
                onClick={() => setChecklist({...checklist, reviewedDocs: !checklist.reviewedDocs})}
              >
                <Checkbox checked={checklist.reviewedDocs} />
                <div className="flex-1">
                  <p className="font-medium">Review help documentation</p>
                  <p className="text-sm text-gray-500">Know where to find answers</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <PartyPopper className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4">You're All Set!</h2>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              Great job completing the onboarding! You're now ready to start managing your
              real estate projects like a pro.
            </p>
            <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto mb-6">
              <p className="text-sm text-blue-800">
                <strong>Quick Tip:</strong> You can always access the Training Library and
                Knowledge Base from the help menu if you need assistance.
              </p>
            </div>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Welcome - Getting Started</title>
      </Helmet>

      <div className="max-w-3xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Setup Progress</span>
            <span className="text-sm font-medium">{progress}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between mb-8">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            return (
              <div
                key={step.id}
                className={`flex flex-col items-center ${index <= currentStep ? 'text-blue-600' : 'text-gray-400'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                  isStepComplete(index)
                    ? 'bg-green-100 text-green-600'
                    : index === currentStep
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-400'
                }`}>
                  {isStepComplete(index) ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <StepIcon className="w-5 h-5" />
                  )}
                </div>
                <span className="text-xs font-medium hidden sm:block">{step.title}</span>
              </div>
            );
          })}
        </div>

        {/* Content Card */}
        <Card>
          <CardContent className="pt-6">
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handlePrevStep}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          {currentStep < steps.length - 1 ? (
            <Button onClick={handleNextStep} className="bg-blue-600 hover:bg-blue-700">
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button className="bg-green-600 hover:bg-green-700">
              Finish Setup
              <CheckCircle2 className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserOnboardingWizardPage;
