import React from 'react';
import {
  FileQuestion,
  FolderOpen,
  Search,
  Users,
  Building2,
  DollarSign,
  FileText,
  Inbox,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type EmptyStateType =
  | 'default'
  | 'search'
  | 'filter'
  | 'projects'
  | 'opportunities'
  | 'transactions'
  | 'contacts'
  | 'entities'
  | 'documents'
  | 'inbox';

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  icon?: React.ElementType;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const TYPE_CONFIG: Record<EmptyStateType, {
  icon: React.ElementType;
  title: string;
  description: string;
}> = {
  default: {
    icon: FolderOpen,
    title: 'No data found',
    description: 'There is no data to display at this time.'
  },
  search: {
    icon: Search,
    title: 'No results found',
    description: 'Try adjusting your search terms or filters to find what you\'re looking for.'
  },
  filter: {
    icon: FileQuestion,
    title: 'No matching results',
    description: 'No items match your current filters. Try adjusting your selection.'
  },
  projects: {
    icon: Building2,
    title: 'No projects yet',
    description: 'Get started by creating your first project to track your real estate developments.'
  },
  opportunities: {
    icon: FolderOpen,
    title: 'No opportunities yet',
    description: 'Start building your pipeline by adding potential deals and opportunities.'
  },
  transactions: {
    icon: DollarSign,
    title: 'No transactions yet',
    description: 'Financial transactions will appear here once you start recording them.'
  },
  contacts: {
    icon: Users,
    title: 'No contacts yet',
    description: 'Add contacts to keep track of your business relationships and network.'
  },
  entities: {
    icon: Building2,
    title: 'No entities yet',
    description: 'Create entities to manage your legal structures and organizations.'
  },
  documents: {
    icon: FileText,
    title: 'No documents yet',
    description: 'Upload documents to keep all your files organized in one place.'
  },
  inbox: {
    icon: Inbox,
    title: 'All caught up!',
    description: 'You have no pending notifications or messages.'
  }
};

export function EmptyState({
  type = 'default',
  title,
  description,
  icon,
  action,
  secondaryAction,
  className
}: EmptyStateProps) {
  const config = TYPE_CONFIG[type];
  const IconComponent = icon || config.icon;
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      <div className="rounded-full bg-muted p-4 mb-4">
        <IconComponent className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{displayTitle}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {displayDescription}
      </p>
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3">
          {action && (
            <Button onClick={action.onClick}>
              <Plus className="mr-2 h-4 w-4" />
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default EmptyState;
