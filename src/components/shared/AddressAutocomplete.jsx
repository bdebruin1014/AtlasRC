import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin } from 'lucide-react';

// Note: This uses Google Places API. You'll need to add the script to index.html:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places"></script>

export function AddressAutocomplete({
  value,
  onChange,
  onAddressSelect,
  label = "Address",
  required = false,
  placeholder = "Start typing an address...",
  className = "",
}) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    if (!window.google || !inputRef.current) return;

    autocompleteRef.current = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        types: ['address'],
        componentRestrictions: { country: 'us' },
      }
    );

    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current.getPlace();
      
      if (!place.address_components) return;

      const addressData = {
        full_address: place.formatted_address,
        street_address: '',
        city: '',
        state: '',
        zip: '',
        county: '',
        lat: place.geometry?.location?.lat(),
        lng: place.geometry?.location?.lng(),
      };

      place.address_components.forEach((component) => {
        const type = component.types[0];
        switch (type) {
          case 'street_number':
            addressData.street_address = component.long_name + ' ';
            break;
          case 'route':
            addressData.street_address += component.long_name;
            break;
          case 'locality':
            addressData.city = component.long_name;
            break;
          case 'administrative_area_level_1':
            addressData.state = component.short_name;
            break;
          case 'postal_code':
            addressData.zip = component.long_name;
            break;
          case 'administrative_area_level_2':
            addressData.county = component.long_name.replace(' County', '');
            break;
        }
      });

      onChange(addressData.full_address);
      if (onAddressSelect) {
        onAddressSelect(addressData);
      }
    });

    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, []);

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label className={required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}>
          {label}
        </Label>
      )}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pl-10"
        />
      </div>
    </div>
  );
}

// Fallback version without Google API
export function AddressFields({
  values = {},
  onChange,
  required = false,
}) {
  const handleChange = (field, value) => {
    onChange({ ...values, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label className={required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}>
          Street Address
        </Label>
        <Input
          value={values.street_address || ''}
          onChange={(e) => handleChange('street_address', e.target.value)}
          placeholder="123 Main Street"
          required={required}
        />
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="col-span-2 md:col-span-1">
          <Label className={required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}>
            City
          </Label>
          <Input
            value={values.city || ''}
            onChange={(e) => handleChange('city', e.target.value)}
            placeholder="City"
            required={required}
          />
        </div>
        
        <div>
          <Label className={required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}>
            State
          </Label>
          <Input
            value={values.state || ''}
            onChange={(e) => handleChange('state', e.target.value)}
            placeholder="TX"
            maxLength={2}
            required={required}
          />
        </div>
        
        <div>
          <Label className={required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}>
            ZIP
          </Label>
          <Input
            value={values.zip || ''}
            onChange={(e) => handleChange('zip', e.target.value)}
            placeholder="75001"
            required={required}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label>County</Label>
        <Input
          value={values.county || ''}
          onChange={(e) => handleChange('county', e.target.value)}
          placeholder="County"
        />
      </div>
    </div>
  );
}

export default AddressAutocomplete;
