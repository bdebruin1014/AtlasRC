import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const US_STATES = [
  { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' }, { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' }, { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' }, { value: 'DE', label: 'Delaware' }, { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' }, { value: 'HI', label: 'Hawaii' }, { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' }, { value: 'IN', label: 'Indiana' }, { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' }, { value: 'KY', label: 'Kentucky' }, { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' }, { value: 'MD', label: 'Maryland' }, { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' }, { value: 'MN', label: 'Minnesota' }, { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' }, { value: 'MT', label: 'Montana' }, { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' }, { value: 'NH', label: 'New Hampshire' }, { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' }, { value: 'NY', label: 'New York' }, { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' }, { value: 'OH', label: 'Ohio' }, { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' }, { value: 'PA', label: 'Pennsylvania' }, { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' }, { value: 'SD', label: 'South Dakota' }, { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' }, { value: 'UT', label: 'Utah' }, { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' }, { value: 'WA', label: 'Washington' }, { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' }, { value: 'WY', label: 'Wyoming' }
];

export interface AddressValue {
  street1: string;
  street2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface AddressInputProps {
  value: AddressValue;
  onChange: (address: AddressValue) => void;
  errors?: Partial<Record<keyof AddressValue, string>>;
  disabled?: boolean;
  className?: string;
  showCountry?: boolean;
  required?: boolean;
}

interface Suggestion {
  id: string;
  description: string;
  placeId: string;
}

export function AddressInput({
  value,
  onChange,
  errors = {},
  disabled = false,
  className,
  showCountry = false,
  required = false
}: AddressInputProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Simulate address autocomplete (in production, use Google Places API)
  const searchAddresses = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Mock suggestions based on query
    const mockSuggestions: Suggestion[] = [
      { id: '1', description: `${query}, New York, NY 10001`, placeId: 'place1' },
      { id: '2', description: `${query}, Los Angeles, CA 90001`, placeId: 'place2' },
      { id: '3', description: `${query}, Chicago, IL 60601`, placeId: 'place3' }
    ];

    setSuggestions(mockSuggestions);
    setIsSearching(false);
    setShowSuggestions(true);
  };

  const handleStreetChange = (newStreet: string) => {
    onChange({ ...value, street1: newStreet });
    searchAddresses(newStreet);
  };

  const handleSuggestionSelect = (suggestion: Suggestion) => {
    // Parse the suggestion (in production, use place details API)
    const parts = suggestion.description.split(', ');
    if (parts.length >= 3) {
      const stateZip = parts[parts.length - 1].split(' ');
      onChange({
        ...value,
        street1: parts[0],
        city: parts[parts.length - 2],
        state: stateZip[0] || '',
        zipCode: stateZip[1] || ''
      });
    }
    setShowSuggestions(false);
    setSuggestions([]);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Street Address 1 with Autocomplete */}
      <div className="space-y-2 relative">
        <Label htmlFor="street1">
          Street Address {required && '*'}
        </Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            id="street1"
            value={value.street1}
            onChange={(e) => handleStreetChange(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Start typing an address..."
            disabled={disabled}
            className={cn('pl-10', errors.street1 && 'border-destructive')}
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
        {errors.street1 && (
          <p className="text-sm text-destructive">{errors.street1}</p>
        )}

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                type="button"
                className="w-full px-4 py-2 text-left text-sm hover:bg-muted focus:bg-muted focus:outline-none"
                onClick={() => handleSuggestionSelect(suggestion)}
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span>{suggestion.description}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Street Address 2 */}
      <div className="space-y-2">
        <Label htmlFor="street2">Apartment, Suite, etc.</Label>
        <Input
          id="street2"
          value={value.street2}
          onChange={(e) => onChange({ ...value, street2: e.target.value })}
          placeholder="Apt, Suite, Building, etc."
          disabled={disabled}
        />
      </div>

      {/* City, State, ZIP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">
            City {required && '*'}
          </Label>
          <Input
            id="city"
            value={value.city}
            onChange={(e) => onChange({ ...value, city: e.target.value })}
            placeholder="City"
            disabled={disabled}
            className={cn(errors.city && 'border-destructive')}
          />
          {errors.city && (
            <p className="text-sm text-destructive">{errors.city}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">
            State {required && '*'}
          </Label>
          <Select
            value={value.state}
            onValueChange={(newState) => onChange({ ...value, state: newState })}
            disabled={disabled}
          >
            <SelectTrigger className={cn(errors.state && 'border-destructive')}>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {US_STATES.map((state) => (
                <SelectItem key={state.value} value={state.value}>
                  {state.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.state && (
            <p className="text-sm text-destructive">{errors.state}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="zipCode">
            ZIP Code {required && '*'}
          </Label>
          <Input
            id="zipCode"
            value={value.zipCode}
            onChange={(e) => onChange({ ...value, zipCode: e.target.value })}
            placeholder="12345"
            maxLength={10}
            disabled={disabled}
            className={cn(errors.zipCode && 'border-destructive')}
          />
          {errors.zipCode && (
            <p className="text-sm text-destructive">{errors.zipCode}</p>
          )}
        </div>
      </div>

      {/* Country */}
      {showCountry && (
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Select
            value={value.country || 'USA'}
            onValueChange={(country) => onChange({ ...value, country })}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USA">United States</SelectItem>
              <SelectItem value="CAN">Canada</SelectItem>
              <SelectItem value="MEX">Mexico</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

export default AddressInput;
