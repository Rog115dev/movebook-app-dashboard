'use client';

import { useCallback, useState } from 'react';
import { ConfirmDialog } from '@/components/ConfirmDialog';

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

type PendingConfirm = ConfirmOptions & {
  resolve: (ok: boolean) => void;
};

/**
 * In-app confirm dialog (replaces window.confirm, which browsers often block).
 * Usage: `const { confirm, confirmDialog } = useConfirm();`
 * then `if (!(await confirm({ message: '…' }))) return;` and render `{confirmDialog}`.
 */
export function useConfirm() {
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setPending({ ...options, resolve });
    });
  }, []);

  const close = useCallback(
    (ok: boolean) => {
      if (!pending) return;
      pending.resolve(ok);
      setPending(null);
    },
    [pending]
  );

  const confirmDialog = (
    <ConfirmDialog
      open={Boolean(pending)}
      title={pending?.title || 'Confirm'}
      message={pending?.message || ''}
      confirmLabel={pending?.confirmLabel || 'Remove'}
      cancelLabel={pending?.cancelLabel || 'Cancel'}
      onConfirm={() => close(true)}
      onCancel={() => close(false)}
    />
  );

  return { confirm, confirmDialog };
}
