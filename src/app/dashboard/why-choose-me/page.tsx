import { redirect } from 'next/navigation';

export default function LegacyRedirect() {
  redirect('/dashboard/home/why-choose-me');
}
