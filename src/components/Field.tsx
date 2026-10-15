'use client';

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  type?: string;
  hint?: string;
  disabled?: boolean;
};

export function Field({
  label,
  value,
  onChange,
  multiline,
  type = 'text',
  hint,
  disabled,
}: Props) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-zinc-200">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          disabled={disabled}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none ring-[#FF7800] focus:ring-2 disabled:opacity-60"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none ring-[#FF7800] focus:ring-2 disabled:opacity-60"
        />
      )}
      {hint ? <span className="text-xs text-zinc-500">{hint}</span> : null}
    </label>
  );
}
