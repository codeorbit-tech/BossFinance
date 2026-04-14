import { Suspense } from 'react';
import VehicleLoanForm from './VehicleLoanForm';

export default function VehicleLoanPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center animate-pulse text-on-surface-variant font-bold">Loading form...</div>}>
      <VehicleLoanForm />
    </Suspense>
  );
}
