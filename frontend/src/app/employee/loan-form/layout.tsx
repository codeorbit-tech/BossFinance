'use client';

import LoanCalculatorFAB from '@/components/LoanCalculatorFAB';

export default function LoanFormLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <LoanCalculatorFAB />
    </>
  );
}
