import { redirect } from 'next/navigation';

export default function LegacyColorsRedirect() {
  redirect('/dashboard/colors');
}
