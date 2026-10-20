import { redirect } from 'next/navigation';

type Props = { params: Promise<{ slug?: string[] }> };

export default async function OthersCatchAll({ params }: Props) {
  const { slug } = await params;
  const rest = slug?.length ? `/${slug.join('/')}` : '';
  redirect(`/dashboard/generals${rest}`);
}
