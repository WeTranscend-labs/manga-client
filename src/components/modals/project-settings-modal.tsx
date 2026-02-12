'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DialogProps } from '@/components/ui/modal';

interface ProjectSettingsModalProps extends DialogProps {
  project: any;
  onSave: (settings: any) => void;
  onClose?: () => void;
}

export function ProjectSettingsModal({
  isOpen,
  onDismiss,
  project,
  onSave,
  onClose,
}: ProjectSettingsModalProps) {
  const handleClose = () => {
    if (onClose) onClose();
    onDismiss();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Project Settings</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {/* Project settings form would go here */}
          <p>Project settings form placeholder for {project?.title}</p>
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
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
