import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, User, Search, Building, Phone, Mail } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

export function ContactSelector({
  value,
  onChange,
  required = false,
  placeholder = "Select contact...",
  showCreateButton = true,
  filterByType = null, // 'individual', 'company', or null for all
  className = "",
}) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['contacts', filterByType],
    queryFn: async () => {
      let query = supabase
        .from('contacts')
        .select('*')
        .order('last_name, first_name');
      
      if (filterByType) {
        query = query.eq('contact_type', filterByType);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const filteredContacts = contacts.filter(contact => {
    if (!searchQuery) return true;
    const fullName = `${contact.first_name} ${contact.last_name}`.toLowerCase();
    const company = (contact.company || '').toLowerCase();
    return fullName.includes(searchQuery.toLowerCase()) || 
           company.includes(searchQuery.toLowerCase());
  });

  const createContactMutation = useMutation({
    mutationFn: async (newContact) => {
      const { data, error } = await supabase
        .from('contacts')
        .insert([newContact])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      onChange(data.id);
      setIsCreateModalOpen(false);
      toast({
        title: "Contact Created",
        description: `${data.first_name} ${data.last_name} has been created.`,
      });
    },
  });

  const selectedContact = contacts.find(c => c.id === value);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex gap-2">
        <Select value={value || ''} onValueChange={onChange}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder={isLoading ? "Loading..." : placeholder}>
              {selectedContact && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {selectedContact.first_name} {selectedContact.last_name}
                  </span>
                  {selectedContact.company && (
                    <span className="text-xs text-muted-foreground">
                      ({selectedContact.company})
                    </span>
                  )}
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            {filteredContacts.map((contact) => (
              <SelectItem key={contact.id} value={contact.id}>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{contact.first_name} {contact.last_name}</span>
                  {contact.company && (
                    <span className="text-xs text-muted-foreground">
                      - {contact.company}
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
            {filteredContacts.length === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No contacts found
              </div>
            )}
          </SelectContent>
        </Select>
        
        {showCreateButton && (
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" title="Create New Contact">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <QuickContactCreateForm
                onSubmit={(data) => createContactMutation.mutate(data)}
                onCancel={() => setIsCreateModalOpen(false)}
                isLoading={createContactMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}

function QuickContactCreateForm({ onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    company: '',
    title: '',
    phone: '',
    email: '',
    contact_type: 'individual',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Create New Contact</DialogTitle>
      </DialogHeader>
      
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="first_name">First Name *</Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) => updateField('first_name', e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="last_name">Last Name *</Label>
            <Input
              id="last_name"
              value={formData.last_name}
              onChange={(e) => updateField('last_name', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            value={formData.company}
            onChange={(e) => updateField('company', e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => updateField('phone', e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || !formData.first_name || !formData.last_name}>
          {isLoading ? 'Creating...' : 'Create Contact'}
        </Button>
      </div>
    </form>
  );
}

export default ContactSelector;
