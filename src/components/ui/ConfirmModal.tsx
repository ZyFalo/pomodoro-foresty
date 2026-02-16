'use client';

import { Modal } from './Modal';
import { Icon } from './Icon';

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
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-sm mx-4 text-center">
        {/* Warning icon */}
        <div className="w-12 h-12 rounded-full bg-danger/15 flex items-center justify-center mx-auto mb-3">
          <Icon name="warning" size={28} className="text-danger" />
        </div>

        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p
          className="text-sm text-white/70 mb-5"
          dangerouslySetInnerHTML={{
            __html: message.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>'),
          }}
        />

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-white/20 bg-transparent text-white/80 text-sm font-medium cursor-pointer hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border-none text-white text-sm font-semibold cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, var(--color-danger), #ef4444)' }}
          >
            {loading ? '...' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
