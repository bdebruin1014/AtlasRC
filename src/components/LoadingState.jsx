import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const LoadingState = ({ 
  type = 'spinner', 
  message = 'Loading...', 
  className,
  size = 'default' 
}) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    default: 'h-8 w-8',
    large: 'h-12 w-12',
  };

  if (type === 'skeleton') {
    return (
      <div className={cn("animate-pulse space-y-4 p-6", className)}>
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-4/6" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="h-24 bg-gray-200 rounded" />
          <div className="h-24 bg-gray-200 rounded" />
          <div className="h-24 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className={cn("animate-pulse p-4", className)}>
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 bg-gray-200 rounded-full" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className={cn("animate-pulse", className)}>
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-100 p-4">
            <div className="flex gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-4 bg-gray-200 rounded flex-1" />
              ))}
            </div>
          </div>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="p-4 border-t">
              <div className="flex gap-4">
                {[1, 2, 3, 4].map(j => (
                  <div key={j} className="h-4 bg-gray-200 rounded flex-1" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default spinner
  return (
    <div className={cn(
      "flex flex-col items-center justify-center min-h-[200px] p-8",
      className
    )}>
      <Loader2 className={cn("animate-spin text-emerald-600", sizeClasses[size])} />
      {message && (
        <p className="mt-4 text-sm text-gray-500">{message}</p>
      )}
    </div>
  );
};

export default LoadingState;
