import React, { useState, useMemo } from 'react';
import {
  AlertTriangle, Shield, Building, DollarSign, TrendingDown,
  CheckCircle, XCircle, HelpCircle, ChevronDown, ChevronRight,
  FileText, Scale, Droplets, Zap, Users, MapPin, BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const mockRiskAssessments = [
  {
    id: 'RISK-2024-0012',
    property: 'Lakeside Business Park',
    address: '500 Lakeside Dr, Austin, TX',
    type: 'Office',
    assessmentDate: '2024-01-22',
    overallRisk: 'medium',
    overallScore: 65,
    status: 'in_review',
    assessor: 'Sarah Johnson',
    categories: [
      {
        name: 'Market Risk',
        icon: 'TrendingDown',
        score: 70,
        risk: 'medium',
        factors: [
          { factor: 'Market vacancy rate', score: 60, notes: 'Austin office vacancy at 18%, above historical average' },
          { factor: 'Submarket fundamentals', score: 75, notes: 'Lakeside submarket outperforming CBD' },
          { factor: 'Supply pipeline', score: 65, notes: '2 competing projects under construction within 2 miles' },
          { factor: 'Demand drivers', score: 80, notes: 'Strong tech employment growth in Austin metro' }
        ]
      },
      {
        name: 'Financial Risk',
        icon: 'DollarSign',
        score: 60,
        risk: 'medium',
        factors: [
          { factor: 'In-place NOI sustainability', score: 55, notes: 'Below-market rents provide upside but current NOI weak' },
          { factor: 'Tenant credit quality', score: 65, notes: 'Mix of investment grade and smaller tenants' },
          { factor: 'Lease rollover exposure', score: 50, notes: '35% of NRA rolling in next 24 months' },
          { factor: 'Capital requirements', score: 70, notes: 'Moderate deferred maintenance identified' }
        ]
      },
      {
        name: 'Physical Risk',
        icon: 'Building',
        score: 72,
        risk: 'low',
        factors: [
          { factor: 'Building condition', score: 70, notes: 'Good condition, some HVAC updates needed' },
          { factor: 'Structural integrity', score: 85, notes: 'No significant structural issues identified' },
          { factor: 'Roof/envelope', score: 65, notes: 'Roof replacement needed within 5 years' },
          { factor: 'MEP systems', score: 68, notes: 'HVAC units averaging 12 years old' }
        ]
      },
      {
        name: 'Environmental Risk',
        icon: 'Droplets',
        score: 85,
        risk: 'low',
        factors: [
          { factor: 'Phase I findings', score: 90, notes: 'No RECs identified in Phase I' },
          { factor: 'Flood zone', score: 80, notes: 'Zone X - minimal flood risk' },
          { factor: 'Hazardous materials', score: 85, notes: 'No known hazardous materials' },
          { factor: 'Soil conditions', score: 85, notes: 'Standard foundation, no issues' }
        ]
      },
      {
        name: 'Legal/Title Risk',
        icon: 'Scale',
        score: 75,
        risk: 'low',
        factors: [
          { factor: 'Title encumbrances', score: 80, notes: 'Standard easements, no material issues' },
          { factor: 'Zoning compliance', score: 70, notes: 'Conforming use, some parking variance' },
          { factor: 'Lease review', score: 75, notes: 'Standard lease terms, some renewal options' },
          { factor: 'Litigation exposure', score: 75, notes: 'No pending litigation' }
        ]
      },
      {
        name: 'Execution Risk',
        icon: 'Zap',
        score: 55,
        risk: 'high',
        factors: [
          { factor: 'Business plan complexity', score: 50, notes: 'Value-add strategy requires significant leasing' },
          { factor: 'Renovation scope', score: 60, notes: 'Lobby and common area renovation planned' },
          { factor: 'Lease-up timeline', score: 50, notes: 'Need to lease 22% vacancy plus 35% rollover' },
          { factor: 'Exit strategy viability', score: 60, notes: 'Dependent on executing repositioning' }
        ]
      }
    ],
    mitigations: [
      { risk: 'Lease rollover exposure', mitigation: 'Early tenant outreach, competitive TI packages', status: 'planned' },
      { risk: 'Business plan complexity', mitigation: 'Engage experienced leasing team early', status: 'planned' },
      { risk: 'HVAC age', mitigation: 'Include HVAC replacement in capex budget', status: 'planned' }
    ]
  },
  {
    id: 'RISK-2024-0011',
    property: 'Metro Industrial Complex',
    address: '2200 Commerce Way, Dallas, TX',
    type: 'Industrial',
    assessmentDate: '2024-01-18',
    overallRisk: 'low',
    overallScore: 82,
    status: 'completed',
    assessor: 'John Smith',
    categories: [
      {
        name: 'Market Risk',
        icon: 'TrendingDown',
        score: 85,
        risk: 'low',
        factors: [
          { factor: 'Market vacancy rate', score: 90, notes: 'Dallas industrial vacancy at 4.5%' },
          { factor: 'Submarket fundamentals', score: 85, notes: 'Prime logistics corridor' },
          { factor: 'Supply pipeline', score: 80, notes: 'Limited spec development in immediate area' },
          { factor: 'Demand drivers', score: 85, notes: 'E-commerce and distribution growth strong' }
        ]
      },
      {
        name: 'Financial Risk',
        icon: 'DollarSign',
        score: 80,
        risk: 'low',
        factors: [
          { factor: 'In-place NOI sustainability', score: 85, notes: 'Rents at market with 3% annual bumps' },
          { factor: 'Tenant credit quality', score: 90, notes: 'Amazon anchor tenant - investment grade' },
          { factor: 'Lease rollover exposure', score: 70, notes: 'Amazon lease expires in 6 years' },
          { factor: 'Capital requirements', score: 75, notes: 'Well-maintained, minimal deferred maintenance' }
        ]
      }
    ],
    mitigations: []
  }
];

const riskConfig = {
  low: { label: 'Low Risk', color: 'bg-green-100 text-green-800', barColor: 'bg-green-500' },
  medium: { label: 'Medium Risk', color: 'bg-yellow-100 text-yellow-800', barColor: 'bg-yellow-500' },
  high: { label: 'High Risk', color: 'bg-red-100 text-red-800', barColor: 'bg-red-500' }
};

const categoryIcons = {
  'Market Risk': TrendingDown,
  'Financial Risk': DollarSign,
  'Physical Risk': Building,
  'Environmental Risk': Droplets,
  'Legal/Title Risk': Scale,
  'Execution Risk': Zap
};

export default function RiskAssessmentPage() {
  const [selectedAssessment, setSelectedAssessment] = useState(mockRiskAssessments[0]);
  const [expandedCategories, setExpandedCategories] = useState(['Market Risk', 'Financial Risk', 'Execution Risk']);

  const toggleCategory = (category) => {
    setExpandedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const getRiskLevel = (score) => {
    if (score >= 75) return 'low';
    if (score >= 50) return 'medium';
    return 'high';
  };

  const getScoreColor = (score) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const stats = useMemo(() => ({
    total: mockRiskAssessments.length,
    lowRisk: mockRiskAssessments.filter(a => a.overallRisk === 'low').length,
    mediumRisk: mockRiskAssessments.filter(a => a.overallRisk === 'medium').length,
    highRisk: mockRiskAssessments.filter(a => a.overallRisk === 'high').length
  }), []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Risk Assessment</h1>
          <p className="text-gray-600">Evaluate and mitigate deal risks</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Shield className="w-4 h-4 mr-2" />New Assessment
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg"><FileText className="w-5 h-5 text-blue-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">Assessments</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg"><CheckCircle className="w-5 h-5 text-green-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.lowRisk}</p>
              <p className="text-sm text-gray-600">Low Risk</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg"><HelpCircle className="w-5 h-5 text-yellow-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.mediumRisk}</p>
              <p className="text-sm text-gray-600">Medium Risk</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.highRisk}</p>
              <p className="text-sm text-gray-600">High Risk</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-1 space-y-2">
          {mockRiskAssessments.map((assessment) => (
            <div
              key={assessment.id}
              onClick={() => setSelectedAssessment(assessment)}
              className={cn(
                "bg-white rounded-lg border p-4 cursor-pointer hover:border-blue-300 transition-colors",
                selectedAssessment?.id === assessment.id ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-200"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <p className="font-medium text-gray-900">{assessment.property}</p>
                <span className={cn("px-2 py-0.5 rounded text-xs", riskConfig[assessment.overallRisk].color)}>{riskConfig[assessment.overallRisk].label}</span>
              </div>
              <p className="text-sm text-gray-500 mb-2">{assessment.type}</p>
              <div className="flex items-center justify-between">
                <span className={cn("text-2xl font-bold", getScoreColor(assessment.overallScore))}>{assessment.overallScore}</span>
                <span className="text-xs text-gray-500">{assessment.assessmentDate}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="col-span-3 space-y-4">
          {selectedAssessment && (
            <>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl font-bold text-gray-900">{selectedAssessment.property}</h2>
                      <span className={cn("px-2 py-1 rounded-full text-xs", riskConfig[selectedAssessment.overallRisk].color)}>{riskConfig[selectedAssessment.overallRisk].label}</span>
                    </div>
                    <p className="text-gray-600 flex items-center gap-1"><MapPin className="w-4 h-4" />{selectedAssessment.address}</p>
                  </div>
                  <div className="text-right">
                    <p className={cn("text-4xl font-bold", getScoreColor(selectedAssessment.overallScore))}>{selectedAssessment.overallScore}</p>
                    <p className="text-sm text-gray-500">Overall Score</p>
                  </div>
                </div>

                <div className="grid grid-cols-6 gap-2">
                  {selectedAssessment.categories.map((cat) => {
                    const Icon = categoryIcons[cat.name] || AlertTriangle;
                    return (
                      <div key={cat.name} className="text-center p-3 bg-gray-50 rounded-lg">
                        <Icon className={cn("w-5 h-5 mx-auto mb-1", getScoreColor(cat.score))} />
                        <p className={cn("text-lg font-bold", getScoreColor(cat.score))}>{cat.score}</p>
                        <p className="text-xs text-gray-500">{cat.name.split(' ')[0]}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                {selectedAssessment.categories.map((category) => {
                  const Icon = categoryIcons[category.name] || AlertTriangle;
                  const isExpanded = expandedCategories.includes(category.name);

                  return (
                    <div key={category.name} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <div
                        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                        onClick={() => toggleCategory(category.name)}
                      >
                        <div className="flex items-center gap-3">
                          {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                          <Icon className="w-5 h-5 text-gray-600" />
                          <h3 className="font-semibold text-gray-900">{category.name}</h3>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-32">
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div className={cn("h-full rounded-full", riskConfig[category.risk].barColor)} style={{ width: `${category.score}%` }} />
                            </div>
                          </div>
                          <span className={cn("text-xl font-bold w-12 text-right", getScoreColor(category.score))}>{category.score}</span>
                          <span className={cn("px-2 py-1 rounded text-xs w-24 text-center", riskConfig[category.risk].color)}>{riskConfig[category.risk].label}</span>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="border-t border-gray-200 p-4">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-left text-gray-500 border-b">
                                <th className="pb-2">Factor</th>
                                <th className="pb-2 text-center w-20">Score</th>
                                <th className="pb-2">Notes</th>
                              </tr>
                            </thead>
                            <tbody>
                              {category.factors.map((factor, idx) => (
                                <tr key={idx} className="border-b border-gray-100 last:border-0">
                                  <td className="py-2 font-medium text-gray-900">{factor.factor}</td>
                                  <td className="py-2 text-center">
                                    <span className={cn("font-bold", getScoreColor(factor.score))}>{factor.score}</span>
                                  </td>
                                  <td className="py-2 text-gray-600">{factor.notes}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {selectedAssessment.mitigations.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5" />Risk Mitigations
                  </h3>
                  <div className="space-y-3">
                    {selectedAssessment.mitigations.map((mit, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{mit.risk}</p>
                          <p className="text-sm text-gray-600">{mit.mitigation}</p>
                        </div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs capitalize">{mit.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
