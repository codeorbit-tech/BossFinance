'use client';

import { Suspense } from 'react';
import SimpleLoanForm from './SimpleLoanForm';

export default function SimpleLoanFormPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading form...</div>}>
      <SimpleLoanForm />
    </Suspense>
  );
}
