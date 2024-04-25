import { Icon } from '@components/IconComponent';

import {
  useFloating,
  FloatingPortal,
  FloatingOverlay,
  FloatingFocusManager,
  useTransitionStyles,
  useDismiss,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import { Dispatch, SetStateAction } from 'react';
import { FCWithChildren } from 'types/react';
import styles from './ModalContainer.module.scss';

export interface ModalProps {
  onClose?: () => void;
  className?: string;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

const ModalContainer: FCWithChildren<ModalProps> = ({
  onClose = () => null,
  children,
  isOpen,
  setIsOpen,
}) => {
  const { refs, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
  });

  const handleClickClose = () => {
    onClose();
    setIsOpen(false);
  };

  const stylesOverlay = useTransitionStyles(context, {
    duration: 300,
    initial: {
      opacity: 0,
    },
  }).styles;

  const stylesDialog = useTransitionStyles(context, {
    duration: 300,
    initial: {
      transform: 'translate3d(0, 3%, 0)',
    },
  }).styles;

  const dismiss = useDismiss(context, { outsidePressEvent: 'mousedown' });
  const role = useRole(context, { role: 'dialog' });

  const { getFloatingProps } = useInteractions([dismiss, role]);
  return (
    <>
      <FloatingPortal>
        {isOpen && (
          <FloatingOverlay
            style={stylesOverlay}
            className={styles.dialogOverlay}
            lockScroll
          >
            <FloatingFocusManager context={context}>
              <div
                style={stylesDialog}
                className={styles.dialog}
                ref={refs.setFloating}
                {...getFloatingProps()}
              >
                {children}
                <button
                  onClick={handleClickClose}
                  aria-label="Close"
                  className={styles.closeButton}
                >
                  <Icon name="cross" />
                </button>
              </div>
            </FloatingFocusManager>
          </FloatingOverlay>
        )}
      </FloatingPortal>
    </>
  );
};

export default ModalContainer;
