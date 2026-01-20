import React, { useState } from 'react';
import { Edit2, Save, X, Plus, Trash2, Target, Eye, Heart, Star, Compass, Mountain, Calendar, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const EOSVisionTraction = ({ program }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('vision'); // 'vision', 'traction'

  const [vto, setVto] = useState({
    // Vision Side
    coreValues: [
      { id: 1, value: 'Integrity First', description: 'We do what we say and say what we do' },
      { id: 2, value: 'Excellence in Execution', description: 'We deliver quality in everything we touch' },
      { id: 3, value: 'Continuous Improvement', description: 'We never stop learning and growing' },
      { id: 4, value: 'Team Before Self', description: 'We succeed together or not at all' },
      { id: 5, value: 'Client Obsession', description: 'We put our clients first in every decision' },
    ],
    coreFocus: {
      purpose: 'To build communities that transform neighborhoods and create lasting value',
      niche: 'Residential real estate development in the Upstate South Carolina market',
    },
    tenYearTarget: 'Become the premier residential developer in Upstate SC with $50M in annual revenue and 500+ units delivered',
    marketingStrategy: {
      targetMarket: 'First-time homebuyers and young families in Greenville County seeking quality new construction homes priced $350K-$500K',
      threeUniques: [
        'Superior quality construction with attention to detail',
        'Innovative designs that maximize space and functionality',
        'Exceptional customer experience from contract to closing',
      ],
      provenProcess: 'VanRock Development Method™ - Our proven 6-phase approach from land acquisition to happy homeowner',
      guarantee: 'If you\'re not 100% satisfied at your 1-year walkthrough, we\'ll fix any issues at no cost',
    },
    threeYearPicture: {
      date: 'December 31, 2027',
      revenue: '$25,000,000',
      profit: '$3,750,000',
      measurables: [
        '150 units delivered annually',
        '12 active projects at any time',
        '35 full-time employees',
        'Net Promoter Score of 75+',
      ],
      whatDoesItLookLike: [
        'We have a full leadership team with clear accountability',
        'Our processes are documented and followed consistently',
        'We\'re known as the builder of choice in Greenville',
        'We have a waiting list of investors wanting to partner with us',
      ],
    },

    // Traction Side
    oneYearPlan: {
      date: 'December 31, 2025',
      revenue: '$12,000,000',
      profit: '$1,500,000',
      measurables: [
        '48 units delivered',
        '6 active projects',
        '18 employees',
        'NPS of 65+',
      ],
      goals: [
        { id: 1, goal: 'Complete Oakridge Estates project', owner: 'Bryan V.', status: 'on-track' },
        { id: 2, goal: 'Launch property management division', owner: 'Sarah M.', status: 'on-track' },
        { id: 3, goal: 'Secure $10M in new project financing', owner: 'Bryan V.', status: 'on-track' },
        { id: 4, goal: 'Implement EOS across all entities', owner: 'Bryan V.', status: 'complete' },
        { id: 5, goal: 'Hire Director of Construction', owner: 'Mike J.', status: 'at-risk' },
      ],
    },
    quarterlyRocks: {
      quarter: 'Q1 2025',
      rocks: [
        { id: 1, rock: 'Launch new property management software', owner: 'Bryan V.', status: 'on-track' },
        { id: 2, rock: 'Hire 2 project managers', owner: 'Sarah M.', status: 'on-track' },
        { id: 3, rock: 'Complete ISO certification', owner: 'Mike J.', status: 'on-track' },
        { id: 4, rock: 'Implement new CRM system', owner: 'Lisa C.', status: 'at-risk' },
        { id: 5, rock: 'Establish vendor qualification process', owner: 'Tom W.', status: 'off-track' },
      ],
    },
    issuesList: [
      'Cash flow timing with large projects',
      'Need better subcontractor vetting',
      'Marketing lead quality declining',
      'Office space constraints',
    ],
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'on-track': case 'complete': return 'bg-green-100 text-green-700';
      case 'at-risk': return 'bg-amber-100 text-amber-700';
      case 'off-track': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Vision/Traction Organizer™</h1>
          <p className="text-sm text-gray-500">Your company&apos;s strategic roadmap on two pages</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}><X className="w-4 h-4 mr-1" />Cancel</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]" onClick={() => setIsEditing(false)}><Save className="w-4 h-4 mr-1" />Save</Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setIsEditing(true)}><Edit2 className="w-4 h-4 mr-1" />Edit</Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button 
          onClick={() => setActiveTab('vision')}
          className={cn("px-6 py-2 rounded-lg font-medium", activeTab === 'vision' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}
        >
          Vision
        </button>
        <button 
          onClick={() => setActiveTab('traction')}
          className={cn("px-6 py-2 rounded-lg font-medium", activeTab === 'traction' ? "bg-[#047857] text-white" : "bg-white border hover:bg-gray-50")}
        >
          Traction
        </button>
      </div>

      {/* Vision Side */}
      {activeTab === 'vision' && (
        <div className="space-y-6">
          {/* Core Values */}
          <div className="bg-white border rounded-lg">
            <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-white">
              <h3 className="font-semibold flex items-center gap-2">
                <Heart className="w-5 h-5 text-purple-500" />
                Core Values
              </h3>
              <p className="text-xs text-gray-500 mt-1">The essential and enduring guiding principles of your company</p>
            </div>
            <div className="p-4 space-y-3">
              {vto.coreValues.map((cv, idx) => (
                <div key={cv.id} className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-medium">{idx + 1}</span>
                  <div>
                    <p className="font-medium">{cv.value}</p>
                    <p className="text-sm text-gray-500">{cv.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Core Focus */}
          <div className="bg-white border rounded-lg">
            <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-white">
              <h3 className="font-semibold flex items-center gap-2">
                <Compass className="w-5 h-5 text-blue-500" />
                Core Focus™
              </h3>
              <p className="text-xs text-gray-500 mt-1">Why you exist and what you do best</p>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Purpose/Cause/Passion</p>
                <p className="font-medium">{vto.coreFocus.purpose}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Niche</p>
                <p className="font-medium">{vto.coreFocus.niche}</p>
              </div>
            </div>
          </div>

          {/* 10-Year Target */}
          <div className="bg-white border rounded-lg">
            <div className="p-4 border-b bg-gradient-to-r from-green-50 to-white">
              <h3 className="font-semibold flex items-center gap-2">
                <Star className="w-5 h-5 text-green-500" />
                10-Year Target™
              </h3>
              <p className="text-xs text-gray-500 mt-1">Your Big Hairy Audacious Goal (BHAG)</p>
            </div>
            <div className="p-4">
              <p className="text-lg font-medium">{vto.tenYearTarget}</p>
            </div>
          </div>

          {/* Marketing Strategy */}
          <div className="bg-white border rounded-lg">
            <div className="p-4 border-b bg-gradient-to-r from-amber-50 to-white">
              <h3 className="font-semibold flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-500" />
                Marketing Strategy
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Target Market</p>
                <p className="font-medium">{vto.marketingStrategy.targetMarket}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Three Uniques™</p>
                <ol className="list-decimal list-inside space-y-1">
                  {vto.marketingStrategy.threeUniques.map((unique, idx) => (
                    <li key={idx} className="font-medium">{unique}</li>
                  ))}
                </ol>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Proven Process</p>
                <p className="font-medium">{vto.marketingStrategy.provenProcess}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Guarantee</p>
                <p className="font-medium">{vto.marketingStrategy.guarantee}</p>
              </div>
            </div>
          </div>

          {/* 3-Year Picture */}
          <div className="bg-white border rounded-lg">
            <div className="p-4 border-b bg-gradient-to-r from-indigo-50 to-white">
              <h3 className="font-semibold flex items-center gap-2">
                <Eye className="w-5 h-5 text-indigo-500" />
                3-Year Picture™
              </h3>
              <p className="text-xs text-gray-500 mt-1">Future Date: {vto.threeYearPicture.date}</p>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500">Revenue</p>
                  <p className="text-xl font-bold text-green-700">{vto.threeYearPicture.revenue}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500">Profit</p>
                  <p className="text-xl font-bold text-green-700">{vto.threeYearPicture.profit}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Measurables</p>
                  <ul className="space-y-1">
                    {vto.threeYearPicture.measurables.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">What Does It Look Like?</p>
                  <ul className="space-y-1">
                    {vto.threeYearPicture.whatDoesItLookLike.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Traction Side */}
      {activeTab === 'traction' && (
        <div className="space-y-6">
          {/* 1-Year Plan */}
          <div className="bg-white border rounded-lg">
            <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-white">
              <h3 className="font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                1-Year Plan
              </h3>
              <p className="text-xs text-gray-500 mt-1">Future Date: {vto.oneYearPlan.date}</p>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500">Revenue</p>
                  <p className="text-xl font-bold text-blue-700">{vto.oneYearPlan.revenue}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500">Profit</p>
                  <p className="text-xl font-bold text-blue-700">{vto.oneYearPlan.profit}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Measurables</p>
                  <ul className="space-y-1">
                    {vto.oneYearPlan.measurables.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">Goals for the Year</p>
                  <div className="space-y-2">
                    {vto.oneYearPlan.goals.map((goal) => (
                      <div key={goal.id} className="flex items-center justify-between text-sm">
                        <span>{goal.goal}</span>
                        <span className={cn("px-2 py-0.5 rounded text-xs capitalize", getStatusColor(goal.status))}>
                          {goal.status.replace('-', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quarterly Rocks */}
          <div className="bg-white border rounded-lg">
            <div className="p-4 border-b bg-gradient-to-r from-green-50 to-white">
              <h3 className="font-semibold flex items-center gap-2">
                <Mountain className="w-5 h-5 text-green-500" />
                Rocks - {vto.quarterlyRocks.quarter}
              </h3>
              <p className="text-xs text-gray-500 mt-1">The 3-7 most important things to accomplish this quarter</p>
            </div>
            <div className="divide-y">
              {vto.quarterlyRocks.rocks.map((rock) => (
                <div key={rock.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{rock.rock}</p>
                    <p className="text-sm text-gray-500">{rock.owner}</p>
                  </div>
                  <span className={cn("px-2 py-1 rounded text-xs capitalize", getStatusColor(rock.status))}>
                    {rock.status.replace('-', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Issues List */}
          <div className="bg-white border rounded-lg">
            <div className="p-4 border-b bg-gradient-to-r from-amber-50 to-white">
              <h3 className="font-semibold flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-500" />
                Issues List
              </h3>
              <p className="text-xs text-gray-500 mt-1">Long-term issues to be solved</p>
            </div>
            <div className="p-4">
              <ul className="space-y-2">
                {vto.issuesList.map((issue, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EOSVisionTraction;
