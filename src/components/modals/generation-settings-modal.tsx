'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DialogProps } from '@/components/ui/modal';

interface GenerationSettingsModalProps extends DialogProps {
  settings: any;
  onSave: (settings: any) => void;
  onClose?: () => void;
}

export function GenerationSettingsModal({
  isOpen,
  onDismiss,
  settings,
  onSave,
  onClose,
}: GenerationSettingsModalProps) {
  const handleClose = () => {
    if (onClose) onClose();
    onDismiss();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generation Settings</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {/* Generation settings form would go here */}
          <p>Generation settings form placeholder</p>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSave({});
              handleClose();
            }}
          >
            Apply Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
