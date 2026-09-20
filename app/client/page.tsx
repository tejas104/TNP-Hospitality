import { redirect } from 'next/navigation';
export default function ClientPage() {
  redirect('/contact?interest=event-request');
}
