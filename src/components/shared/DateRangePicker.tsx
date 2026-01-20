import React, { useState } from 'react';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

const PRESET_RANGES = [
  { label: 'Today', getValue: () => ({ from: new Date(), to: new Date() }) },
  {
    label: 'Yesterday',
    getValue: () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return { from: yesterday, to: yesterday };
    }
  },
  {
    label: 'Last 7 days',
    getValue: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 7);
      return { from: start, to: end };
    }
  },
  {
    label: 'Last 30 days',
    getValue: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);
      return { from: start, to: end };
    }
  },
  {
    label: 'This month',
    getValue: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { from: start, to: end };
    }
  },
  {
    label: 'Last month',
    getValue: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from: start, to: end };
    }
  },
  {
    label: 'This quarter',
    getValue: () => {
      const now = new Date();
      const quarter = Math.floor(now.getMonth() / 3);
      const start = new Date(now.getFullYear(), quarter * 3, 1);
      const end = new Date(now.getFullYear(), quarter * 3 + 3, 0);
      return { from: start, to: end };
    }
  },
  {
    label: 'This year',
    getValue: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 1);
      const end = new Date(now.getFullYear(), 11, 31);
      return { from: start, to: end };
    }
  }
];

export function DateRangePicker({
  value,
  onChange,
  className,
  placeholder = 'Select date range',
  disabled = false
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [month, setMonth] = useState(new Date());

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handlePresetClick = (preset: typeof PRESET_RANGES[0]) => {
    const range = preset.getValue();
    onChange?.(range);
  };

  const handleSelect = (range: DateRange | undefined) => {
    if (range) {
      onChange?.(range);
    }
  };

  const handleClear = () => {
    onChange?.({ from: undefined, to: undefined });
  };

  const displayValue = () => {
    if (value?.from && value?.to) {
      if (value.from.toDateString() === value.to.toDateString()) {
        return formatDate(value.from);
      }
      return `${formatDate(value.from)} - ${formatDate(value.to)}`;
    }
    if (value?.from) {
      return `${formatDate(value.from)} - ...`;
    }
    return placeholder;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'justify-start text-left font-normal min-w-[240px]',
            !value?.from && 'text-muted-foreground',
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayValue()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          {/* Presets */}
          <div className="border-r p-2 w-40">
            <p className="text-xs font-medium text-muted-foreground px-2 py-1">
              Quick Select
            </p>
            <div className="space-y-1">
              {PRESET_RANGES.map((preset) => (
                <Button
                  key={preset.label}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-sm"
                  onClick={() => handlePresetClick(preset)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            {(value?.from || value?.to) && (
              <>
                <div className="border-t my-2" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-sm text-muted-foreground"
                  onClick={handleClear}
                >
                  Clear selection
                </Button>
              </>
            )}
          </div>

          {/* Calendar */}
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => {
                  const newMonth = new Date(month);
                  newMonth.setMonth(newMonth.getMonth() - 1);
                  setMonth(newMonth);
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                {month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => {
                  const newMonth = new Date(month);
                  newMonth.setMonth(newMonth.getMonth() + 1);
                  setMonth(newMonth);
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Calendar
              mode="range"
              selected={{ from: value?.from, to: value?.to }}
              onSelect={handleSelect as any}
              month={month}
              onMonthChange={setMonth}
              numberOfMonths={2}
              className="rounded-md border-0"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default DateRangePicker;
