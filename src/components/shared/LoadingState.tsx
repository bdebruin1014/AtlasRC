import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

type LoadingVariant = 'spinner' | 'skeleton' | 'pulse' | 'dots';
type LoadingSize = 'sm' | 'md' | 'lg' | 'xl';

interface LoadingStateProps {
  variant?: LoadingVariant;
  size?: LoadingSize;
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

interface SkeletonCardProps {
  lines?: number;
  showAvatar?: boolean;
  showImage?: boolean;
  className?: string;
}

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

const SIZE_CLASSES: Record<LoadingSize, { spinner: string; text: string }> = {
  sm: { spinner: 'h-4 w-4', text: 'text-xs' },
  md: { spinner: 'h-6 w-6', text: 'text-sm' },
  lg: { spinner: 'h-8 w-8', text: 'text-base' },
  xl: { spinner: 'h-12 w-12', text: 'text-lg' }
};

export function LoadingState({
  variant = 'spinner',
  size = 'md',
  text,
  fullScreen = false,
  className
}: LoadingStateProps) {
  const sizeClasses = SIZE_CLASSES[size];

  const content = () => {
    switch (variant) {
      case 'spinner':
        return (
          <div className="flex flex-col items-center justify-center gap-3">
            <Loader2 className={cn('animate-spin text-muted-foreground', sizeClasses.spinner)} />
            {text && <p className={cn('text-muted-foreground', sizeClasses.text)}>{text}</p>}
          </div>
        );

      case 'dots':
        return (
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={cn(
                    'rounded-full bg-muted-foreground animate-bounce',
                    size === 'sm' && 'h-1.5 w-1.5',
                    size === 'md' && 'h-2 w-2',
                    size === 'lg' && 'h-3 w-3',
                    size === 'xl' && 'h-4 w-4'
                  )}
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
            {text && <p className={cn('text-muted-foreground', sizeClasses.text)}>{text}</p>}
          </div>
        );

      case 'pulse':
        return (
          <div className="flex flex-col items-center justify-center gap-3">
            <div
              className={cn(
                'rounded-full bg-primary/30 animate-pulse',
                size === 'sm' && 'h-8 w-8',
                size === 'md' && 'h-12 w-12',
                size === 'lg' && 'h-16 w-16',
                size === 'xl' && 'h-24 w-24'
              )}
            />
            {text && <p className={cn('text-muted-foreground', sizeClasses.text)}>{text}</p>}
          </div>
        );

      case 'skeleton':
        return (
          <div className="space-y-4 w-full max-w-sm">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        );

      default:
        return null;
    }
  };

  if (fullScreen) {
    return (
      <div className={cn(
        'fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50',
        className
      )}>
        {content()}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-center p-8', className)}>
      {content()}
    </div>
  );
}

export function SkeletonCard({
  lines = 3,
  showAvatar = false,
  showImage = false,
  className
}: SkeletonCardProps) {
  return (
    <div className={cn('p-4 border rounded-lg space-y-4', className)}>
      {showImage && <Skeleton className="h-40 w-full rounded-md" />}
      <div className="flex items-center gap-4">
        {showAvatar && <Skeleton className="h-10 w-10 rounded-full" />}
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-3"
            style={{ width: `${100 - (i * 15)}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function SkeletonTable({
  rows = 5,
  columns = 4,
  className
}: SkeletonTableProps) {
  return (
    <div className={cn('border rounded-lg overflow-hidden', className)}>
      {/* Header */}
      <div className="flex gap-4 p-4 bg-muted/50 border-b">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 p-4 border-b last:border-0">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              className="h-4 flex-1"
              style={{ opacity: 1 - (rowIndex * 0.1) }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonList({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3 border rounded-lg">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}

export default LoadingState;
