import { redirect } from 'next/navigation';

export default function LegacyLanguagesRedirect() {
  redirect('/dashboard/languages');
}
