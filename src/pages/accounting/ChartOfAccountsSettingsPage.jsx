import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BookOpen, Plus, Download, Upload, Copy, CheckCircle2, Building2,
  Home, Briefcase, Factory, Warehouse, ArrowLeft, Save, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

// Chart of Accounts Templates
const COA_TEMPLATES = {
  REAL_ESTATE_DEVELOPMENT: {
    id: 'real_estate_dev',
    name: 'Real Estate Development',
    icon: Building2,
    description: 'Comprehensive chart for development projects, construction, and property management',
    color: 'blue',
    accountCount: 145,
    categories: ['Assets', 'Liabilities', 'Equity', 'Revenue', 'COGS', 'Operating Expenses', 'Development Costs']
  },
  PROPERTY_MANAGEMENT: {
    id: 'property_mgmt',
    name: 'Property Management',
    icon: Home,
    description: 'Optimized for rental property operations and tenant management',
    color: 'green',
    accountCount: 98,
    categories: ['Assets', 'Liabilities', 'Equity', 'Rental Income', 'Property Expenses', 'Maintenance']
  },
  CONSTRUCTION: {
    id: 'construction',
    name: 'Construction Company',
    icon: Factory,
    description: 'Job costing, WIP tracking, and contractor-specific accounts',
    color: 'orange',
    accountCount: 132,
    categories: ['Assets', 'Liabilities', 'Equity', 'Contract Revenue', 'Job Costs', 'Equipment']
  },
  HOLDING_COMPANY: {
    id: 'holding_company',
    name: 'Holding Company',
    icon: Briefcase,
    description: 'Multi-entity structure with investment tracking and intercompany accounts',
    color: 'purple',
    accountCount: 87,
    categories: ['Assets', 'Investments', 'Liabilities', 'Equity', 'Investment Income', 'Admin Expenses']
  },
  FAMILY_OFFICE: {
    id: 'family_office',
    name: 'Family Office',
    icon: Warehouse,
    description: 'Wealth management, trust accounting, and diversified investments',
    color: 'indigo',
    accountCount: 156,
    categories: ['Assets', 'Investments', 'Trusts', 'Liabilities', 'Equity', 'Income', 'Expenses']
  },
  STANDARD: {
    id: 'standard',
    name: 'Standard Business',
    icon: FileText,
    description: 'General business chart of accounts',
    color: 'gray',
    accountCount: 72,
    categories: ['Assets', 'Liabilities', 'Equity', 'Revenue', 'Expenses']
  }
};

const ChartOfAccountsSettingsPage = () => {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [currentCOA, setCurrentCOA] = useState(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    loadCurrentCOA();
  }, [entityId]);

  const loadCurrentCOA = async () => {
    try {
      setLoading(false);
      // TODO: Load existing COA from service
      setCurrentCOA({
        template: 'real_estate_dev',
        accountCount: 145,
        lastModified: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error loading COA:', error);
    }
  };

  const handleApplyTemplate = async (templateId) => {
    try {
      setImporting(true);
      // TODO: Implement template application via service
      toast({
        title: 'Chart of Accounts Applied',
        description: `${COA_TEMPLATES[templateId]?.name} template has been applied successfully.`
      });
      loadCurrentCOA();
    } catch (error) {
      console.error('Error applying template:', error);
      toast({
        title: 'Error',
        description: 'Failed to apply template',
        variant: 'destructive'
      });
    } finally {
      setImporting(false);
    }
  };

  const handleImportCSV = (event) => {
    const file = event.target.files[0];
    if (file) {
      toast({
        title: 'Importing Chart of Accounts',
        description: `Processing ${file.name}...`
      });
      // TODO: Implement CSV import
    }
  };

  const handleExportCSV = () => {
    toast({
      title: 'Export Started',
      description: 'Downloading chart of accounts...'
    });
    // TODO: Implement CSV export
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" onClick={() => navigate(`/accounting/${entityId}/settings`)}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Settings
            </Button>
          </div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-blue-600" />
            Chart of Accounts Setup
          </h1>
          <p className="text-gray-500 mt-1">
            Choose a template or import your existing chart of accounts
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <label>
            <Button variant="outline" asChild>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                Import CSV
              </span>
            </Button>
            <input
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Current COA Status */}
      {currentCOA && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-semibold text-blue-900">
                    Current Template: {COA_TEMPLATES[currentCOA.template.toUpperCase()]?.name || 'Custom'}
                  </p>
                  <p className="text-sm text-blue-700">
                    {currentCOA.accountCount} accounts • Last modified {new Date(currentCOA.lastModified).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Button onClick={() => navigate(`/accounting/${entityId}/chart-of-accounts`)}>
                View Accounts
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Template Selection */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Select a Template</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.values(COA_TEMPLATES).map((template) => {
            const Icon = template.icon;
            const isSelected = selectedTemplate === template.id;
            const isCurrent = currentCOA?.template === template.id;
            
            return (
              <Card
                key={template.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-lg",
                  isSelected && "border-2 border-blue-500 shadow-lg",
                  isCurrent && "border-2 border-green-500"
                )}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center",
                      `bg-${template.color}-100`
                    )}>
                      <Icon className={cn("w-6 h-6", `text-${template.color}-600`)} />
                    </div>
                    {isCurrent && (
                      <Badge variant="success">Active</Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg mt-3">{template.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Total Accounts</span>
                      <span className="font-semibold">{template.accountCount}</span>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-500 mb-2">Categories:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.categories.map((cat) => (
                          <Badge key={cat} variant="outline" className="text-xs">
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {!isCurrent && (
                      <Button
                        className="w-full mt-3"
                        variant={isSelected ? "default" : "outline"}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyTemplate(template.id);
                        }}
                        disabled={importing}
                      >
                        {importing ? 'Applying...' : 'Apply Template'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Import Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Import Custom Chart of Accounts</CardTitle>
          <CardDescription>
            Upload a CSV file with your existing chart of accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <p className="font-medium">CSV Format Requirements:</p>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Column headers: Account Number, Account Name, Account Type, Parent Account (optional)</li>
              <li>Account Type must be one of: Asset, Liability, Equity, Revenue, Expense, COGS</li>
              <li>Account numbers should be unique and numeric (e.g., 1000, 1010, 1020)</li>
              <li>Parent Account should reference an existing account number for sub-accounts</li>
            </ul>
            <div className="pt-2">
              <Button variant="link" className="p-0 h-auto">
                <Download className="w-4 h-4 mr-1" />
                Download sample CSV template
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warning */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">Important Notes:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Applying a template will replace your current chart of accounts</li>
                <li>Existing transactions will remain linked to their original accounts</li>
                <li>You can customize accounts after applying a template</li>
                <li>Consider exporting your current COA before making changes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChartOfAccountsSettingsPage;
