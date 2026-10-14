type Props = {
  title: string;
  description?: string;
};

export function PageHeader({ title, description }: Props) {
  return (
    <header className="mb-8">
      <h2 className="text-2xl font-semibold text-white">{title}</h2>
      {description ? (
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">{description}</p>
      ) : null}
    </header>
  );
}
