import React from 'react';
import { Button } from '@/components/ui/button';

export default function OpportunityContacts({ opportunity }) {
  const contacts = [
    {
      name: opportunity.broker,
      role: 'Listing Broker',
      company: opportunity.brokerCompany,
      phone: opportunity.brokerPhone,
      email: opportunity.brokerEmail,
    },
    {
      name: 'James Wilson Estate',
      role: 'Seller',
      company: '—',
      phone: '—',
      email: '—',
    },
    {
      name: 'Robert Smith',
      role: 'Seller Attorney',
      company: 'Smith & Associates',
      phone: '(864) 555-0200',
      email: 'rsmith@smithlaw.com',
    },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Contacts</h2>
        <Button className="bg-[#047857] hover:bg-[#065f46]">Add Contact</Button>
      </div>
      <div className="bg-white border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium">Role</th>
              <th className="text-left px-4 py-3 font-medium">Company</th>
              <th className="text-left px-4 py-3 font-medium">Phone</th>
              <th className="text-left px-4 py-3 font-medium">Email</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {contacts.map((contact, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-[#047857] font-medium">{contact.name}</td>
                <td className="px-4 py-3">{contact.role}</td>
                <td className="px-4 py-3">{contact.company}</td>
                <td className="px-4 py-3">{contact.phone}</td>
                <td className="px-4 py-3">{contact.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
