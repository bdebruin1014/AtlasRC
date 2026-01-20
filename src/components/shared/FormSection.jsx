import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FormSection({
  title,
  description,
  children,
  defaultOpen = true,
  collapsible = true,
  className,
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn("border rounded-lg", className)}>
      <div
        className={cn(
          "flex items-center justify-between p-4 bg-muted/50",
          collapsible && "cursor-pointer hover:bg-muted"
        )}
        onClick={() => collapsible && setIsOpen(!isOpen)}
      >
        <div>
          <h3 className="font-semibold">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {collapsible && (
          <div className="text-muted-foreground">
            {isOpen ? (
              <ChevronDown className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </div>
        )}
      </div>
      {isOpen && (
        <div className="p-4 border-t">
          {children}
        </div>
      )}
    </div>
  );
}

export default FormSection;
