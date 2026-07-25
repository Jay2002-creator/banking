'use client';

import React from 'react';
import Modal from './Modal.jsx';
import { AlertOctagon } from 'lucide-react';

/**
 * Premium double-confirmation prompt for high-risk operations (e.g. account closures, overrides).
 *
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {function(): void} props.onClose
 * @param {function(): void} props.onConfirm
 * @param {string} [props.title='Are you absolutely sure?']
 * @param {string} [props.description]
 * @param {string} [props.confirmLabel='Proceed']
 * @param {string} [props.cancelLabel='Cancel']
 * @param {'danger'|'warning'|'info'} [props.type='danger'] - Styled behavior presets.
 * @param {boolean} [props.loading=false]
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you absolutely sure?',
  description = 'This is a critical operation that cannot be reverted. Please review details before continuing.',
  confirmLabel = 'Proceed',
  cancelLabel = 'Cancel',
  type = 'danger',
  loading = false,
}) {
  const stylesMap = {
    danger: {
      button: 'btn-danger',
      icon: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 ring-rose-100 dark:ring-rose-950/20',
    },
    warning: {
      button: 'bg-amber-500 hover:bg-amber-600 text-white border-amber-500',
      icon: 'text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 ring-amber-100 dark:ring-amber-950/20',
    },
    info: {
      button: 'btn-primary',
      icon: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 ring-indigo-100 dark:ring-indigo-950/20',
    },
  };

  const activeStyle = stylesMap[type] || stylesMap.info;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center text-center">
        {/* Warning Icon block */}
        <div className={`flex items-center justify-center w-12 h-12 rounded-full ring-4 mb-4 ${activeStyle.icon}`}>
          <AlertOctagon className="w-6 h-6" />
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          {description}
        </p>

        {/* Call to Actions buttons */}
        <div className="flex items-center justify-center gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn btn-outline flex-1"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`btn flex-1 ${activeStyle.button}`}
          >
            {loading && (
              <span className="w-4 h-4 border-2 border-white/25 border-t-white animate-spin rounded-full shrink-0" />
            )}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
