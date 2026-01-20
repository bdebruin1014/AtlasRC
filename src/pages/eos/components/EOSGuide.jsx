import React, { useState } from 'react';
import { BookOpen, Target, Users, Mountain, TrendingUp, AlertTriangle, Calendar, Clock, Compass, Heart, Eye, Star, Zap, CheckCircle, ChevronRight, ExternalLink, Play, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const EOSGuide = () => {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', label: 'EOS Overview', icon: BookOpen },
    { id: 'vision', label: 'Vision Component', icon: Eye },
    { id: 'people', label: 'People Component', icon: Users },
    { id: 'data', label: 'Data Component', icon: TrendingUp },
    { id: 'issues', label: 'Issues Component', icon: AlertTriangle },
    { id: 'process', label: 'Process Component', icon: Zap },
    { id: 'traction', label: 'Traction Component', icon: Target },
    { id: 'meetings', label: 'Meeting Pulse', icon: Calendar },
    { id: 'tools', label: 'EOS Tools', icon: Star },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-[#047857]" />
          EOS® Implementation Guide
        </h1>
        <p className="text-sm text-gray-500">Everything you need to know to run EOS in your organization</p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="col-span-1">
          <div className="bg-white border rounded-lg p-4 sticky top-6">
            <h3 className="font-semibold mb-3">Contents</h3>
            <nav className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors",
                      activeSection === section.id
                        ? "bg-[#047857] text-white"
                        : "hover:bg-gray-100 text-gray-700"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {section.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="col-span-3">
          {/* Overview */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              <div className="bg-white border rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">What is EOS®?</h2>
                <p className="text-gray-600 mb-4">
                  The Entrepreneurial Operating System (EOS) is a complete set of simple concepts and practical tools 
                  that has helped thousands of entrepreneurs get what they want from their businesses. By implementing 
                  EOS, you will master the Six Key Components™ of your business and gain the tools you need to build 
                  a great company.
                </p>
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-purple-700">100,000+</p>
                    <p className="text-sm text-purple-600">Companies Using EOS</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-green-700">6</p>
                    <p className="text-sm text-green-600">Key Components</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-blue-700">20+</p>
                    <p className="text-sm text-blue-600">Proven Tools</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border rounded-lg p-6">
                <h3 className="font-semibold mb-4">The Six Key Components™</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: 'Vision', desc: 'Getting everyone in your organization 100% on the same page with where you\'re going and how you\'re going to get there', icon: Eye, color: 'purple' },
                    { name: 'People', desc: 'Surrounding yourself with great people - Right People in the Right Seats', icon: Users, color: 'blue' },
                    { name: 'Data', desc: 'Cutting through feelings and opinions to manage your business on facts and numbers', icon: TrendingUp, color: 'green' },
                    { name: 'Issues', desc: 'Strengthening your ability to identify, discuss, and solve issues', icon: AlertTriangle, color: 'amber' },
                    { name: 'Process', desc: 'Systemizing your business by identifying and documenting core processes', icon: Zap, color: 'pink' },
                    { name: 'Traction', desc: 'Bringing discipline and accountability into the organization through rocks, meetings, and measurables', icon: Target, color: 'red' },
                  ].map((comp) => {
                    const Icon = comp.icon;
                    return (
                      <div key={comp.name} className={cn("border rounded-lg p-4", `border-${comp.color}-200 bg-${comp.color}-50`)}>
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className={cn("w-5 h-5", `text-${comp.color}-500`)} />
                          <h4 className="font-semibold">{comp.name}</h4>
                        </div>
                        <p className="text-sm text-gray-600">{comp.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-[#047857] text-white rounded-lg p-6">
                <h3 className="font-semibold mb-3">Getting Started with EOS</h3>
                <ol className="space-y-2 text-green-100">
                  <li className="flex items-start gap-2">
                    <span className="w-6 h-6 bg-white text-[#047857] rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                    <span>Read &quot;Traction&quot; by Gino Wickman</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-6 h-6 bg-white text-[#047857] rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                    <span>Complete your Vision/Traction Organizer (V/TO)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-6 h-6 bg-white text-[#047857] rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                    <span>Build your Accountability Chart</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-6 h-6 bg-white text-[#047857] rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
                    <span>Create your Scorecard with 5-15 weekly metrics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-6 h-6 bg-white text-[#047857] rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">5</span>
                    <span>Start running weekly Level 10 Meetings™</span>
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* Vision Component */}
          {activeSection === 'vision' && (
            <div className="space-y-6">
              <div className="bg-white border rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Eye className="w-6 h-6 text-purple-500" />
                  Vision Component
                </h2>
                <p className="text-gray-600 mb-6">
                  The Vision Component ensures everyone in your organization is rowing in the same direction. 
                  It answers the 8 questions that define who you are, where you&apos;re going, and how you&apos;ll get there.
                </p>

                <h3 className="font-semibold mb-3">The 8 Questions</h3>
                <div className="space-y-4">
                  {[
                    { q: '1. What are your Core Values?', desc: '3-7 essential guiding principles that define your culture' },
                    { q: '2. What is your Core Focus™?', desc: 'Your purpose/cause/passion and your niche' },
                    { q: '3. What is your 10-Year Target™?', desc: 'Your big, long-range goal (BHAG)' },
                    { q: '4. What is your Marketing Strategy?', desc: 'Target market, 3 Uniques, Proven Process, Guarantee' },
                    { q: '5. What is your 3-Year Picture™?', desc: 'What does the company look like in 3 years?' },
                    { q: '6. What is your 1-Year Plan?', desc: 'Revenue, profit, and 3-7 goals for this year' },
                    { q: '7. What are your Quarterly Rocks?', desc: '3-7 priorities for the next 90 days' },
                    { q: '8. What are your Issues?', desc: 'The obstacles, barriers, and challenges to overcome' },
                  ].map((item, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-4">
                      <p className="font-medium">{item.q}</p>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <h3 className="font-semibold text-purple-800 mb-3">Vision/Traction Organizer™ (V/TO)</h3>
                <p className="text-purple-700 text-sm mb-4">
                  The V/TO is a two-page strategic plan that captures all 8 questions. It becomes the living document 
                  that guides your company&apos;s direction.
                </p>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                  <Download className="w-4 h-4 mr-1" />Download V/TO Template
                </Button>
              </div>
            </div>
          )}

          {/* People Component */}
          {activeSection === 'people' && (
            <div className="space-y-6">
              <div className="bg-white border rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Users className="w-6 h-6 text-blue-500" />
                  People Component
                </h2>
                <p className="text-gray-600 mb-6">
                  The People Component is about surrounding yourself with great people. In EOS, we use a simple 
                  formula: Right People + Right Seats = Great Company.
                </p>

                <div className="grid grid-cols-2 gap-6">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Right People</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      People who share your Core Values. Use the People Analyzer™ to evaluate each person 
                      against your core values on a +, +/-, or - scale.
                    </p>
                    <div className="bg-blue-50 rounded p-3 text-sm">
                      <p className="font-medium text-blue-800">The Bar</p>
                      <p className="text-blue-700">Aim for no -, at most one +/-, and the rest +</p>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Right Seats</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      The right role that leverages their unique talents. Use GWC™ to evaluate fit:
                    </p>
                    <ul className="text-sm space-y-2">
                      <li><strong>G</strong>ets it - Truly understands the role</li>
                      <li><strong>W</strong>ants it - Has genuine desire for the role</li>
                      <li><strong>C</strong>apacity - Has the skills and time to do it</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white border rounded-lg p-6">
                <h3 className="font-semibold mb-4">The Accountability Chart™</h3>
                <p className="text-gray-600 mb-4">
                  The Accountability Chart replaces the traditional org chart. It starts with three major functions: 
                  Sales/Marketing, Operations, and Finance. Each seat has 5 roles (responsibilities).
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">
                    <strong>Key Principle:</strong> Structure first, people second. Design the right structure, 
                    then fill it with the right people.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Data Component */}
          {activeSection === 'data' && (
            <div className="space-y-6">
              <div className="bg-white border rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                  Data Component
                </h2>
                <p className="text-gray-600 mb-6">
                  The Data Component cuts through subjective feelings and opinions to make decisions based on facts 
                  and numbers. A Scorecard with 5-15 weekly metrics tells you the health of your business at a glance.
                </p>

                <h3 className="font-semibold mb-3">Building Your Scorecard</h3>
                <div className="space-y-3">
                  {[
                    'Identify 5-15 weekly numbers that predict success',
                    'Each number should have one owner',
                    'Set a goal/target for each metric',
                    'Track whether you hit or miss each week',
                    'Aim for 80%+ hit rate',
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="font-semibold text-green-800 mb-3">What Makes a Good Measurable?</h3>
                <ul className="text-green-700 text-sm space-y-2">
                  <li>• <strong>Weekly:</strong> Not monthly or daily</li>
                  <li>• <strong>Leading:</strong> Predicts future results, not just reports the past</li>
                    <li>• <strong>Objective:</strong> Numbers don&apos;t lie</li>
                  <li>• <strong>Owned:</strong> One person is accountable</li>
                </ul>
              </div>
            </div>
          )}

          {/* Issues Component */}
          {activeSection === 'issues' && (
            <div className="space-y-6">
              <div className="bg-white border rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-amber-500" />
                  Issues Component
                </h2>
                <p className="text-gray-600 mb-6">
                  Every organization has issues. Great organizations solve them effectively. EOS provides a simple 
                  framework called IDS® - Identify, Discuss, Solve.
                </p>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-amber-50 rounded-lg p-4">
                    <h4 className="font-semibold text-amber-800">1. Identify</h4>
                    <p className="text-sm text-amber-700">Get to the root cause. Ask &quot;why?&quot; until you find the real issue, not just symptoms.</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-4">
                    <h4 className="font-semibold text-amber-800">2. Discuss</h4>
                    <p className="text-sm text-amber-700">Open, honest discussion. Everyone contributes. Stay focused - no tangents.</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-4">
                    <h4 className="font-semibold text-amber-800">3. Solve</h4>
                    <p className="text-sm text-amber-700">Make a decision. Create a to-do with owner and due date. Move on.</p>
                  </div>
                </div>

                <h3 className="font-semibold mb-3">Two Types of Issues Lists</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium">Short-Term (L10 Issues)</h4>
                    <p className="text-sm text-gray-600">Weekly issues solved in L10 meetings</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium">Long-Term (V/TO Issues)</h4>
                    <p className="text-sm text-gray-600">Strategic issues for quarterly/annual planning</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Process Component */}
          {activeSection === 'process' && (
            <div className="space-y-6">
              <div className="bg-white border rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Zap className="w-6 h-6 text-pink-500" />
                  Process Component
                </h2>
                <p className="text-gray-600 mb-6">
                  The Process Component is about systemizing your business. Document your core processes so 
                  everyone follows the same way of doing things (FBA - Followed By All).
                </p>

                <div className="bg-pink-50 border border-pink-200 rounded-lg p-6 mb-6">
                  <h3 className="font-semibold text-pink-800 mb-2">The 20/80 Rule</h3>
                  <p className="text-pink-700 text-sm">
                    Document processes at the 20% level to get 80% of the value. Just capture the major steps - 
                    not every tiny detail. This keeps processes simple and followable.
                  </p>
                </div>

                <h3 className="font-semibold mb-3">Core Processes to Document</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    'HR Process (hiring, firing, reviews)',
                    'Marketing Process (lead generation)',
                    'Sales Process (lead to close)',
                    'Operations Process (delivering your product/service)',
                    'Accounting Process (invoicing, collections, payables)',
                    'Customer Retention Process',
                  ].map((process, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <span className="w-6 h-6 bg-pink-500 text-white rounded-full flex items-center justify-center text-xs">{idx + 1}</span>
                      <span className="text-sm">{process}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Traction Component */}
          {activeSection === 'traction' && (
            <div className="space-y-6">
              <div className="bg-white border rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Target className="w-6 h-6 text-red-500" />
                  Traction Component
                </h2>
                <p className="text-gray-600 mb-6">
                  Traction is the ability to execute - to make your vision a reality. It combines Rocks (90-day priorities) 
                  with a regular Meeting Pulse™ to create discipline and accountability.
                </p>

                <h3 className="font-semibold mb-3">Rocks</h3>
                <p className="text-gray-600 mb-4">
                  Rocks are the 3-7 most important priorities for the quarter. They come from your vision and create 
                  focus for the entire organization.
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-red-800 mb-2">SMART Rocks</h4>
                  <p className="text-red-700 text-sm">
                    Specific, Measurable, Attainable, Realistic, Timely. Each rock has one owner 
                    and a clear definition of &quot;done.&quot;
                  </p>
                </div>

                <h3 className="font-semibold mb-3">To-Dos</h3>
                <p className="text-gray-600 mb-4">
                  To-dos are 7-day action items that emerge from L10 meetings. They&apos;re smaller than rocks 
                  but still move the company forward.
                </p>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    7 days to complete
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    One owner per to-do
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    90%+ completion rate target
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Meeting Pulse */}
          {activeSection === 'meetings' && (
            <div className="space-y-6">
              <div className="bg-white border rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-indigo-500" />
                  Meeting Pulse™
                </h2>
                <p className="text-gray-600 mb-6">
                  A consistent meeting rhythm that creates accountability and drives execution. 
                  EOS recommends three types of meetings.
                </p>

                <div className="space-y-6">
                  {/* L10 */}
                  <div className="border rounded-lg p-6">
                    <h3 className="font-semibold flex items-center gap-2 mb-3">
                      <Clock className="w-5 h-5 text-blue-500" />
                      Level 10 Meeting™ (Weekly)
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">90 minutes, same day, same time, same agenda</p>
                    <div className="grid grid-cols-7 gap-2 text-xs">
                      {[
                        { name: 'Segue', time: '5m' },
                        { name: 'Scorecard', time: '5m' },
                        { name: 'Rock Review', time: '5m' },
                        { name: 'Headlines', time: '5m' },
                        { name: 'To-Do Review', time: '5m' },
                        { name: 'IDS', time: '60m' },
                        { name: 'Conclude', time: '5m' },
                      ].map((item, idx) => (
                        <div key={idx} className="bg-blue-50 rounded p-2 text-center">
                          <p className="font-medium text-blue-800">{item.name}</p>
                          <p className="text-blue-600">{item.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quarterly */}
                  <div className="border rounded-lg p-6">
                    <h3 className="font-semibold flex items-center gap-2 mb-3">
                      <Mountain className="w-5 h-5 text-purple-500" />
                      Quarterly Planning (Every 90 Days)
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">Full-day session to review quarter and set new rocks</p>
                    <ul className="text-sm space-y-1">
                      <li>• Review V/TO and make updates</li>
                      <li>• Evaluate rock completion</li>
                      <li>• Set new quarterly rocks</li>
                      <li>• Solve strategic issues</li>
                    </ul>
                  </div>

                  {/* Annual */}
                  <div className="border rounded-lg p-6">
                    <h3 className="font-semibold flex items-center gap-2 mb-3">
                      <Star className="w-5 h-5 text-green-500" />
                      Annual Planning (Once a Year)
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">2-day offsite to plan the year ahead</p>
                    <ul className="text-sm space-y-1">
                      <li>• Review and update entire V/TO</li>
                      <li>• Set 1-year plan and goals</li>
                      <li>• Set Q1 rocks</li>
                      <li>• Team health and people issues</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* EOS Tools */}
          {activeSection === 'tools' && (
            <div className="space-y-6">
              <div className="bg-white border rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Star className="w-6 h-6 text-amber-500" />
                  EOS Tools
                </h2>
                <p className="text-gray-600 mb-6">
                  EOS provides over 20 practical tools. Here are the essential ones to master:
                </p>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: 'V/TO™', desc: 'Vision/Traction Organizer - your 2-page strategic plan' },
                    { name: 'Accountability Chart™', desc: 'Right structure with right people in right seats' },
                    { name: 'Scorecard', desc: '5-15 weekly metrics that predict success' },
                    { name: 'Rock Sheet', desc: 'Track quarterly rocks and milestones' },
                    { name: 'Issues List', desc: 'Capture and prioritize issues to solve' },
                    { name: 'L10 Agenda', desc: 'Standard agenda for weekly meetings' },
                    { name: 'People Analyzer™', desc: 'Evaluate people against core values' },
                    { name: 'GWC™', desc: 'Assess if someone Gets it, Wants it, has Capacity' },
                    { name: 'Process Sheet', desc: 'Document core processes at 20% level' },
                    { name: 'Meeting Pulse™', desc: 'Regular meeting rhythm for execution' },
                  ].map((tool, idx) => (
                    <div key={idx} className="border rounded-lg p-4 hover:bg-gray-50">
                      <h4 className="font-medium">{tool.name}</h4>
                      <p className="text-sm text-gray-500">{tool.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                <h3 className="font-semibold text-amber-800 mb-3">Recommended Reading</h3>
                <ul className="text-amber-700 text-sm space-y-2">
                  <li>• <strong>Traction</strong> by Gino Wickman - The foundational EOS book</li>
                  <li>• <strong>Get a Grip</strong> by Gino Wickman - EOS as a business fable</li>
                  <li>• <strong>Rocket Fuel</strong> by Gino Wickman - The Visionary/Integrator relationship</li>
                  <li>• <strong>How to Be a Great Boss</strong> by Gino Wickman - Managing with EOS</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EOSGuide;
