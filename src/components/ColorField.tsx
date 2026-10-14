'use client';

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function ColorField({ label, value, onChange }: Props) {
  const isHex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);
  return (
    <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#141414] p-3">
      <input
        type="color"
        value={isHex ? value : '#FF7800'}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-10 cursor-pointer rounded border-0 bg-transparent"
      />
      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-wide text-white/45">{label}</p>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full bg-transparent text-sm text-white outline-none"
        />
      </div>
    </label>
  );
}
