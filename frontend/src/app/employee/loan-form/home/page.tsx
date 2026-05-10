'use client';

import HomeLoanForm from './HomeLoanForm';
import { Suspense } from 'react';

export default function HomeLoanPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center animate-pulse">Loading Application...</div>}>
      <HomeLoanForm />
    </Suspense>
  );
}
