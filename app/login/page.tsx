import WorkspaceAccess from '@/components/tnp/public/WorkspaceAccess';
import { Suspense } from 'react';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="ux-access-pending">Loading workspace choices…</main>
      }
    >
      <WorkspaceAccess />
    </Suspense>
  );
}
