'use client';

type Props = {
  saving: boolean;
  message: string;
  onSave: () => void;
  onReset?: () => void;
};

export function SaveBar({ saving, message, onSave, onReset }: Props) {
  return (
    <div className="sticky bottom-0 mt-8 flex flex-wrap items-center gap-3 border-t border-zinc-800 bg-zinc-950/95 py-4 backdrop-blur">
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="rounded-lg bg-[#FF7800] px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
      >
        {saving ? 'Saving…' : 'Save changes'}
      </button>
      {onReset ? (
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300"
        >
          Reload
        </button>
      ) : null}
      {message ? <p className="text-sm text-zinc-400">{message}</p> : null}
    </div>
  );
}
