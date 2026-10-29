'use client';

import { Field } from '@/components/Field';
import { formatPlanPrice } from '@/lib/currency';
import type { PlanSettings } from '@/lib/types';

const USD = { code: 'USD', symbol: '$', label: 'US Dollar' } as const;

function formatUsd(amount: number) {
  return formatPlanPrice(amount, USD);
}

const PLAN_ORDER = ['free', 'basic', 'premium', 'pro'] as const;

type Props = {
  plans: PlanSettings[];
  selectedId: string;
  onSelect: (id: string) => void;
  onChange: (idx: number, patch: Partial<PlanSettings>) => void;
};

export function PlanEditor({
  plans,
  selectedId,
  onSelect,
  onChange,
}: Props) {
  const ordered = PLAN_ORDER.map(
    (id) => plans.find((p) => p.id === id) || null
  ).filter(Boolean) as PlanSettings[];
  const tabs = ordered.length
    ? ordered
    : [...plans].sort(
        (a, b) =>
          PLAN_ORDER.indexOf(a.id as (typeof PLAN_ORDER)[number]) -
          PLAN_ORDER.indexOf(b.id as (typeof PLAN_ORDER)[number])
      );
  const idx = plans.findIndex((p) => p.id === selectedId);
  const plan = idx >= 0 ? plans[idx] : null;

  if (!plans.length) {
    return <p className="text-sm text-zinc-500">No plans loaded.</p>;
  }

  return (
    <div>
      <div
        className="flex flex-wrap gap-2 rounded-xl border border-zinc-800 bg-zinc-950/60 p-2"
        role="tablist"
        aria-label="Plan version"
      >
        {tabs.map((p) => {
          const active = p.id === selectedId;
          return (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onSelect(p.id)}
              className={`min-w-[4.5rem] flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                active
                  ? 'bg-[#FF7800] text-black'
                  : 'border border-zinc-700 text-zinc-300 hover:border-[#FF7800]/50 hover:text-white'
              }`}
            >
              {p.name || p.id}
            </button>
          );
        })}
      </div>

      {plan && idx >= 0 ? (
        <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-lg font-medium text-[#FF7800]">{plan.name}</h3>
            <span className="text-xs text-zinc-500">id: {plan.id}</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Name"
              value={plan.name}
              onChange={(v) => onChange(idx, { name: v })}
            />

            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-zinc-200">
                Price (USD)
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-[#FF7800]">$</span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={Number.isFinite(plan.amount) ? plan.amount : 0}
                  onChange={(e) =>
                    onChange(idx, {
                      amount: Number(e.target.value) || 0,
                      price: formatUsd(Number(e.target.value) || 0),
                    })
                  }
                  className="w-40 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none ring-[#FF7800] focus:ring-2"
                />
                <span className="text-sm text-zinc-400">
                  Preview: {plan.price}
                </span>
              </div>
              <span className="text-xs text-zinc-500">
                Stored as USD. Mobile converts after country selection.
              </span>
            </label>

            <Field
              label="Subtitle"
              value={plan.subtitle}
              onChange={(v) => onChange(idx, { subtitle: v })}
            />
            <Field
              label="CTA"
              value={plan.cta}
              onChange={(v) => onChange(idx, { cta: v })}
            />
            <Field
              label="Badge (e.g. Personal avatar)"
              value={plan.badge || ''}
              onChange={(v) => onChange(idx, { badge: v || undefined })}
            />
            <label className="flex items-center gap-2 self-end pb-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={Boolean(plan.badgeDenied)}
                onChange={(e) =>
                  onChange(idx, { badgeDenied: e.target.checked })
                }
              />
              Badge denied (red ✕ on mobile)
            </label>
          </div>

          <h4 className="mb-2 mt-5 text-sm font-medium text-zinc-300">
            Features (one per line — matches mobile plan cards)
          </h4>
          <textarea
            value={plan.features.map((f) => f.text).join('\n')}
            onChange={(e) => {
              const lines = e.target.value.split('\n');
              onChange(idx, {
                features: lines.map((text, i) => ({
                  text,
                  included: plan.features[i]?.included !== false,
                  highlight: plan.features[i]?.highlight,
                })),
              });
            }}
            rows={9}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none ring-[#FF7800] focus:ring-2"
          />
          <p className="mt-2 text-xs text-zinc-500">
            Tip: mark a line as highlight in defaults or keep existing highlight
            flags when editing text in place (e.g. Pro “AI training plan
            development”).
          </p>

          <div className="mt-4 space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Feature highlights
            </p>
            {plan.features.map((f, fi) =>
              f.text.trim() ? (
                <label
                  key={`${plan.id}-hl-${fi}`}
                  className="flex items-start gap-2 text-sm text-zinc-300"
                >
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={Boolean(f.highlight)}
                    onChange={(e) => {
                      const features = plan.features.map((row, i) =>
                        i === fi
                          ? { ...row, highlight: e.target.checked }
                          : row
                      );
                      onChange(idx, { features });
                    }}
                  />
                  <span
                    className={
                      f.highlight ? 'text-[#FF7800]' : 'text-zinc-400'
                    }
                  >
                    {f.text}
                  </span>
                </label>
              ) : null
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export { formatUsd };
