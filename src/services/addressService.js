// src/services/addressService.js
// Address Autocomplete and Property Info Service

export async function getAddressSuggestions(input) {
  if (!input || input.length < 3) return [];

  // No real address API is configured yet.
  // When a provider (e.g. Google Places) is integrated, replace this stub.
  return [];
}

export async function getAddressDetails(placeId) {
  // No real address API is configured yet.
  // When a provider (e.g. Google Places) is integrated, replace this stub.
  return null;
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
