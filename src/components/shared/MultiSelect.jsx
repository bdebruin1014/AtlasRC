import React, { useState } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

export function MultiSelect({
  options = [], // { value, label }
  value = [], // Array of selected values
  onChange,
  placeholder = "Select options...",
  searchPlaceholder = "Search...",
  emptyMessage = "No options found.",
  maxDisplayed = 3,
  className,
}) {
  const [open, setOpen] = useState(false);

  const selectedLabels = value.map(v => 
    options.find(o => o.value === v)?.label || v
  );

  const toggleOption = (optionValue) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const removeOption = (optionValue, e) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== optionValue));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          <div className="flex flex-wrap gap-1 items-center">
            {value.length === 0 && (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            {selectedLabels.slice(0, maxDisplayed).map((label, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {label}
                <X
                  className="ml-1 h-3 w-3 cursor-pointer"
                  onClick={(e) => removeOption(value[idx], e)}
                />
              </Badge>
            ))}
            {value.length > maxDisplayed && (
              <Badge variant="secondary" className="text-xs">
                +{value.length - maxDisplayed} more
              </Badge>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {options.map((option) => (
              <CommandItem
                key={option.value}
                onSelect={() => toggleOption(option.value)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value.includes(option.value) ? "opacity-100" : "opacity-0"
                  )}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default MultiSelect;
