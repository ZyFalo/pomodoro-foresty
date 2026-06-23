'use client';

import { Modal } from './Modal';
import { Icon } from './Icon';
import { Button } from './Button';

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmar',
  loading = false,
}: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="bg-[#0E1A12]/90 border border-white-10 rounded-[24px] backdrop-blur-2xl shadow-[0_24px_60px_rgba(0,0,0,0.5)] p-7 max-w-sm w-full mx-4 text-center">
        {/* Warning icon */}
        <div className="w-14 h-14 rounded-full bg-danger/15 ring-1 ring-danger/25 flex items-center justify-center mx-auto mb-4">
          <Icon name="warning" size={28} className="text-danger" />
        </div>

        <h3 className="font-display text-xl font-semibold text-white mb-2">{title}</h3>
        <p
          className="text-sm text-white-60 mb-6 leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: message.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>'),
          }}
        />

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
