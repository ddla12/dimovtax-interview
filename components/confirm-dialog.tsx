'use client';

import { Button } from './ui/button';
import React from 'react';

interface ConfirmDialogProps {
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  selectedCount: number;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmDialog({
  dialogRef,
  selectedCount,
  isDeleting,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <dialog
      ref={dialogRef}
      id="confirm-delete-dialog"
      className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl backdrop:bg-black/50 backdrop:backdrop-blur-sm"
    >
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Delete selected projects?</h2>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete {selectedCount} selected project{selectedCount === 1 ? '' : 's'}? This action cannot be undone.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm} disabled={isDeleting} className="w-full sm:w-auto">
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
