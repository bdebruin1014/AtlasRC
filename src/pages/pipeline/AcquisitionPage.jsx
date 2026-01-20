// pages/pipeline/AcquisitionPage.jsx
// Wrapper page for the Acquisition Pipeline Dashboard

import { Suspense, lazy } from 'react';
import LoadingState from '@/components/LoadingState';

const PipelineDashboard = lazy(() => import('@/components/pipeline/PipelineDashboard'));

export default function AcquisitionPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <PipelineDashboard />
    </Suspense>
  );
}
