import React, { useCallback, useEffect, useState } from 'react';

interface DisconnectConfirmModalProps {
  connectorName: string;
  onConfirm: () => void;
  onClose: () => void;
}

const DisconnectConfirmModal: React.FC<DisconnectConfirmModalProps> = ({ connectorName, onConfirm, onClose }) => {
  const [input, setInput] = useState('');
  const [visible, setVisible] = useState(false);
  const confirmText = 'DESCONECTAR';

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const close = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 150);
  }, [onClose]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [close]);

  const canConfirm = input === confirmText;

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-150 ${visible ? 'opacity-100' : 'opacity-0'}`}
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div className={`bg-[#111113] border border-[#3f3f46]/60 rounded-2xl shadow-2xl w-[420px] overflow-hidden transition-all duration-150 ${
        visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}>
        <div className="px-6 py-5">
          <h3 className="text-sm font-semibold text-[#fafafa] mb-2">Desconectar integração</h3>
          <p className="text-xs text-[#71717a] leading-relaxed mb-4">
            Tem certeza que deseja desconectar <span className="text-[#fafafa] font-medium">{connectorName}</span>?
            Todos os dados de cache, mapeamentos e logs de sincronização serão removidos.
            Esta ação não pode ser desfeita.
          </p>
          <div>
            <label className="block text-xs text-[#71717a] mb-1.5">
              Digite <span className="text-[#f31260] font-mono font-medium">{confirmText}</span> para confirmar:
            </label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={confirmText}
              className="w-full px-3 py-2.5 rounded-lg bg-[#0f0f12] border border-[#3f3f46]/50 text-sm text-[#fafafa] placeholder:text-[#27272a] focus:outline-none focus:border-[#f31260]/50 transition-colors font-mono"
              autoFocus
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#27272a]">
          <button
            onClick={close}
            className="px-4 py-2 rounded-lg text-sm text-[#71717a] hover:text-[#fafafa] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => { if (canConfirm) { onConfirm(); close(); } }}
            disabled={!canConfirm}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              canConfirm ? 'bg-[#f31260] text-white hover:bg-[#f31260]/80' : 'bg-[#27272a] text-[#52525b] cursor-not-allowed'
            }`}
          >
            Desconectar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisconnectConfirmModal;
