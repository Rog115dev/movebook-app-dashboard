'use client';

import type { ColorSettings } from '@/lib/types';

type Props = {
  colors: ColorSettings;
};

/** Live phone mock using the draft palette (unsaved values included). */
export function ColorPreview({ colors: c }: Props) {
  return (
    <aside className="lg:sticky lg:top-6">
      <p className="mb-3 text-xs uppercase tracking-[0.18em] text-zinc-500">
        Live preview
      </p>

      <div className="mx-auto w-[280px] rounded-[2rem] border border-zinc-700 bg-zinc-900 p-3 shadow-2xl shadow-black/40">
        <div className="mb-2 flex items-center justify-center">
          <span className="h-1.5 w-16 rounded-full bg-zinc-700" />
        </div>

        <div
          className="overflow-hidden rounded-[1.4rem] border"
          style={{ background: c.bg, borderColor: c.border }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pb-2 pt-4">
            <span
              className="text-[10px] font-medium"
              style={{ color: c.orange }}
            >
              LANG
            </span>
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold"
              style={{ borderColor: c.borderOrange, color: c.white }}
            >
              AI
            </div>
            <div className="flex flex-col gap-1">
              <span
                className="block h-0.5 w-5 rounded"
                style={{ background: c.white }}
              />
              <span
                className="ml-auto block h-0.5 w-4 rounded"
                style={{ background: c.white }}
              />
              <span
                className="block h-0.5 w-5 rounded"
                style={{ background: c.white }}
              />
            </div>
          </div>

          {/* Brand title */}
          <div className="px-5 pb-3 pt-1 text-center">
            <p className="text-[15px] font-bold leading-tight">
              <span style={{ color: c.white }}>Movesbook </span>
              <span style={{ color: c.orange }}>FitAI</span>
              <span style={{ color: c.white }}> Coach</span>
            </p>
            <p
              className="mt-1 text-[10px] leading-snug"
              style={{ color: c.whiteMuted }}
            >
              Comprehensive solutions for modern sport & fitness
            </p>
            <div
              className="mx-auto mt-2 h-0.5 w-10 rounded"
              style={{ background: c.orange }}
            />
          </div>

          {/* Hero card */}
          <div className="px-4">
            <div
              className="relative overflow-hidden rounded-xl border"
              style={{
                borderColor: c.border,
                background: `linear-gradient(145deg, ${c.bgElevated}, ${c.bgCard})`,
                minHeight: 96,
              }}
            >
              <div
                className="absolute inset-x-[-20%] top-1/2 h-8 -translate-y-1/2 -rotate-[18deg] opacity-50"
                style={{
                  background: `linear-gradient(90deg, ${c.orange}, ${c.goldSoft}, ${c.orangeHot})`,
                }}
              />
              <div className="relative z-10 flex h-24 flex-col justify-end p-3">
                <p
                  className="text-lg font-black tracking-wide"
                  style={{ color: c.white }}
                >
                  BREAK ALL LIMITS
                </p>
                <p className="text-[10px]" style={{ color: c.whiteDim }}>
                  Push Beyond Yesterday...
                </p>
              </div>
              <div
                className="relative z-10 flex items-center gap-2 px-3 py-2"
                style={{ background: 'rgba(0,0,0,0.55)' }}
              >
                <span
                  className="text-[10px]"
                  style={{ color: c.white }}
                >
                  ▶ 0:00
                </span>
                <div
                  className="h-0.5 flex-1 overflow-hidden rounded"
                  style={{ background: c.border }}
                >
                  <div
                    className="h-full w-1/5"
                    style={{ background: c.orange }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="space-y-2 px-4 py-3">
            <div
              className="rounded-lg py-2.5 text-center text-xs font-semibold"
              style={{ background: c.orange, color: c.black }}
            >
              Feature of the version →
            </div>
            <div
              className="rounded-lg border py-2.5 text-center text-xs font-medium"
              style={{ borderColor: c.goldSoft, color: c.white }}
            >
              Sign up
            </div>
            <p className="text-center text-[10px]" style={{ color: c.whiteDim }}>
              Already have an account?{' '}
              <span style={{ color: c.orange }} className="font-semibold">
                Log in
              </span>
            </p>
          </div>

          {/* Card sample */}
          <div className="px-4 pb-4">
            <div
              className="rounded-xl border p-3"
              style={{
                background: c.bgElevated,
                borderColor: c.border,
              }}
            >
              <p
                className="text-xs font-bold"
                style={{ color: c.white }}
              >
                Why Choose <span style={{ color: c.orange }}>Me</span>
              </p>
              <p
                className="mt-1 text-[10px] leading-snug"
                style={{ color: c.whiteMuted }}
              >
                Results-driven coaching with quality assured plans.
              </p>
              <div className="mt-2 flex gap-2">
                <span
                  className="rounded px-2 py-0.5 text-[9px] font-semibold"
                  style={{
                    background: c.orange,
                    color: c.black,
                  }}
                >
                  Primary
                </span>
                <span
                  className="rounded border px-2 py-0.5 text-[9px]"
                  style={{
                    borderColor: c.borderOrange,
                    color: c.goldSoft,
                  }}
                >
                  Accent
                </span>
                <span
                  className="rounded px-2 py-0.5 text-[9px]"
                  style={{ color: c.red }}
                >
                  Alert
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-zinc-500">
        Updates as you edit — save to push to the app
      </p>
    </aside>
  );
}
