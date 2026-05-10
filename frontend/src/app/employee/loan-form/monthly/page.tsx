import { Suspense } from 'react';
import MonthlyLoanForm from './MonthlyLoanForm';

export default function MonthlyLoanPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><span className="material-symbols-outlined animate-spin text-accent text-4xl">progress_activity</span></div>}>
      <MonthlyLoanForm />
    </Suspense>
  );
}
