'use client';

import { useMemo } from 'react';
import { Field } from '@/components/Field';
import { formatPlanPrice } from '@/lib/currency';
import {
  PLAN_USER_TYPES,
  PLAN_VERSIONS,
  audienceLabel,
  parsePlanMatrixId,
  planMatrixId,
  type PlanVersionKey,
} from '@/lib/planMatrix';
import type { PlanSettings, UnlockAudience } from '@/lib/types';

const USD = { code: 'USD', symbol: '$', label: 'US Dollar' } as const;

function formatUsd(amount: number) {
  return formatPlanPrice(amount, USD);
}

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
  const parsed = parsePlanMatrixId(selectedId);
  const userType: UnlockAudience = parsed.audience || 'athlete';
  const version: PlanVersionKey = parsed.version || 'free';
  const activeId = planMatrixId(version, userType);
  const idx = plans.findIndex((p) => p.id === activeId);
  const plan = idx >= 0 ? plans[idx] : null;

  function selectUserType(next: UnlockAudience) {
    onSelect(planMatrixId(version, next));
  }

  function selectVersion(next: PlanVersionKey) {
    onSelect(planMatrixId(next, userType));
  }

  const versionTabs = useMemo(() => PLAN_VERSIONS, []);

  if (!plans.length) {
    return <p className="text-sm text-zinc-500">No plans loaded.</p>;
  }

  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
        Type of user
      </p>
      <div
        className="flex flex-wrap gap-2 rounded-xl border border-zinc-800 bg-zinc-950/60 p-2"
        role="tablist"
        aria-label="Type of user"
      >
        {PLAN_USER_TYPES.map((t) => {
          const active = t.id === userType;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => selectUserType(t.id)}
              className={`min-w-[4.5rem] flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                active
                  ? 'bg-[#FF7800] text-black'
                  : 'border border-zinc-700 text-zinc-300 hover:border-[#FF7800]/50 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <p className="mb-2 mt-5 text-xs font-medium uppercase tracking-wide text-zinc-500">
        Version for {audienceLabel(userType)}
      </p>
      <div
        className="flex flex-wrap gap-2 rounded-xl border border-zinc-800 bg-zinc-950/60 p-2"
        role="tablist"
        aria-label="Plan version"
      >
        {versionTabs.map((v) => {
          const active = v.key === version;
          return (
            <button
              key={v.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => selectVersion(v.key)}
              className={`min-w-[4.5rem] flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                active
                  ? 'bg-[#FF7800] text-black'
                  : 'border border-zinc-700 text-zinc-300 hover:border-[#FF7800]/50 hover:text-white'
              }`}
            >
              {v.label}
            </button>
          );
        })}
      </div>

      {plan && idx >= 0 ? (
        <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-medium text-[#FF7800]">
              {plan.name}{' '}
              <span className="text-sm font-normal text-zinc-400">
                · {audienceLabel(userType)}
              </span>
            </h3>
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

          <p className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-xs text-zinc-400">
            User type for this card:{' '}
            <span className="text-[#FF7800]">{audienceLabel(userType)}</span>
            . Mobile shows these 4 versions only when the visitor selected this
            role on the first form.
          </p>

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
      ) : (
        <p className="mt-4 text-sm text-zinc-500">
          Plan {activeId} not found — save once to expand the 4×5 matrix.
        </p>
      )}
    </div>
  );
}

export { formatUsd };
