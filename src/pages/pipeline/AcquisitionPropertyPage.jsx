// pages/pipeline/AcquisitionPropertyPage.jsx
// Wrapper page for property detail view

import { Suspense, lazy } from 'react';
import LoadingState from '@/components/LoadingState';

const PropertyDetail = lazy(() => import('@/components/pipeline/PropertyDetail'));

export default function AcquisitionPropertyPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <PropertyDetail />
    </Suspense>
  );
}
