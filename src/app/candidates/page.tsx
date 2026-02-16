'use client';

import CandidatesTable from '@/components/candidates/CandidatesTable';
import PasswordProtection from '@/components/auth/PasswordProtection';

export default function CandidatesPage() {
  const requiredPassword = process.env.NEXT_PUBLIC_CANDIDATES_PAGE_PASSWORD || 'sandevex123';
  
  return (
    <PasswordProtection requiredPassword={requiredPassword}>
      <div className="p-2">
        <CandidatesTable />
      </div>
    </PasswordProtection>
  );
}
