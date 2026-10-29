'use client';

import type { ColorSettings } from '@/lib/types';

type Props = {
  colors: ColorSettings;
  /** Keys currently highlighted from the left list / preview click. */
  activeKeys?: (keyof ColorSettings)[];
  /** Click a preview region → focus related color keys on the left. */
  onSelectKeys?: (keys: (keyof ColorSettings)[]) => void;
};

function regionClass(
  keys: (keyof ColorSettings)[],
  activeKeys: (keyof ColorSettings)[] | undefined,
  clickable: boolean
) {
  const active = keys.some((k) => activeKeys?.includes(k));
  return [
    'rounded transition',
    clickable ? 'cursor-pointer' : '',
    active
      ? 'ring-2 ring-[#FF7800] ring-offset-1 ring-offset-transparent'
      : clickable
        ? 'hover:ring-1 hover:ring-[#FF7800]/60'
        : '',
  ]
    .filter(Boolean)
    .join(' ');
}

/** Live phone mock using the draft palette (unsaved values included). */
export function ColorPreview({
  colors: c,
  activeKeys,
  onSelectKeys,
}: Props) {
  const clickable = Boolean(onSelectKeys);
  const select = (keys: (keyof ColorSettings)[]) => {
    onSelectKeys?.(keys);
  };

  return (
    <aside className="lg:sticky lg:top-6">
      <p className="mb-3 text-xs uppercase tracking-[0.18em] text-zinc-500">
        Live preview
      </p>
      <p className="mb-3 text-xs text-zinc-500">
        Click a part of the preview to highlight its color on the left.
      </p>

      <div className="mx-auto w-[280px] rounded-[2rem] border border-zinc-700 bg-zinc-900 p-3 shadow-2xl shadow-black/40">
        <div className="mb-2 flex items-center justify-center">
          <span className="h-1.5 w-16 rounded-full bg-zinc-700" />
        </div>

        <div
          className={`overflow-hidden rounded-[1.4rem] border ${regionClass(['bg', 'border'], activeKeys, clickable)}`}
          style={{ background: c.bg, borderColor: c.border }}
          onClick={() => select(['bg', 'border'])}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') select(['bg', 'border']);
          }}
          role={clickable ? 'button' : undefined}
          tabIndex={clickable ? 0 : undefined}
          title="Background / border"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pb-2 pt-4">
            <span
              className={`px-1 text-[10px] font-medium ${regionClass(['orange'], activeKeys, clickable)}`}
              style={{ color: c.orange }}
              onClick={(e) => {
                e.stopPropagation();
                select(['orange']);
              }}
              title="Brand orange"
            >
              LANG
            </span>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold ${regionClass(['borderOrange', 'white'], activeKeys, clickable)}`}
              style={{ borderColor: c.borderOrange, color: c.white }}
              onClick={(e) => {
                e.stopPropagation();
                select(['borderOrange', 'white']);
              }}
              title="Orange border / white"
            >
              AI
            </div>
            <div
              className={`flex flex-col gap-1 p-1 ${regionClass(['white'], activeKeys, clickable)}`}
              onClick={(e) => {
                e.stopPropagation();
                select(['white']);
              }}
              title="White"
            >
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
              <span
                className={regionClass(['white'], activeKeys, clickable)}
                style={{ color: c.white }}
                onClick={(e) => {
                  e.stopPropagation();
                  select(['white']);
                }}
              >
                Movesbook{' '}
              </span>
              <span
                className={regionClass(['orange'], activeKeys, clickable)}
                style={{ color: c.orange }}
                onClick={(e) => {
                  e.stopPropagation();
                  select(['orange']);
                }}
              >
                FitAI
              </span>
              <span
                className={regionClass(['white'], activeKeys, clickable)}
                style={{ color: c.white }}
                onClick={(e) => {
                  e.stopPropagation();
                  select(['white']);
                }}
              >
                {' '}
                Coach
              </span>
            </p>
            <p
              className={`mt-1 text-[10px] leading-snug ${regionClass(['whiteMuted'], activeKeys, clickable)}`}
              style={{ color: c.whiteMuted }}
              onClick={(e) => {
                e.stopPropagation();
                select(['whiteMuted']);
              }}
              title="Muted text"
            >
              Comprehensive solutions for modern sport & fitness
            </p>
            <div
              className={`mx-auto mt-2 h-0.5 w-10 rounded ${regionClass(['orange'], activeKeys, clickable)}`}
              style={{ background: c.orange }}
              onClick={(e) => {
                e.stopPropagation();
                select(['orange']);
              }}
            />
          </div>

          {/* Hero card */}
          <div className="px-4">
            <div
              className={`relative overflow-hidden rounded-xl border ${regionClass(['bgElevated', 'bgCard', 'orange', 'goldSoft', 'orangeHot'], activeKeys, clickable)}`}
              style={{
                borderColor: c.border,
                background: `linear-gradient(145deg, ${c.bgElevated}, ${c.bgCard})`,
                minHeight: 96,
              }}
              onClick={(e) => {
                e.stopPropagation();
                select([
                  'bgElevated',
                  'bgCard',
                  'orange',
                  'goldSoft',
                  'orangeHot',
                ]);
              }}
              title="Hero surfaces & accent gradient"
            >
              <div
                className="absolute inset-x-[-20%] top-1/2 h-8 -translate-y-1/2 -rotate-[18deg] opacity-50"
                style={{
                  background: `linear-gradient(90deg, ${c.orange}, ${c.goldSoft}, ${c.orangeHot})`,
                }}
              />
              <div className="relative z-10 flex h-24 flex-col justify-end p-3">
                <p
                  className={`text-lg font-black tracking-wide ${regionClass(['white'], activeKeys, clickable)}`}
                  style={{ color: c.white }}
                  onClick={(e) => {
                    e.stopPropagation();
                    select(['white']);
                  }}
                >
                  BREAK ALL LIMITS
                </p>
                <p
                  className={`text-[10px] ${regionClass(['whiteDim'], activeKeys, clickable)}`}
                  style={{ color: c.whiteDim }}
                  onClick={(e) => {
                    e.stopPropagation();
                    select(['whiteDim']);
                  }}
                >
                  Push Beyond Yesterday...
                </p>
              </div>
              <div
                className="relative z-10 flex items-center gap-2 px-3 py-2"
                style={{ background: 'rgba(0,0,0,0.55)' }}
              >
                <span className="text-[10px]" style={{ color: c.white }}>
                  ▶ 0:00
                </span>
                <div
                  className={`h-0.5 flex-1 overflow-hidden rounded ${regionClass(['border', 'orange'], activeKeys, clickable)}`}
                  style={{ background: c.border }}
                  onClick={(e) => {
                    e.stopPropagation();
                    select(['border', 'orange']);
                  }}
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
              className={`rounded-lg py-2.5 text-center text-xs font-semibold ${regionClass(['orange', 'black'], activeKeys, clickable)}`}
              style={{ background: c.orange, color: c.black }}
              onClick={(e) => {
                e.stopPropagation();
                select(['orange', 'black']);
              }}
              title="Primary button"
            >
              Feature of the version →
            </div>
            <div
              className={`rounded-lg border py-2.5 text-center text-xs font-medium ${regionClass(['goldSoft', 'white'], activeKeys, clickable)}`}
              style={{ borderColor: c.goldSoft, color: c.white }}
              onClick={(e) => {
                e.stopPropagation();
                select(['goldSoft', 'white']);
              }}
              title="Secondary button"
            >
              Sign up
            </div>
            <p className="text-center text-[10px]" style={{ color: c.whiteDim }}>
              Already have an account?{' '}
              <span
                style={{ color: c.orange }}
                className={`font-semibold ${regionClass(['orange'], activeKeys, clickable)}`}
                onClick={(e) => {
                  e.stopPropagation();
                  select(['orange']);
                }}
              >
                Log in
              </span>
            </p>
          </div>

          {/* Card sample */}
          <div className="px-4 pb-4">
            <div
              className={`rounded-xl border p-3 ${regionClass(['bgElevated', 'border'], activeKeys, clickable)}`}
              style={{
                background: c.bgElevated,
                borderColor: c.border,
              }}
              onClick={(e) => {
                e.stopPropagation();
                select(['bgElevated', 'border']);
              }}
              title="Card surface"
            >
              <p
                className="text-xs font-bold"
                style={{ color: c.white }}
              >
                Why Choose{' '}
                <span
                  style={{ color: c.orange }}
                  className={regionClass(['orange'], activeKeys, clickable)}
                  onClick={(e) => {
                    e.stopPropagation();
                    select(['orange']);
                  }}
                >
                  Me
                </span>
              </p>
              <p
                className={`mt-1 text-[10px] leading-snug ${regionClass(['whiteMuted'], activeKeys, clickable)}`}
                style={{ color: c.whiteMuted }}
                onClick={(e) => {
                  e.stopPropagation();
                  select(['whiteMuted']);
                }}
              >
                Results-driven coaching with quality assured plans.
              </p>
              <div className="mt-2 flex gap-2">
                <span
                  className={`rounded px-2 py-0.5 text-[9px] font-semibold ${regionClass(['orange', 'black'], activeKeys, clickable)}`}
                  style={{
                    background: c.orange,
                    color: c.black,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    select(['orange', 'black']);
                  }}
                >
                  Primary
                </span>
                <span
                  className={`rounded border px-2 py-0.5 text-[9px] ${regionClass(['borderOrange', 'goldSoft'], activeKeys, clickable)}`}
                  style={{
                    borderColor: c.borderOrange,
                    color: c.goldSoft,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    select(['borderOrange', 'goldSoft']);
                  }}
                >
                  Accent
                </span>
                <span
                  className={`rounded px-2 py-0.5 text-[9px] ${regionClass(['red'], activeKeys, clickable)}`}
                  style={{ color: c.red }}
                  onClick={(e) => {
                    e.stopPropagation();
                    select(['red']);
                  }}
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
