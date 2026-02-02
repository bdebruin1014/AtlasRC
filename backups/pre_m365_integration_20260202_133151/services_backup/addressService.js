// src/services/addressService.js
// Address Autocomplete and Property Info Service

import { isDemoMode } from '@/lib/supabase';

const mockSuggestions = [
  { place_id: '1', description: '123 Main Street, Greenville, SC 29601', structured: { street: '123 Main Street', city: 'Greenville', state: 'SC', zip: '29601', county: 'Greenville' } },
  { place_id: '2', description: '456 Oak Drive, Simpsonville, SC 29681', structured: { street: '456 Oak Drive', city: 'Simpsonville', state: 'SC', zip: '29681', county: 'Greenville' } },
  { place_id: '3', description: '789 Pine Road, Greer, SC 29650', structured: { street: '789 Pine Road', city: 'Greer', state: 'SC', zip: '29650', county: 'Greenville' } },
  { place_id: '4', description: '321 Elm Street, Travelers Rest, SC 29690', structured: { street: '321 Elm Street', city: 'Travelers Rest', state: 'SC', zip: '29690', county: 'Greenville' } },
  { place_id: '5', description: '654 Maple Avenue, Mauldin, SC 29662', structured: { street: '654 Maple Avenue', city: 'Mauldin', state: 'SC', zip: '29662', county: 'Greenville' } },
];

export async function getAddressSuggestions(input) {
  if (!input || input.length < 3) return [];

  if (isDemoMode) {
    const term = input.toLowerCase();
    return mockSuggestions.filter(s => s.description.toLowerCase().includes(term));
  }

  // In production, this would call Google Places API or similar
  // For now, return mock data even in non-demo mode
  const term = input.toLowerCase();
  return mockSuggestions.filter(s => s.description.toLowerCase().includes(term));
}

export async function getAddressDetails(placeId) {
  if (isDemoMode) {
    const suggestion = mockSuggestions.find(s => s.place_id === placeId);
    return suggestion?.structured || null;
  }

  // In production, call Google Places Details API
  const suggestion = mockSuggestions.find(s => s.place_id === placeId);
  return suggestion?.structured || null;
}

export function calculateLotArea(dimensions) {
  if (!dimensions) return null;

  const { frontage, depth, leftSide, rightSide, shape } = dimensions;

  if (shape === 'rectangle' && frontage && depth) {
    const sqft = parseFloat(frontage) * parseFloat(depth);
    return { sqft, acres: sqft / 43560 };
  }

  if (shape === 'trapezoid' && frontage && depth && leftSide && rightSide) {
    // Average of parallel sides times height (approximation)
    const avgWidth = (parseFloat(frontage) + parseFloat(depth)) / 2;
    const height = parseFloat(leftSide);
    const sqft = avgWidth * height;
    return { sqft, acres: sqft / 43560 };
  }

  if (shape === 'irregular' && frontage && depth) {
    // Simple approximation for irregular lots
    const sqft = parseFloat(frontage) * parseFloat(depth) * 0.9;
    return { sqft, acres: sqft / 43560 };
  }

  return null;
}

export function formatArea(sqft) {
  if (!sqft) return '';
  if (sqft >= 43560) {
    return `${(sqft / 43560).toFixed(2)} acres (${sqft.toLocaleString()} sq ft)`;
  }
  return `${sqft.toLocaleString()} sq ft`;
}
