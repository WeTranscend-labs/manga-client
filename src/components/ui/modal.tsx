import { useUIStore } from '@/stores/ui.store';
import * as React from 'react';

// Helper to wait
const delayed = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export interface DialogProps<T = any> {
  isOpen: boolean;
  onDismiss: () => void;
  // Dynamic props are spread, so T intersects here, but usually passed via direct props
}

export function useModal<T = any>(
  Component: React.ComponentType<any>, // Loosen type to accept components without strict DialogProps
  key?: string,
): [
  (
    data?: T,
    disableCloseByBackdrop?: boolean,
  ) => { waitingClose: () => Promise<unknown> },
  () => void,
  boolean,
] {
  const { onPresent, onDismiss, getIsModalOpen } = useUIStore();
  const [id] = React.useState(
    () => key || `modal-${Math.random().toString(36).substr(2, 9)}`,
  );

  const handlePresent = React.useCallback(
    (data?: T, disableCloseByBackdrop = false) => {
      onPresent(id, Component, data, disableCloseByBackdrop);

      return {
        waitingClose: async () => {
          await delayed(200);
          return new Promise((resolve) => {
            const timer = setInterval(() => {
              const isOpen = getIsModalOpen(id);
              if (!isOpen) {
                resolve(true);
                clearInterval(timer);
              }
            }, 200);
          });
        },
      };
    },
    [id, Component, onPresent, getIsModalOpen],
  );

  const handleDismiss = React.useCallback(() => {
    onDismiss(id);
  }, [id, onDismiss]);

  const isOpen = useUIStore((state) => state.getIsModalOpen(id));

  return [handlePresent, handleDismiss, isOpen];
}

export function useCloseAllModal() {
  return useUIStore((state) => state.closeAllModals);
}

export function useCloseById() {
  const onDismiss = useUIStore((state) => state.onDismiss);
  return React.useCallback((id: string) => onDismiss(id), [onDismiss]);
}

export function ModalContainer() {
  const modals = useUIStore((state) => state.modals);
  const onDismiss = useUIStore((state) => state.onDismiss);

  if (modals.length === 0) return null;

  return (
    <>
      {modals.map((modal) => {
        const {
          id,
          component: Component,
          props,
          disableCloseByBackdrop,
        } = modal;
        const handleClose = () => onDismiss(id);

        const componentProps = {
          isOpen: true,
          onDismiss: handleClose,
          ...props, // Spread props so they are available directly
          key: id,
        };

        if (React.isValidElement(Component)) {
          // @ts-ignore
          return React.cloneElement(Component, componentProps);
        }

        // @ts-ignore
        return <Component key={id} {...componentProps} />;
      })}
    </>
  );
}
