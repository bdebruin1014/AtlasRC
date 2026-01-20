import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { 
  User, Building, Users, Bell, Plug, Palette, CreditCard, 
  Save, Lock, Monitor, Mail, Settings
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import EditableField from '@/components/EditableField';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const TABS = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'company', label: 'Company Settings', icon: Building },
    { id: 'team', label: 'Team & Permissions', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'integrations', label: 'Integrations', icon: Plug },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'billing', label: 'Billing & Plans', icon: CreditCard },
  ];

  return (
    <>
      <Helmet>
        <title>Settings | AtlasDev</title>
      </Helmet>

      <div className="flex h-full bg-[#EDF2F7] overflow-hidden">
         {/* Sidebar */}
         <div className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
            <div className="p-6 border-b border-gray-200">
               <h2 className="text-xl font-bold text-gray-900">Settings</h2>
            </div>
            <div className="p-4 space-y-1 overflow-y-auto">
               {TABS.map(tab => (
                  <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id)}
                     className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                        activeTab === tab.id 
                           ? "bg-emerald-50 text-emerald-700" 
                           : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                     )}
                  >
                     <tab.icon className="w-4 h-4" />
                     {tab.label}
                  </button>
               ))}
            </div>
         </div>

         {/* Content */}
         <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-3xl mx-auto">
               <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-8 py-6 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                     <h2 className="text-xl font-bold text-gray-900">{TABS.find(t => t.id === activeTab)?.label}</h2>
                     <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Save className="w-4 h-4 mr-2" /> Save Changes
                     </Button>
                  </div>

                  <div className="p-8">
                     {activeTab === 'profile' && (
                        <div className="space-y-8">
                           <div className="flex items-center gap-6">
                              <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-2xl font-bold text-emerald-600 border-4 border-white shadow-sm">
                                 AJ
                              </div>
                              <div>
                                 <Button variant="outline" size="sm" className="mr-2">Change Avatar</Button>
                                 <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">Remove</Button>
                              </div>
                           </div>
                           
                           <div className="grid grid-cols-2 gap-6">
                              <EditableField label="First Name" defaultValue="Alex" />
                              <EditableField label="Last Name" defaultValue="Johnson" />
                              <EditableField label="Email Address" defaultValue="alex@atlasdev.com" />
                              <EditableField label="Phone Number" defaultValue="(555) 123-4567" />
                           </div>

                           <div className="pt-6 border-t border-gray-100">
                              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                 <Lock className="w-4 h-4 text-gray-400" /> Security
                              </h3>
                              <Button variant="outline" className="w-full sm:w-auto">Change Password</Button>
                           </div>
                        </div>
                     )}

                     {activeTab === 'notifications' && (
                        <div className="space-y-6">
                           <div className="space-y-4">
                              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Email Notifications</h3>
                              {['Daily Digest', 'New Project Assignments', 'Task Due Reminders', 'Mentioned in Comments'].map((item, i) => (
                                 <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50">
                                    <div className="flex items-center gap-3">
                                       <Mail className="w-4 h-4 text-gray-400" />
                                       <span className="text-sm text-gray-700">{item}</span>
                                    </div>
                                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}

                     {['company', 'team', 'integrations', 'appearance', 'billing'].includes(activeTab) && (
                        <div className="text-center py-12 text-gray-400">
                           <Settings className="w-12 h-12 mx-auto mb-4 opacity-20" />
                           <p className="font-medium">Settings for {activeTab}</p>
                           <p className="text-sm text-gray-500 mt-1">Configuration interface coming soon</p>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         </div>
      </div>
    </>
  );
};

export default SettingsPage;