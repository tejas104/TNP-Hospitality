import { AdminOperations } from '@/components/tnp/portals/operations/AdminOperations';

// The detailed Operations desk (preview-service driven) now sits behind the
// admin console at /operations.
export default function OperationsDeskPage() {
  return <AdminOperations />;
}
