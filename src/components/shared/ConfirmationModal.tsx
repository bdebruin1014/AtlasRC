import React from 'react';
import {
  AlertTriangle,
  Trash2,
  Save,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

type ConfirmationType = 'delete' | 'save' | 'submit' | 'warning' | 'info' | 'success' | 'error';

interface ConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  type?: ConfirmationType;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  destructive?: boolean;
}

const TYPE_CONFIG: Record<ConfirmationType, {
  icon: React.ElementType;
  title: string;
  description: string;
  confirmLabel: string;
  iconColor: string;
  iconBg: string;
}> = {
  delete: {
    icon: Trash2,
    title: 'Delete Item',
    description: 'Are you sure you want to delete this item? This action cannot be undone.',
    confirmLabel: 'Delete',
    iconColor: 'text-red-600',
    iconBg: 'bg-red-100'
  },
  save: {
    icon: Save,
    title: 'Save Changes',
    description: 'Are you sure you want to save these changes?',
    confirmLabel: 'Save',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100'
  },
  submit: {
    icon: Send,
    title: 'Submit',
    description: 'Are you sure you want to submit? This action may not be reversible.',
    confirmLabel: 'Submit',
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100'
  },
  warning: {
    icon: AlertTriangle,
    title: 'Warning',
    description: 'Please review carefully before proceeding.',
    confirmLabel: 'Continue',
    iconColor: 'text-yellow-600',
    iconBg: 'bg-yellow-100'
  },
  info: {
    icon: AlertCircle,
    title: 'Confirm Action',
    description: 'Are you sure you want to proceed with this action?',
    confirmLabel: 'Confirm',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100'
  },
  success: {
    icon: CheckCircle,
    title: 'Success',
    description: 'The operation completed successfully.',
    confirmLabel: 'OK',
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100'
  },
  error: {
    icon: XCircle,
    title: 'Error',
    description: 'An error occurred. Please try again.',
    confirmLabel: 'OK',
    iconColor: 'text-red-600',
    iconBg: 'bg-red-100'
  }
};

export function ConfirmationModal({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  type = 'info',
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  isLoading = false,
  destructive
}: ConfirmationModalProps) {
  const config = TYPE_CONFIG[type];
  const IconComponent = config.icon;

  const displayTitle = title || config.title;
  const displayDescription = description || config.description;
  const displayConfirmLabel = confirmLabel || config.confirmLabel;

  const isDestructive = destructive !== undefined ? destructive : type === 'delete';
  const showCancel = type !== 'success' && type !== 'error';

  const handleConfirm = async () => {
    await onConfirm();
    if (!isLoading) {
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <div className="flex items-start gap-4">
            <div className={cn(
              'rounded-full p-2',
              config.iconBg
            )}>
              <IconComponent className={cn('h-5 w-5', config.iconColor)} />
            </div>
            <div className="flex-1">
              <AlertDialogTitle>{displayTitle}</AlertDialogTitle>
              <AlertDialogDescription className="mt-2">
                {displayDescription}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {showCancel && (
            <AlertDialogCancel onClick={handleCancel} disabled={isLoading}>
              {cancelLabel}
            </AlertDialogCancel>
          )}
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn(
              isDestructive && 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              displayConfirmLabel
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Convenience hooks for common confirmation scenarios
export function useDeleteConfirmation() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [itemToDelete, setItemToDelete] = React.useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const openDeleteConfirmation = (item: { id: string; name: string }) => {
    setItemToDelete(item);
    setIsOpen(true);
  };

  const closeDeleteConfirmation = () => {
    setIsOpen(false);
    setItemToDelete(null);
  };

  return {
    isOpen,
    setIsOpen,
    itemToDelete,
    isDeleting,
    setIsDeleting,
    openDeleteConfirmation,
    closeDeleteConfirmation
  };
}

export default ConfirmationModal;
